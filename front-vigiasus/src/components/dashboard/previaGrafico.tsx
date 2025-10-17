// components/chart-preview.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { PieChart, BarChart3, TrendingUp, Eye } from "lucide-react";
import { loadGoogleCharts } from "@/lib/googleCharts";

interface ChartPreviewProps {
    graphType: "pie" | "chart" | "line";
    dataset: {
        columns: string[];
        rows: (string | number)[][];
    };
    title: string;
}

export function ChartPreview({ graphType, dataset, title }: ChartPreviewProps) {
    const chartRef = useRef<HTMLDivElement | null>(null);

    const getChartIcon = () => {
        switch (graphType) {
            case "pie": return <PieChart className="w-5 h-5" />;
            case "chart": return <BarChart3 className="w-5 h-5" />;
            case "line": return <TrendingUp className="w-5 h-5" />;
        }
    };

    const getChartData = () => {
        if (!dataset || !Array.isArray(dataset.rows) || dataset.rows.length === 0) return null;
        if (!dataset.rows[0].some((cell) => cell !== "")) return null;

        const header = dataset.columns;
        const data = dataset.rows
            .filter((row) => row.some((cell) => cell !== ""))
            .map((row) => row.map((cell) => {
                const num = Number(cell);
                return isNaN(num) ? cell : num;
            }));

        return [header, ...data];
    };

    const chartData = getChartData();
    const hasValidData = !!(chartData && chartData.length > 1);

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let chartInstance: any = null;

        const draw = async () => {
            if (!chartRef.current) return;
            if (!hasValidData) return;
            try {
                const google = await loadGoogleCharts(['corechart', 'bar']);
                if (!google || !google.visualization) return;

                const dataTable = google.visualization.arrayToDataTable(chartData as any);

                const options = {
                    title,
                    backgroundColor: 'transparent',
                    legend: { position: graphType === 'pie' ? 'labeled' : 'right', textStyle: { fontSize: 12 } },
                    chartArea: { width: '80%', height: '70%' },
                    colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
                };

                switch (graphType) {
                    case 'pie':
                        chartInstance = new google.visualization.PieChart(chartRef.current);
                        break;
                    case 'chart':
                        chartInstance = new google.visualization.ColumnChart(chartRef.current);
                        break;
                    case 'line':
                        chartInstance = new google.visualization.LineChart(chartRef.current);
                        break;
                    default:
                        chartInstance = new google.visualization.ColumnChart(chartRef.current);
                }

                chartInstance.draw(dataTable, options);
            } catch (err) {
                // silently ignore draw errors for now
            }
        };

        draw();

        if (chartRef.current && (window as any).ResizeObserver) {
            resizeObserver = new ResizeObserver(() => draw());
            resizeObserver.observe(chartRef.current);
        }

        return () => {
            if (resizeObserver && chartRef.current) {
                resizeObserver.unobserve(chartRef.current);
                resizeObserver.disconnect();
            }
            chartInstance = null;
        };
    }, [graphType, JSON.stringify(chartData), title]);

    if (!hasValidData) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Preview do Gráfico</h3>
                <p className="text-gray-500">Adicione dados para visualizar o gráfico</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                {getChartIcon()}
                <h3 className="text-lg font-semibold text-gray-800">Preview do Gráfico</h3>
            </div>

            <div className="h-64">
                <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
                Preview baseado em {(chartData as any).length - 1} ponto(s) de dados
            </div>
        </div>
    );
}