"use client";

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Edit, Eye } from 'lucide-react';

import GerenciaDashboardPreview from "@/components/gerencia/dashboard/gerencia-dashboard-preview";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import type { FileType } from "@/components/contextosCard/contextoCard";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import { diretoriasConfig } from "@/constants/diretorias";
import { mockGraphs } from "@/constants/graphData";

export default function GerenciaPage() {
    // Dynamic route: get id from URL segment
    const params = useParams();
    const id = (params?.id as string) || "";

    // Resolve gerência and diretoria from diretoriasConfig
    const resolved = useMemo(() => {
        if (!id) return null;
        for (const key of Object.keys(diretoriasConfig)) {
            const dir = diretoriasConfig[key];
            const ger = dir.gerencias.find(g => g.id === id);
            if (ger) return { diretoria: dir, gerencia: ger };
        }
        return null;
    }, [id]);

    // Local UI state for edit/view toggle
    const [modo, setModo] = useState<'visualizacao' | 'edicao'>('visualizacao');

    // Indicators (kept from original)
    const indicators: {
        title: string; value: string; subtitle: string; change: string;
        changeType: "positive" | "negative" | "neutral"; borderColor: string;
        iconType: "cuidados" | "unidades" | "servidores" | "atividade" | "cruz" | "populacao" | "medicos";
    }[] = [
        { title: "População Atendida", value: "68 milhões", subtitle: "Atendimento da Rede Municipal", change: "+32% em relação ao PMQA", changeType: "positive", borderColor: "border-l-blue-500", iconType: "cuidados" },
        { title: "Unidades de Saúde", value: "200", subtitle: "Unidades ativas", change: "— Sem alteração", changeType: "neutral", borderColor: "border-l-green-500", iconType: "unidades" },
        { title: "Profissionais Ativos", value: "2.345", subtitle: "Em toda Secretaria", change: "+4,2% em relação ao PMQA", changeType: "positive", borderColor: "border-l-red-500", iconType: "servidores" },
    ]

    // Sample files for FileGrid (kept from original)
    const sampleFiles: { id: string; title: string; type: FileType; insertedDate: string; url?: string; payload?: unknown }[] = [
        { id: "1", title: "Pagamento ESF e ESB - 2025", type: "pdf", insertedDate: "2024-06-23", url: "/docs/cms.pdf" },
        { id: "2", title: "Pagamento ESF e ESB - 2025", type: "doc", insertedDate: "2024-06-23" },
        { id: "3", title: "Unidades com o PEC implementado", type: "dashboard", insertedDate: "2025-08-22", payload: { exemplo: true } },
        { id: "4", title: "Servidores ativos - comissionados, efetivos e contratos", type: "excel", insertedDate: "2024-06-23" },
        { id: "5", title: "Resolução 20/07/2025", type: "resolucao", insertedDate: "2024-06-23" },
        { id: "6", title: "Link para Dashboard Externo", type: "link", insertedDate: "2024-06-23", url: "https://www.google.com" },
        { id: "7", title: "Servidores ativos - comissionados, efetivos e contratos", type: "excel", insertedDate: "2024-06-23" },
        { id: "8", title: "Resolução 20/07/2025", type: "resolucao", insertedDate: "2024-06-23" },
        { id: "9", title: "Link para Dashboard Externo", type: "link", insertedDate: "2024-06-23", url: "https://www.google.com" },
    ]

    if (!id) {
        return <div className="p-8 text-center text-gray-500">Carregando gerência…</div>;
    }

    if (!resolved) {
        return <div className="p-8 text-center text-gray-500">Gerência não encontrada</div>;
    }

    const { diretoria, gerencia } = resolved;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header with diretoria gradient and gerência name */}
            <div
                className="relative p-8 mb-6 text-white shadow-lg"
                style={{
                    background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`
                }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        {/* <h1 className="text-4xl font-bold">{gerencia.nome}</h1> */}
                        <h2 className="text-3xl font-regular mt-1">{diretoria.nome}</h2>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6">
                {/* Top bar with edit toggle */}
                <div className="flex justify-between items-center mb-6">

                    <div className="mb-4 flex items-center gap-4">
                        <h1 className="text-6xl font-bold text-blue-700">{gerencia.sigla}</h1>
                        <h2 className="text-4xl ml-2.5 text-transform: uppercase text-blue-600">{gerencia.nome}</h2>
                    </div>

                    <button
                        onClick={() => setModo(modo === 'visualizacao' ? 'edicao' : 'visualizacao')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow"
                    >
                        {modo === 'visualizacao' ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {modo === 'visualizacao' ? 'Modo de Edição' : 'Modo de Visualização'}
                    </button>
                </div>

                {/* Dashboard header + add button */}
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-4xl font-regular mr-2 text-blue-600">Dashboard</h3>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => { /* open add dashboard modal */ }} />}
                </div>

                {/* Dashboard carousel */}
                <div className="mb-10">
                    <GerenciaDashboardPreview graphs={mockGraphs} gerencia={id} />
                </div>

                {/* Indicators */}
                <div className="flex justify-center items-center gap-4 mb-15 mt-12 flex-wrap">
                    {modo === 'edicao' && <AddIndicatorButton onClick={() => { /* open indicator modal */ }} />}
                    {indicators.map((indicator, index) => (
                        <IndicatorCard key={index} {...indicator} />
                    ))}
                </div>

                {/* Filter + Files grid */}
                <FilterBar />
                <FileGrid
                    files={sampleFiles}
                    onFileClick={() => { /* open view modal */ }}
                    isEditing={modo === 'edicao'}
                    onAddContextClick={() => { /* open add context modal */ }}
                />

                {/* Gerência details using diretoria.ts data (optional fields) */}
                <div className="mt-30 mb-25">
                    <div className="mb-2 flex flex-row items-center gap-8">
                        <div className="flex-1">
                            <div className="flex gap-4 justify-start items-center mb-4">
                                <h1 className="text-6xl font-extrabold text-blue-700">{gerencia.sigla ?? gerencia.nome?.slice(0, 4).toUpperCase()}</h1>
                                <h3 className="text-4xl font-regular text-blue-600">{gerencia.nome}</h3>
                            </div>
                            <span className="text-2xl font-medium ml-2 text-blue-600">SOBRE</span>
                            <div className="mb-8 mt-3 max-w-[90%]">
                                <p className="text-md ml-2 text-blue-600">{gerencia.descricao ?? "Sem descrição disponível para esta gerência."}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-[300px] h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                            {gerencia.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={gerencia.image} alt={gerencia.nome} className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-gray-400 text-lg">Sem imagem</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}