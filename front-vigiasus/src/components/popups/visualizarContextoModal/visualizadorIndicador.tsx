"use client";

import React from 'react';
import type { NomeIcone } from '@/components/popups/addContextoModal/types';
import { icons as indicatorIcons } from '@/components/indicadores/indicadorCard';

// Este mapa "traduz" o tipo de ícone genérico para o ícone específico do card
const iconMap: Record<NomeIcone, keyof typeof indicatorIcons> = {
    Heart: "cuidados",
    Building: "unidades",
    ClipboardList: "servidores",
    TrendingUp: "atividade",
    Landmark: "cruz",
    Users: "populacao",
    UserCheck: "medicos",
    DollarSign: "atividade", // Mapeando para um ícone temático existente
};

interface VisualizadorIndicadorProps {
    title: string;
    description?: string;
    valorAtual?: string | number;
    unidade?: string;
    textoComparativo?: string;
    cor?: string;
    icone?: NomeIcone;
}

const getChangeType = (text?: string): 'positive' | 'negative' | 'neutral' => {
    const t = (text ?? '').trim();
    if (t.startsWith('+')) return 'positive';
    if (t.startsWith('-')) return 'negative';
    return 'neutral';
};

export const VisualizadorIndicador: React.FC<VisualizadorIndicadorProps> = ({
    title, description, valorAtual, unidade, textoComparativo, cor, icone
}) => {
    const changeType = getChangeType(textoComparativo);
    
    const corTextoComparativo = 
        changeType === 'positive' ? 'text-green-600' :
        changeType === 'negative' ? 'text-red-600' :
        'text-gray-600';

    const unidadesMonetarias = ["R$", "$", "€"];
    const eUnidadeMonetaria = unidade ? unidadesMonetarias.includes(unidade) : false;
    
    const IconeDoCard = icone && iconMap[icone] ? indicatorIcons[iconMap[icone]] : null;

    return (
        <div 
            className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] w-full max-w-xs transition-all"
            style={{ borderLeft: `4px solid ${cor || '#cccccc'}` }}
        >
            <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-gray-600 break-words pr-1 text-xs sm:text-sm">{title || "Título"}</p>
                <div className="text-gray-400 flex-shrink-0">{IconeDoCard}</div>
            </div>
            <div className="my-1 sm:my-2 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none">
                    {eUnidadeMonetaria && unidade && <span className="text-lg sm:text-2xl font-medium text-gray-500 mr-0.5 sm:mr-1">{unidade}</span>}
                    {valorAtual ?? "0"}
                    {!eUnidadeMonetaria && unidade && unidade !== "Nenhum" && <span className="text-lg sm:text-2xl font-medium text-gray-500 ml-0.5 sm:ml-1">{unidade}</span>}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 break-words">{description || "Descrição"}</p>
            </div>
            <div className="h-5">
                {textoComparativo && (
                    <div className={`text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 ${corTextoComparativo}`}>
                        {changeType === "positive" && <span>▲</span>}
                        {changeType === "negative" && <span>▼</span>}
                        {changeType === "neutral" && <span className="font-bold">—</span>}
                        <span>{textoComparativo.replace(/^(\+|-|—)\s*/, "")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};