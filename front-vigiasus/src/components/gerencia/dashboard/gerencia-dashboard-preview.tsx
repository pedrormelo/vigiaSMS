// src/components/gerencia/dashboard/gerencia-dashboard-preview.tsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import type { LayoutType } from "@/components/dashboard/selecionarLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface GerenciaDashboardPreviewProps {
    graphs: (GraphData | null)[]
    gerencia: string
    className?: string
}

export function GerenciaDashboardPreview({ graphs, gerencia, className }: GerenciaDashboardPreviewProps) {
    // Filtra apenas os gráficos que pertencem a esta gerência
    const filtered = useMemo(
        () => graphs.filter((g): g is GraphData => !!g && g.gerencia === gerencia),
        [graphs, gerencia]
    )

    // Escolhe um layout com base no número de gráficos (mesma abordagem usada na secretaria)
    const chooseLayout = (n: number): LayoutType => {
        if (n >= 3) return "asymmetric" // capacidade 3
        if (n === 2) return "sideBySide" // capacidade 2
        return "grid" // capacidade 4, usará 1 slot para um único gráfico
    }

    // Constrói páginas com layouts dinâmicos por página
    const [page, setPage] = useState(0)

    // Calcula as páginas dinamicamente: preenche cada página otimamente, depois escolhe o layout por página
    const pages = useMemo(() => {
        if (filtered.length === 0) return []

        const result: { graphs: GraphData[], layout: LayoutType }[] = []
        let remaining = [...filtered]

        while (remaining.length > 0) {
            // Determina o layout ideal para os gráficos restantes
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
                takeCount = 1 // Mesmo que a capacidade seja 4, pegamos apenas 1 se for o último
            }

            result.push({
                graphs: remaining.slice(0, takeCount),
                layout
            })
            remaining = remaining.slice(takeCount)
        }

        return result
    }, [filtered])

    const totalPages = Math.max(1, pages.length)

    // Se o filtro mudar e a página atual ficar fora do intervalo, ajusta-a
    useEffect(() => {
        setPage((p) => (p >= totalPages ? Math.max(0, totalPages - 1) : p))
    }, [totalPages])

    const currentPage = pages[page] || { graphs: [], layout: "grid" as LayoutType }
    const pageGraphs = currentPage.graphs
    const layout = currentPage.layout

    // ***** INÍCIO DA MODIFICAÇÃO *****
    // Calcula uma renderVersion que muda com a página e o layout
    const renderVersion = useMemo(() => {
        // Cria um identificador único para a combinação de página e layout
        const layoutCode = layout === "asymmetric" ? 3 : layout === "sideBySide" ? 2 : 1;
        // Usa uma combinação simples que muda quando a página ou layout muda
        return page * 10 + layoutCode;
    }, [page, layout]);
    // ***** FIM DA MODIFICAÇÃO *****


    if (filtered.length === 0) {
        return (
            <div className="bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
                Nenhum gráfico cadastrado para esta gerência.
            </div>
        )
    }

    return (
        <div className={cn("relative", className)}>
            {/* Corpo do Carrossel */}
            <DashboardPreview
                key={`${gerencia}-${layout}-${page}`} // Key existente está boa
                layout={layout}
                graphs={pageGraphs}
                onGraphSelect={() => {}}
                onGraphRemove={() => {}}
                onHighlightToggle={() => {}}
                editMode={false}
                renderVersion={renderVersion} // ***** MODIFICAÇÃO: Passa a renderVersion calculada *****
            />

            {/* Controles: mostra apenas se houver várias páginas */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                        size="icon"
                        className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:border-gray-400"
                        onClick={() => setPage((p) => Math.max(0, p - 1))} // Simplificado para ir para trás
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
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} // Simplificado para ir para a frente
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