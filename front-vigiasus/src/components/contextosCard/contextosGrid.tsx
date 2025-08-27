"use client"

import { FileItem, type FileType } from "../contextosCard/contextoCard"

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
        <div className="flex1 items-center max-w-[82%]">
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-x-1 mb-8 mx-auto ${className}`}>
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        title={file.title}
                        type={file.type}
                        insertedDate={file.insertedDate}
                        onClick={() => onFileClick?.(file)}
                        className="w-full"
                    />
                ))}
            </div>
        </div>

    )
}
