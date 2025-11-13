// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, BarChart3, Expand, Loader2 } from "lucide-react";
import { TipoGrafico, ConjuntoDeDadosGrafico } from "./types";
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

    const dadosGrafico = conjuntoDeDados
        ? [
            conjuntoDeDados.colunas,
            ...conjuntoDeDados.linhas.map(linha =>
                linha.map((celula, index) => {
                    if (index > 0) {
                        const num = parseFloat(celula as string);
                        return isNaN(num) ? null : num;
                    }
                    return celula;
                })
            )
        ]
        : [];

    const coresDoGrafico =
        conjuntoDeDados && conjuntoDeDados.cores && conjuntoDeDados.cores.length > 0
            ? conjuntoDeDados.cores
            : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    const opcoesFinais = {
        title: titulo || "Pré-visualização do Gráfico",
        backgroundColor: "transparent",
        legend: { position: "bottom", textStyle: { fontSize: 12 } },
        chartArea: { width: "75%", height: "75%" },
        vAxis: (tipoGrafico === 'chart' || tipoGrafico === 'line') ? { viewWindow: { min: 0 } } : {},
        colors: coresDoGrafico,
    };

    const possuiDadosValidos = () => {
        if (!conjuntoDeDados || conjuntoDeDados.linhas.length === 0) return false;
        return conjuntoDeDados.linhas.some(linha => linha.some(celula => celula !== "" && celula !== null));
    };

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let chartInstance: any = null;

const draw = async () => {
            if (!chartRef.current) return;
            try {
        console.debug('[previsualizacaoGrafico] antes de loadGoogleCharts, status=', (window as any).__googleChartsLoaderStatus);
        const google = await loadGoogleCharts(['corechart', 'bar']);
        console.debug('[previsualizacaoGrafico] loadGoogleCharts resolved, google=', !!google, 'visualization=', !!(google && google.visualization));
                if (!google || !google.visualization) return;

                const chartData = google.visualization.arrayToDataTable(dadosGrafico);

                switch (tipoGrafico) {
                    case "pie":
                        chartInstance = new google.visualization.PieChart(chartRef.current);
                        break;
                    case "line":
                        chartInstance = new google.visualization.AreaChart(chartRef.current);
                        break;
                    case "chart":
                        chartInstance = new google.visualization.ColumnChart(chartRef.current);
                        break;
                    default:
                        chartInstance = new google.visualization.PieChart(chartRef.current);
                }

                chartInstance.draw(chartData, opcoesFinais);
            } catch (err) {
                console.error('[previsualizacaoGrafico] failed to draw chart', err, 'loaderStatus=', (window as any).__googleChartsLoaderStatus);
            }
        };

        if (possuiDadosValidos()) {
            draw();

            if (chartRef.current && (window as any).ResizeObserver) {
                resizeObserver = new ResizeObserver(() => draw());
                resizeObserver.observe(chartRef.current);
            }
        }

        return () => {
            if (resizeObserver && chartRef.current) {
                resizeObserver.unobserve(chartRef.current);
                resizeObserver.disconnect();
            }
            chartInstance = null;
        };
    }, [tipoGrafico, dadosGrafico, opcoesFinais]);
    const LoaderPersonalizado = () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <p>A carregar biblioteca de gráficos...</p>
        </div>
    );

    return (
        <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner relative group">
            {possuiDadosValidos() ? (
                <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            ) : (
                <LoaderPersonalizado />
            )}
            
            {!emTelaCheia && aoAlternarTelaCheia && possuiDadosValidos() && (
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