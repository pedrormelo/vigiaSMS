"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

import { ChartPie, ChartLine, ChartColumn } from 'lucide-react'

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
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                        {isHighlighted && (
                            <svg className="h-4 w-4 text-blue-400 fill-blue-400" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                        />
                                    </svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove?.(id)
                                    }}
                                >
                                    Remover do Layout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

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
                <h3 className="font-medium text-white text-lg leading-tight">{title}</h3>
                <p className="text-white/80 text-sm mt-1">{gerencia}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/90">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}
