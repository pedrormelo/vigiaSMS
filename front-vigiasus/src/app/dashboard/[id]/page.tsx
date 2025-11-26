"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import { SecretariaDashboardPreview } from "@/components/dashboard/secretaria-dashboard-preview"
import { SecretariaMetricsSection } from "@/components/dashboard/secretaria/metrics-section"
import { getDiretoriaDashboardLayout, getDashboardHighlights, listIndicatorsForDiretoria, listIndicatorsForSecretaria, mapLayoutItemsToGraphData, type IndicatorMetric } from "@/services/dashboardService"
import { authService, type AuthUser } from "@/services/authService"

import { diretoriasConfig } from "@/constants/diretorias" // fallback (não remover ainda)
import { getDiretoriaBySlug, type Diretoria } from "@/services/organizacaoService"
import type { NomeIcone } from "@/components/popups/addContextoModal/types"
import { Building, ClipboardList, DollarSign, HeartPulse, Info, Landmark, Pen, TrendingUp, Users, UserCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import InfoPopover from "@/components/dashboard/InfoPopover"
import React from "react"
import type { MetricItem, MetricColor } from "@/components/dashboard/secretaria/metricsGrid"

// Indicator and KPI helpers
const indicatorIconComponentMap: Record<NomeIcone, LucideIcon> = {
    Heart: HeartPulse,
    Building: Building,
    ClipboardList: ClipboardList,
    TrendingUp: TrendingUp,
    Landmark: Landmark,
    Users: Users,
    UserCheck: UserCheck,
    DollarSign: DollarSign,
}

const monetaryUnits = new Set(["R$", "$", "€"])

const fallbackMetricColors: MetricColor[] = ["blue", "cyan", "green", "orange", "red", "purple", "pink"]

function getIndicatorIconComponent(name?: string): LucideIcon {
    if (!name) return HeartPulse
    const key = name as NomeIcone
    return indicatorIconComponentMap[key] ?? HeartPulse
}

function classifyChangeType(text?: string): "positive" | "negative" | "neutral" {
    if (!text) return "neutral"
    const trimmed = text.trim()
    if (trimmed.startsWith("+")) return "positive"
    if (trimmed.startsWith("-")) return "negative"
    return "neutral"
}

function formatIndicatorValue(valorTexto: string, unidade?: string): string {
    const trimmedUnit = unidade?.trim()
    if (!valorTexto) {
        return trimmedUnit && trimmedUnit !== "Nenhum" ? `0 ${trimmedUnit}` : "0"
    }
    if (!trimmedUnit || trimmedUnit === "Nenhum") return valorTexto
    if (monetaryUnits.has(trimmedUnit)) return `${trimmedUnit} ${valorTexto}`
    return `${valorTexto} ${trimmedUnit}`
}

function formatGoalValue(valorTexto?: string, unidade?: string): string | undefined {
    if (!valorTexto) return undefined
    const trimmed = valorTexto.trim()
    if (!trimmed) return undefined
    return formatIndicatorValue(trimmed, unidade)
}

function computeProgress(metric: IndicatorMetric): number | undefined {
    if (metric.valorAtual === null || metric.valorAtual === undefined) return undefined
    if (!metric.valorAlvo || metric.valorAlvo <= 0) return undefined
    const pct = (metric.valorAtual / metric.valorAlvo) * 100
    if (!Number.isFinite(pct)) return undefined
    return Math.max(0, Math.min(100, pct))
}

function resolveDiretoriaColorToken(slugOrId: string): MetricColor | undefined {
    const direct = diretoriasConfig[slugOrId]
    if (direct?.corUI) return direct.corUI as MetricColor
    const match = Object.values(diretoriasConfig).find(d => d.id === slugOrId)
    if (match?.corUI) return match.corUI as MetricColor
    return undefined
}

function buildDiretoriaColorMap(metrics: IndicatorMetric[]): Map<string, MetricColor> {
    const map = new Map<string, MetricColor>()
    let fallbackIndex = 0

    for (const metric of metrics) {
        const key = metric.diretoriaSlug || metric.diretoriaId
        if (!key || map.has(key)) continue
        const configured = resolveDiretoriaColorToken(key)
        if (configured) {
            map.set(key, configured)
        }
    }

    for (const metric of metrics) {
        const key = metric.diretoriaSlug || metric.diretoriaId
        if (!key || map.has(key)) continue
        const color = fallbackMetricColors[fallbackIndex % fallbackMetricColors.length]
        fallbackIndex += 1
        map.set(key, color)
    }

    return map
}

function composeMetricTitle(metric: IndicatorMetric): string {
    if (metric.gerenciaNome) return `${metric.title} — ${metric.gerenciaNome}`
    return metric.title
}


// State for dynamic layout + graphs
const FALLBACK_LAYOUT: "asymmetric" | "grid" | "sideBySide" = "asymmetric";

export default function DashboardView() {
    const params = useParams()
    const router = useRouter();
    const id = params.id as string
    const [diretoriaApi, setDiretoriaApi] = React.useState<Diretoria | null>(null)
    const [graphs, setGraphs] = React.useState<GraphData[]>([])
    const [layout, setLayout] = React.useState<"asymmetric" | "grid" | "sideBySide">(FALLBACK_LAYOUT)
    const [loadingGraphs, setLoadingGraphs] = React.useState(false)
    const [errorGraphs, setErrorGraphs] = React.useState<string | null>(null)
    const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null)
    const [canEdit, setCanEdit] = React.useState(false)
    const [metrics, setMetrics] = React.useState<IndicatorMetric[]>([])
    const [loadingMetrics, setLoadingMetrics] = React.useState(false)
    const [metricsError, setMetricsError] = React.useState<string | null>(null)
    React.useEffect(() => {
        let active = true
        if (id && id !== 'secretaria') {
            getDiretoriaBySlug(id).then(d => { if (active) setDiretoriaApi(d) })
        }
        return () => { active = false }
    }, [id])

    // Read current user and compute edit permission (only diretor of this diretoria)
    React.useEffect(() => {
        const user = authService.getUser();
        setCurrentUser(user);
        // compute permission by slug (fast) and by id when available
        const matchesSlug = !!(user?.diretoriaSlug && id && user.diretoriaSlug === id);
        const matchesId = !!(user?.diretoriaId && diretoriaApi?.id && user.diretoriaId === diretoriaApi.id);
        const isDiretor = user?.role === 'diretor';
        setCanEdit(!!isDiretor && (matchesSlug || matchesId));
    }, [id, diretoriaApi])

    // Load dashboard data (layout or highlights)
    React.useEffect(() => {
        let active = true
        async function load() {
            setLoadingGraphs(true); setErrorGraphs(null);
            try {
                if (id === 'secretaria') {
                    const highlights = await getDashboardHighlights();
                    if (!active) return;
                    setGraphs(mapLayoutItemsToGraphData(highlights));
                    setLayout('asymmetric');
                } else if (diretoriaApi?.id) {
                    const layoutData = await getDiretoriaDashboardLayout(diretoriaApi.id);
                    if (!active) return;
                    if (layoutData) {
                        // Map layout type from backend enum to front variant
                        const mappedLayout = layoutData.tipoLayout === 'ASYMMETRIC' ? 'asymmetric' : layoutData.tipoLayout === 'SIDEBYSIDE' ? 'sideBySide' : 'grid';
                        setLayout(mappedLayout);
                        setGraphs(mapLayoutItemsToGraphData(layoutData.items));
                    } else {
                        setGraphs([]);
                        setLayout('asymmetric');
                    }
                }
            } catch (e: any) {
                if (active) setErrorGraphs(e?.message || 'Falha ao carregar gráficos.');
            } finally {
                if (active) setLoadingGraphs(false);
            }
        }
        load();
        return () => { active = false }
    }, [id, diretoriaApi])

    React.useEffect(() => {
        let active = true
        async function loadMetrics() {
            setLoadingMetrics(true); setMetricsError(null);
            try {
                if (id === 'secretaria') {
                    const data = await listIndicatorsForSecretaria();
                    if (!active) return;
                    setMetrics(data);
                } else if (diretoriaApi?.id) {
                    const data = await listIndicatorsForDiretoria(diretoriaApi.id);
                    if (!active) return;
                    setMetrics(data);
                } else {
                    if (active) setMetrics([]);
                }
            } catch (e: any) {
                if (active) setMetricsError(e?.message || 'Falha ao carregar métricas.');
            } finally {
                if (active) setLoadingMetrics(false);
            }
        }
        loadMetrics();
        return () => { active = false }
    }, [id, diretoriaApi?.id, diretoriaApi?.slug, diretoriaApi?.nome])

    const directorMetricCards = React.useMemo(() => {
        if (id === 'secretaria' || metrics.length === 0) return [] as Array<{
            id: string;
            title: string;
            value: string;
            subtitle: string;
            change?: string;
            changeType: "positive" | "negative" | "neutral";
            borderColor: string;
        }>;

        const defaultBorderColor = diretoriaApi?.corFrom
            || (diretoriaApi as any)?.cores?.from
            || diretoriasConfig[id]?.cores?.from
            || '#1745FF';

        return metrics.map(metric => {
            const subtitlePieces: string[] = [];
            if (metric.gerenciaNome) subtitlePieces.push(metric.gerenciaNome);
            if (metric.descricao) subtitlePieces.push(metric.descricao);
            const subtitle = subtitlePieces.join(' • ') || 'Indicador da diretoria';

            return {
                id: metric.id,
                title: metric.title,
                value: formatIndicatorValue(metric.valorAtualTexto, metric.unidade),
                subtitle,
                change: metric.textoComparativo || undefined,
                changeType: classifyChangeType(metric.textoComparativo),
                borderColor: metric.cor || defaultBorderColor,
            };
        });
    }, [id, metrics, diretoriaApi])

    const secretariaMetricItems = React.useMemo(() => {
        if (id !== 'secretaria') return undefined;
        if (metrics.length === 0) return [] as MetricItem[];

        const colorMap = buildDiretoriaColorMap(metrics);

        return metrics.map<MetricItem>(metric => {
            const colorKey = metric.diretoriaSlug || metric.diretoriaId;
            const color = colorKey ? (colorMap.get(colorKey) ?? 'purple') : 'purple';
            return {
                id: metric.id,
                title: composeMetricTitle(metric),
                value: formatIndicatorValue(metric.valorAtualTexto, metric.unidade),
                icon: getIndicatorIconComponent(metric.icone),
                color,
                goal: formatGoalValue(metric.valorAlvoTexto, metric.unidade),
                progress: computeProgress(metric) ?? undefined,
            };
        });
    }, [id, metrics])
    const diretoria = diretoriaApi || diretoriasConfig[id]

    if (!id) {
        return <p className="text-center mt-10">Carregando...</p>
    }
    if (!diretoria) {
        return <p className="text-center mt-10">Diretoria não encontrada</p>
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
            {/* Header */}
            <div
                className="relative p-10 text-white shadow-md"
                style={
                    diretoria.bannerImage
                        ? {
                            backgroundImage: `url(${diretoria.bannerImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }
                        : {
                            background: diretoria && (diretoria as any).corFrom && (diretoria as any).corTo
                                ? `linear-gradient(to right, ${(diretoria as any).corFrom}, ${(diretoria as any).corTo})`
                                : `linear-gradient(to right, ${(diretoria as any).cores?.from}, ${(diretoria as any).cores?.to})`,
                        }
                }
            >
                <div className="flex justify-between items-center">
                    <div className="min-h-[150px]">
                        <h1 className="text-4xl font-regular">{diretoria.nome}</h1>
                        <p className="text-5xl mt-2 font-bold opacity-100">DASHBOARD</p>
                    </div>

                    {/* Botões do canto direito */}
                    <div className="flex flex-col items-center gap-3">
                        <InfoPopover
                            trigger={
                                <button
                                    className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm"
                                    aria-label="Sobre esta página"
                                >
                                    <Info size={20} />
                                </button>
                            }
                            heading="Sobre"
                            title={diretoria.nome}
                            description={(diretoriaApi?.sobre || diretoria?.sobre) ?? "Esta página apresenta informações e gráficos relevantes desta diretoria."}
                            side="left"
                            align="center"
                            sideOffset={12}
                            alignOffset={0}
                            showTail={false}
                        />
                        {id !== "secretaria" && canEdit && (
                            <button
                                onClick={() => router.push(`/dashboard/${id}/editar-layout`)}
                                className="flex items-center justify-center w-11 h-11 cursor-pointer rounded-[0.6rem] bg-white text-gray-600 hover:bg-white/80 transition-all duration-200 shadow-sm">
                                <Pen size={25} />
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <div className="p-8 mx-auto">
                <h2 className="text-3xl font-semibold text-blue-700">Visão Geral</h2>
            </div>

            {/* Dashboard Charts - Secretaria uses a special preview showing only highlighted graphs */}
            <div className="flex justify-center items-center w-full pt-2 mb-10">
                <div className="max-w-[90%] w-full">
                    {loadingGraphs && (
                        <div className="text-center py-16 text-gray-500">Carregando gráficos...</div>
                    )}
                    {!loadingGraphs && errorGraphs && (
                        <div className="text-center py-16 text-red-500">{errorGraphs}</div>
                    )}
                    {!loadingGraphs && !errorGraphs && (
                        id === 'secretaria' ? (
                            <>
                                <SecretariaDashboardPreview graphs={graphs} />
                                <div className="mt-10">
                                    {metricsError && !loadingMetrics ? (
                                        <div className="text-center text-red-500 py-10">{metricsError}</div>
                                    ) : (
                                        <SecretariaMetricsSection
                                            loading={loadingMetrics}
                                            mainItems={secretariaMetricItems}
                                            secondaryItems={[]}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            graphs.length > 0 ? (
                                <DashboardPreview
                                    layout={layout}
                                    graphs={graphs}
                                    onGraphSelect={() => { }}
                                    onGraphRemove={() => { }}
                                    onHighlightToggle={() => { }}
                                    editMode={false}
                                />
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
                                    <p className="text-lg text-gray-600">Nenhum gráfico configurado para esta diretoria.</p>
                                    {canEdit ? (
                                        <button
                                            onClick={() => router.push(`/dashboard/${id}/editar-layout`)}
                                            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            Configurar layout
                                        </button>
                                    ) : (
                                        <p className="mt-4 text-sm text-gray-500">Entre em contato com o diretor para configurar o layout.</p>
                                    )}
                                </div>
                            )
                        )
                    )}
                </div>
            </div>

            {id !== 'secretaria' && (
                <div className="flex flex-col items-center gap-6 mb-22 z-10 relative w-full px-8">
                    {loadingMetrics && (
                        <div className="text-center text-gray-500">Carregando métricas...</div>
                    )}
                    {!loadingMetrics && metricsError && (
                        <div className="text-center text-red-500">{metricsError}</div>
                    )}
                    {!loadingMetrics && !metricsError && (
                        directorMetricCards.length > 0 ? (
                            <div className="flex flex-wrap gap-6 justify-center w-full max-w-[1200px]">
                                {directorMetricCards.map(card => (
                                    <div
                                        key={card.id}
                                        className="bg-white rounded-3xl shadow-md px-7 py-6 min-w-[260px] max-w-[320px] flex flex-col gap-3 border border-gray-100"
                                        style={{ borderLeft: `4px solid ${card.borderColor}` }}
                                    >
                                        <h3 className="text-lg font-bold text-slate-700">{card.title}</h3>
                                        <div className="text-3xl font-extrabold text-slate-900 break-words">{card.value}</div>
                                        <div className="text-sm text-gray-500 break-words">{card.subtitle}</div>
                                        {card.change && (
                                            <div className={`text-xs font-medium mt-2 ${card.changeType === "positive" ? "text-green-600" : card.changeType === "negative" ? "text-red-600" : "text-gray-600"}`}>
                                                {card.changeType === "positive" && <span>▲ </span>}
                                                {card.changeType === "negative" && <span>▼ </span>}
                                                {card.changeType === "neutral" && <span className="font-bold">— </span>}
                                                <span>{card.change.replace(/^([+\-—])\s*/, '')}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 w-full">Nenhum indicador disponível para esta diretoria.</div>
                        )
                    )}
                </div>
            )}

        </div>
    )
}
