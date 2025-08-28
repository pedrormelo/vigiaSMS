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
        <div className="flex justify-center items-center w-full h-full">
            <div className="bg-white border border-[#f0f0f0] rounded-4xl shadow-lg backdrop-blur-sm flex flex-col items-center justify-center p-6">
                <div
                    className={`grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-x-6 mx-auto custom-scroll`}
                    style={{ maxHeight: '520px', overflowY: 'auto' }}
                >
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
        </div>

    )
}
