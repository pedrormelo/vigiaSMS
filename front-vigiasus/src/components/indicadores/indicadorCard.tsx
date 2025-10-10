import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { Hospital,
    HeartPulse,
    Activity,
    Cross,
    HeartHandshake,
    ClipboardPlus,
    Stethoscope,
} from 'lucide-react';

// 1. Adicionar 'export' aqui
export const icons = {
    unidades: (
        <Hospital className="w-4 h-4" />
    ),
    cuidados: (
        <HeartPulse className="w-4 h-4" />
    ),
    atividade: (
        <Activity className="w-4 h-4" />
    ),
    cruz: (
        <Cross className="w-4 h-4" />
    ),
    populacao: (
        <HeartHandshake className="w-4 h-4" />
    ),
    servidores: (
        <ClipboardPlus className="w-4 h-4" />
    ),
    medicos: (
        <Stethoscope className="w-4 h-4" />
    )
}

// E também aqui, para consistência, caso precise no futuro.
export const borderColors = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    red: "border-l-red-500",
    yellow: "border-l-yellow-500",
    purple: "border-l-purple-500",
    orange: "border-l-orange-500",
    teal: "border-l-teal-500",
    pink: "border-l-pink-500",
}

interface IndicatorCardProps {
    title: string
    value: string
    subtitle: string
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    borderColor: keyof typeof borderColors | string
    iconType: keyof typeof icons
    valuePrefix?: string
    valueSuffix?: string
    onClick?: () => void
}


export function IndicatorCard({
    title,
    value,
    subtitle,
    change,
    changeType = "neutral",
    borderColor,
    iconType,
    valuePrefix = "",
    valueSuffix = "",
    onClick,
}: IndicatorCardProps) {
    const borderClass = borderColor in borderColors ? borderColors[borderColor as keyof typeof borderColors] : borderColor

    return (
        <Card className={cn(
            "relative p-3 min-w-[240px] h-24 border-l-4 border-gray-200 rounded-[5px] bg-white shadow-sm overflow-hidden transition-transform duration-200 hover:scale-105",
            borderClass,
            onClick && "cursor-pointer"
        )}
        onClick={onClick}
        >
            <div className="flex items-start justify-between h-full">
                <div className="flex flex-col justify-between h-full flex-1 min-w-0 pr-2">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-0 leading-tight truncate">{title}</h3>
                        <p className="text-xl font-bold text-gray-900 leading-none">
                            {valuePrefix}
                            {value}
                            {valueSuffix}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight break-words mt-0.5">{subtitle}</p>
                        {change && (
                            <div
                                className={cn(
                                    "text-[11px] flex items-center gap-0.5 mt-1",
                                    changeType === "positive" && "text-green-600",
                                    changeType === "negative" && "text-red-600",
                                    changeType === "neutral" && "text-gray-500",
                                )}
                            >
                                {changeType === "positive" && <span>▲</span>}
                                {changeType === "negative" && <span>▼</span>}
                                {changeType === "neutral" && <span className="font-bold">—</span>}
                                <span>{change.replace("— ", "")}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end justify-start h-full flex-shrink-0">
                    <div className="text-gray-400">{icons[iconType]}</div>
                </div>
            </div>
        </Card>
    )
}