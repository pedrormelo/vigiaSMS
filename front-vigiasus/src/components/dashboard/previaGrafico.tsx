// components/chart-preview.tsx
import React from "react";
import { Chart as GoogleChart } from "react-google-charts";
import { PieChart, BarChart3, TrendingUp, Eye } from "lucide-react";

interface ChartPreviewProps {
    graphType: "pie" | "chart" | "line";
    dataset: {
        columns: string[];
        rows: (string | number)[][];
    };
    title: string;
}

export function ChartPreview({ graphType, dataset, title }: ChartPreviewProps) {
    const getChartIcon = () => {
        switch (graphType) {
            case "pie": return <PieChart className="w-5 h-5" />;
            case "chart": return <BarChart3 className="w-5 h-5" />;
            case "line": return <TrendingUp className="w-5 h-5" />;
        }
    };

    // Converter dados para formato do Google Charts
    const getChartData = () => {
        if (!dataset.rows.length || !dataset.rows[0].some(cell => cell !== "")) {
            return null;
        }

        const header = dataset.columns;
        const data = dataset.rows
            .filter(row => row.some(cell => cell !== ""))
            .map(row => 
                row.map(cell => {
                    const num = Number(cell);
                    return isNaN(num) ? cell : num;
                })
            );

        return [header, ...data];
    };

    const chartData = getChartData();
    const hasValidData = chartData && chartData.length > 1;

    const chartOptions = {
        title,
        titleTextStyle: {
            fontSize: 18,
            bold: true
        },
        backgroundColor: 'transparent',
        legend: { 
            position: graphType === 'pie' ? 'labeled' : 'right',
            textStyle: { fontSize: 12 }
        },
        chartArea: { 
            width: '80%', 
            height: '70%' 
        },
        hAxis: { title: dataset.columns[0] },
        vAxis: { title: 'Valores' },
        colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    };

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
                {graphType === "pie" && (
                    <GoogleChart
                        chartType="PieChart"
                        data={chartData}
                        options={chartOptions}
                        width="100%"
                        height="100%"
                    />
                )}
                {graphType === "chart" && (
                    <GoogleChart
                        chartType="ColumnChart"
                        data={chartData}
                        options={chartOptions}
                        width="100%"
                        height="100%"
                    />
                )}
                {graphType === "line" && (
                    <GoogleChart
                        chartType="LineChart"
                        data={chartData}
                        options={chartOptions}
                        width="100%"
                        height="100%"
                    />
                )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
                Preview baseado em {chartData.length - 1} ponto(s) de dados
            </div>
        </div>
    );
}