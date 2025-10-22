// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react"; // Adicionado useMemo
import { Eye, BarChart3, Expand, Loader2, AlertTriangle } from "lucide-react"; // Adicionado AlertTriangle
// Importar FormatoColuna
import { TipoGrafico, ConjuntoDeDadosGrafico, FormatoColuna } from "./types";
import { loadGoogleCharts } from '@/lib/googleCharts';

interface PrevisualizacaoGraficoProps {
    tipoGrafico: TipoGrafico;
    conjuntoDeDados: ConjuntoDeDadosGrafico | null;
    titulo: string;
    previsualizacaoGerada: boolean;
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
}

export const PrevisualizacaoGrafico: React.FC<PrevisualizacaoGraficoProps> = ({
    tipoGrafico,
    conjuntoDeDados,
    titulo,
    previsualizacaoGerada,
    aoAlternarTelaCheia,
    emTelaCheia = false
}) => {
    const chartRef = useRef<HTMLDivElement>(null);
    // Estados adicionados para melhor feedback
    const [isLoadingLibs, setIsLoadingLibs] = useState(false);
    const [drawError, setDrawError] = useState<string | null>(null);

    // Memoized data preparation (similar ao original, mas com useMemo)
    const dadosGrafico = useMemo(() => {
        if (!conjuntoDeDados) return null; // Retorna null se não houver dados
        try {
            return [
                conjuntoDeDados.colunas,
                ...conjuntoDeDados.linhas.map(linha =>
                    linha.map((celula, index) => {
                        if (index > 0) { // Colunas numéricas
                            // Trata vírgula como decimal, remove R$, % e espaços
                            const valorString = String(celula ?? "").trim().replace('.', '').replace(',', '.').replace(/R\$|\s|%/g, '');
                             if (valorString === "") return null; // Célula vazia vira null
                             const num = parseFloat(valorString);
                             return isNaN(num) ? null : num; // Retorna número ou null
                        }
                        return celula; // Coluna de categoria
                    })
                )
            ];
        } catch (e) {
            console.error("Erro ao preparar dadosGrafico:", e);
            setDrawError("Erro ao processar os dados da tabela.");
            return null; // Retorna null em caso de erro
        }
    }, [conjuntoDeDados]); // Recalcula apenas se conjuntoDeDados mudar


    const coresDoGrafico = useMemo(() => // useMemo para cores
        conjuntoDeDados?.cores?.length ? conjuntoDeDados.cores : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
     [conjuntoDeDados?.cores]);

    // Opções básicas do gráfico (useMemo)
    const opcoesFinais = useMemo(() => ({
        title: titulo || "Pré-visualização do Gráfico",
        backgroundColor: "transparent",
        legend: { position: "bottom", textStyle: { fontSize: 12 } },
        chartArea: { width: "75%", height: "70%" }, // Ajustado height
        vAxis: (tipoGrafico === 'chart' || tipoGrafico === 'line') ? { viewWindow: { min: 0 }, format: '###,##0.##' } : {}, // Formato numérico base para eixo Y
        hAxis: (tipoGrafico === 'chart' && dadosGrafico && dadosGrafico.length > 2 && dadosGrafico[1].length === 2) ? { format: '###,##0.##' } : {}, // Formato para eixo X em BarChart (horizontal)
        colors: coresDoGrafico,
        tooltip: { isHtml: true } // Mantido para caso precise no futuro
    }), [titulo, tipoGrafico, coresDoGrafico, dadosGrafico]); // Adicionado dadosGrafico como dep. para hAxis


    const possuiDadosValidos = () => {
         if (!dadosGrafico || dadosGrafico.length < 2) return false; // Precisa cabeçalho + 1 linha
         // Verifica se existe algum valor não nulo/vazio nas colunas de dados
         return dadosGrafico.slice(1).some(linha => linha.slice(1).some(celula => celula !== null && celula !== undefined && String(celula).trim() !== ""));
    };

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let chartInstance: any = null;
        let isMounted = true;
        let googleVisualization: any = null; // Guardar referência

        const draw = async () => {
             // Verificações iniciais
             if (!chartRef.current || !previsualizacaoGerada || !isMounted) {
                 if (!previsualizacaoGerada && drawError) setDrawError(null);
                 if (isLoadingLibs) setIsLoadingLibs(false);
                 return;
             }
             if (!possuiDadosValidos()) {
                 setDrawError("Não há dados válidos suficientes para gerar o gráfico.");
                 setIsLoadingLibs(false);
                 return;
             }

            setDrawError(null);
            setIsLoadingLibs(true);

            try {
                console.debug('[previsualizacaoGrafico] Carregando Google Charts...');
                const google = await loadGoogleCharts(['corechart']); // Apenas corechart deve bastar
                googleVisualization = google.visualization; // Guarda a referência
                if (!googleVisualization || !isMounted) {
                    throw new Error("Biblioteca Google Charts (visualization) não carregada ou componente desmontado.");
                }
                console.debug('[previsualizacaoGrafico] Biblioteca carregada.');

                if (!chartRef.current || !dadosGrafico) return; // Re-check

                console.debug('[previsualizacaoGrafico] Criando DataTable...');
                let chartData;
                 try {
                     chartData = googleVisualization.arrayToDataTable(dadosGrafico);
                     console.debug('[previsualizacaoGrafico] DataTable criada.');
                 } catch (dataTableError: any) {
                     console.error('[previsualizacaoGrafico] Erro ao criar DataTable:', dataTableError);
                     throw new Error(`Falha ao processar os dados: ${dataTableError.message}`);
                 }


                // --- INÍCIO DA LÓGICA DE FORMATAÇÃO ---
                if (conjuntoDeDados?.formatos && chartData) {
                    console.debug('[previsualizacaoGrafico] Aplicando formatos:', conjuntoDeDados.formatos);
                    conjuntoDeDados.formatos.forEach((formato: FormatoColuna, index: number) => {
                        // Aplica apenas às colunas de dados (índice > 0)
                        if (index > 0 && index < chartData.getNumberOfColumns()) {
                            const columnType = chartData.getColumnType(index);
                            // Aplica formatação apenas se a coluna for numérica
                            if (columnType === 'number') {
                                let formatter;
                                try {
                                    if (formato === 'percent') {
                                        // Google Charts espera que 0.5 seja formatado como 50%
                                        // Se os seus dados já estão como 50, divida por 100 ANTES de passar para arrayToDataTable
                                        // OU use um pattern que não multiplique por 100 (mas isso é menos comum)
                                        // Assumindo que os dados estão como decimais (ex: 0.15 para 15%):
                                        formatter = new googleVisualization.NumberFormat({ pattern: '#,##0.##%' });
                                         console.debug(`[previsualizacaoGrafico] Aplicando formato 'percent' à coluna ${index}`);
                                    } else if (formato === 'currency') {
                                        formatter = new googleVisualization.NumberFormat({
                                            prefix: 'R$ ',
                                            decimalSymbol: ',',
                                            groupingSymbol: '.',
                                            pattern: '#,##0.00' // Força duas casas decimais
                                        });
                                         console.debug(`[previsualizacaoGrafico] Aplicando formato 'currency' à coluna ${index}`);
                                    } else if (formato === 'number') {
                                        // Formato numérico padrão pt-BR
                                         formatter = new googleVisualization.NumberFormat({
                                            decimalSymbol: ',',
                                            groupingSymbol: '.',
                                            pattern: '#,##0.##' // Mostra até 2 casas decimais se existirem
                                        });
                                        console.debug(`[previsualizacaoGrafico] Aplicando formato 'number' à coluna ${index}`);
                                    }

                                    if (formatter) {
                                        formatter.format(chartData, index);
                                    }
                                } catch (formatError: any) {
                                    console.error(`[previsualizacaoGrafico] Erro ao aplicar formato '${formato}' à coluna ${index}:`, formatError);
                                    // Continua mesmo se um formatador falhar
                                }
                            } else {
                                console.warn(`[previsualizacaoGrafico] Tentativa de aplicar formato numérico '${formato}' à coluna ${index} não numérica (tipo: '${columnType}').`);
                            }
                        } else if (index >= chartData.getNumberOfColumns()) {
                            console.warn(`[previsualizacaoGrafico] Índice de formato ${index} fora dos limites das colunas da DataTable (${chartData.getNumberOfColumns()}).`);
                        }
                    });
                } else {
                    console.debug('[previsualizacaoGrafico] Sem formatos personalizados para aplicar.');
                }
                // --- FIM DA LÓGICA DE FORMATAÇÃO ---


                console.debug(`[previsualizacaoGrafico] Preparando para desenhar gráfico tipo '${tipoGrafico}'...`);
                let ChartClass;
                const currentOptions = { ...opcoesFinais }; // Copia as opções base

                // Seleciona classe e ajusta opções específicas
                 switch (tipoGrafico) {
                    case "pie":
                        ChartClass = googleVisualization.PieChart;
                        currentOptions.pieSliceText = 'percentage'; // Mostra % na fatia
                        currentOptions.legend = { position: "right", alignment: 'center', textStyle: { fontSize: 11 } }; // Legenda à direita
                        currentOptions.chartArea = { width: "90%", height: "90%", left: 10, top: 10 }; // Mais espaço para pizza
                         if ('vAxis' in currentOptions) delete (currentOptions as any).vAxis; // Remove eixo Y
                         if ('hAxis' in currentOptions) delete (currentOptions as any).hAxis; // Remove eixo X
                        break;
                    case "line":
                        ChartClass = googleVisualization.AreaChart; // Ou LineChart
                         (currentOptions as any).vAxis.format = conjuntoDeDados?.formatos?.[1] === 'percent' ? '#%' : conjuntoDeDados?.formatos?.[1] === 'currency' ? 'R$ #,##0.00' : '#,##0.##'; // Formata eixo Y com base na primeira série de dados
                        break;
                    case "chart":
                    default:
                        ChartClass = googleVisualization.ColumnChart; // Colunas verticais
                        // ChartClass = googleVisualization.BarChart; // Barras horizontais (se preferir)
                        (currentOptions as any).vAxis.format = conjuntoDeDados?.formatos?.[1] === 'percent' ? '#%' : conjuntoDeDados?.formatos?.[1] === 'currency' ? 'R$ #,##0.00' : '#,##0.##'; // Formata eixo Y
                        // Se for BarChart (horizontal), formatar hAxis em vez de vAxis
                         // if (ChartClass === googleVisualization.BarChart) {
                         //    (currentOptions as any).hAxis = { viewWindow: { min: 0 }, format: conjuntoDeDados?.formatos?.[1] === 'percent' ? '#%' : conjuntoDeDados?.formatos?.[1] === 'currency' ? 'R$ #,##0.00' : '#,##0.##' };
                         //    delete (currentOptions as any).vAxis; // Remove vAxis para BarChart
                         // }
                        break;
                }

                if (!chartRef.current) return; // Última verificação
                chartInstance = new ChartClass(chartRef.current);

                 // Listener de erro do Google Charts
                 googleVisualization.events.addListener(chartInstance, 'error', (err: any) => {
                     console.error('[previsualizacaoGrafico] Erro no desenho do Google Charts:', err);
                     if (isMounted) setDrawError(`Erro ao desenhar: ${err.message || String(err)}`);
                 });

                console.debug('[previsualizacaoGrafico] Desenhando gráfico com opções:', JSON.stringify(currentOptions));
                chartInstance.draw(chartData, currentOptions);
                console.debug('[previsualizacaoGrafico] Gráfico desenhado.');

            } catch (err: any) {
                console.error('[previsualizacaoGrafico] Falha no processo de desenho:', err);
                if (isMounted && !drawError) { // Só define se não houver erro mais específico
                    setDrawError(`Erro ao gerar gráfico: ${err.message || String(err)}`);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingLibs(false);
                }
            }
        };

        // Chama draw se houver dados válidos
        // O useEffect só é re-executado se as dependências mudarem
        draw();


        // ResizeObserver (mantido como no original)
        if (chartRef.current && (window as any).ResizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                 if (isMounted) draw(); // Redesenha ao mudar tamanho
            });
            resizeObserver.observe(chartRef.current);
        }

        // Função de Limpeza (mantida, com adição de remoção de listeners)
        return () => {
             console.debug('[previsualizacaoGrafico] Limpando componente...');
            isMounted = false;
            if (resizeObserver && chartRef.current) {
                try { resizeObserver.unobserve(chartRef.current); } catch {}
                resizeObserver.disconnect();
            }
            if (chartInstance && typeof chartInstance.clearChart === 'function') {
                try {
                     if (googleVisualization && googleVisualization.events) {
                         googleVisualization.events.removeAllListeners(chartInstance);
                     }
                    chartInstance.clearChart();
                    console.debug('[previsualizacaoGrafico] Instância do gráfico limpa.');
                } catch (e) {
                    console.error("[previsualizacaoGrafico] Erro ao limpar instância:", e);
                }
            }
            chartInstance = null;
            googleVisualization = null;
        };
        // Dependências atualizadas para incluir formatos
    }, [
        tipoGrafico,
        dadosGrafico, // Já memoizado
        titulo,
        opcoesFinais, // Já memoizado
        conjuntoDeDados?.formatos, // Adicionado dependencia direta nos formatos
        previsualizacaoGerada
    ]);

    // Loader Personalizado (mantido)
    const LoaderPersonalizado = () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <p>A carregar biblioteca de gráficos...</p>
        </div>
    );

     // 1. Não é para gerar ainda
    if (!previsualizacaoGerada) {
        return (
            <div className="w-full h-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Pré-visualização</h3>
                <p className="text-gray-500 text-sm">Clique em "Gerar/Atualizar Gráfico".</p>
            </div>
        );
    }

    // 2. Carregando
    if (isLoadingLibs) {
        return (
             <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <p>A carregar gráfico...</p>
            </div>
        );
    }

     // 3. Erro
    if (drawError) {
        return (
            <div className="w-full h-full p-4 bg-red-50 border border-red-200 rounded-2xl shadow-inner flex flex-col items-center justify-center text-red-700 text-center">
                 <AlertTriangle className="w-10 h-10 mb-3" />
                 <p className="font-semibold mb-1">Erro na Pré-visualização</p>
                 <p className="text-xs">{drawError}</p>
                 <p className="text-xs mt-2 text-gray-500">Verifique dados/formatos ou consola (F12).</p>
            </div>
        );
    }

    // 4. Sucesso ou Dados Inválidos (após tentativa)
    return (
        <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner relative group">
            {!possuiDadosValidos() ? (
                 <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500">
                     <BarChart3 className="w-10 h-10 mb-3 text-gray-400" />
                     <p className="font-semibold">Pré-visualização Indisponível</p>
                     <p className="text-sm">Insira dados válidos e clique em "Atualizar Gráfico".</p>
                 </div>
             ) : (
                // Container do gráfico
                <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            )}

            {/* Botão Tela Cheia */}
            {!emTelaCheia && aoAlternarTelaCheia && possuiDadosValidos() && !isLoadingLibs && !drawError && (
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