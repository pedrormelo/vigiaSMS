// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
"use client";

import React from "react";
import { Chart } from "react-google-charts";
import { Eye, BarChart3, Expand } from "lucide-react";
import { TipoGrafico, ConjuntoDeDadosGrafico } from "./types";

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

    const possuiDadosValidos = () => {
        if (!conjuntoDeDados || conjuntoDeDados.linhas.length === 0) return false;
        return conjuntoDeDados.linhas.some(linha => linha.some(celula => celula !== "" && celula !== null));
    };

    if (!previsualizacaoGerada) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-full">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-600">Pré-visualização do Gráfico</h3>
                <p className="text-sm text-gray-500">Clique em &quot;Gerar Gráfico&quot; após inserir os dados.</p>
            </div>
        );
    }

    if (!conjuntoDeDados || !possuiDadosValidos()) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl h-full">
                <Eye className="w-12 h-12 text-yellow-500 mb-3" />
                <h3 className="font-semibold text-yellow-700">Dados Incompletos</h3>
                <p className="text-sm text-yellow-600">Preencha a tabela com dados válidos para gerar o gráfico.</p>
            </div>
        );
    }

    const dadosGrafico = [
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
    ];

    const coresDoGrafico = 
        conjuntoDeDados.cores && conjuntoDeDados.cores.length > 0
            ? conjuntoDeDados.cores
            : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    const getEstilosPorTipo = () => {
        return { colors: coresDoGrafico };
    };

    const opcoesBase = {
        title: titulo || "Pré-visualização do Gráfico",
        backgroundColor: "transparent",
        legend: { position: "bottom", textStyle: { fontSize: 12 } },
        chartArea: { width: "75%", height: "75%" },
    };

    const opcoesEspecificas =
        (tipoGrafico === 'chart' || tipoGrafico === 'line')
            ? { vAxis: { viewWindow: { min: 0 } } }
            : {};

    const opcoesFinais = { 
        ...opcoesBase, 
        ...opcoesEspecificas,
        ...getEstilosPorTipo() 
    };

    const obterTipoGrafico = () => {
        switch (tipoGrafico) {
            case "pie": return "PieChart";
            case "line": return "AreaChart";
            case "chart": return "ColumnChart";
            default: return "PieChart";
        }
    };

    return (
        <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-2xl shadow-inner relative group">
            <Chart
                key={JSON.stringify(conjuntoDeDados)}
                chartType={obterTipoGrafico()}
                data={dadosGrafico}
                options={opcoesFinais}
                width="100%"
                height="100%"
                loader={<div>A carregar gráfico...</div>}
            />
            {!emTelaCheia && aoAlternarTelaCheia && previsualizacaoGerada && possuiDadosValidos() && (
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