// src/components/contextosCard/contextoCard.tsx
"use client"

import {
    FileText, FileSpreadsheet, FileSearch, Link, Calendar, ChartNetwork, Gauge, Presentation,
    Clock,
    MoreVertical,
    Eye, EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
// [MODIFICAÇÃO] Importar 'Versao'
import { StatusContexto, Versao } from "@/components/validar/typesDados" 
import StatusBadge from "@/components/alerts/statusBadge"
import { Badge } from "@/components/ui/badge" 
// [MODIFICAÇÃO] Importar o statusConfig para usar as cores e textos corretos
import { statusConfig } from "@/components/validar/colunasTable/statusConfig"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type FileType = "pdf" | "doc" | "dashboard" | "planilha" | "resolucao" | "link" | "leis" | "indicador" | "apresentacao"

interface FileItemProps {
    id: string;
    title: string
    type: FileType
    insertedDate: string
    status: StatusContexto;
    versoes?: Versao[]; // <-- Prop 'versoes'
    className?: string
    onClick?: () => void
    isEditing?: boolean;
    estaOculto?: boolean;
    onToggleOculto?: (id: string) => void;
}

// Config permanece a mesma...
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
        color: "bg-amber-400 hover:bg-amber-500",
        svg: "/icons/CONTEXTOS/PPTX-1.svg",
        icon: Presentation,
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
    planilha: { 
        color: "bg-[#008C32] hover:bg-[#006B24]",
        svg: "/icons/CONTEXTOS/PLA-1.svg",
        label: "Planilha", 
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

export function FileItem({
    id,
    title,
    type,
    insertedDate,
    status,
    versoes = [], // <-- Recebe 'versoes'
    className,
    onClick,
    isEditing = false,
    estaOculto = false,
    onToggleOculto
}: FileItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon

    const isPublished = status === StatusContexto.Publicado;
    const isDisabled = !isPublished || estaOculto;
    const cardColor = config.color;
    const textColor = "text-white";
    const canToggleHide = estaOculto ? true : isPublished;

    // <--- [MELHORIA v2] Início da nova lógica de badge (Mais Responsiva)
    let combinedEditingBadge: React.ReactNode = null;
    
    if (isEditing && !isPublished) {
        // 1. Determinar a versão
        const numVersoes = versoes?.length || 1;
        const isNovaVersao = numVersoes > 1;

        // Texto Abreviado (para o badge) e Completo (para o title)
        const versaoTextoAbreviado = `v${numVersoes}`;
        const versaoTextoCompleto = isNovaVersao ? `v${numVersoes} - Nova Versão` : `v1 - Novo Envio`;

        // 2. Obter o status config (cor e texto)
        const configStatus = statusConfig[status] || { text: status, className: "bg-gray-100 text-gray-800" };
        const statusTexto = configStatus.text;
        
        // 3. Criar o badge combinado
        combinedEditingBadge = (
            <Badge 
                className={cn("font-bold", configStatus.className)} 
                // O title (hover) tem o texto completo
                title={`${versaoTextoCompleto}. Status: ${statusTexto}`} 
            >
                {/* O texto visível é abreviado */}
                {versaoTextoAbreviado} ({statusTexto})
            </Badge>
        );
    }
    // <--- [MELHORIA v2] Fim da nova lógica

    return (
        <div
            className={cn(
                "rounded-4xl p-6 cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between max-h-[200px] max-w-[245px] relative overflow-hidden",
                cardColor,
                isDisabled && "opacity-70 grayscale-[80%] hover:opacity-100 hover:grayscale-0",
                className,
            )}
            onClick={onClick}
            title={isPublished ? title : `${title} (Status: ${status})`}
        >
            {/* --- Container de Badges (LÓGICA ATUALIZADA) --- */}
            <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                
                {/* [MELHORIA] Renderiza OU o badge de edição OU o badge de status normal */}
                {combinedEditingBadge ? (
                    combinedEditingBadge // Mostra "v1 (Aguardando Gerente)"
                ) : !isPublished ? (
                    <StatusBadge status={status} /> // Mostra "Aguardando Gerente" (modo visualização)
                ) : null}
                
                {/* Badge de Oculto (Sempre mostra se oculto) */}
                {estaOculto && (
                    <Badge className="bg-gray-700/80 text-white border-none py-1 px-2" title="Este contexto está oculto">
                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                        Oculto
                    </Badge>
                )}
            </div>

            {/* --- Menu Dropdown --- */}
            {isEditing && (
                <div className="absolute top-2 right-2 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="p-1.5 rounded-full text-white/90 hover:bg-white/25 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-white/90 backdrop-blur-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem
                                disabled={!canToggleHide}
                                onClick={() => onToggleOculto?.(id)}
                                className="cursor-pointer font-medium"
                                title={!canToggleHide ? "Apenas contextos publicados podem ser ocultados" : (estaOculto ? "Tornar Visível" : "Ocultar Contexto")}
                            >
                                {estaOculto ? (
                                    <><Eye className="w-4 h-4 mr-2" /> Tornar Visível</>
                                ) : (
                                    <><EyeOff className="w-4 h-4 mr-2" /> Ocultar Contexto</>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {!isPublished && (
                <Clock className="absolute -right-2 -bottom-2 w-20 h-20 text-black/10 z-0" strokeWidth={1.5} />
            )}

            {/* [MELHORIA] O padding-top (mt-6) só é aplicado se houver badges visíveis */}
            <div className={cn(
                "flex justify-center mb-4 z-10",
                // Aplica padding se (não publicado) OU (oculto)
                (!isPublished || estaOculto) && "mt-6" 
            )}>
                {(config as any).svg ? (
                    <Image src={(config as any).svg} alt={config.label} width={40} height={40} />
                ) : IconComponent ? (
                    <IconComponent className="h-10 w-10 text-white" />
                ) : null}
            </div>

            {/* Título e Data */}
            <div className="text-center mb-4 z-10">
                <h3 className={cn("font-medium text-lg leading-tight truncate px-2", textColor)} title={title}>{title}</h3>
            </div>
            <div className={cn("flex items-center justify-center gap-2 z-10", "text-white/90")}>
                <Calendar className="h-4 w-4" />
                <time dateTime={insertedDate} className="text-sm">
                    {new Date(insertedDate).toLocaleDateString("pt-BR")}
                </time>
            </div>
        </div>
    )
}