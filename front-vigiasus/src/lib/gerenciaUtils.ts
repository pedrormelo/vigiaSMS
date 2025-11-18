// src/lib/gerenciaUtils.ts
import type { TipoGrafico, IndicadorDetailsPayload, NomeIcone } from "@/components/popups/addContextoModal/types";
import type { Contexto } from "@/components/validar/typesDados";
import { icons as indicatorIcons } from "@/components/indicadores/indicadorCard";

export const mapTipoGraficoParaBackend = (tipo?: TipoGrafico): 'PIE' | 'BAR' | 'LINE' | undefined => {
    switch (tipo || 'chart') {
        case 'pie':
            return 'PIE';
        case 'line':
            return 'LINE';
        case 'chart':
            return 'BAR';
        default:
            return undefined;
    }
};

export const normalizarNumero = (valor?: string): number | undefined => {
    if (!valor) return undefined;
    const semEspacos = valor.replace(/\s/g, '');
    const semPontosDeMilhar = semEspacos.replace(/\.(?=\d{3}(?:\D|$))/g, '');
    const tratado = semPontosDeMilhar.replace(',', '.');
    if (!tratado) return undefined;
    const num = Number(tratado);
    return Number.isFinite(num) ? num : undefined;
};

export function toIndicatorCardProps(indicator: Contexto) {
    if (indicator.type !== 'indicador' || !indicator.payload) {
        return {
            id: indicator.id,
            title: indicator.title,
            value: "0",
            unidade: "",
            subtitle: indicator.description || "Sem dados",
            status: indicator.status,
            estaOculto: indicator.estaOculto,
            borderColor: "border-l-gray-500",
            iconType: "cruz" as keyof typeof indicatorIcons,
            versoes: indicator.versoes || [],
            insertedDate: indicator.insertedDate,
            solicitante: indicator.solicitante,
            gerencia: indicator.gerencia,
            autor: indicator.solicitante,
            historico: indicator.historico,
        };
    }

    const payload = indicator.payload as IndicadorDetailsPayload;
    const iconName = (payload.icone || "Heart") as NomeIcone;
    const iconMap: Record<NomeIcone, keyof typeof indicatorIcons> = {
        Heart: "cuidados",
        Building: "unidades",
        ClipboardList: "servidores",
        TrendingUp: "atividade",
        Landmark: "cruz",
        Users: "populacao",
        UserCheck: "medicos",
        DollarSign: "ambulancia",
    };

    const borderColorMap: { [key: string]: string } = {
        "#3B82F6": "border-l-blue-500",
        "#22C55E": "border-l-green-500",
        "#EF4444": "border-l-red-500",
        "#EAB308": "border-l-yellow-500",
        "#A855F7": "border-l-purple-500",
        "#F97316": "border-l-orange-500",
        "#14B8A6": "border-l-teal-500",
        "#EC4899": "border-l-pink-500",
    };

    const changeTypeMap = (text: string = ""): "positive" | "negative" | "neutral" => {
        if (text.startsWith('+')) return 'positive';
        if (text.startsWith('-')) return 'negative';
        return 'neutral';
    };

    return {
        id: indicator.id,
        title: indicator.title,
        value: payload.valorAtual || "0",
        unidade: payload.unidade || "",
        subtitle: payload.description || indicator.description || "",
        change: payload.textoComparativo || "",
        changeType: changeTypeMap(payload.textoComparativo),
        borderColor: borderColorMap[payload.cor] || "border-l-gray-500",
        iconType: iconMap[iconName] || "cruz",
        status: indicator.status,
        estaOculto: indicator.estaOculto,
        versoes: indicator.versoes || [],
        insertedDate: indicator.insertedDate,
        solicitante: indicator.solicitante,
        gerencia: indicator.gerencia,
        autor: indicator.solicitante,
        historico: indicator.historico,
    };
}
