"use client"

import { useEffect, useState } from "react"
import { LayoutSelector, type LayoutType } from "@/components/dashboard/selecionarLayout"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { SelecioneGraficoModal } from "@/components/popups/selecioneGrafico-modal"
import { SelecioneKpiModal } from "@/components/popups/selecioneKpiModal"
import { diretoriasConfig } from "@/constants/diretorias";
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/dist/client/components/navigation"
import { showSuccessToast, showWarningToast } from "@/components/ui/Toasts";

import { Info, LayoutDashboard, Plus, Star, Trash } from "lucide-react";
import { authService } from "@/services/authService";
import { getDiretoriaBySlug, type Diretoria } from "@/services/organizacaoService";
import { getDiretoriaDashboardLayout, getDiretoriaDashboardKpis, listAvailableGraphsForDiretoria, listAvailableKpisForDiretoria, mapLayoutItemsToGraphData, saveDiretoriaDashboardKpis, saveDiretoriaDashboardLayout, setVersaoDestaque, type DashboardKpiSelection, type IndicatorMetric } from "@/services/dashboardService";

// Available graphs will be loaded dynamically

export default function DashboardBuilder() {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>("asymmetric")
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [authorized, setAuthorized] = useState(false)
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

    const MAX_KPIS = 5

    const formatKpiValue = (metric: IndicatorMetric) => {
        const unit = metric.unidade?.trim()
        const value = metric.valorAtualTexto || "0"
        if (!unit || unit.toLowerCase() === "nenhum") return value
        if (["R$", "$", "€"].includes(unit)) return `${unit} ${value}`
        return `${value} ${unit}`
    }

    const sortMetricsByDate = (metrics: IndicatorMetric[]) => {
        return [...metrics].sort((a, b) => {
            if (!a.updatedAt && !b.updatedAt) return 0
            if (!a.updatedAt) return 1
            if (!b.updatedAt) return -1
            return b.updatedAt.localeCompare(a.updatedAt)
        })
    }

    const [layoutGraphs, setLayoutGraphs] = useState<(GraphData | null)[]>(() => Array(getMaxGraphsForLayout(selectedLayout)).fill(null))
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
    const [availableGraphs, setAvailableGraphs] = useState<GraphData[]>([])
    const [selectedKpis, setSelectedKpis] = useState<DashboardKpiSelection[]>([])
    const [availableKpis, setAvailableKpis] = useState<IndicatorMetric[]>([])
    const [kpiModalOpen, setKpiModalOpen] = useState(false)
    const [loadingLayout, setLoadingLayout] = useState(false)
    const [loadingAvailable, setLoadingAvailable] = useState(false)
    const [loadingKpis, setLoadingKpis] = useState(false)
    const [diretoriaApi, setDiretoriaApi] = useState<Diretoria | null>(null)

    const handleGraphSelect = (graph: GraphData) => {
        if (selectedPosition !== null) {
            // Check if graph is already in the layout
            const isGraphAlreadyInLayout = layoutGraphs.some((layoutGraph) => layoutGraph?.id === graph.id)

            if (isGraphAlreadyInLayout) {
                showWarningToast("Este gráfico já está presente no layout. Cada gráfico pode ser adicionado apenas uma vez.")
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

    const handleKpiSelect = (metric: IndicatorMetric) => {
        if (selectedKpis.some((item) => item.contextoVersaoId === metric.contextoVersaoId)) {
            showWarningToast("Este indicador já foi adicionado.")
            return
        }
        if (selectedKpis.length >= MAX_KPIS) {
            showWarningToast(`Você pode selecionar no máximo ${MAX_KPIS} indicadores.`)
            return
        }

        setSelectedKpis((prev) => {
            if (prev.some((item) => item.contextoVersaoId === metric.contextoVersaoId) || prev.length >= MAX_KPIS) {
                return prev
            }
            const next: DashboardKpiSelection[] = [...prev, {
                dashboardKpiId: metric.id,
                diretoriaId: diretoriaApi?.id || metric.diretoriaId,
                contextoVersaoId: metric.contextoVersaoId,
                position: prev.length,
                isHighlighted: false,
                metric: { ...metric, isHighlighted: false },
            }]
            return next.map((item, index) => ({ ...item, position: index }))
        })

        setAvailableKpis((prev) => prev.filter((item) => item.contextoVersaoId !== metric.contextoVersaoId))

        if (selectedKpis.length + 1 >= MAX_KPIS) {
            setKpiModalOpen(false)
        }
    }

    const handleKpiRemove = (contextoVersaoId: string) => {
        let removedMetric: IndicatorMetric | null = null
        setSelectedKpis((prev) => {
            const remaining = prev.filter((item) => {
                if (item.contextoVersaoId === contextoVersaoId) {
                    removedMetric = item.metric
                    return false
                }
                return true
            }).map((item, index) => ({ ...item, position: index }))
            return remaining
        })
        if (removedMetric) {
            setAvailableKpis((prev) => {
                const merged = [...prev.filter((item) => item.contextoVersaoId !== removedMetric!.contextoVersaoId), removedMetric!]
                return sortMetricsByDate(merged)
            })
        }
    }

    const handleKpiHighlightToggle = (contextoVersaoId: string) => {
        setSelectedKpis((prev) => {
            const target = prev.find((item) => item.contextoVersaoId === contextoVersaoId)
            const enableHighlight = !!target && !target.isHighlighted
            return prev.map((item) => {
                if (item.contextoVersaoId === contextoVersaoId) {
                    const highlighted = enableHighlight ? true : false
                    return {
                        ...item,
                        isHighlighted: highlighted,
                        metric: { ...item.metric, isHighlighted: highlighted }
                    }
                }
                if (enableHighlight && item.isHighlighted) {
                    return {
                        ...item,
                        isHighlighted: false,
                        metric: { ...item.metric, isHighlighted: false }
                    }
                }
                if (enableHighlight) {
                    return {
                        ...item,
                        metric: { ...item.metric, isHighlighted: false }
                    }
                }
                return item
            })
        })
    }

    const handleHighlightToggle = async (id: string, highlighted: boolean) => {
        // Optimistic update with limit check
        let reverted = false;
        setLayoutGraphs((prev) => {
            const currentHighlighted = prev.filter((g) => g?.isHighlighted).length
            if (highlighted && currentHighlighted >= 3) {
                showWarningToast("Cada diretoria pode destacar no máximo 3 gráficos.")
                reverted = true;
                return prev
            }
            return prev.map((graph) => (graph?.id === id ? { ...graph, isHighlighted: highlighted } : graph))
        })
        if (reverted) return;
        // Persist
        const ok = await setVersaoDestaque(id, highlighted);
        if (!ok) {
            // Revert on failure
            setLayoutGraphs((prev) => prev.map((g) => (g?.id === id ? { ...g, isHighlighted: !highlighted } : g)))
            showWarningToast("Falha ao atualizar destaque. Tente novamente.")
        }
    }

    const handleLayoutChange = (layout: LayoutType) => {
        setSelectedLayout(layout)
        // Reset graphs to a fixed-length array matching the new layout
        setLayoutGraphs(Array(getMaxGraphsForLayout(layout)).fill(null))
        setSelectedPosition(null)
    }

    const handleSaveDashboard = async () => {
        if (!diretoriaApi?.id) return;
        const items = layoutGraphs
            .map((graph, idx) => graph ? ({ contextoVersaoId: graph.id, slotIndex: idx }) : null)
            .filter(Boolean) as { contextoVersaoId: string; slotIndex: number }[];
        const layoutPromise = saveDiretoriaDashboardLayout(diretoriaApi.id, selectedLayout, items);
        const kpiPayload = selectedKpis.map((item, index) => ({
            contextoVersaoId: item.contextoVersaoId,
            position: index,
            isHighlighted: item.isHighlighted,
        }));
        const kpiPromise = saveDiretoriaDashboardKpis(diretoriaApi.id, kpiPayload);

        const [layoutOk, kpiOk] = await Promise.all([layoutPromise, kpiPromise]);
        if (layoutOk && kpiOk) {
            showSuccessToast("Dashboard salvo com sucesso!");
            router.push(`/dashboard/${id}`);
        } else {
            showWarningToast("Não foi possível salvar todas as alterações agora.");
        }
    }

    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Guard: only diretor of this diretoria may access
    useEffect(() => {
        const user = authService.getUser();
        const isDiretor = user?.role === 'diretor';
        const matchesSlug = !!(user?.diretoriaSlug && id && user.diretoriaSlug === id);
        const allowed = !!isDiretor && matchesSlug;
        setAuthorized(allowed);
        if (!allowed) {
            try { router.replace(`/dashboard/${id}`); } catch {}
        }
        setCheckingAuth(false);
    }, [id, router]);

    // Load diretoria info by slug to get diretoriaId
    useEffect(() => {
        let active = true;
        if (!authorized) return;
        (async () => {
            const dir = await getDiretoriaBySlug(id);
            if (active) setDiretoriaApi(dir);
        })();
        return () => { active = false };
    }, [id, authorized]);

    // Prefill layout and load available graphs
    useEffect(() => {
        let active = true;
        (async () => {
            if (!authorized || !diretoriaApi?.id) return;
            setLoadingLayout(true); setLoadingAvailable(true);
            try {
                const layoutData = await getDiretoriaDashboardLayout(diretoriaApi.id);
                if (active) {
                    if (layoutData) {
                        const mappedLayout: LayoutType = layoutData.tipoLayout === 'ASYMMETRIC' ? 'asymmetric' : layoutData.tipoLayout === 'SIDEBYSIDE' ? 'sideBySide' : 'grid';
                        setSelectedLayout(mappedLayout);
                        const graphs = mapLayoutItemsToGraphData(layoutData.items);
                        const max = getMaxGraphsForLayout(mappedLayout);
                        const padded = [...graphs].slice(0, max);
                        while (padded.length < max) padded.push(null as any);
                        setLayoutGraphs(padded as (GraphData | null)[]);
                    } else {
                        setSelectedLayout('asymmetric');
                        setLayoutGraphs(Array(getMaxGraphsForLayout('asymmetric')).fill(null));
                    }
                }
            } finally {
                if (active) setLoadingLayout(false);
            }

            try {
                const avail = await listAvailableGraphsForDiretoria(diretoriaApi.id);
                if (active) {
                    const inLayoutIds = new Set((layoutGraphs.filter(Boolean) as GraphData[]).map(g => g.id));
                    setAvailableGraphs(avail.filter(g => !inLayoutIds.has(g.id)));
                }
            } finally {
                if (active) setLoadingAvailable(false);
            }
        })();
        return () => { active = false };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorized, diretoriaApi?.id]);

    useEffect(() => {
        let active = true
        ;(async () => {
            if (!authorized || !diretoriaApi?.id) return
            setLoadingKpis(true)
            try {
                const [selected, available] = await Promise.all([
                    getDiretoriaDashboardKpis(diretoriaApi.id),
                    listAvailableKpisForDiretoria(diretoriaApi.id)
                ])
                if (!active) return
                const selectedIds = new Set(selected.map((item) => item.contextoVersaoId))
                setSelectedKpis(selected.map((item, index) => ({ ...item, position: index })))
                setAvailableKpis(sortMetricsByDate(available.filter((metric) => !selectedIds.has(metric.contextoVersaoId))))
            } catch (error) {
                console.error('Erro ao carregar KPIs:', error)
                if (active) {
                    setSelectedKpis([])
                    setAvailableKpis([])
                }
            } finally {
                if (active) setLoadingKpis(false)
            }
        })()
        return () => {
            active = false
        }
    }, [authorized, diretoriaApi?.id])

    if (!id) {
        return <p className="text-center mt-10">Carregando...</p>;
    }

    if (checkingAuth) {
        return <p className="text-center mt-10">Verificando permissão...</p>;
    }

    if (!authorized) {
        return null;
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

                <section className="rounded-3xl border border-dashed border-blue-200 bg-white/70 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-light text-blue-700">Indicadores (KPIs) do painel</h2>
                            <p className="text-sm text-slate-500">Selecione até {MAX_KPIS} indicadores publicados para destacar rapidamente os resultados da diretoria.</p>
                            <p className="text-xs text-slate-400">Apenas um KPI pode ser marcado para aparecer na visão da Secretaria.</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <span className="text-xs font-medium text-slate-500">Selecionados: {selectedKpis.length}/{MAX_KPIS}</span>
                            <Button
                                type="button"
                                onClick={() => setKpiModalOpen(true)}
                                disabled={loadingKpis || selectedKpis.length >= MAX_KPIS}
                                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                <Plus className="h-4 w-4" />
                                ADICIONAR KPI
                            </Button>
                        </div>
                    </div>

                    {loadingKpis ? (
                        <div className="py-10 text-center text-slate-500">Carregando indicadores...</div>
                    ) : selectedKpis.length > 0 ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {selectedKpis.map((item) => (
                                <div
                                    key={item.contextoVersaoId}
                                    className={`relative rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${
                                        item.isHighlighted
                                            ? "border-amber-400 bg-amber-50/60"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                                                {item.metric.gerenciaNome || "Indicador"}
                                            </p>
                                            <h3 className="text-base font-semibold leading-tight text-slate-800 line-clamp-2">
                                                {item.metric.title}
                                            </h3>
                                            {item.metric.descricao && (
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {item.metric.descricao}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleKpiRemove(item.contextoVersaoId)}
                                            className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                            title="Remover indicador"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="text-2xl font-bold text-slate-900">
                                                {formatKpiValue(item.metric)}
                                            </div>
                                            {item.metric.valorAlvoTexto && (
                                                <div className="text-xs text-slate-500">Meta: {item.metric.valorAlvoTexto}</div>
                                            )}
                                            {item.metric.textoComparativo && (
                                                <div className="text-xs font-medium text-emerald-600">
                                                    {item.metric.textoComparativo}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
                                            <span className="font-medium text-slate-600">Destacar na Secretaria</span>
                                            <button
                                                type="button"
                                                onClick={() => handleKpiHighlightToggle(item.contextoVersaoId)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                                    item.isHighlighted ? "bg-amber-500" : "bg-slate-300"
                                                }`}
                                                title={item.isHighlighted ? "Remover destaque" : "Definir como destaque"}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                                        item.isHighlighted ? "translate-x-5" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {item.isHighlighted && (
                                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                                            <Star className="h-3 w-3 text-amber-600" fill="currentColor" strokeWidth={2} />
                                            Destaque
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500">
                            <p className="text-sm">Nenhum KPI selecionado ainda.</p>
                            <p className="text-xs">Use o botão "Adicionar KPI" para escolher os indicadores que serão exibidos.</p>
                        </div>
                    )}
                </section>

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
                    graphs={availableGraphs}
                    onGraphSelect={handleGraphSelect}
                />
                <SelecioneKpiModal
                    open={kpiModalOpen}
                    onClose={() => setKpiModalOpen(false)}
                    metrics={availableKpis}
                    onSelect={handleKpiSelect}
                />
            </div>
        </div>
    )
}
