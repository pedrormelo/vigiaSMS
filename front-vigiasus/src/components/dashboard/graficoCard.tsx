"use client"

import type { ReactElement } from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

import { ChartPie, ChartColumn, Calendar, AreaChart } from 'lucide-react'
import type { GraphType } from "@/lib/graphTypes"
export type { GraphType } from "@/lib/graphTypes"

interface GraphCardProps {
    id: string
    title: string
    type: GraphType
    gerencia: string
    insertedDate: string
    isHighlighted?: boolean
    isInLayout?: boolean
    className?: string
    onClick?: () => void
    onHighlightToggle?: (id: string, highlighted: boolean) => void
    onRemove?: (id: string) => void
}

const graphTypeConfig: Record<GraphType, {
    accent: string
    badge: string
    iconBg: string
    icon: () => ReactElement
    label: string
}> = {
    line: {
        accent: "#2563EB",
        badge: "bg-blue-50 text-blue-600",
        iconBg: "bg-blue-100 text-blue-600",
        icon: () => <AreaChart className="h-5 w-5" />,
        label: "Gráfico de área",
    },
    chart: {
        accent: "#7C3AED",
        badge: "bg-violet-50 text-violet-600",
        iconBg: "bg-violet-100 text-violet-600",
        icon: () => <ChartColumn className="h-5 w-5" />,
        label: "Gráfico de barras",
    },
    pie: {
        accent: "#DB2777",
        badge: "bg-rose-50 text-rose-600",
        iconBg: "bg-rose-100 text-rose-600",
        icon: () => <ChartPie className="h-5 w-5" />,
        label: "Gráfico de pizza",
    },
}

export function GraphCard({
    id,
    title,
    type,
    gerencia,
    insertedDate,
    isHighlighted = false,
    isInLayout = false,
    className,
    onClick,
    onHighlightToggle,
    onRemove,
}: GraphCardProps) {
    const config = graphTypeConfig[type] ?? graphTypeConfig.chart
    const IconComponent = config.icon
    const cardClasses = cn(
        "group relative flex h-full w-full flex-col justify-between rounded-2xl border border-blue-100 bg-white/95 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
    )

    return (
        <div
            className={cardClasses}
            style={{ borderLeft: `4px solid ${config.accent}` }}
            onClick={onClick}
        >
            {isInLayout && (
                <div className="absolute top-3 right-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium">Destaque</span>
                    <Switch
                        checked={isHighlighted}
                        onCheckedChange={(checked) => {
                            onHighlightToggle?.(id, checked)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-75"
                    />
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.iconBg)}>
                    <IconComponent />
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide", config.badge)}>
                    {config.label}
                </span>
            </div>

            <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold leading-snug text-slate-900 line-clamp-2" title={title}>
                    {title}
                </h3>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600" title={gerencia}>
                    {gerencia}
                </p>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                <time dateTime={insertedDate}>
                    Atualizado em {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}
