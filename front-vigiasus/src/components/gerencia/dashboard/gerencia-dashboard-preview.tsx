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
import { normalizeGraphType } from "@/lib/graphTypes";
// --- FIM DAS ALTERAÇÕES ---


interface GerenciaDashboardPreviewProps {
    graphs: Contexto[] // <-- Alterado de (GraphData | null)[] para Contexto[]
    gerencia: string
    className?: string
    disabled?: boolean
}

export function GerenciaDashboardPreview({ graphs, gerencia, className, disabled = false }: GerenciaDashboardPreviewProps) {
    
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
                    type: normalizeGraphType(ctx.chartType),
                    gerencia: ctx.gerencia || 'N/A', 
                    insertedDate: ctx.insertedDate,
                    isHighlighted: ctx.estaOculto, 
                    // Constrói o array 'data' que o ChartPreview espera [colunas, ...linhas]
                    data: [
                        payload.colunas,
                        ...payload.linhas
                    ], 
                    colors: payload.cores,
                    status: ctx.status
                };
            });
    }, [graphs, gerencia]);
    // --- FIM DA ALTERAÇÃO ---


    // Sempre limitar a páginas de até 3 gráficos usando layout assimétrico
    const [page, setPage] = useState(0)

    const pages = useMemo(() => {
        if (filteredAsGraphData.length === 0) return []
        const chunked: GraphData[][] = []
        for (let i = 0; i < filteredAsGraphData.length; i += 3) {
            chunked.push(filteredAsGraphData.slice(i, i + 3))
        }
        return chunked
    }, [filteredAsGraphData])

    const totalPages = Math.max(1, pages.length)

    useEffect(() => {
        setPage(p => (p >= totalPages ? Math.max(0, totalPages - 1) : p))
    }, [totalPages])

    const pageGraphs = pages[page] || []
    // Layout é sempre "asymmetric" conforme regra solicitada
    const layout: LayoutType = "asymmetric"

    const renderVersion = useMemo(() => page * 10 + 3, [page])


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
                key={`${gerencia}-asymmetric-${page}`}
                layout={layout}
                graphs={pageGraphs}
                onGraphSelect={() => {}}
                onGraphRemove={() => {}}
                onHighlightToggle={() => {}}
                editMode={false}
                renderVersion={renderVersion}
                disabled={disabled}
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