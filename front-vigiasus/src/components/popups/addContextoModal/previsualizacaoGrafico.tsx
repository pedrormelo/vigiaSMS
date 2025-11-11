// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Eye, Expand, Loader2, AlertTriangle } from "lucide-react";
import { TipoGrafico, ConjuntoDeDadosGrafico, FormatoColuna } from "./types";
import { loadGoogleCharts, isGoogleChartsLoaded } from "@/lib/googleCharts";

interface PrevisualizacaoGraficoProps {
    tipoGrafico: TipoGrafico;
    conjuntoDeDados: ConjuntoDeDadosGrafico | null;
    titulo: string;
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
    refreshKey?: number; // força redesenho quando muda
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
    const [isLoadingLibs, setIsLoadingLibs] = useState(false);
    const [drawError, setDrawError] = useState<string | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const [retryToken, setRetryToken] = useState(0);
    const rafIdRef = useRef<number | null>(null);

    // 🔧 --- Preparação e saneamento de dados ---
    const dadosGrafico = useMemo(() => {
        if (!conjuntoDeDados) return null;

        try {
            const parseLocaleNumber = (raw: string, formato?: FormatoColuna): number | null => {
                if (raw == null) return null;
                let s = String(raw).trim();
                if (!s) return null;
                // Detect percent sign explicitly present
                const hadPercent = /%/.test(s);
                // Remove currency prefixes/suffixes and any non-digit separators except , . -
                s = s.replace(/[R$\s]/gi, "");
                s = s.replace(/[^0-9,.-]/g, "");
                if (!s) return null;
                let normalized = s;
                const hasComma = normalized.includes(",");
                const hasDot = normalized.includes(".");
                if (hasComma && hasDot) {
                    // Choose the last separator as decimal; remove the other as thousands
                    const lastComma = normalized.lastIndexOf(",");
                    const lastDot = normalized.lastIndexOf(".");
                    if (lastComma > lastDot) {
                        // comma decimal, dots thousand
                        normalized = normalized.replace(/\./g, "").replace(",", ".");
                    } else {
                        // dot decimal, commas thousand
                        normalized = normalized.replace(/,/g, "");
                    }
                } else if (hasComma) {
                    // Treat comma as decimal
                    normalized = normalized.replace(/\./g, "");
                    normalized = normalized.replace(",", ".");
                } else {
                    // Dot as decimal; remove stray commas just in case
                    normalized = normalized.replace(/,/g, "");
                }
                const num = Number(normalized);
                if (isNaN(num)) return null;
                let val = num;
                const shouldBePercent = formato === "percent" || hadPercent;
                if (shouldBePercent && Math.abs(val) >= 1) val = val / 100;
                return val;
            };

            const linhasFormatadas = conjuntoDeDados.linhas.map((linha, linhaIndex) =>
                linha.map((celula, colIndex) => {
                    // Primeira coluna: categorias (mantém texto)
                    if (colIndex === 0) return celula;

                    let valor = celula;

                    // Converte strings diversas ("12,5", "1.234,56", "10%", "R$ 1.234,00") para number
                    if (typeof valor === "string") {
                        const formatoColuna = conjuntoDeDados.formatos?.[colIndex];
                        const parsed = parseLocaleNumber(valor, formatoColuna);
                        valor = parsed ?? null; // Mantém null para valores não numéricos
                    }

                    // Inicializa valores vazios (valor agora é number | null após parsing)
                    if (valor === null || valor === undefined) {
                        valor = null;
                    }

                    // Normaliza percentuais
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

            const resultado = [conjuntoDeDados.colunas, ...linhasFormatadas];

            // 🧠 Depuração opcional (detecção automática de tipos mistos)
            for (let i = 1; i < resultado[0].length; i++) {
                const tipos = new Set(resultado.slice(1).map(l => typeof l[i]));
                if (tipos.size > 1) {
                    console.warn(`[previsualizacaoGrafico] Coluna ${i} tem tipos mistos:`, [...tipos]);
                }
            }

            return resultado;
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

    const opcoesFinais = useMemo(
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
        }),
        [titulo, tipoGrafico, coresDoGrafico]
    );

    const possuiDadosValidos = () => {
        if (!dadosGrafico || dadosGrafico.length < 2) return false;
        const primeiraLinhaDeDados = dadosGrafico[1];
        if (!primeiraLinhaDeDados) return false;
        return primeiraLinhaDeDados.slice(1).some(c => c !== null && c !== undefined);
    };

    // 🎨 --- Renderização do gráfico ---
    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let chartInstance: any = null;
        let isMounted = true;
        let googleVisualization: any = null;
        let runId = Math.random();

        const draw = async () => {
            if (!chartRef.current || !isMounted) return;
            const containerEl = chartRef.current; // fixa o container alvo deste draw
            if (!possuiDadosValidos()) {
                setDrawError(null);
                setIsLoadingLibs(false);
                try { if (containerEl) containerEl.innerHTML = ""; } catch {}
                return;
            }

            // Inicia loading apenas se a biblioteca ainda não estiver carregada
            const libLoaded = isGoogleChartsLoaded();
            if (!libLoaded) setIsLoadingLibs(true);
            // limpa o container antes de redesenhar
            try { if (containerEl) containerEl.innerHTML = ""; } catch {}

            // Aguarda um frame para estabilizar o DOM (evita corrida com StrictMode/mudança de ref)
            await new Promise<void>((resolve) => {
                rafIdRef.current = requestAnimationFrame(() => resolve());
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            timeoutRef.current = window.setTimeout(() => {
                if (!isMounted) return;
                console.warn("[previsualizacaoGrafico] Timeout ao carregar Google Charts. Exibindo mensagem de erro.");
                setDrawError("Tempo excedido ao carregar bibliotecas do gráfico. Verifique sua conexão e tente novamente.");
                setIsLoadingLibs(false);
            }, 15000);
            setDrawError(null);

            try {
                const google = await loadGoogleCharts(["corechart"]);
                // Se houver corrida ou desmontagem, aborta e limpa loading/timeout
                if (!isMounted || runId === null) {
                    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
                    setIsLoadingLibs(false);
                    return;
                }
                googleVisualization = google.visualization;

                if (!isMounted) return;
                if (!googleVisualization) throw new Error("Biblioteca Google Charts não carregada.");

                // Constrói DataTable com tipos explícitos para evitar inferência incorreta
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

                // Aplicar formatações (%, R$, etc.)
                if (conjuntoDeDados?.formatos && chartData) {
                    conjuntoDeDados.formatos.forEach((formato: FormatoColuna, index: number) => {
                        if (index > 0 && index < chartData.getNumberOfColumns()) {
                            const columnType = chartData.getColumnType(index);
                            if (columnType === "number") {
                                let formatter;
                                try {
                                    if (formato === "percent") {
                                        formatter = new googleVisualization.NumberFormat({ pattern: "#,##0.##%" });
                                    } else if (formato === "currency") {
                                        formatter = new googleVisualization.NumberFormat({
                                            prefix: "R$ ",
                                            decimalSymbol: ",",
                                            groupingSymbol: ".",
                                            pattern: "#,##0.00",
                                        });
                                    } else if (formato === "number") {
                                        formatter = new googleVisualization.NumberFormat({
                                            decimalSymbol: ",",
                                            groupingSymbol: ".",
                                            pattern: "#,##0.##",
                                        });
                                    }
                                    if (formatter) formatter.format(chartData, index);
                                } catch (formatError: any) {
                                    console.error(`[previsualizacaoGrafico] Erro ao aplicar formato '${formato}' à coluna ${index}:`, formatError);
                                }
                            }
                        }
                    });
                }

                let ChartClass;
                const currentOptions = { ...opcoesFinais };

                const primeiroFormato = conjuntoDeDados?.formatos?.[1];
                const axisFormat =
                    primeiroFormato === "percent"
                        ? "#%"
                        : primeiroFormato === "currency"
                        ? "R$ #,##0.00"
                        : "#,##0.##";

                switch (tipoGrafico) {
                    case "pie":
                        ChartClass = googleVisualization.PieChart;
                        Object.assign(currentOptions, {
                            pieSliceText: "percentage",
                            legend: { position: "bottom", alignment: "center", textStyle: { fontSize: 11 } },
                            chartArea: { width: "90%", height: "80%" },
                        });
                        delete (currentOptions as any).vAxis;
                        break;
                    case "line":
                        ChartClass = googleVisualization.AreaChart;
                        (currentOptions as any).vAxis.format = axisFormat;
                        break;
                    case "chart":
                    default:
                        ChartClass = googleVisualization.ColumnChart;
                        (currentOptions as any).vAxis.format = axisFormat;
                        break;
                }

                // --- INÍCIO DA CORREÇÃO ---
                // Verificamos se a 'ref' (chartRef.current) ainda existe *antes*
                // de passá-la para o construtor do Google Charts.
                if (!containerEl || !isMounted || chartRef.current !== containerEl) {
                    console.warn("[previsualizacaoGrafico] A referência do gráfico (chartRef.current) tornou-se nula durante o desenho. Abortando.");
                    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
                    if (isMounted) setIsLoadingLibs(false); // Garante que o loading pare
                    return; // Aborta a função de desenho
                }
                // --- FIM DA CORREÇÃO ---

                chartInstance = new ChartClass(containerEl); // prende ao container do início do draw
                if (googleVisualization?.events) {
                    googleVisualization.events.addListener(chartInstance, 'ready', () => {
                        if (isMounted) setIsLoadingLibs(false);
                    });
                    googleVisualization.events.addListener(chartInstance, "error", (err: any) => {
                        console.error("[previsualizacaoGrafico] Erro no desenho do Google Charts:", err);
                        if (isMounted) {
                            setDrawError(`Erro ao desenhar: ${err.message || String(err)}`);
                            setIsLoadingLibs(false);
                        }
                    });
                } else {
                    // Fallback se events não existir
                    setTimeout(() => { if (isMounted) setIsLoadingLibs(false); }, 500);
                }
                chartInstance.draw(chartData, currentOptions);
            } catch (err: any) {
                console.error("[previsualizacaoGrafico] Falha no processo de desenho:", err);
                if (isMounted && !drawError) {
                    setDrawError(`Erro ao gerar gráfico: ${err.message || String(err)}`);
                    setIsLoadingLibs(false);
                }
            } finally {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                if (isMounted && isLoadingLibs && isGoogleChartsLoaded()) {
                    // Caso 'ready' não tenha disparado (ex: gráfico sem listeners), garantimos fim do loading
                    setIsLoadingLibs(false);
                }
            }
    };
        const scheduleDraw = () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            rafIdRef.current = requestAnimationFrame(() => { draw(); });
        };

        scheduleDraw();

        if (chartRef.current && (window as any).ResizeObserver) {
            resizeObserver = new ResizeObserver(() => isMounted && scheduleDraw());
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            isMounted = false;
            runId = null as any;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            if (resizeObserver && chartRef.current) {
                try {
                    resizeObserver.unobserve(chartRef.current);
                } catch {}
                resizeObserver.disconnect();
            }
            if (chartInstance?.clearChart) {
                try {
                    if (googleVisualization?.events) {
                        googleVisualization.events.removeAllListeners(chartInstance);
                    }
                    chartInstance.clearChart();
                } catch (e) {
                    console.error("[previsualizacaoGrafico] Erro ao limpar instância:", e);
                }
            }
        };
    }, [tipoGrafico, dadosGrafico, titulo, opcoesFinais, conjuntoDeDados?.formatos, retryToken, refreshKey]);

    // --- Renderização condicional ---
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
                <p className="text-xs mt-2 text-gray-500">Verifique os dados ou o console (F12). Você também pode tentar novamente.</p>
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
            {/* Este 'div' é o container que recebe a ref.
              Ele SÓ é renderizado quando nenhum dos estados (isLoading, drawError, !possuiDadosValidos) é verdadeiro.
            */}
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