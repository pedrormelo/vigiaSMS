"use client"

import { Scrollbar } from "@radix-ui/react-scroll-area"
import { FileItem, type FileType } from "../contextosCard/contextoCard"
import ScrollArea from "../ui/scroll-area"

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
            <div className="bg-white border border-[#f0f0f0] rounded-[50px] shadow-lg backdrop-blur-sm flex flex-col items-center justify-center p-6">
                <ScrollArea height="100vh" className="flex-1 w-full" showScrollbar="always">
                    <div
                        className={`grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-x-6 mx-auto  p-6 max-h-192 `}
                        // style={{ maxHeight: '520px', overflowY: 'auto' /  custom-scroll  //  overflow-y-scroll }}
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
                </ScrollArea>
            </div>
        </div>

    )
}
