"use client"

import { useParams, useRouter } from "next/dist/client/components/navigation"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { SecretariaDashboardPreview } from "@/components/dashboard/secretaria-dashboard-preview"
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
    // Destacados (para testar Secretaria)
    {
        id: "g1-line",
        type: "line",
        title: "Produção Ambulatorial (Mensal)",
        gerencia: "GPLAN",
        insertedDate: "2025-09-15",
        isHighlighted: true,
        data: [
            ["Mês", "Alta", "Média", "Baixa"],
            ["Mai", 1000, 800, 600],
            ["Jun", 1200, 850, 650],
            ["Jul", 1300, 900, 700],
            ["Ago", 1400, 950, 750],
        ],
    },
    {
        id: "g2-pie",
        type: "pie",
        title: "Distribuição de Atendimentos",
        gerencia: "GPLAN",
        insertedDate: "2025-09-16",
        isHighlighted: true,
        data: [
            ["Categoria", "Atendimentos"],
            ["Urgência", 25],
            ["Consulta", 35],
            ["Especialidades", 20],
            ["Atenção Básica", 20],
        ],
    },
    {
        id: "g3-bar",
        type: "chart",
        title: "Cobertura Vacinal (Meta vs Atual)",
        gerencia: "GTI",
        insertedDate: "2025-09-17",
        isHighlighted: true,
        data: [
            ["Faixa", "Atual", "Meta"],
            ["0-1", 80, 90],
            ["1-5", 85, 95],
            ["6-10", 90, 98],
            ["11-15", 88, 97],
        ],
    },
    {
        id: "g4-line",
        type: "line",
        title: "Tempo Médio de Espera (Dias)",
        gerencia: "Regulação",
        insertedDate: "2025-09-18",
        isHighlighted: true,
        data: [
            ["Mês", "Consultas", "Exames"],
            ["Mai", 12, 8],
            ["Jun", 10, 7],
            ["Jul", 9, 6],
            ["Ago", 8, 5],
        ],
    },
    {
        id: "g5-pie",
        type: "pie",
        title: "Tipos de Procedimentos",
        gerencia: "Atenção Básica",
        insertedDate: "2025-09-19",
        isHighlighted: true,
        data: [
            ["Tipo", "%"],
            ["Consulta", 45],
            ["Vacinação", 20],
            ["Coleta", 15],
            ["Visita Domiciliar", 20],
        ],
    },
    {
        id: "g6-bar",
        type: "chart",
        title: "Leitos Ocupados por Setor",
        gerencia: "Regulação de Leitos",
        insertedDate: "2025-09-19",
        isHighlighted: true,
        data: [
            ["Setor", "Ocupação"],
            ["Clínico", 78],
            ["Cirúrgico", 66],
            ["UTI", 85],
            ["Pediatria", 60],
        ],
    },
    {
        id: "g7-line",
        type: "line",
        title: "Atendimentos por Especialidade",
        gerencia: "Especialidades",
        insertedDate: "2025-09-20",
        isHighlighted: true,
        data: [
            ["Mês", "Cardio", "Orto", "Neuro"],
            ["Mai", 320, 210, 90],
            ["Jun", 400, 220, 110],
            ["Jul", 380, 240, 120],
            ["Ago", 420, 260, 130],
        ],
    },
    // Não destacados (não devem aparecer na Secretaria)
    {
        id: "g8-pie",
        type: "pie",
        title: "Canais de Atendimento",
        gerencia: "Ouvidoria",
        insertedDate: "2025-09-20",
        isHighlighted: false,
        data: [
            ["Canal", "%"],
            ["Telefone", 30],
            ["Web", 50],
            ["Presencial", 20],
        ],
    },
    {
        id: "g9-bar",
        type: "chart",
        title: "Absenteísmo por Unidade",
        gerencia: "Gestão",
        insertedDate: "2025-09-21",
        isHighlighted: false,
        data: [
            ["Unidade", "%"],
            ["A", 12],
            ["B", 9],
            ["C", 15],
            ["D", 7],
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
                style={
                    diretoria.bannerImage
                        ? {
                            backgroundImage: `url(${diretoria.bannerImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }
                        : {
                            background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`,
                        }
                }
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


            {/* Dashboard Charts - Secretaria uses a special preview showing only highlighted graphs */}
            <div className="flex justify-center items-center w-full pt-2 mb-28">
                <div className="max-w-[90%] w-full">
                    {id === "secretaria" ? (
                        <SecretariaDashboardPreview graphs={graphs} />
                    ) : (
                        <DashboardPreview
                            layout={layout}
                            graphs={graphs}
                            onGraphSelect={() => { }}
                            onGraphRemove={() => { }}
                            onHighlightToggle={() => { }}
                            editMode={false}
                        />
                    )}
                </div>
            </div>

        </div>
    )
}
