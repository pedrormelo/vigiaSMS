"use client";

import React from "react";
import { Chart } from "react-google-charts";
import { Eye, BarChart3 } from "lucide-react";
import { GraphType, ChartDataset } from "./types";

interface ChartPreviewProps {
    graphType: GraphType;
    dataset: ChartDataset | null;
    title: string;
    isPreviewGenerated: boolean;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ graphType, dataset, title, isPreviewGenerated }) => {
    
    const hasValidData = () => {
        // A verificação `!dataset` já acontece antes, mas mantemos aqui por segurança
        if (!dataset || dataset.rows.length === 0) return false;
        return dataset.rows.some(row => row.some(cell => cell !== "" && cell !== null));
    };

    if (!isPreviewGenerated) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-full">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-600">Pré-visualização do Gráfico</h3>
                <p className="text-sm text-gray-500">Clique em "Gerar Gráfico" após inserir os dados.</p>
            </div>
        );
    }

    // MUDANÇA: Verificamos se 'dataset' é nulo ANTES de tentar usá-lo.
    if (!dataset || !hasValidData()) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl h-full">
                <Eye className="w-12 h-12 text-yellow-500 mb-3" />
                <h3 className="font-semibold text-yellow-700">Dados Incompletos</h3>
                <p className="text-sm text-yellow-600">Preencha a tabela com dados válidos para gerar o gráfico.</p>
            </div>
        );
    }
    
    // Se chegamos aqui, 'dataset' com certeza não é nulo.
    const chartData = [
        dataset.columns,
        ...dataset.rows.map(row => 
            row.map((cell, index) => {
                if (index > 0) {
                    const num = parseFloat(cell as string);
                    return isNaN(num) ? null : num;
                }
                return cell;
            })
        )
    ];

    const options = {
        title: title || "Pré-visualização do Gráfico",
        backgroundColor: "transparent",
        legend: { position: "bottom", textStyle: { fontSize: 12 } },
        chartArea: { width: "90%", height: "75%" },
        colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
    };

    const getChartType = () => {
        switch (graphType) {
            case "pie": return "PieChart";
            case "line": return "LineChart";
            case "chart": return "ColumnChart";
            default: return "PieChart";
        }
    };

    return (
        <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner">
            <Chart
                key={JSON.stringify(dataset)} 
                chartType={getChartType()}
                data={chartData}
                options={options}
                width="100%"
                height="100%"
                loader={<div>Carregando gráfico...</div>}
            />
        </div>
    );
};