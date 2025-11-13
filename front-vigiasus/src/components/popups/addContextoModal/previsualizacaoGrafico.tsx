// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Eye, Expand, Loader2, AlertTriangle } from "lucide-react";
import { TipoGrafico, ConjuntoDeDadosGrafico, FormatoColuna } from "./types";
import { loadGoogleCharts, isGoogleChartsLoaded } from "@/lib/googleCharts";

// --- Interfaces Tipadas para Google Charts ---

interface GoogleDataTable {
    addColumn: (type: string, label?: string) => number;
    addRows: (rows: (string | number | null)[][]) => number;
    getNumberOfColumns: () => number;
    getColumnType: (columnIndex: number) => string;
}

interface GoogleChartOptions {
    title?: string;
    backgroundColor?: string;
    legend?: { position: string; alignment?: string; textStyle?: { fontSize: number } };
    chartArea?: { width: string; height: string };
    vAxis?: { viewWindow?: { min: number }; format?: string };
    hAxis?: { format?: string };
    colors?: string[];
    tooltip?: { isHtml: boolean };
    animation?: { duration: number; easing: string; startup: boolean };
    pieSliceText?: string;
    [key: string]: unknown;
}

interface GoogleChartInstance {
    draw: (data: GoogleDataTable, options: GoogleChartOptions) => void;
    clearChart: () => void;
}

interface GoogleVisualization {
    DataTable: new () => GoogleDataTable;
    NumberFormat: new (options: { prefix?: string; decimalSymbol?: string; groupingSymbol?: string; pattern?: string }) => { format: (data: GoogleDataTable, index: number) => void };
    PieChart: new (element: Element) => GoogleChartInstance;
    AreaChart: new (element: Element) => GoogleChartInstance;
    ColumnChart: new (element: Element) => GoogleChartInstance;
    events: {
        addListener: (instance: GoogleChartInstance, eventName: string, handler: (e?: unknown) => void) => void;
        removeAllListeners: (instance: GoogleChartInstance) => void;
    };
}

// Interface estendida para Window para compatibilidade com ResizeObserver
interface WindowWithResizeObserver extends Window {
    ResizeObserver: typeof ResizeObserver;
}

