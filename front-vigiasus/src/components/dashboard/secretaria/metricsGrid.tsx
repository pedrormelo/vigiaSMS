import type { LucideIcon } from "lucide-react"
import { DiretoriaMetricCard, type DiretoriaMetricCardProps } from "./diretoria-metric-card"
import { cn } from "@/lib/utils"

export type MetricColor = DiretoriaMetricCardProps["color"]

export interface MetricItem {
    id?: string
    title: string
    value: string | number
    icon: LucideIcon
    color: MetricColor
    goal?: string | number
    progress?: number
}

export interface MetricsGridProps {
    items: MetricItem[]
    title?: string
    className?: string
    columns?: 2 | 3 | 4 | 5
    loading?: boolean
    skeletonCount?: number
}

export function MetricsGrid({ items, title = "Métricas das Diretorias", className, columns = 5, loading = false, skeletonCount = 5 }: MetricsGridProps) {
    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    }[columns]

    return (
        <section className={cn("w-full", className)}>
            {title && <h2 className="mb-6 text-2xl font-bold text-slate-900">{title}</h2>}

            <div className={cn("grid gap-6", gridCols)}>
                {loading
                    ? Array.from({ length: skeletonCount }).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                    ))
                    : items.length > 0
                        ? items.map((m, idx) => (
                            <DiretoriaMetricCard
                                key={m.id ?? idx}
                                title={m.title}
                                value={m.value}
                                icon={m.icon}
                                color={m.color}
                                goal={m.goal}
                                progress={m.progress}
                            />
                        ))
                        : (
                            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                                Nenhuma métrica disponível.
                            </div>
                        )}
            </div>
        </section>
    )
}