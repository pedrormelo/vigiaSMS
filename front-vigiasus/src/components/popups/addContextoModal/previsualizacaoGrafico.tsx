<<<<<<< HEAD
=======
// src/components/popups/addContextoModal/previsualizacaoGrafico.tsx
>>>>>>> consertando-gerencia
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

<<<<<<< HEAD
    // MUDANÇA: Separamos as opções para aplicar a correção condicionalmente
=======
    const coresDoGrafico = 
        conjuntoDeDados.cores && conjuntoDeDados.cores.length > 0
            ? conjuntoDeDados.cores
            : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    const getEstilosPorTipo = () => {
        return { colors: coresDoGrafico };
    };

>>>>>>> consertando-gerencia
    const opcoesBase = {
        title: titulo || "Pré-visualização do Gráfico",
        backgroundColor: "transparent",
        legend: { position: "bottom", textStyle: { fontSize: 12 } },
<<<<<<< HEAD
        chartArea: { width: "90%", height: "75%" },
        colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
    };

    // Adiciona a opção para forçar o eixo a começar em 0 para gráficos de barra e linha
    const opcoesEspecificas =
        (tipoGrafico === 'chart' || tipoGrafico === 'line')
            ? {
                vAxis: {
                    viewWindow: { min: 0 }, // Força o eixo vertical a começar em 0
                },
              }
            : {};

    const opcoesFinais = { ...opcoesBase, ...opcoesEspecificas };
=======
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
>>>>>>> consertando-gerencia

    const obterTipoGrafico = () => {
        switch (tipoGrafico) {
            case "pie": return "PieChart";
<<<<<<< HEAD
            case "line": return "LineChart";
=======
            case "line": return "AreaChart";
>>>>>>> consertando-gerencia
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
<<<<<<< HEAD
                options={opcoesFinais} // Usamos as opções finais aqui
                width="100%"
                height="100%"
                loader={<div>Carregando gráfico...</div>}
=======
                options={opcoesFinais}
                width="100%"
                height="100%"
                loader={<div>A carregar gráfico...</div>}
>>>>>>> consertando-gerencia
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