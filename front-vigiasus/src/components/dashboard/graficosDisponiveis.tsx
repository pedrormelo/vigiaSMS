"use client"

import { GraphCard } from "./graficoCard"
import type { GraphData } from "./dasboard-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/input"
import { useState } from "react"

interface AvailableGraphsProps {
    graphs: GraphData[]
    onGraphSelect: (graph: GraphData) => void
}

export function AvailableGraphs({ graphs, onGraphSelect }: AvailableGraphsProps) {
    const [filter, setFilter] = useState<"all" | "recent">("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredGraphs = graphs.filter((graph) => {
        const matchesSearch =
            graph.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            graph.gerencia.toLowerCase().includes(searchQuery.toLowerCase())

        if (filter === "recent") {
            const graphDate = new Date(graph.insertedDate)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return matchesSearch && graphDate >= thirtyDaysAgo
        }

        return matchesSearch
    })

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-600">Gráficos Disponíveis</h2>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <Input
                        placeholder="Pesquise pelo nome do Contexto ou da Gerência"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={filter === "recent" ? "default" : "outline"}
                    onClick={() => setFilter("recent")}
                    className="rounded-full"
                >
                    Mais Recentes
                </Button>
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    className="rounded-full"
                >
                    Todos
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-h-96 overflow-y-auto">
                {filteredGraphs.map((graph) => (
                    <GraphCard
                        key={graph.id}
                        id={graph.id}
                        title={graph.title}
                        type={graph.type}
                        gerencia={graph.gerencia}
                        insertedDate={graph.insertedDate}
                        onClick={() => onGraphSelect(graph)}
                    />
                ))}
            </div>
        </div>
    )
}
