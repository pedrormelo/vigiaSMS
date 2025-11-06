// src/components/gerencia/dashboard/gerencia-dashboard-preview.tsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import type { LayoutType } from "@/components/dashboard/selecionarLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

// --- INÍCIO DAS ALTERAÇÕES ---
import type { Contexto } from "@/components/validar/typesDados"; // Importa o tipo Contexto
import type { ConjuntoDeDadosGrafico } from "@/components/popups/addContextoModal/types"; // Importa o tipo do Payload
import type { GraphType } from "@/components/dashboard/graficoCard"; // Importa o GraphType
// --- FIM DAS ALTERAÇÕES ---


interface GerenciaDashboardPreviewProps {
    graphs: Contexto[] // <-- Alterado de (GraphData | null)[] para Contexto[]
    gerencia: string
    className?: string
}

export function GerenciaDashboardPreview({ graphs, gerencia, className }: GerenciaDashboardPreviewProps) {
    
    // --- INÍCIO DA ALTERAÇÃO ---
    // Mapeia o formato Contexto[] para GraphData[]
    const filteredAsGraphData = useMemo(() => {
        return graphs
            .filter(ctx => ctx.gerencia === gerencia) // Filtra pela gerência ID (g6, g7, etc.)
            .map((ctx): GraphData => {
                // Mapeia o formato Contexto -> GraphData
                const payload = (ctx.payload as ConjuntoDeDadosGrafico) || { colunas: [], linhas: [] };
                return {
                    id: ctx.id,
                    title: ctx.title,
                    type: (ctx.chartType as GraphType) || 'chart', // Converte chartType para type
                    gerencia: ctx.gerencia || 'N/A', 
                    insertedDate: ctx.insertedDate,
                    isHighlighted: ctx.estaOculto, 
                    // Constrói o array 'data' que o ChartPreview espera [colunas, ...linhas]
                    data: [
                        payload.colunas,
                        ...payload.linhas
                    ], 
                    colors: payload.cores
                };
            });
    }, [graphs, gerencia]);
    // --- FIM DA ALTERAÇÃO ---


    // Escolhe um layout com base no número de gráficos
    const chooseLayout = (n: number): LayoutType => {
        if (n >= 3) return "asymmetric" // capacidade 3
        if (n === 2) return "sideBySide" // capacidade 2
        return "grid" // capacidade 4, usará 1 slot para um único gráfico
    }

    // Constrói páginas com layouts dinâmicos por página
    const [page, setPage] = useState(0)

    // Calcula as páginas dinamicamente
    const pages = useMemo(() => {
        // Usa filteredAsGraphData
        if (filteredAsGraphData.length === 0) return []

        const result: { graphs: GraphData[], layout: LayoutType }[] = []
        let remaining = [...filteredAsGraphData] // Usa filteredAsGraphData

        while (remaining.length > 0) {
            const count = remaining.length
            let takeCount: number
            let layout: LayoutType

            if (count >= 3) {
                layout = "asymmetric"
                takeCount = 3
            } else if (count === 2) {
                layout = "sideBySide"
                takeCount = 2
            } else {
                layout = "grid"
                takeCount = 1 
            }

            result.push({
                graphs: remaining.slice(0, takeCount),
                layout
            })
            remaining = remaining.slice(takeCount)
        }

        return result
    }, [filteredAsGraphData]) // Depende de filteredAsGraphData

    const totalPages = Math.max(1, pages.length)

    useEffect(() => {
        setPage((p) => (p >= totalPages ? Math.max(0, totalPages - 1) : p))
    }, [totalPages])

    const currentPage = pages[page] || { graphs: [], layout: "grid" as LayoutType }
    const pageGraphs = currentPage.graphs
    const layout = currentPage.layout

    const renderVersion = useMemo(() => {
        const layoutCode = layout === "asymmetric" ? 3 : layout === "sideBySide" ? 2 : 1;
        return page * 10 + layoutCode;
    }, [page, layout]);


    // Usa filteredAsGraphData para a verificação de vazio
    if (filteredAsGraphData.length === 0) {
        return (
            <div className="bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
                Nenhum gráfico cadastrado para esta gerência.
            </div>
        )
    }

    return (
        <div className={cn("relative", className)}>
            <DashboardPreview
                key={`${gerencia}-${layout}-${page}`} 
                layout={layout}
                graphs={pageGraphs}
                onGraphSelect={() => {}}
                onGraphRemove={() => {}}
                onHighlightToggle={() => {}}
                editMode={false}
                renderVersion={renderVersion} 
            />

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                        size="icon"
                        className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:border-gray-400"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        aria-label="Página anterior"
                    >
                        <ArrowLeft className="h-4 w-4 text-gray-500" />
                    </Button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Ir para página ${i + 1}`}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-colors",
                                    i === page ? "bg-[#2651FF]" : "bg-blue-300 hover:bg-blue-400"
                                )}
                                onClick={() => setPage(i)}
                            />
                        ))}
                    </div>

                    <Button
                        size="icon"
                        className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        aria-label="Próxima página"
                    >
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default GerenciaDashboardPreview;