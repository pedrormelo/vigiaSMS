"use client"

import { useParams, useRouter } from "next/dist/client/components/navigation"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { diretoriasConfig } from "@/constants/diretorias"
import { Info, Pen } from "lucide-react"
import React from "react"

// Mock indicator data
const indicators = [
    {
        title: "População Atendida",
        value: "68 milhões",
        subtitle: "Atendidos na Rede Municipal",
        change: "+32% em relação ao PMQA",
        changeType: "positive",
    },
    {
        title: "Unidades de Saúde",
        value: "200",
        subtitle: "Unidades ativas",
        change: "— Sem alteração",
        changeType: "neutral",
    },
    {
        title: "Profissionais Ativos",
        value: "2.345",
        subtitle: "Em toda Secretaria",
        change: "+4,2% em relação ao PMQA",
        changeType: "positive",
    },
    {
        title: "Alertas Ativos",
        value: "0",
        subtitle: "Requerem atenção imediata",
        change: "-2 em relação à semana anterior",
        changeType: "negative",
    },
]


// Example: Replace with real data from backend or context
const layout: "asymmetric" | "grid" | "sideBySide" = "asymmetric";
const graphs: (GraphData | null)[] = [
    {
        id: "main",
        type: "line",
        title: "Atendimentos de Alta vs Média e Baixa complexidade",
        gerencia: "GPLAN",
        insertedDate: "2025-09-15",
        data: [
            ["Mês", "Alta", "Média", "Baixa"],
            ["Maio", 1000, 800, 600],
            ["Junho", 1200, 850, 650],
            ["Julho", 1300, 900, 700],
            ["Agosto", 1400, 950, 750],
        ],
    },
    {
        id: "pie",
        type: "pie",
        title: "Distribuição de Atendimentos",
        gerencia: "GPLAN",
        insertedDate: "2025-09-15",
        data: [
            ["Categoria", "Atendimentos"],
            ["Work", 45],
            ["Urgência", 25],
            ["Consulta", 15],
            ["Especialidades", 10],
            ["Atenção Básica", 5],
        ],
    },
    {
        id: "bar",
        type: "chart",
        title: "Cobertura Vacinal",
        gerencia: "GTI",
        insertedDate: "2025-09-15",
        data: [
            ["Faixa etária", "Cobertura Atual", "Meta"],
            ["0-1", 80, 90],
            ["1-5", 85, 95],
            ["6-10", 90, 98],
            ["11-15", 88, 97],
        ],
    },
];

export default function DashboardView() {
    const params = useParams()
    const router = useRouter();
    const id = params.id as string
    const diretoria = diretoriasConfig[id]

    if (!id) {
        return <p className="text-center mt-10">Carregando...</p>
    }
    if (!diretoria) {
        return <p className="text-center mt-10">Diretoria não encontrada</p>
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
            {/* Header */}
            <div
                className="relative p-10 text-white shadow-lg"
                style={{
                    background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`,
                }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-regular">{diretoria.nome}</h1>
                        <p className="text-5xl mt-2 font-bold opacity-90">DASHBOARD</p>
                    </div>

                    {/* Botões do canto direito */}
                    <div className="flex flex-col items-center gap-3">
                        <button className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm">
                            <Info size={20} />
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/${id}/editar-layout`)}
                            className="flex items-center justify-center w-11 h-11 cursor-pointer rounded-[0.6rem] bg-white text-gray-600 hover:bg-white/80 transition-all duration-200 shadow-sm">
                            <Pen size={25} />
                        </button>
                    </div>

                </div>
            </div>

            <div className="p-8 mx-auto">
                <h2 className="text-3xl font-bold text-blue-700 mb-2">Visão Geral</h2>
            </div>

            {/* Indicators */}
            <div className="flex gap-6 justify-center mb-12 z-10 relative">
                {indicators.map((indicator, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-md p-6 min-w-[220px] max-w-[260px] flex flex-col gap-2 border border-gray-100">
                        <h3 className="text-lg font-bold text-blue-700">{indicator.title}</h3>
                        <div className="text-3xl font-extrabold text-blue-900">{indicator.value}</div>
                        <div className="text-sm text-gray-500">{indicator.subtitle}</div>
                        <div className={`text-xs font-medium mt-2 ${indicator.changeType === "positive" ? "text-green-600" : indicator.changeType === "negative" ? "text-red-600" : "text-gray-600"}`}>
                            {indicator.change}
                        </div>
                    </div>
                ))}
            </div>
            

            {/* Dashboard Charts - use DashboardPreview for layout and rendering */}
            <div className="flex justify-center items-center w-full pt-2 mb-28">
                <div className="max-w-[90%] w-full">
                    <DashboardPreview
                        layout={layout}
                        graphs={graphs}
                        onGraphSelect={() => {}}
                        onGraphRemove={() => {}}
                        onHighlightToggle={() => {}}
                        editMode={false}
                    />
                </div>
            </div>

        </div>
    )
}
