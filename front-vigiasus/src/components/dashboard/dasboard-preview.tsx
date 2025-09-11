"use client"

import type { GraphType } from "./graficoCard"
import { AddGraphButton } from "./adicionarGrafico"
import { ChartPreview } from "./chart-preview"
import type { LayoutType } from "./selecionarLayout"
import { cn } from "@/lib/utils"

export interface GraphData {
    id: string
    title: string
    type: GraphType
    gerencia: string
    insertedDate: string
    data: any[]        // <-- novo campo
    isHighlighted?: boolean
}


interface DashboardPreviewProps {
    layout: LayoutType
    graphs: (GraphData | null)[]
    onGraphSelect: (position: number) => void
    onGraphRemove: (id: string) => void
    onHighlightToggle: (id: string, highlighted: boolean) => void
}

export function DashboardPreview({
    layout,
    graphs,
    onGraphSelect,
    onGraphRemove,
    onHighlightToggle,
}: DashboardPreviewProps) {
    const getLayoutClasses = () => {
        switch (layout) {
            case "asymmetric":
                return "grid grid-cols-2 grid-rows-2 gap-4 h-96"
            case "grid":
                return "grid grid-cols-2 grid-rows-2 gap-4 h-96"
            case "sideBySide":
                return "grid grid-cols-2 gap-4 h-96"
            default:
                return "grid grid-cols-2 grid-rows-2 gap-4 h-96"
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
                                <div className="relative w-full h-full group">
                                    <ChartPreview type={graph.type} title={graph.title} isHighlighted={graph.isHighlighted} data={graph.data} />
                                    {/* Overlay controls */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            onClick={() => onHighlightToggle(graph.id, !graph.isHighlighted)}
                                            className={`px-2 py-1 text-xs rounded ${graph.isHighlighted ? "bg-blue-500 text-white" : "bg-white text-gray-700 border"
                                                }`}
                                        >
                                            {graph.isHighlighted ? "Destacado" : "Marcar como Destaque"}
                                        </button>
                                        <button
                                            onClick={() => onGraphRemove(graph.id)}
                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <AddGraphButton onClick={() => onGraphSelect(index)} className="w-full h-full" />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
