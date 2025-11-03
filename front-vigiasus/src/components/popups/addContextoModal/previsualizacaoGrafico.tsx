// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Eye, Expand, Loader2, AlertTriangle } from "lucide-react";
import { TipoGrafico, ConjuntoDeDadosGrafico, FormatoColuna } from "./types";
import { loadGoogleCharts } from "@/lib/googleCharts";

interface PrevisualizacaoGraficoProps {
    tipoGrafico: TipoGrafico;
    conjuntoDeDados: ConjuntoDeDadosGrafico | null;
    titulo: string;
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
}

export const PrevisualizacaoGrafico: React.FC<PrevisualizacaoGraficoProps> = ({
    tipoGrafico,
    conjuntoDeDados,
    titulo,
    aoAlternarTelaCheia,
    emTelaCheia = false,
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [isLoadingLibs, setIsLoadingLibs] = useState(false);
    const [drawError, setDrawError] = useState<string | null>(null);

    // 🔧 --- Preparação e saneamento de dados ---
    const dadosGrafico = useMemo(() => {
        if (!conjuntoDeDados) return null;

        try {
            const linhasFormatadas = conjuntoDeDados.linhas.map((linha, linhaIndex) =>
                linha.map((celula, colIndex) => {
                    // Primeira coluna: categorias (mantém texto)
                    if (colIndex === 0) return celula;

                    let valor = celula;

                    // Converte string numérica (ex: "12,5") → number
                    if (typeof valor === "string" && valor.trim() !== "") {
                        const num = Number(valor.replace(",", "."));
                        if (!isNaN(num)) valor = num;
                    }

                    // Inicializa valores vazios
                    if (valor === "" || valor === undefined || valor === null) {
                        // Primeira linha recebe null (mantém tipo numérico sem alterar o gráfico)
                        valor = linhaIndex === 0 ? null : 0;
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

        const draw = async () => {
            if (!chartRef.current || !isMounted) return;
            if (!possuiDadosValidos()) {
                setDrawError(null);
                setIsLoadingLibs(false);
                chartRef.current.innerHTML = "";
                return;
            }

            setIsLoadingLibs(true);
            setDrawError(null);

            try {
                const google = await loadGoogleCharts(["corechart"]);
                googleVisualization = google.visualization;

                if (!isMounted) return;
                if (!googleVisualization) throw new Error("Biblioteca Google Charts não carregada.");

                const chartData = googleVisualization.arrayToDataTable(dadosGrafico);

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

                chartInstance = new ChartClass(chartRef.current);
                googleVisualization.events.addListener(chartInstance, "error", (err: any) => {
                    console.error("[previsualizacaoGrafico] Erro no desenho do Google Charts:", err);
                    if (isMounted) setDrawError(`Erro ao desenhar: ${err.message || String(err)}`);
                });

                chartInstance.draw(chartData, currentOptions);
            } catch (err: any) {
                console.error("[previsualizacaoGrafico] Falha no processo de desenho:", err);
                if (isMounted && !drawError) {
                    setDrawError(`Erro ao gerar gráfico: ${err.message || String(err)}`);
                }
            } finally {
                if (isMounted) setIsLoadingLibs(false);
            }
        };

        draw();

        if (chartRef.current && (window as any).ResizeObserver) {
            resizeObserver = new ResizeObserver(() => isMounted && draw());
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            isMounted = false;
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
    }, [tipoGrafico, dadosGrafico, titulo, opcoesFinais, conjuntoDeDados?.formatos]);

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
                <p className="text-xs mt-2 text-gray-500">Verifique os dados ou o console (F12).</p>
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
