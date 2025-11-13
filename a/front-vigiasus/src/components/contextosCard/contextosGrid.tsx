// src/components/contextosCard/contextosGrid.tsx
"use client"

import { FileItem, type FileType } from "../contextosCard/contextoCard"
import { AddContextButton } from "./adicionarContexto"
import ScrollArea from "@/components/ui/scroll-area"
// 1. IMPORTAR O TIPO UNIFICADO
import { Contexto, StatusContexto } from "@/components/validar/typesDados" 

// 2. ATUALIZAR INTERFACE FileData para ser Contexto
// (Removemos FileData e usamos Contexto diretamente)

// 3. ATUALIZAR INTERFACE FileGridProps
interface FileGridProps {
    files: Contexto[] // <-- Usa o tipo unificado Contexto
    onFileClick?: (file: Contexto) => void // <-- Usa o tipo unificado Contexto
    onAddContextClick?: () => void
    className?: string
    isEditing?: boolean;
    onToggleOculto?: (id: string) => void; 
}

export function FileGrid({ 
    files, 
    onFileClick, 
    onAddContextClick, 
    className, 
    isEditing,
    onToggleOculto 
}: FileGridProps) {
    
    // 4. ATUALIZAR O .map() para ler do Contexto
    const gridItems = [
        ...(isEditing ? [<AddContextButton key="add-context" onClick={() => onAddContextClick?.()} />] : []),
        ...files.map((file) => (
            <FileItem
                key={file.id}
                id={file.id} 
                title={file.title} // <-- Correto
                type={file.type} // <-- Correto
                insertedDate={file.insertedDate} // <-- Correto
                status={file.status} // <-- Correto
                versoes={file.versoes} // <--- [MODIFICAÇÃO] Adicionado prop 'versoes'
                estaOculto={file.estaOculto} 
                isEditing={isEditing} 
                onClick={() => onFileClick?.(file)}
                onToggleOculto={onToggleOculto} 
                className="w-full"
            />
        ))
    ];

    const rows = [];
    for (let i = 0; i < gridItems.length; i += 4) {
        rows.push(gridItems.slice(i, i + 4));
    }

    return (
        <div className="flex justify-center items-center mt-10 w-full h-full">
            <div className="rounded-[50px] flex flex-col items-center justify-center">
                <ScrollArea height="660px" snap className="w-full">
                    <div className="flex flex-col p-6 gap-4 snap-y snap-mandatory">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid pt-2 grid-cols-1 md:grid-cols-4 gap-6 snap-start">
                                {row.map((item) => item)}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}