"use client"

import { useState } from "react"
import { LayoutSelector, type LayoutType } from "@/components/dashboard/selecionarLayout"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { AvailableGraphsPanel } from "@/components/dashboard/graficos-filterBar"
import { SelecioneGraficoModal } from "@/components/popups/selecioneGrafico-modal"
import { diretoriasConfig } from "@/constants/diretorias";
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/dist/client/components/navigation"

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
            ["Jan", 50, 180, 150],
            ["Fev", 120, 85, 55],
            ["Mar", 130, 90, 60],
        ],
    },
    {
        id: "4",
        title: "Cobertura Vacinal por Faixa Etária",
        type: "chart",
        gerencia: "GTI",
        insertedDate: "2024-02-01",
        data: [
            ["Faixa etária", "Cobertura Atual", "Meta"],
            ["0-1", 80, 90],
            ["1-5", 85, 95],
            ["6-10", 90, 98],
            ["11-15", 88, 97],
        ],
    },
    {
        id: "5",
        title: "Motivo de Alta - Top 5",
        type: "pie",
        gerencia: "GERAL",
        insertedDate: "2024-03-10",
        data: [
            ["Motivo", "Qtd"],
            ["Cura", 120],
            ["Transferência", 45],
            ["Óbito", 5],
            ["Alta Voluntária", 10],
            ["Outro", 20],
        ],
    },
    {
        id: "6",
        title: "Série Temporal - Vacina A",
        type: "line",
        gerencia: "VAC",
        insertedDate: "2024-04-12",
        data: [
            ["Mês", "Dose 1", "Dose 2"],
            ["Jan", 500, 450],
            ["Fev", 600, 480],
            ["Mar", 700, 520],
            ["Abr", 800, 600],
        ],
    },
    {
        id: "7",
        title: "Pequeno - 1 linha",
        type: "chart",
        gerencia: "TEST",
        insertedDate: "2024-05-01",
        data: [["Categoria", "Valor"], ["A", 10]],
    },
    {
        id: "8",
        title: "Muitos Pontos",
        type: "line",
        gerencia: "ANALYTICS",
        insertedDate: "2024-06-15",
        data: [
            ["X", "Y"],
            ...Array.from({ length: 20 }, (_, i) => [`P${i + 1}`, Math.round(Math.random() * 1000)])
        ],
    },
    {
        id: "9",
        title: "Dados Inválidos (teste)",
        type: "pie",
        gerencia: "TEST",
        insertedDate: "2024-06-01",
        data: [], // should show 'Dados indisponíveis' in preview
    },
    {
        id: "10",
        title: "Comparativo Mensal - Serviços",
        type: "chart",
        gerencia: "SERV",
        insertedDate: "2024-07-20",
        data: [
            ["Mês", "Serv1", "Serv2", "Serv3"],
            ["Jan", 120, 80, 60],
            ["Feb", 150, 90, 70],
            ["Mar", 170, 110, 80],
        ],
    },
]

export default function DashboardBuilder() {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>("asymmetric")
    // Keep layoutGraphs as a fixed-length array matching the layout slots to avoid sparse arrays
    const getMaxGraphsForLayout = (layout: LayoutType) => {
        switch (layout) {
            case "asymmetric":
                return 3
            case "grid":
                return 4
            case "sideBySide":
                return 2
            default:
                return 4
        }
    }

    const [layoutGraphs, setLayoutGraphs] = useState<(GraphData | null)[]>(() => Array(getMaxGraphsForLayout(selectedLayout)).fill(null))
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

    const handleGraphSelect = (graph: GraphData) => {
        if (selectedPosition !== null) {
            // Check if graph is already in the layout
            const isGraphAlreadyInLayout = layoutGraphs.some((layoutGraph) => layoutGraph?.id === graph.id)

            if (isGraphAlreadyInLayout) {
                alert("Este gráfico já está presente no layout. Cada gráfico pode ser adicionado apenas uma vez.")
                setSelectedPosition(null)
                return
            }
            // Ensure the array length matches current layout slots
            const max = getMaxGraphsForLayout(selectedLayout)
            const newLayoutGraphs = [...layoutGraphs]
            while (newLayoutGraphs.length < max) newLayoutGraphs.push(null)

            newLayoutGraphs[selectedPosition] = { ...graph, isHighlighted: false }
            setLayoutGraphs(newLayoutGraphs.slice(0, max))
            setSelectedPosition(null)
        }
    }

    const handlePositionSelect = (position: number) => {
        setSelectedPosition(position)
    }

    const handleGraphRemove = (id: string) => {
        setLayoutGraphs((prev) => {
            // Find the first occurrence and remove only that one, keep array length unchanged
            const updatedGraphs = [...prev]
            const indexToRemove = updatedGraphs.findIndex((graph) => graph?.id === id)
            if (indexToRemove !== -1) {
                updatedGraphs[indexToRemove] = null
            }
            return updatedGraphs
        })
    }

    const handleHighlightToggle = (id: string, highlighted: boolean) => {
        setLayoutGraphs((prev) => {
            const currentHighlighted = prev.filter((g) => g?.isHighlighted).length
            if (highlighted && currentHighlighted >= 3) {
                // Limite de 3 destaques
                alert("Cada diretoria pode destacar no máximo 3 gráficos.")
                return prev
            }
            return prev.map((graph) => (graph?.id === id ? { ...graph, isHighlighted: highlighted } : graph))
        })
    }

    const handleLayoutChange = (layout: LayoutType) => {
        setSelectedLayout(layout)
        // Reset graphs to a fixed-length array matching the new layout
        setLayoutGraphs(Array(getMaxGraphsForLayout(layout)).fill(null))
        setSelectedPosition(null)
    }

    const handleSaveDashboard = () => {
        const filledGraphs = layoutGraphs.filter((graph) => graph !== null)
        router.push(`/dashboard/${id}`);
        console.log("Saving dashboard:", { layout: selectedLayout, graphs: filledGraphs })
        // Here you would typically save to a backend
        alert("Dashboard salvo com sucesso!")
    }

    const params = useParams();
    const router = useRouter();
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
                style={
                    diretoria.bannerImage
                        ? {
                            backgroundImage: `url(${diretoria.bannerImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }
                        : {
                            background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`
                        }
                }
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
                    editMode={true}
                />

                <div className="flex justify-end pb-30">
                    <Button
                        onClick={handleSaveDashboard}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-3xl text-md font-medium"
                    >
                        <LayoutDashboard className="mr-2" />
                        SALVAR DASHBOARD
                    </Button>
                </div>

                {/* <AvailableGraphsPanel graphs={mockGraphs} onGraphSelect={handleGraphSelect} /> */}

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