interface PrevisualizacaoGraficoProps {
    tipoGrafico: TipoGrafico;
    conjuntoDeDados: ConjuntoDeDadosGrafico | null;
    titulo: string;
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
    refreshKey?: number;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const PrevisualizacaoGrafico: React.FC<PrevisualizacaoGraficoProps> = ({
    tipoGrafico,
    conjuntoDeDados,
    titulo,
    aoAlternarTelaCheia,
    emTelaCheia = false,
    refreshKey,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    // Refs tipadas para persistência
    const chartInstanceRef = useRef<GoogleChartInstance | null>(null);
    const lastChartTypeRef = useRef<TipoGrafico | null>(null);

    const [isLoadingLibs, setIsLoadingLibs] = useState(false);
    const [drawError, setDrawError] = useState<string | null>(null);
    
    // Refs para controle de ciclo de vida assíncrono
    const timeoutRef = useRef<number | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const [retryToken, setRetryToken] = useState(0);

    // 🔧 Preparação dos dados (Memoizado)
    const dadosGrafico = useMemo(() => {
        if (!conjuntoDeDados) return null;

        try {
            const parseLocaleNumber = (raw: string, formato?: FormatoColuna): number | null => {
                if (raw == null) return null;
                let s = String(raw).trim();
                if (!s) return null;
                const hadPercent = /%/.test(s);
                s = s.replace(/[R$\s]/gi, "");
                s = s.replace(/[^0-9,.-]/g, "");
                if (!s) return null;
                let normalized = s;
                const hasComma = normalized.includes(",");
                const hasDot = normalized.includes(".");
                if (hasComma && hasDot) {
                    const lastComma = normalized.lastIndexOf(",");
                    const lastDot = normalized.lastIndexOf(".");
                    if (lastComma > lastDot) {
                        normalized = normalized.replace(/\./g, "").replace(",", ".");
                    } else {
                        normalized = normalized.replace(/,/g, "");
                    }
                } else if (hasComma) {
                    normalized = normalized.replace(/\./g, "");
                    normalized = normalized.replace(",", ".");
                } else {
                    normalized = normalized.replace(/,/g, "");
                }
                const num = Number(normalized);
                if (isNaN(num)) return null;
                let val = num;
                const shouldBePercent = formato === "percent" || hadPercent;
                if (shouldBePercent && Math.abs(val) >= 1) val = val / 100;
                return val;
            };

            const linhasFormatadas = conjuntoDeDados.linhas.map((linha) =>
                linha.map((celula, colIndex) => {
                    if (colIndex === 0) return celula;
                    let valor = celula;
                    if (typeof valor === "string") {
                        const formatoColuna = conjuntoDeDados.formatos?.[colIndex];
                        const parsed = parseLocaleNumber(valor, formatoColuna);
                        valor = parsed ?? null;
                    }
                    if (valor === null || valor === undefined) {
                        valor = null;
                    }
                    if (typeof valor === "number") {
                        const formatoColuna = conjuntoDeDados.formatos?.[colIndex];
                        if (formatoColuna === "percent") {
                            const normalizado = Math.abs(valor) >= 1 ? valor / 100 : valor;
                            return normalizado;
                        }
                    }
                    return valor;
                })
            );

            return [conjuntoDeDados.colunas, ...linhasFormatadas];
        } catch (e) {
            console.error("Erro ao preparar dadosGrafico:", e);
            setDrawError("Erro ao processar os dados da tabela.");
            return null;
        }
    }, [conjuntoDeDados]);

    const coresDoGrafico = useMemo(
        () =>
            conjuntoDeDados?.cores?.length
                ? conjuntoDeDados.cores
                : ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
        [conjuntoDeDados?.cores]
    );

    const opcoesFinais: GoogleChartOptions = useMemo(
        () => ({
            title: titulo || "Pré-visualização do Gráfico",
            backgroundColor: "transparent",
            legend: { position: "bottom", textStyle: { fontSize: 12 } },
            chartArea: { width: "75%", height: "70%" },
            vAxis:
                tipoGrafico === "chart" || tipoGrafico === "line"
                    ? { viewWindow: { min: 0 }, format: "###,##0.##" }
                    : {},
            colors: coresDoGrafico,
            tooltip: { isHtml: true },
            animation: {
                duration: 500,
                easing: 'out',
                startup: true 
            }
        }),
        [titulo, tipoGrafico, coresDoGrafico]
    );

    // Envolvido em useCallback para ser dependência estável do useEffect
    const possuiDadosValidos = useCallback(() => {
        if (!dadosGrafico || dadosGrafico.length < 2) return false;
        const primeiraLinhaDeDados = dadosGrafico[1];
        if (!primeiraLinhaDeDados) return false;
        return primeiraLinhaDeDados.slice(1).some(c => c !== null && c !== undefined);
    }, [dadosGrafico]);

    // 🎨 --- Renderização do gráfico ---
    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let isMounted = true;
        let googleVisualization: GoogleVisualization | null = null;
        // runId ajuda a verificar se o efeito ainda é válido após await
        let runId: number | null = Math.random(); 

        const draw = async () => {
            if (!chartRef.current || !isMounted) return;
            const containerEl = chartRef.current;

            // Se não houver dados, limpa o gráfico e sai
            if (!possuiDadosValidos()) {
                setDrawError(null);
                setIsLoadingLibs(false);
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.clearChart();
                    chartInstanceRef.current = null;
                }
                try { if (containerEl) containerEl.innerHTML = ""; } catch {}
                return;
            }

            const libLoaded = isGoogleChartsLoaded();
            if (!libLoaded) setIsLoadingLibs(true);

            // Aguarda frame de animação para estabilidade do DOM
            await new Promise<void>((resolve) => {
                rafIdRef.current = requestAnimationFrame(() => resolve());
            });
            
            // Limpa timeout anterior
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            
            // Define novo timeout de segurança
            timeoutRef.current = window.setTimeout(() => {
                if (!isMounted) return;
                setDrawError("Tempo excedido ao carregar bibliotecas do gráfico.");
                setIsLoadingLibs(false);
            }, 15000);
            
            // Reseta erro antes de tentar desenhar
            setDrawError(null);

            try {
                const google = await loadGoogleCharts(["corechart"]);
                
                // Verifica montagem após await
                if (!isMounted || runId === null) {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    setIsLoadingLibs(false);
                    return;
                }
                
                googleVisualization = google.visualization as GoogleVisualization;

                if (!googleVisualization) throw new Error("Biblioteca Google Charts não carregada.");

                // Preparação do DataTable
                if (!dadosGrafico) throw new Error("Dados do gráfico ausentes");
                const header = dadosGrafico[0] as string[];
                const rows = dadosGrafico.slice(1);
                
                const chartData = new googleVisualization.DataTable();
                chartData.addColumn('string', header[0]);
                for (let c = 1; c < header.length; c++) {
                    chartData.addColumn('number', header[c]);
                }
                const safeRows = rows.map((r) => {
                    const row: (string | number | null)[] = [String(r[0] ?? '')];
                    for (let c = 1; c < header.length; c++) {
                        const v = r[c];
                        row.push(typeof v === 'number' && Number.isFinite(v) ? v : null);
                    }
                    return row;
                });
                chartData.addRows(safeRows);

                // Formatação de Colunas
                if (conjuntoDeDados?.formatos && chartData) {
                    conjuntoDeDados.formatos.forEach((formato: FormatoColuna, index: number) => {
                        if (index > 0 && index < chartData.getNumberOfColumns()) {
                            const columnType = chartData.getColumnType(index);
                            if (columnType === "number") {
                                let formatter;
                                try {
                                    if (formato === "percent") formatter = new googleVisualization!.NumberFormat({ pattern: "#,##0.##%" });
                                    else if (formato === "currency") formatter = new googleVisualization!.NumberFormat({ prefix: "R$ ", decimalSymbol: ",", groupingSymbol: ".", pattern: "#,##0.00" });
                                    else if (formato === "number") formatter = new googleVisualization!.NumberFormat({ decimalSymbol: ",", groupingSymbol: ".", pattern: "#,##0.##" });
                                    
                                    if (formatter) formatter.format(chartData, index);
                                } catch (e) { console.error(e); }
                            }
                        }
                    });
                }

                // Seleção do Tipo de Gráfico
                let ChartClass: new (e: Element) => GoogleChartInstance;
                const currentOptions: GoogleChartOptions = { ...opcoesFinais };
                const primeiroFormato = conjuntoDeDados?.formatos?.[1];
                const axisFormat = primeiroFormato === "percent" ? "#%" : primeiroFormato === "currency" ? "R$ #,##0.00" : "#,##0.##";

                switch (tipoGrafico) {
                    case "pie":
                        ChartClass = googleVisualization.PieChart;
                        currentOptions.pieSliceText = "percentage";
                        currentOptions.legend = { position: "bottom", alignment: "center", textStyle: { fontSize: 11 } };
                        currentOptions.chartArea = { width: "90%", height: "80%" };
                        delete currentOptions.vAxis;
                        break;
                    case "line":
                        ChartClass = googleVisualization.AreaChart;
                        if (currentOptions.vAxis) currentOptions.vAxis.format = axisFormat;
                        break;
                    case "chart":
                    default:
                        ChartClass = googleVisualization.ColumnChart;
                        if (currentOptions.vAxis) currentOptions.vAxis.format = axisFormat;
                        break;
                }

                // Verificação de segurança do DOM
                if (!containerEl || !isMounted || chartRef.current !== containerEl) return;

                // Lógica de Reutilização da Instância para evitar Flicker
                let chartInstance = chartInstanceRef.current;
                const shouldRecreate = !chartInstance || lastChartTypeRef.current !== tipoGrafico;

                if (shouldRecreate) {
                    if (chartInstance) {
                        try { chartInstance.clearChart(); } catch {}
                    }
                    containerEl.innerHTML = ""; // Limpa apenas ao criar nova instância
                    chartInstance = new ChartClass(containerEl);
                    chartInstanceRef.current = chartInstance;
                    lastChartTypeRef.current = tipoGrafico;

                    if (googleVisualization?.events) {
                        googleVisualization.events.addListener(chartInstance, 'ready', () => {
                            if (isMounted) setIsLoadingLibs(false);
                        });
                        googleVisualization.events.addListener(chartInstance, "error", (err: unknown) => {
                            console.error("[previsualizacaoGrafico] Erro no desenho:", err);
                            if (isMounted) {
                                setDrawError(`Erro ao desenhar: ${getErrorMessage(err)}`);
                                setIsLoadingLibs(false);
                            }
                        });
                    }
                } 
                
                // Guarda para TypeScript que chartInstance não é nulo aqui
                if (!chartInstance) {
                    throw new Error("Falha ao criar instância do gráfico");
                }

                chartInstance.draw(chartData, currentOptions);

                // Se reutilizamos a instância, o evento 'ready' pode não disparar novamente,
                // então garantimos que o loading pare.
                if (!shouldRecreate && isMounted) {
                    setIsLoadingLibs(false);
                }

            } catch (err: unknown) {
                console.error("[previsualizacaoGrafico] Falha:", err);
                if (isMounted) {
                    // Removemos a verificação !drawError para garantir que erros novos sejam mostrados
                    setDrawError(`Erro: ${getErrorMessage(err)}`);
                    setIsLoadingLibs(false);
                }
            } finally {
                if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
            }
        };

        const scheduleDraw = () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(() => { draw(); });
        };

