// src/components/contextosCard/contextoCard.tsx
"use client"

import { 
    FileText, FileSpreadsheet, FileSearch, Link, Calendar, ChartNetwork, Gauge, Presentation, 
    Clock // <-- 1. Importar o ícone Clock
} from "lucide-react" 
import { cn } from "@/lib/utils"
import Image from "next/image"
import { StatusContexto } from "@/components/validar/typesDados" 
import StatusBadge from "@/components/alerts/statusBadge" 

export type FileType = "pdf" | "doc" | "dashboard" | "excel" | "resolucao" | "link" | "leis" | "indicador" | "apresentacao"

interface FileItemProps {
    title: string
    type: FileType
    insertedDate: string
    status: StatusContexto; 
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
    apresentacao: {
        color: "bg-amber-400 hover:bg-amber-500", // Amarelo Ouro (Amber)
        svg: "/icons/CONTEXTOS/PPTX-1.svg", // Ícone PPTX-1 existente em public/icons/CONTEXTOS
        icon: Presentation, // Ícone Lucide como fallback
        label: "Apresentação",
    },
    dashboard: {
        color: "bg-[#B329E9] hover:bg-purple-600",
        icon: ChartNetwork,
        label: "Gráfico de Dashboard",
    },

    indicador: {
        color: "bg-teal-500 hover:bg-teal-600",
        svg: "/icons/CONTEXTOS/INDC.svg",
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

// --- REMOVIDAS as consts pendingStyle e pendingTextStyle ---

export function FileItem({ title, type, insertedDate, status, className, onClick }: FileItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon
    
    const isPublished = status === StatusContexto.Publicado;

    // --- LÓGICA DE ESTILO ATUALIZADA ---
    const cardColor = config.color; // <-- Sempre usa a cor original
    const textColor = "text-white"; // <-- Sempre usa texto branco

    return (
        <div
            className={cn(
                "rounded-4xl p-6 cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between max-h-[200px] max-w-[245px] relative overflow-hidden", // <-- Adicionado overflow-hidden
                cardColor, // <-- Cor original é aplicada
                // --- APLICA FILTROS SE NÃO ESTIVER PUBLICADO ---
                !isPublished && "opacity-70 grayscale-[80%] hover:opacity-100 hover:grayscale-0", 
                className,
            )}
            onClick={onClick}
            title={isPublished ? title : `${title} (Status: ${status})`} // Tooltip melhorado
        >
            {/* O Badge de Status (AGORA CORRIGIDO) */}
            {!isPublished && (
                <div className="absolute top-3 left-3 z-10">
                    {/* Isto agora vai renderizar o badge correto, ex: "Aguardando Gerente" */}
                    <StatusBadge status={status} />
                </div>
            )}
            
            {/* --- ADICIONADA MARCA D'ÁGUA DE STATUS --- */}
            {!isPublished && (
                 <Clock className="absolute -right-2 -bottom-2 w-20 h-20 text-black/10 z-0" strokeWidth={1.5} />
            )}

            <div className="flex justify-center mb-4 mt-6 z-10"> {/* Adicionado mt-6 e z-10 */}
                { (config as any).svg ? (
                    <Image src={(config as any).svg} alt={config.label} width={40} height={40} />
                ) : IconComponent ? (
                    <IconComponent className="h-10 w-10 text-white" />
                ) : null }
            </div>

            <div className="text-center mb-4 z-10"> {/* Adicionado z-10 */}
                <h3 className={cn("font-medium text-lg leading-tight truncate px-2", textColor)} title={title}>{title}</h3>
            </div>

            <div className={cn("flex items-center justify-center gap-2 z-10", "text-white/90")}> {/* Adicionado z-10 */}
                <Calendar className="h-4 w-4" />
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}