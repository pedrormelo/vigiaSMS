// src/components/dashboard/chart-preview.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleCharts } from "@/lib/googleCharts"; // Certifique-se que o caminho está correto
import type { GraphType } from "./graficoCard"; // Ajuste o caminho se necessário
import { Info, Loader2, AlertTriangle } from "lucide-react"; // Adicionado AlertTriangle
import { cn } from "@/lib/utils"; // Adicionado cn

interface ChartPreviewProps {
    type: GraphType;
    title: string;
    data: any[]; // Array esperado pelo Google Charts
    colors?: string[];
    isHighlighted?: boolean;
    editMode?: boolean;
    renderVersion?: number; // Para forçar redesenho
    onShowDetails?: () => void;
}

export function ChartPreview({ type, title, data, colors, isHighlighted, editMode, renderVersion, onShowDetails }: ChartPreviewProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [drawError, setDrawError] = useState<string | null>(null); // Estado para erros
    const retryRef = useRef<number>(0); // tentativas de aguardar visualization

    // Verifica se os dados são minimamente válidos (array com pelo menos cabeçalho)
    const hasValidDataStructure = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let chartInstance: any = null;
        let readyListener: any = null;
        let isMounted = true; // Flag para verificar se o componente ainda está montado

        const draw = async () => {
            // Verifica se o componente ainda está montado e se a ref existe
            if (!chartRef.current || !isMounted) return;

            // Define o estado de carregamento e limpa erros anteriores
            setIsLoading(true);
            setDrawError(null);

            // Verifica a estrutura dos dados antes de tentar carregar a lib
            if (!hasValidDataStructure) {
                 if (isMounted) {
                    setDrawError("Formato de dados inválido para o gráfico.");
                    setIsLoading(false);
                 }
                return;
            }

            try {
                // Carrega a biblioteca Google Charts
                console.debug('[ChartPreview] Carregando Google Charts...'); // Log
                const google = await loadGoogleCharts(['corechart', 'bar']);

                // ----- PONTO CRÍTICO DA VERIFICAÇÃO -----
                // Verifica se carregou, se o componente ainda está montado,
                // e se o módulo 'visualization' e a função 'arrayToDataTable' existem.
                if (!google || !google.visualization || typeof google.visualization.arrayToDataTable !== 'function') {
                    if (!isMounted) return;
                    // Aguarda a disponibilidade com pequenas re-tentativas sem considerar erro imediatamente
                    if (retryRef.current < 50) { // ~10s com 200ms
                        retryRef.current += 1;
                        setTimeout(() => { if (isMounted) draw(); }, 200);
                        return;
                    }
                    console.error('[ChartPreview] google.visualization.arrayToDataTable não está disponível após várias tentativas.');
                    setDrawError("A biblioteca de gráficos (visualization) não carregou corretamente.");
                    setIsLoading(false);
                    return;
                }
                retryRef.current = 0;
                console.debug('[ChartPreview] Biblioteca carregada, google.visualization.arrayToDataTable está disponível.'); // Log
                // ----- FIM DA VERIFICAÇÃO -----


                // Prepara os dados para o gráfico (agora seguro chamar arrayToDataTable)
                console.debug('[ChartPreview] Criando DataTable...'); // Log
                const chartData = google.visualization.arrayToDataTable(data);
                console.debug('[ChartPreview] DataTable criada.'); // Log


                // Define as cores padrão ou usa as fornecidas
                const defaultColors = colors && colors.length > 0 ? colors : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

                // Opções comuns do gráfico
                const options = {
                    title: title,
                    backgroundColor: "transparent",
                    chartArea: { width: "85%", height: "75%" },
                    legend: { position: "bottom", textStyle: { fontSize: 11 } },
                    colors: defaultColors,
                    tooltip: { isHtml: false },
                    // Garante que eixos numéricos comecem do zero (se aplicável)
                    vAxis: { viewWindow: { min: 0 } },
                    hAxis: { viewWindow: { min: 0 } }
                };

                // Escolhe o tipo de gráfico e ajusta opções específicas
                let ChartClass;
                switch (type) {
                    case "pie":
                        ChartClass = google.visualization.PieChart;
                        // Match modal style: percentages inside slices and legend at the bottom (no leader lines)
                        (options as any).pieSliceText = 'percentage';
                        (options as any).legend = { position: 'bottom', alignment: 'center', textStyle: { fontSize: 12 } };
                        (options as any).chartArea = { width: "90%", height: "80%" };
                        delete (options as any).vAxis;
                        delete (options as any).hAxis;
                        break;
                    case "line":
                        ChartClass = google.visualization.AreaChart;
                        break;
                    case "chart":
                    default:
                        ChartClass = google.visualization.ColumnChart;
                        break;
                }

                // Última verificação antes de instanciar
                if (!chartRef.current || !isMounted) return;

                // Cria a instância do gráfico
                chartInstance = new ChartClass(chartRef.current);

                // Adiciona listener para saber quando o gráfico está pronto
                if (google.visualization.events) { // Verifica se 'events' existe
                    readyListener = google.visualization.events.addListener(chartInstance, 'ready', () => {
                        if (isMounted) { setIsLoading(false); }
                    });
                    // Adiciona listener para erros de desenho do Google Charts
                    google.visualization.events.addListener(chartInstance, 'error', (err: any) => {
                         if (isMounted) {
                            console.error('[ChartPreview] Erro no desenho do Google Charts:', err);
                            setDrawError(err?.message || 'Erro ao desenhar o gráfico.');
                            setIsLoading(false);
                         }
                    });
                } else {
                     // Fallback se 'events' não estiver disponível (menos provável)
                    console.warn('[ChartPreview] google.visualization.events não encontrado. Estado de loading pode não ser preciso.');
                    // Força isLoading para false após um tempo, como fallback
                    setTimeout(() => { if (isMounted) setIsLoading(false); }, 1000);
                }


                // Desenha o gráfico
                console.debug('[ChartPreview] Desenhando gráfico...'); // Log
                chartInstance.draw(chartData, options);
                console.debug('[ChartPreview] Comando draw executado.'); // Log

            } catch (err: any) {
                // Captura erros gerais
                if (isMounted) {
                    console.error('[ChartPreview] Falha ao preparar ou desenhar o gráfico:', err);
                    setDrawError(err.message || 'Ocorreu um erro inesperado ao gerar o gráfico.');
                    setIsLoading(false); // Garante que isLoading seja false mesmo com erro
                }
            }
        };

        // Inicia o processo de desenho
        draw();

        // Configura o ResizeObserver para redesenhar quando o tamanho mudar
        if (chartRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                // Redesenha apenas se montado
                if (isMounted) draw();
            });
            resizeObserver.observe(chartRef.current);
        }

        // Função de limpeza
        return () => {
            console.debug('[ChartPreview] Limpando componente...'); // Log
            isMounted = false; // Sinaliza que o componente foi desmontado

            // Limpa o ResizeObserver
            if (resizeObserver && chartRef.current) {
                 try { resizeObserver.unobserve(chartRef.current); } catch {}
                 resizeObserver.disconnect();
            }
            resizeObserver = null;

             // Remove listeners do Google Charts
            if (readyListener && (window as any).google?.visualization?.events && chartInstance) {
                try {
                    (window as any).google.visualization.events.removeListener(readyListener);
                     (window as any).google.visualization.events.removeAllListeners(chartInstance);
                     console.debug('[ChartPreview] Listeners do Google Charts removidos.'); // Log
                } catch {}
            }
            readyListener = null;

            // Limpa a instância do gráfico do Google Charts
            if (chartInstance && typeof chartInstance.clearChart === 'function') {
                try {
                    chartInstance.clearChart();
                     console.debug('[ChartPreview] Instância do gráfico limpa.'); // Log
                } catch (e) {
                     console.error("[ChartPreview] Erro ao limpar instância do gráfico:", e);
                }
            }
            chartInstance = null;
        };
    // Adiciona JSON.stringify(data) para reagir a mudanças no *conteúdo* dos dados
    }, [type, JSON.stringify(data), title, renderVersion, colors, hasValidDataStructure]); // Adicionado hasValidDataStructure

    // Renderização do componente
    return (
        <div
            className={cn(
                "relative bg-white rounded-2xl border p-4 h-full flex flex-col transition-all duration-200 overflow-hidden", // Adicionado overflow-hidden
                isHighlighted && editMode
                    ? "border-blue-400 ring-2 ring-blue-400 ring-opacity-50 shadow-lg shadow-blue-400/25"
                    : "border-gray-200 shadow-md",
                 // Adiciona classe se houver erro ou dados inválidos
                 (drawError || !hasValidDataStructure) ? "border-red-300 bg-red-50/50" : ""
            )}
            aria-busy={isLoading}
        >
            {/* Container do Gráfico (ocupa espaço restante) */}
            <div className="flex-1 min-h-0 relative"> {/* Garante que o container flexível funcione */}

                {/* Mensagem de Erro ou Dados Inválidos */}
                 {(drawError || !hasValidDataStructure) && !isLoading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-red-50 rounded-lg z-10">
                          <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
                         <span className="text-red-600 text-xs font-semibold">
                            {drawError ? "Erro ao carregar gráfico" : "Dados inválidos"}
                         </span>
                         <span className="text-red-500 text-[10px] mt-1 line-clamp-2" title={drawError ?? undefined}>
                            {drawError ?? "Verifique os dados fornecidos."}
                         </span>
                     </div>
                 )}

                {/* O gráfico em si (oculto se houver erro/dados inválidos) */}
                <div ref={chartRef} className={cn("w-full h-full", (drawError || !hasValidDataStructure) ? "invisible" : "")} />

                 {/* Overlay de Loading (mostrado apenas durante o carregamento E se não houver erro ainda E se os dados forem válidos) */}
                {isLoading && !drawError && hasValidDataStructure && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm z-20"> {/* Aumentado z-index */}
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
                        <span className="text-xs font-medium text-gray-600">Carregando gráfico…</span>
                    </div>
                )}
            </div>

            {/* Botão de Detalhes */}
            {onShowDetails && !editMode && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowDetails();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all z-30" // Aumentado z-index
                    title="Ver detalhes"
                    aria-label="Ver detalhes do gráfico"
                >
                    <Info className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}