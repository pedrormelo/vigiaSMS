"use client"

import { useMemo, useState } from "react"
import type { GraphData } from "./dasboard-preview"
import { DashboardPreview } from "./dasboard-preview"
import type { LayoutType } from "./selecionarLayout"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { getDiretorias, getGerencias, type Diretoria, type Gerencia } from "@/services/organizacaoService"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SecretariaDashboardPreviewProps {
    graphs: (GraphData | null)[]
    className?: string
}

type DiretoriaGroup = {
    id: string;
    nome: string;
    graphs: GraphData[];
    color?: string;
}

export function SecretariaDashboardPreview({ graphs, className }: SecretariaDashboardPreviewProps) {
    const [diretorias, setDiretorias] = useState<Diretoria[]>([])
    const [gerencias, setGerencias] = useState<Gerencia[]>([])

    useEffect(() => {
        let active = true
        ;(async () => {
            try {
                const [dirs, gers] = await Promise.all([getDiretorias(), getGerencias()])
                if (active) { setDiretorias(dirs || []); setGerencias(gers || []) }
            } catch { /* noop */ }
        })()
        return () => { active = false }
    }, [])
    const highlighted = useMemo(
        () => graphs.filter((g): g is GraphData => Boolean(g && g.isHighlighted)),
        [graphs]
    )

    // Group highlighted graphs by diretoria, using direct ids when available
    const groups = useMemo<DiretoriaGroup[]>(() => {
        const dirIdToSlug = new Map(diretorias.map(d => [d.id, d.slug || d.id]))
        const dirSlugToName = new Map(diretorias.map(d => [d.slug || d.id, d.nome]))
        const dirSlugToColor = new Map(diretorias.map(d => [d.slug || d.id, d.corFrom]))

        const gerenciaIdToDirSlug = new Map<string, string>()
        const gerenciaNameToDirSlug = new Map<string, string>()
        for (const g of gerencias) {
            const slug = dirIdToSlug.get(g.diretoriaId)
            if (!slug) continue
            gerenciaIdToDirSlug.set(g.id, slug)
            if (g.nome) gerenciaNameToDirSlug.set(g.nome.toLowerCase(), slug)
        }

        const orderedSlugs = diretorias
            .filter(d => (d.slug || d.id) !== "secretaria")
            .map(d => d.slug || d.id)

        const map = new Map<string, GraphData[]>()
        for (const slug of orderedSlugs) {
            map.set(slug, [])
        }

        for (const graph of highlighted) {
            let dirSlug: string | undefined
            if (graph.diretoriaId) {
                dirSlug = dirIdToSlug.get(graph.diretoriaId) || dirSlug
            }
            if (!dirSlug && graph.gerenciaId) {
                dirSlug = gerenciaIdToDirSlug.get(graph.gerenciaId) || dirSlug
            }
            const nomeBase = graph.gerenciaNome || graph.gerencia || ""
            if (!dirSlug && nomeBase) {
                dirSlug = gerenciaNameToDirSlug.get(nomeBase.toLowerCase()) || dirSlug
            }
            if (!dirSlug) {
                dirSlug = "outras"
            }
            if (!map.has(dirSlug)) {
                map.set(dirSlug, [])
            }
            map.get(dirSlug)!.push(graph)
        }

        const ordered: DiretoriaGroup[] = []
        for (const slug of orderedSlugs) {
            ordered.push({
                id: slug,
                nome: dirSlugToName.get(slug) || slug,
                graphs: map.get(slug) || [],
                color: dirSlugToColor.get(slug) || undefined
            })
        }
        if (map.has("outras")) {
            ordered.push({ id: "outras", nome: "Outras Diretorias", graphs: map.get("outras") || [] })
        }
        return ordered
    }, [highlighted, diretorias, gerencias])

    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, groups.length)
    const current = groups[Math.min(page - 1, groups.length - 1)]

    const prev = () => setPage(p => Math.max(1, p - 1))
    const next = () => setPage(p => Math.min(totalPages, p + 1))

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

    const titleStyle = useMemo(() => {
        const color = current?.color
        return color ? { color } : undefined
    }, [current?.color])

    if (highlighted.length === 0) {
        return (
            <div className={cn("bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200", className)}>
                <div className="text-center text-gray-500 py-16">Nenhum gráfico destacado pelas diretorias.</div>
            </div>
        )
    }

    return (
        <div className={cn("bg-gray-50/25 rounded-2xl p-6 border border-gray-200 shadow-sm", className)}>
            <div className="mb-2">
                <h3 className={cn("text-5xl font-bold")} style={titleStyle}>
                    {current?.nome}
                </h3>
            </div>

            {/* Diretoria label */}
            <div className="mb-6">
                <h1 className="text-3xl font-regular text-gray-500">Contextos em Destaque</h1>
            </div>

            {pageGraphs.length > 0 ? (
                <DashboardPreview
                    layout={layout}
                    graphs={pageGraphs}
                    onGraphSelect={() => { }}
                    onGraphRemove={() => { }}
                    onHighlightToggle={() => { }}
                    editMode={false}
                    renderVersion={renderVersion}
                />
            ) : (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <p className="text-gray-500 text-lg">Nenhum gráfico destacado por essa diretoria.</p>
                </div>
            )}

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
