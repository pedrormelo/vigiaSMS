"use client"

import type { GraphType } from "./graficoCard"
import { AddGraphButton } from "./adicionarGrafico"
import { ChartPreview } from "./chart-preview"
import type { LayoutType } from "./selecionarLayout"
import { cn } from "@/lib/utils"

import { Trash } from "lucide-react"
import { useMemo, useState } from "react"
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal"
import type { DetalhesContexto, ConjuntoDeDadosGrafico, TipoGrafico } from "@/components/popups/addContextoModal/types"
import type { FileType } from "@/components/contextosCard/contextoCard"

export interface GraphData {
    id: string
    title: string
    type: GraphType
    gerencia: string
    insertedDate: string
    data: any[]        
    colors?: string[]  // Add colors support
    isHighlighted?: boolean
    editMode?: boolean
}


interface DashboardPreviewProps {
    layout: LayoutType
    graphs: (GraphData | null)[]
    onGraphSelect: (position: number) => void
    onGraphRemove: (id: string) => void
    onHighlightToggle: (id: string, highlighted: boolean) => void
    editMode?: boolean
    renderVersion?: number
}

export function DashboardPreview({
    layout,
    graphs,
    onGraphSelect,
    onGraphRemove,
    onHighlightToggle,
    editMode = false,
    renderVersion,
}: DashboardPreviewProps) {
    const [modalAberto, setModalAberto] = useState(false)
    const [detalhesSelecionados, setDetalhesSelecionados] = useState<DetalhesContexto | null>(null)

    const mapGraphToDetalhes = (graph: GraphData): DetalhesContexto => {
        // GraphData.data expected as Google Charts array: [columns, ...rows]
        const cols = Array.isArray(graph.data) && graph.data.length > 0 ? (graph.data[0] as string[]) : []
        const rows = Array.isArray(graph.data) && graph.data.length > 1 ? (graph.data.slice(1) as (string | number)[][]) : []
        const dataset: ConjuntoDeDadosGrafico = {
            colunas: cols,
            linhas: rows,
            cores: graph.colors,
        }
        const chartType = (graph.type as TipoGrafico) ?? "chart"

        const detalhes: DetalhesContexto = {
            id: graph.id,
            title: graph.title,
            type: "dashboard" as FileType,
            insertedDate: graph.insertedDate,
            payload: dataset,
            chartType,
            description: undefined,
            solicitante: undefined,
        }
        return detalhes
    }

    const abrirDetalhes = (graph: GraphData) => {
        const det = mapGraphToDetalhes(graph)
        setDetalhesSelecionados(det)
        setModalAberto(true)
    }
    const getLayoutClasses = () => {
        switch (layout) {
            case "asymmetric":
                return "grid grid-cols-2 grid-rows-2 gap-4 h-[32rem]"
            case "grid":
                return "grid grid-cols-2 grid-rows-2 gap-4 h-[32rem]"
            case "sideBySide":
                return "grid grid-cols-2 gap-4 h-[32rem]"
            default:
                return "grid grid-cols-2 grid-rows-2 gap-4 h-[32rem]"
        }
    }

    const getItemClasses = (index: number) => {
        if (layout === "asymmetric") {
            return index === 0 ? "row-span-2" : ""
        }
        if (layout === "sideBySide") {
            return "row-span-1"
        }
        return ""
    }

    const getMaxGraphs = () => {
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

    const maxGraphs = getMaxGraphs()
    const displayGraphs = graphs.slice(0, maxGraphs)

    // Fill empty slots
    while (displayGraphs.length < maxGraphs) {
        displayGraphs.push(null)
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
            <div className={getLayoutClasses()}>
                {displayGraphs.map((graph, index) => {
                    return (
                        <div key={index} className={cn("flex items-center justify-center", getItemClasses(index))}>
                            {graph ? (
                                <div className={`relative w-full h-full group ${editMode ? "border-2 rounded-2xl border-dashed border-gray-200" : ""}`}>
                                    <ChartPreview
                                        key={`${graph.id}-${renderVersion ?? 0}`}
                                        type={graph.type}
                                        title={graph.title}
                                        isHighlighted={graph.isHighlighted}
                                        data={graph.data}
                                        colors={graph.colors}
                                        editMode={editMode}
                                        renderVersion={renderVersion}
                                        onShowDetails={() => abrirDetalhes(graph)}
                                    />
                                    {editMode && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center">
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs text-gray-500 font-medium pr-2">Marcar como <span className="font-bold">Destaque</span></p>
                                                <button
                                                    onClick={() => onHighlightToggle(graph.id, !graph.isHighlighted)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                        graph.isHighlighted ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                                    title={graph.isHighlighted ? "Remover destaque" : "Marcar como destaque"}
                                                >
                                                    <span
                                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                                            graph.isHighlighted ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onGraphRemove(graph.id)}
                                                className="p-2 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                                                title="Remover gráfico"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                editMode ? <AddGraphButton onClick={() => onGraphSelect(index)} className="w-full h-full" /> : null
                            )}
                        </div>
                    )
                })}
            </div>
            {/* Modal de Visualização do Contexto para gráficos */}
            <VisualizarContextoModal
                estaAberto={modalAberto}
                aoFechar={() => setModalAberto(false)}
                dadosDoContexto={detalhesSelecionados}
                perfil="membro"
            />
        </div>
    )
}
