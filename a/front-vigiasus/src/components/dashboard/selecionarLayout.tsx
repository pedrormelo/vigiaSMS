"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { LayoutPanelLeft, LayoutGrid, StretchVertical } from "lucide-react"

export type LayoutType = "asymmetric" | "grid" | "sideBySide"

interface LayoutOption {
    id: LayoutType
    name: string
    icon: React.ComponentType<{ className?: string }>
    description: string
}

const AsymmetricIcon = ({ className }: { className?: string }) => (
    <LayoutPanelLeft className= {className} strokeWidth={1.50} />
)

const GridIcon = ({ className }: { className?: string }) => (
    <LayoutGrid className= {className} strokeWidth={1.50} />
)

const SideBySideIcon = ({ className }: { className?: string }) => (
    <StretchVertical className= {className} strokeWidth={1.50} />
)

const layoutOptions: LayoutOption[] = [
    {
        id: "asymmetric",
        name: "Assimétrico",
        icon: AsymmetricIcon,
        description: "Um gráfico grande à esquerda e dois menores à direita",
    },
    {
        id: "grid",
        name: "Grade",
        icon: GridIcon,
        description: "Quatro gráficos pequenos em grade",
    },
    {
        id: "sideBySide",
        name: "Lado a Lado",
        icon: SideBySideIcon,
        description: "Dois gráficos grandes lado a lado",
    },
]

interface LayoutSelectorProps {
    selectedLayout: LayoutType
    onLayoutChange: (layout: LayoutType) => void
}

export function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
    return (
        <div className="flex gap-2">
            {layoutOptions.map((option) => {
                const IconComponent = option.icon
                return (
                    <button
                        key={option.id}
                        onClick={() => onLayoutChange(option.id)}
                        className={cn(
                            "p-2 rounded-[8px] cursor-pointer border transition-colors shadow-sm",
                            selectedLayout === option.id
                                ? "border-blue-400 bg-blue-50 text-blue-500"
                                : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500",
                        )}
                        title={option.description}
                    >
                        <IconComponent className="h-7 w-7" />
                    </button>
                )
            })}
        </div>
    )
}