// src/components/contextosCard/viewToggle.tsx
"use client"

import React from 'react';
import { LayoutGrid, List, ListTree } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

export type ViewMode = 'grid' | 'list' | 'detailed'

interface ViewToggleProps {
    value: ViewMode
    onValueChange: (value: ViewMode) => void
    className?: string
}

export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
    return (
        <ToggleGroup 
            type="single" 
            value={value} 
            onValueChange={(val: string) => val && onValueChange(val as ViewMode)}
            className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}
        >
            <ToggleGroupItem 
                value="grid" 
                aria-label="Visualização em Grade"
                className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Grade</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
                value="list" 
                aria-label="Visualização em Lista"
                className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
            >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Lista</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
                value="detailed" 
                aria-label="Visualização Detalhada"
                className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
            >
                <ListTree className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Detalhada</span>
            </ToggleGroupItem>
        </ToggleGroup>
    )
}
