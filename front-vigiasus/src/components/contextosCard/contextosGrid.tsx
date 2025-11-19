// src/components/contextosCard/contextosGrid.tsx
"use client"

import { FileItem } from "../contextosCard/contextoCard"
import { AddContextButton } from "./adicionarContexto"
import { Contexto } from "@/components/validar/typesDados"
import { cn } from "@/lib/utils"

interface FileGridProps {
    files: Contexto[]
    onFileClick?: (file: Contexto) => void
    onAddContextClick?: () => void
    className?: string
    isEditing?: boolean
    onToggleOculto?: (id: string) => void
    scroll?: boolean
    maxHeight?: string
}

export function FileGrid({
    files,
    onFileClick,
    onAddContextClick,
    className,
    isEditing,
    onToggleOculto,
    scroll = true,
    maxHeight = '70vh'
}: FileGridProps) {
    const items = [
        ...(isEditing ? [<AddContextButton key="add-context" onClick={() => onAddContextClick?.()} />] : []),
        ...files.map(file => (
            <FileItem
                key={file.id}
                id={file.id}
                title={file.title}
                type={file.type}
                insertedDate={file.insertedDate}
                status={file.status}
                versoes={file.versoes}
                estaOculto={file.estaOculto}
                isEditing={isEditing}
                onClick={() => onFileClick?.(file)}
                onToggleOculto={onToggleOculto}
            />
        ))
    ]

    const grid = (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 py-6">
            {items}
        </div>
    )

    return (
        <div className={cn("w-full", className)}>
            {scroll ? (
                <div className="overflow-y-auto pr-1" style={{ maxHeight }}>
                    {grid}
                </div>
            ) : (
                grid
            )}
        </div>
    )
}