// src/components/gerencia/dashboard/gerencia-dashboard-preview.tsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import type { LayoutType } from "@/components/dashboard/selecionarLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Eye, EyeOff, RotateCcw } from "lucide-react"

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
    canEdit?: boolean
    hiddenGraphIds?: string[]
    onHideGraph?: (contextoId: string) => void
    onRestoreGraph?: (contextoId: string) => void
    onRestoreAllGraphs?: () => void
}

export function GerenciaDashboardPreview({
    graphs,
    gerencia,
    className,
    disabled = false,
    canEdit = false,
    hiddenGraphIds = [],
    onHideGraph,
    onRestoreGraph,
    onRestoreAllGraphs
}: GerenciaDashboardPreviewProps) {
    
    // --- INÍCIO DA ALTERAÇÃO ---
    // Mapeia o formato Contexto[] para GraphData[]
    const allGraphsAsData = useMemo(() => {
        return graphs
            .filter(ctx => ctx.gerencia === gerencia)
            .map((ctx): GraphData => {
                const payload = (ctx.payload as ConjuntoDeDadosGrafico) || { colunas: [], linhas: [] };
                return {
                    id: ctx.id,
                    title: ctx.title,
                    type: normalizeGraphType(ctx.chartType),
                    gerencia: ctx.gerencia || 'N/A',
                    insertedDate: ctx.insertedDate,
                    isHighlighted: ctx.estaOculto,
                    data: [payload.colunas, ...(payload.linhas || [])],
                    colors: payload.cores,
                    status: ctx.status
                };
            });
    }, [graphs, gerencia]);

    const hiddenSet = useMemo(() => new Set(hiddenGraphIds), [hiddenGraphIds]);

    const visibleGraphs = useMemo(
        () => allGraphsAsData.filter(graph => !hiddenSet.has(graph.id)),
        [allGraphsAsData, hiddenSet]
    );

    const hiddenGraphs = useMemo(
        () => allGraphsAsData.filter(graph => hiddenSet.has(graph.id)),
        [allGraphsAsData, hiddenSet]
    );
    // --- FIM DA ALTERAÇÃO ---


    // Sempre limitar a páginas de até 3 gráficos usando layout assimétrico
    const [page, setPage] = useState(0)

    const pages = useMemo(() => {
        if (visibleGraphs.length === 0) return []
        const chunked: GraphData[][] = []
        for (let i = 0; i < visibleGraphs.length; i += 3) {
            chunked.push(visibleGraphs.slice(i, i + 3))
        }
        return chunked
    }, [visibleGraphs])

    const totalPages = pages.length

    useEffect(() => {
        setPage(p => (p >= totalPages ? Math.max(0, totalPages - 1) : p))
    }, [totalPages])

    const pageGraphs = pages[page] || []
    // Layout é sempre "asymmetric" conforme regra solicitada
    const layout: LayoutType = "asymmetric"

    const renderVersion = useMemo(() => page * 10 + 3, [page])


    // Usa filteredAsGraphData para a verificação de vazio
    const hasVisibleGraphs = visibleGraphs.length > 0

    if (!hasVisibleGraphs && hiddenGraphs.length === 0) {
        return (
            <div className="bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
                Nenhum gráfico cadastrado para esta gerência.
            </div>
        )
    }

    return (
        <div className={cn("relative", className)}>
            {hasVisibleGraphs ? (
                <DashboardPreview
                    key={`${gerencia}-asymmetric-${page}`}
                    layout={layout}
                    graphs={pageGraphs}
                    onGraphSelect={() => {}}
                    onGraphRemove={(id) => onHideGraph?.(id)}
                    onHighlightToggle={() => {}}
                    editMode={canEdit}
                    renderVersion={renderVersion}
                    disabled={disabled}
                    removeButtonTitle="Ocultar deste painel"
                    removeButtonIcon={<EyeOff className="h-5 w-5" />}
                    showHighlightToggle={false}
                />
            ) : (
                <div className="bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
                    Todos os gráficos desta gerência estão ocultos neste painel.
                    {canEdit && onRestoreAllGraphs && (
                        <div className="mt-4 flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRestoreAllGraphs}
                                className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Reexibir todos
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {hasVisibleGraphs && totalPages > 1 && (
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

            {canEdit && hiddenGraphs.length > 0 && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold">Gráficos ocultos ({hiddenGraphs.length})</span>
                        {onRestoreAllGraphs && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRestoreAllGraphs}
                                className="h-8 rounded-full text-blue-700 hover:bg-blue-100"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Reexibir todos
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hiddenGraphs.map(graph => (
                            <Button
                                key={graph.id}
                                variant="secondary"
                                size="sm"
                                onClick={() => onRestoreGraph?.(graph.id)}
                                className="rounded-full border border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
                            >
                                <Eye className="h-4 w-4 mr-1" /> {graph.title}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GerenciaDashboardPreview;