        scheduleDraw();

        const Win = window as unknown as WindowWithResizeObserver;
        if (chartRef.current && Win.ResizeObserver) {
            resizeObserver = new Win.ResizeObserver(() => isMounted && scheduleDraw());
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            isMounted = false;
            runId = null;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (resizeObserver) resizeObserver.disconnect();
            
             // Limpeza no unmount
             if (chartInstanceRef.current) {
                 try { 
                    // Não limpamos o gráfico visualmente no unmount para evitar flash se for apenas re-render
                    // Apenas removemos listeners para evitar leaks
                    chartInstanceRef.current.clearChart(); // Opcional
                 } catch {}
                 // Mantemos a ref null para próxima montagem criar novo
                 chartInstanceRef.current = null;
             }
        };
    }, [tipoGrafico, dadosGrafico, titulo, opcoesFinais, conjuntoDeDados?.formatos, retryToken, refreshKey, possuiDadosValidos]); 
    // Adicionado possuiDadosValidos às dependências

    // ... Resto do componente (Renderização) ...
    if (isLoadingLibs) {
        return (
            <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <p>A carregar gráfico...</p>
            </div>
        );
    }

    if (drawError) {
        return (
            <div className="w-full h-full p-4 bg-red-50 border border-red-200 rounded-2xl shadow-inner flex flex-col items-center justify-center text-red-700 text-center">
                <AlertTriangle className="w-10 h-10 mb-3" />
                <p className="font-semibold mb-1">Erro na Pré-visualização</p>
                <p className="text-xs">{drawError}</p>
                <p className="text-xs mt-2 text-gray-500">Verifique os dados.</p>
                <button
                    onClick={() => { setDrawError(null); setRetryToken((t) => t + 1); }}
                    className="mt-3 px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                >Tentar novamente</button>
            </div>
        );
    }

    if (!possuiDadosValidos()) {
        return (
            <div className="w-full h-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Pré-visualização</h3>
                <p className="text-gray-500 text-sm">Insira dados para visualizar o gráfico.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner relative group">
            <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            
            {!emTelaCheia && aoAlternarTelaCheia && (
                <button
                    onClick={aoAlternarTelaCheia}
                    className="absolute top-2 right-2 p-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    title="Ver em tela cheia"
                >
                    <Expand className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};