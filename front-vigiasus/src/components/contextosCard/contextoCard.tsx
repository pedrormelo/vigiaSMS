// src/components/contextosCard/contextoCard.tsx
"use client"

import { FileText, FileSpreadsheet, FileSearch, Link, Calendar, ChartNetwork, Gauge } from "lucide-react" 
import { cn } from "@/lib/utils"
import Image from "next/image"

export type FileType = "pdf" | "doc" | "dashboard" | "excel" | "resolucao" | "link" | "leis" | "indicador"

interface FileItemProps {
    title: string
    type: FileType
    insertedDate: string
    className?: string
    onClick?: () => void
}

export const fileTypeConfig = {
    pdf: {
        color: "bg-[#C53131] hover:bg-[#A02020]",
        svg: "/icons/CONTEXTOS/PDF-1.svg",
        label: "PDF",
    },
    doc: {
        color: "bg-[#2651FF] hover:bg-[#1E40B8]",
        svg: "/icons/CONTEXTOS/DOC-1.svg",
        label: "DOC",
    },
    dashboard: {
        color: "bg-[#B329E9] hover:bg-purple-600",
        icon: ChartNetwork,
        label: "Gráfico de Dashboard",
    },

    indicador: {
        color: "bg-teal-500 hover:bg-teal-600",
        icon: Gauge,
        label: "Indicador",
    },
    excel: {
        color: "bg-[#008C32] hover:bg-[#006B24]",
        svg: "/icons/CONTEXTOS/PLA-1.svg",
        label: "Excel/XLSX/CSV",
    },
    resolucao: {
        color: "bg-[#E2712A] hover:bg-[#C95A2A]",
        svg: "/icons/CONTEXTOS/RES-1.svg",
        label: "Arquivo de Resolução",
    },
    leis: {
        color: "bg-[#f27] hover:bg-[#f26]",
        icon: FileSearch,
        label: "Arquivo de Resolução",
    },
    link: {
        color: "bg-[#81BFDE] hover:bg-[#6BAEDB]",
        icon: Link,
        label: "Link Externo",
    },
}

export function FileItem({ title, type, insertedDate, className, onClick }: FileItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon

    return (
        <div
            className={cn(
                "rounded-4xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md flex flex-col justify-between max-h-[200px] max-w-[245px]",
                config.color,
                className,
            )}
            onClick={onClick}
        >
            <div className="flex justify-center mb-4">
                { (config as any).svg ? (
                    <Image src={(config as any).svg} alt={config.label} width={40} height={40} />
                ) : IconComponent ? (
                    <IconComponent className="h-10 w-10 text-white" />
                ) : null }
            </div>

            <div className="text-center mb-4">
                <h3 className="font-medium text-white text-lg leading-tight truncate px-2" title={title}>{title}</h3>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="h-4 w-4" />
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}