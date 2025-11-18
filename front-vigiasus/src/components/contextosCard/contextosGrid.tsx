// src/components/contextosCard/contextosGrid.tsx
"use client"

import React, { useState } from "react"
import { FileItem } from "../contextosCard/contextoCard"
import { AddContextButton } from "./adicionarContexto"
import { Contexto } from "@/components/validar/typesDados"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, PanelTop, PanelTopInactive } from "lucide-react"

interface FileGridProps {
    files: Contexto[]
    onFileClick?: (file: Contexto) => void
    onAddContextClick?: () => void
    className?: string
    isEditing?: boolean
    onToggleOculto?: (id: string) => void
    scroll?: boolean
    maxHeight?: string
    pagination?: boolean
    pageSize?: number
    showControls?: boolean
}

export function FileGrid({
    files,
    onFileClick,
    onAddContextClick,
    className,
    isEditing,
    onToggleOculto,
    scroll = true,
    maxHeight = '70vh',
    pagination = true,
    pageSize = 24,
    showControls = true
}: FileGridProps) {
    const [compact, setCompact] = useState(false)
    const [page, setPage] = useState(0)

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
                compact={compact}
            />
        ))
    ]

    const totalItems = items.length
    const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
    const start = pagination ? page * pageSize : 0
    const end = pagination ? start + pageSize : totalItems
    const pageItems = pagination ? items.slice(start, end) : items

    const grid = (
        <div className={cn(
            "grid py-6 px-3",
            compact ? "gap-4" : "gap-6",
            compact
                ? "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
                : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        )}>
            {pageItems}
        </div>
    )

    const containerBase = cn(
        "w-full rounded-xl border shadow-sm",
        "border-neutral-200/70 bg-white/70",
        "dark:border-neutral-800/60 dark:bg-neutral-900/60",
        className,
        scroll ? "overflow-y-auto" : undefined
    )

    const containerStyle = scroll ? { maxHeight } : undefined

    return (
        <div className={containerBase} style={containerStyle}>
            <div className="h-1 w-full rounded-t-[11px] bg-gradient-to-r from-[#2651FF] via-blue-400 to-cyan-400" />

            {showControls && (
                <div className={cn(
                    "sticky top-0 z-10 flex items-center justify-between gap-3",
                    "px-3 py-2 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
                    "dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60",
                    "border-b border-neutral-200/70 dark:border-neutral-800/60"
                )}>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                        {pagination && totalPages > 1 ? ` • página ${page + 1} de ${totalPages}` : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCompact(v => !v)}
                            title={compact ? 'Espaçamento confortável' : 'Modo compacto'}
                            className="gap-1"
                        >
                            {compact ? <PanelTop className="h-4 w-4" /> : <PanelTopInactive className="h-4 w-4" />}
                            <span className="hidden sm:inline">{compact ? 'Compacto' : 'Conforto'}</span>
                        </Button>
                    </div>
                </div>
            )}

            {grid}

            {pagination && totalPages > 1 && (
                <div className="mt-1 mb-2 px-3 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <div className="flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "h-2.5 w-2.5 rounded-full transition-colors",
                                    i === page
                                        ? "bg-[#2651FF]"
                                        : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500"
                                )}
                                aria-label={`Ir para página ${i + 1}`}
                                onClick={() => setPage(i)}
                            />
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="gap-1"
                    >
                        <span className="hidden sm:inline">Próxima</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}