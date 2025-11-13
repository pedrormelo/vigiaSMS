"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

import { ChartPie, ChartLine, ChartColumn, Calendar } from 'lucide-react'

export type GraphType = "line" | "chart" | "pie"

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

const graphTypeConfig = {
    line: {
        color: "bg-[#B329E9] hover:bg-purple-600",
        icon: () => (
            <ChartLine className="h-9 w-9 text-white"></ChartLine>
        ),
        label: "Gráfico de Linhas",
    },
    chart: {
        color: "bg-[#B329E9] hover:bg-purple-600",
        icon: () => (
            <ChartColumn className="h-9 w-9 text-white"></ChartColumn>
        ),
        label: "Gráfico de Barras",
    },
    pie: {
        color: "bg-[#B329E9] hover:bg-purple-600",
        icon: () => (
            <ChartPie className="h-9 w-9 text-white"></ChartPie>
        ),
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
    const config = graphTypeConfig[type]
    const IconComponent = config.icon

    return (
        <div
            className={cn(
                "rounded-4xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md flex flex-col justify-between max-h-[200px] max-w-[245px] relative",
                config.color,
                className,
            )}
            onClick={onClick}
        >
            {isInLayout && (
                <>
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-white/90 text-xs">
                        <span>Destaque</span>
                        <Switch
                            checked={isHighlighted}
                            onCheckedChange={(checked) => {
                                onHighlightToggle?.(id, checked)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="scale-75"
                        />
                    </div>
                </>
            )}

            <div className="flex justify-center mb-4">
                <IconComponent />
            </div>

            <div className="text-center mb-2">
                <h3 className="font-medium text-white text-lg leading-tight truncate px-2" title={title}>{title}</h3>
                <p className="text-white/80 text-sm mt-1 truncate px-2" title={gerencia}>{gerencia}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="h-4 w-4" />
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}
