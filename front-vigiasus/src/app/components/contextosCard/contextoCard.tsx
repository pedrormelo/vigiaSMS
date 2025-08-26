"use client"

import { FileText, FileSpreadsheet, BarChart3, Link, Calendar1 , ChartNetwork  } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileType = "pdf" | "doc" | "dashboard" | "excel" | "resolucao" | "link"

interface FileItemProps {
    title: string
    type: FileType
    insertedDate: string
    className?: string
    onClick?: () => void
}

const fileTypeConfig = {
    pdf: {
        color: "bg-[#C53131]",
        icon: FileText,
        label: "PDF",
    },
    doc: {
        color: "bg-[#2651FF]",
        icon: FileText,
        label: "DOC",
    },
    dashboard: {
        color: "bg-[#B329E9]",
        icon: ChartNetwork,
        label: "Dashboard",
    },
    excel: {
        color: "bg-[#008C32]",
        icon: FileSpreadsheet,
        label: "Excel/XLSX",
    },
    resolucao: {
        color: "bg-[#E2712A]",
        icon: FileText,
        label: "Resolução",
    },
    link: {
        color: "bg-[#81BFDE]",
        icon: Link,
        label: "Link",
    },
}

export function FileItem({ title, type, insertedDate, className, onClick }: FileItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = config.icon

    return (
        <div
            className={cn(
                "rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 flex flex-col justify-between min-h-[160px]",
                config.color,
                className,
            )}
            onClick={onClick}
        >
            <div className="flex justify-center mb-4">
                <IconComponent className="h-12 w-12 text-white" />
            </div>

            <div className="text-center mb-4">
                <h3 className="font-medium text-white text-lg leading-tight">{title}</h3>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar1 className="h-4 w-4" />
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}
