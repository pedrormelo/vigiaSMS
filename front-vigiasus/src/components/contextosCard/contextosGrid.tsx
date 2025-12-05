// src/components/contextosCard/contextosGrid.tsx
"use client"

import { FileItem } from "../contextosCard/contextoCard"
import { FileListItem } from "../contextosCard/fileListItem"
import { FileDetailedListItem } from "../contextosCard/fileDetailedListItem"
import { AddContextButton } from "./adicionarContexto"
import { Contexto } from "@/components/validar/typesDados"
import { cn } from "@/lib/utils"

export type ViewMode = 'grid' | 'list' | 'detailed'

interface FileGridProps {
    files: Contexto[]
    onFileClick?: (file: Contexto) => void
    onAddContextClick?: () => void
    className?: string
    isEditing?: boolean
    onToggleOculto?: (id: string) => void
    scroll?: boolean
    maxHeight?: string
    containerId?: string
    viewMode?: ViewMode
    ocultarBloqueadoMap?: Record<string, string>
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
    containerId,
    viewMode = 'grid',
    ocultarBloqueadoMap
}: FileGridProps) {
    // Renderiza os itens baseado no modo de visualização
    const renderItems = () => {
        const addButton = isEditing ? (
            <AddContextButton key="add-context" id="tour-gerencia-add" onClick={() => onAddContextClick?.()} />
        ) : null;

        const fileItems = files.map(file => {
            const motivoBloqueio = ocultarBloqueadoMap?.[file.id];
            const commonProps = {
                id: file.id,
                title: file.title,
                type: file.type,
                insertedDate: file.insertedDate,
                status: file.status,
                versoes: file.versoes,
                estaOculto: file.estaOculto,
                isEditing,
                onClick: () => onFileClick?.(file),
                onToggleOculto,
                isOcultarBloqueado: Boolean(motivoBloqueio),
                ocultarBloqueadoMotivo: motivoBloqueio
            };

            switch (viewMode) {
                case 'list':
                    return <FileListItem key={file.id} {...commonProps} />;
                case 'detailed':
                    return <FileDetailedListItem key={file.id} {...commonProps} descricao={file.description} />;
                case 'grid':
                default:
                    return <FileItem key={file.id} {...commonProps} />;
            }
        });

        if (viewMode === 'grid') {
            return [addButton, ...fileItems].filter(Boolean);
        }
        return fileItems;
    };

    const content = (() => {
        const items = renderItems();

        if (viewMode === 'grid') {
            return (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 py-6">
                    {items}
                </div>
            );
        } else {
            // Lista ou Detalhada
            return (
                <div className="space-y-3 py-4">
                    {isEditing && (
                        <AddContextButton id="tour-gerencia-add" onClick={() => onAddContextClick?.()} />
                    )}
                    {items}
                </div>
            );
        }
    })();

    return (
        <div className={cn("w-full", className)}>
            {scroll ? (
                <div
                    className="overflow-y-auto pr-1"
                    style={{ maxHeight }}
                    id={containerId}
                >
                    {content}
                </div>
            ) : (
                <div id={containerId}>{content}</div>
            )}
        </div>
    )
}