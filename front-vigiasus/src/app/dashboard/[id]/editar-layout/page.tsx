"use client"

import { useState } from "react"
import { LayoutSelector, type LayoutType } from "@/components/dashboard/selecionarLayout"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { AvailableGraphsPanel } from "@/components/dashboard/graficos-filterBar"
import { SelecioneGraficoModal } from "@/components/popups/selecioneGrafico-modal"
import { diretoriasConfig } from "@/constants/diretorias";
import { Button } from "@/components/ui/button"
import { useParams } from "next/dist/client/components/navigation"

import { Info, LayoutDashboard } from "lucide-react";

// Mock data for available graphs
const mockGraphs: GraphData[] = [
    {
        id: "1",
        title: "Distribuição de Atendimentos",
        type: "pie",
        gerencia: "GPLAN",
        insertedDate: "2024-01-15",
        data: [
            ["Categoria", "Atendimentos"],
            ["Atendimento Básico", 45],
            ["Urgência", 25],
            ["Emergência", 15],
            ["Consulta", 15],
        ],
    },
    {
        id: "2",
        title: "Unidades com o PEC Implementado",
        type: "chart",
        gerencia: "GTI",
        insertedDate: "2024-01-10",
        data: [
            ["Unidade", "Implementado"],
            ["Unidade A", 80],
            ["Unidade B", 65],
            ["Unidade C", 90],
        ],
    },
    {
        id: "3",
        title: "Atendimento de Alta vs Média e Baixa Complexidade",
        type: "line",
        gerencia: "GPLAN",
        insertedDate: "2024-01-20",
        data: [
            ["Mês", "Alta", "Média", "Baixa"],
            ["Jan", 100, 80, 50],
            ["Fev", 120, 85, 55],
            ["Mar", 130, 90, 60],
        ],
    },
]

export default function DashboardBuilder() {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>("asymmetric")
    const [layoutGraphs, setLayoutGraphs] = useState<(GraphData | null)[]>([])
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

    const handleGraphSelect = (graph: GraphData) => {
        if (selectedPosition !== null) {
            const newLayoutGraphs = [...layoutGraphs]
            newLayoutGraphs[selectedPosition] = { ...graph, isHighlighted: false }
            setLayoutGraphs(newLayoutGraphs)
            setSelectedPosition(null)
        }
    }

    const handlePositionSelect = (position: number) => {
        setSelectedPosition(position)
    }

    const handleGraphRemove = (id: string) => {
        setLayoutGraphs((prev) => prev.map((graph) => (graph?.id === id ? null : graph)))
    }

    const handleHighlightToggle = (id: string, highlighted: boolean) => {
        setLayoutGraphs((prev) =>
            prev.map((graph) => (graph?.id === id ? { ...graph, isHighlighted: highlighted } : graph)),
        )
    }

    const handleLayoutChange = (layout: LayoutType) => {
        setSelectedLayout(layout)
        setLayoutGraphs([]) // Reset graphs when layout changes
        setSelectedPosition(null)
    }

    const handleSaveDashboard = () => {
        const filledGraphs = layoutGraphs.filter((graph) => graph !== null)
        console.log("Saving dashboard:", { layout: selectedLayout, graphs: filledGraphs })
        // Here you would typically save to a backend
        alert("Dashboard salvo com sucesso!")
    }

    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return <p className="text-center mt-10">Carregando...</p>;
    }

    const diretoria = diretoriasConfig[id];

    if (!diretoria) {
        return <p className="text-center mt-10">Diretoria não encontrada</p>;
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header com gradiente dinâmico via 'style' */}
            <div
                className="relative p-10 text-white shadow-lg"
                style={{
                    background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`
                }}
            >
                <div className="flex justify-between items-center">
                    {/* Títulos */}
                    <div className="text-white">
                        <h1 className="text-4xl font-regular">
                            {diretoria.nome}
                        </h1>
                        <p className="text-5xl mt-2 font-bold opacity-90">Painel de Dashboards</p>
                    </div>

                    {/* Botões do canto direito */}
                    <div className="flex flex-col items-center gap-3">
                        <button className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm">
                            <Info size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Seletor de Dashboard */}
            <div className="max-w-[90%] pt-6 mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-regular text-blue-600">Escolha o layout da dashboard</h1>
                    <LayoutSelector selectedLayout={selectedLayout} onLayoutChange={handleLayoutChange} />
                </div>

                <DashboardPreview
                    layout={selectedLayout}
                    graphs={layoutGraphs}
                    onGraphSelect={handlePositionSelect}
                    onGraphRemove={handleGraphRemove}
                    onHighlightToggle={handleHighlightToggle}
                />

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveDashboard}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-3xl text-md font-medium"
                    >
                        <LayoutDashboard className="mr-2" />
                        SALVAR DASHBOARD
                    </Button>
                </div>

                <AvailableGraphsPanel graphs={mockGraphs} onGraphSelect={handleGraphSelect} />

                <SelecioneGraficoModal
                    open={selectedPosition !== null}
                    onClose={() => setSelectedPosition(null)}
                    graphs={mockGraphs}
                    onGraphSelect={handleGraphSelect}
                />
            </div>
        </div>
    )
}
