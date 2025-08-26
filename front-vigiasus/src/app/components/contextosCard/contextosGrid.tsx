"use client"

import { FileItem, type FileType } from "./contextoCard"

interface FileData {
    id: string
    title: string
    type: FileType
    insertedDate: string
}

interface FileGridProps {
    files: FileData[]
    onFileClick?: (file: FileData) => void
    className?: string
}

export function FileGrid({ files, onFileClick, className }: FileGridProps) {
    return (
        <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
            {files.map((file) => (
                <FileItem
                    key={file.id}
                    title={file.title}
                    type={file.type}
                    insertedDate={file.insertedDate}
                    onClick={() => onFileClick?.(file)}
                />
            ))}
        </div>
    )
}
