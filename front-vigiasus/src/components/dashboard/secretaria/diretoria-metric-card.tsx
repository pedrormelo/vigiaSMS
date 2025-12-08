import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DiretoriaMetricCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    color: "blue" | "cyan" | "green" | "orange" | "red" | "purple" | "pink"
    goal?: string | number
    progress?: number
    className?: string
}

const colorVariants = {
    blue: "bg-blue-500",
    cyan: "bg-cyan-400",
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
}

const progressColorVariants = {
    blue: "bg-blue-700",
    cyan: "bg-cyan-600",
    green: "bg-green-700",
    orange: "bg-orange-700",
    red: "bg-red-700",
    purple: "bg-purple-700",
    pink: "bg-pink-700",
}

export function DiretoriaMetricCard({
    title,
    value,
    icon: Icon,
    color,
    goal,
    progress,
    className,
}: DiretoriaMetricCardProps) {
    return (
        <div
            className={cn("relative overflow-hidden rounded-lg md:rounded-2xl p-3 md:p-6 text-white shadow-lg", colorVariants[color], className)}
        >
            {/* Header with icon and title */}
            <div className="mb-2 md:mb-4 flex items-center gap-2">
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                <h3 className="text-xs md:text-sm font-medium line-clamp-2">{title}</h3>
            </div>

            {/* Main metric value */}
            <div className="mb-2 md:mb-4 text-3xl md:text-5xl font-bold leading-none truncate">{value}</div>

            {/* Progress bar (if progress is provided) */}
            {progress !== undefined && (
                <div className="mb-2 md:mb-3 h-1 md:h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                    <div
                        className={cn("h-full rounded-full", progressColorVariants[color])}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            )}

            {/* Goal label (if goal is provided) */}
            {goal !== undefined && <div className="text-xs md:text-sm font-medium opacity-90">Meta {goal}</div>}
        </div>
    )
}
