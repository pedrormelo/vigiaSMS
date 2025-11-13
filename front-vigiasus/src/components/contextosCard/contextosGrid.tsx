"use client"

import { FileItem, type FileType } from "../contextosCard/contextoCard"
import { AddContextButton } from "./adicionarContexto"
import ScrollArea from "@/components/ui/scroll-area"

interface FileData {
    id: string
    title: string
    type: FileType
    insertedDate: string
}

interface FileGridProps {
    files: FileData[]
    onFileClick?: (file: FileData) => void
    onAddContextClick?: () => void
    className?: string
    isEditing?: boolean 
}

export function FileGrid({ files, onFileClick, onAddContextClick, className, isEditing }: FileGridProps) {
    //  O botão de adicionar só é incluído na lista se 'isEditing' for verdadeiro
    const gridItems = [
        ...(isEditing ? [<AddContextButton key="add-context" onClick={() => onAddContextClick?.()} />] : []),
        ...files.map((file) => (
            <FileItem
                key={file.id}
                title={file.title}
                type={file.type}
                insertedDate={file.insertedDate}
                onClick={() => onFileClick?.(file)}
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