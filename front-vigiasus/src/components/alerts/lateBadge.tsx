import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BadgeVariant } from "@/constants/alerts"

interface LateBadgeProps {
    daysLate: number
    variant?: BadgeVariant
    className?: string
}

export function LateBadge({ daysLate, variant = "atraso", className }: LateBadgeProps) {
    const isAtraso = variant === "atraso";
    const style = isAtraso
        ? "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 hover:border-orange-300"
        : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300";

    return (
        <Badge
            className={cn(
                "flex items-center gap-1 text-xs font-medium",
                style,
                className,
            )}
        >
            <AlertTriangle className={cn("h-3 w-3 stroke-current", isAtraso ? "text-amber-600" : "text-red-600")} />
            {daysLate} day{daysLate !== 1 ? "s" : ""} {variant}
        </Badge>
    )
}
