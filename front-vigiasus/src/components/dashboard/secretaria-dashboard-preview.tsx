"use client"

import { useMemo, useState } from "react"
import type { GraphData } from "./dasboard-preview"
import { DashboardPreview } from "./dasboard-preview"
import type { LayoutType } from "./selecionarLayout"
import { cn } from "@/lib/utils"
import { diretoriasConfig } from "@/constants/diretorias"
import { mapGerenciaToDiretoria } from "@/constants/gerenciaToDiretoria"

import { ArrowLeft, ArrowRight, Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SecretariaDashboardPreviewProps {
    graphs: (GraphData | null)[]
    pageSize?: number
    className?: string
}

export function SecretariaDashboardPreview({ graphs, pageSize = 6, className }: SecretariaDashboardPreviewProps) {
    const highlighted = useMemo(
        () => graphs.filter((g): g is GraphData => !!g && !!g.isHighlighted),
        [graphs]
    )

    // Group by diretoria id using gerencia name mapping
    const groups = useMemo(() => {
        const allDirKeys = Object.keys(diretoriasConfig).filter(k => k !== "secretaria")
        const map = new Map<string, GraphData[]>();
        // initialize all diretorias with empty arrays to ensure a page exists
        for (const key of allDirKeys) map.set(key, [])

        // assign graphs
        for (const g of highlighted) {
            const diretoriaId = mapGerenciaToDiretoria(g.gerencia)
            if (diretoriaId && map.has(diretoriaId)) {
                map.get(diretoriaId)!.push(g)
            } else {
                // group unknown into "outras"
                const otherKey = "outras"
                if (!map.has(otherKey)) map.set(otherKey, [])
                map.get(otherKey)!.push(g)
            }
        }

        const ordered: { id: string; nome: string; graphs: GraphData[] }[] = []
        for (const key of allDirKeys) {
            ordered.push({ id: key, nome: diretoriasConfig[key].nome, graphs: map.get(key)! })
        }
        if (map.has("outras")) {
            ordered.push({ id: "outras", nome: "Outras Diretorias", graphs: map.get("outras")! })
        }
        return ordered
    }, [highlighted])

    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, groups.length)
    const current = groups[Math.min(page - 1, groups.length - 1)]

    const prev = () => setPage(p => Math.max(1, p - 1))
    const next = () => setPage(p => Math.min(totalPages, p + 1))

    if (highlighted.length === 0) {
        return (
            <div className={cn("bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200", className)}>
                <div className="text-center text-gray-500 py-16">Nenhum gráfico destacado pelas diretorias.</div>
            </div>
        )
    }

    // choose DashboardPreview layout based on count
    const count = current?.graphs.length ?? 0
    const chooseLayout = (n: number): LayoutType => {
        if (n >= 3) return "asymmetric"; // capacity 3
        if (n === 2) return "sideBySide"; // capacity 2
        return "grid"; // capacity 4 but will only use 1 slot
    }
    const layout: LayoutType = chooseLayout(count)

    // determine capacity for chosen layout
    const layoutCapacity = layout === "asymmetric" ? 3 : layout === "sideBySide" ? 2 : 4
    const pageGraphs = (current?.graphs ?? []).slice(0, layoutCapacity)

    // Bump a renderVersion when page/layout changes to force chart redraw
    const renderVersion = useMemo(() => {
        const layoutCode = layout === "asymmetric" ? 3 : layout === "sideBySide" ? 2 : 1
        return page * 100 + layoutCode * 10 + (current?.graphs.length ?? 0)
    }, [page, layout, current?.graphs.length])

    return (
        <div className={cn("bg-gray-50/25 rounded-2xl p-6 border border-gray-200 shadow-sm", className)}>
            <div className="mb-2">
                <h1 className="text-5xl font-bold text-blue-600">Contextos em Destaque</h1>
            </div>

            {/* Diretoria label */}
            <div className="mb-6">
                <h3 className="text-3xl font-semibold">
                    {current?.nome}
                </h3>
            </div>

            <DashboardPreview
                layout={layout}
                graphs={pageGraphs}
                onGraphSelect={() => { }}
                onGraphRemove={() => { }}
                onHighlightToggle={() => { }}
                editMode={false}
                renderVersion={renderVersion}
            />

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                        size="icon"
                        className="px-3 py-1.5 text-sm rounded-full border bg-white  border-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:border-gray-400"
                        onClick={prev}
                        disabled={page === 1}
                    >
                        <ArrowLeft className="h-4 w-4 text-gray-500" />
                    </Button>
                    <span className="text-lg text-gray-600">Diretoria {page} de {totalPages}</span>
                    <Button
                        size="icon"
                        className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        onClick={next}
                        disabled={page === totalPages}
                    >
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>
            )}
        </div>
    )
}
