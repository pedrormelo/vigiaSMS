// src/components/contextosCard/contextoCard.tsx
"use client"

import React, { useState } from 'react';
import {
    FileText, FileSpreadsheet, FileSearch, Link, Calendar, ChartNetwork, Gauge, Presentation,
    Clock,
    MoreVertical,
    Eye, EyeOff,
    LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { StatusContexto, Versao } from "@/components/validar/typesDados" 
import StatusBadge from "@/components/alerts/statusBadge"
import { Badge } from "@/components/ui/badge" 
import { statusConfig } from "@/components/validar/colunasTable/statusConfig"
import { toggleVisibilityContexto } from '@/services/contextoService';
import OcultarContextoModal from '@/components/popups/ocultarContextoModal'; 
import { showSuccessToast, showErrorToast } from '@/components/ui/Toasts'; 
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
    isOcultarBloqueado?: boolean;
    ocultarBloqueadoMotivo?: string;
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
    versoes = [], 
    className,
    onClick,
    isEditing = false,
    estaOculto = false,
    onToggleOculto,
    isOcultarBloqueado = false,
    ocultarBloqueadoMotivo
}: FileItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon

    const [isOcultarModalOpen, setIsOcultarModalOpen] = useState(false);

    const isPublished = status === StatusContexto.Publicado;
    const isDisabled = !isPublished || estaOculto;
    const cardColor = config.color;
    const textColor = "text-white";
    const isBloqueadoParaOcultar = !estaOculto && isOcultarBloqueado;
    const canToggleHide = estaOculto ? true : (isPublished && !isBloqueadoParaOcultar);
    const toggleTooltip = (() => {
        if (estaOculto) return "Tornar visível este contexto";
        if (!isPublished) return "Apenas contextos publicados podem ser ocultados";
        if (isOcultarBloqueado) return ocultarBloqueadoMotivo || "Este conteúdo está em uso em um dashboard de diretoria.";
        return "Ocultar Contexto";
    })();

    // --- HANDLER PRINCIPAL (CHAMADA AO BACKEND) ---
    const handleConfirmToggleOculto = async () => {
        if (!onToggleOculto) return;
        
        try {
            await toggleVisibilityContexto(id);
            
            showSuccessToast(estaOculto ? "Contexto tornado visível!" : "Contexto oculto com sucesso!");
            
            // Notifica o componente pai para atualizar a grelha (Otimista)
            onToggleOculto(id); 
            
        } catch (e: any) {
            console.error("Erro ao alternar visibilidade do contexto:", e);
            showErrorToast(e.message || "Falha ao alternar visibilidade.");
        } finally {
            setIsOcultarModalOpen(false); // Fecha o modal após a ação
        }
    }
    
    // --- HANDLER DE CONTROLE DE FLUXO (ABRIR MODAL OU EXECUTAR DIRETO) ---
    const handleOpenToggleOculto = (e: Event | React.MouseEvent) => {
        // [CORREÇÃO] Previne que o evento suba e ative o onClick do card
        e.stopPropagation(); 
        
        if (estaOculto) {
            // Se está oculto, queremos exibir -> EXECUTAR IMEDIATAMENTE
            handleConfirmToggleOculto();
        } else {
            if (isOcultarBloqueado) {
                showErrorToast(ocultarBloqueadoMotivo || "Este conteúdo está em uso em um dashboard de diretoria e não pode ser ocultado.");
                return;
            }
            // Se está visível, queremos ocultar -> ABRE MODAL DE CONFIRMAÇÃO
            setIsOcultarModalOpen(true);
        }
    }


    // <--- Lógica de Badge (Mantida) ---
    let combinedEditingBadge: React.ReactNode = null;
    
    if (isEditing && !isPublished) {
        const numVersoes = versoes?.length || 1;
        const isNovaVersao = numVersoes > 1;

        const versaoTextoAbreviado = `v${numVersoes}`;
        const versaoTextoCompleto = isNovaVersao ? `v${numVersoes} - Nova Versão` : `v1 - Novo Envio`;

        const configStatus = statusConfig[status] || { text: status, className: "bg-gray-100 text-gray-800" };
        const statusTexto = configStatus.text;
        
        combinedEditingBadge = (
            <Badge 
                className={cn("font-bold text-[10px] md:text-xs py-0.5 md:py-1 px-1 md:px-1.5", configStatus.className)} 
                title={`${versaoTextoCompleto}. Status: ${statusTexto}`} 
            >
                {versaoTextoAbreviado} ({statusTexto})
            </Badge>
        );
    }
    // ---> Fim da Lógica de Badge


    return (
        <>
            <div
                className={cn(
                    "rounded-xl md:rounded-3xl p-2.5 md:p-4 cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between min-h-[150px] md:min-h-[190px] relative overflow-hidden",
                    cardColor,
                    isDisabled && "opacity-70 grayscale-[80%] hover:opacity-100 hover:grayscale-0",
                    className,
                )}
                onClick={onClick} // O clique no card abre o Modal de Visualização (correto)
                title={isPublished ? title : `${title} (Status: ${status})`}
            >
                {/* ... Badges ... */}
                <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 flex flex-col items-start gap-0.5 md:gap-1">
                    
                    {combinedEditingBadge ? (
                        combinedEditingBadge
                    ) : !isPublished ? (
                        <StatusBadge status={status} />
                    ) : null}
                    
                    {estaOculto && (
                        <Badge className="bg-gray-700/80 text-white border-none py-0.5 md:py-1 px-1 md:px-1.5 text-[10px] md:text-xs" title="Este contexto está oculto">
                            <EyeOff className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 mr-0.5 md:mr-1" />
                            Oculto
                        </Badge>
                    )}
                    {isOcultarBloqueado && (
                        <Badge className="bg-blue-700/90 text-white border-none py-0.5 md:py-1 px-1 md:px-1.5 text-[10px] md:text-xs" title={ocultarBloqueadoMotivo || "Em uso no dashboard da diretoria"}>
                            <LayoutDashboard className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 mr-0.5 md:mr-1" />
                            Em uso
                        </Badge>
                    )}
                </div>

                {/* --- Menu Dropdown --- */}
                {isEditing && (
                    <div className="absolute top-1 md:top-1.5 right-1 md:right-1.5 z-20">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                                // [CORREÇÃO 1]: Impede que o clique do Trigger abra o Modal de Visualização do Card
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <button className="p-1 rounded-full text-white/90 hover:bg-white/25 transition-colors">
                                    <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-white/90 backdrop-blur-md"
                                // [CORREÇÃO 1.1]: Impede que qualquer clique no Menu abra o Modal de Visualização do Card
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <DropdownMenuItem
                                    disabled={!canToggleHide}
                                    className="cursor-pointer font-medium"
                                    title={toggleTooltip}
                                    onSelect={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation(); // Garante que o evento não propague
                                        
                                        // Executa o handler que decide abrir o modal ou executar a ação
                                        handleOpenToggleOculto(e as any);
                                    }}
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

                {/* ... Restante do JSX do Card ... */}
                {!isPublished && (
                    <Clock className="absolute -right-1 md:-right-2 -bottom-0.5 md:-bottom-1 w-12 md:w-16 h-12 md:h-16 text-black/10 z-0" strokeWidth={1.5} />
                )}
                <div className={cn(
                    "flex justify-center items-center z-10 py-2 md:py-3"
                )}>
                    {(config as any).svg ? (
                        <Image src={(config as any).svg} alt={config.label} width={64} height={64} className="w-12 md:w-14 h-12 md:h-14" />
                    ) : IconComponent ? (
                        <IconComponent className="h-12 md:h-14 w-12 md:w-14 text-white" />
                    ) : null}
                </div>
                <div className="text-center z-10 px-1.5">
                    <h3 className={cn("font-semibold text-[10px] md:text-sm leading-tight truncate line-clamp-2", textColor)} title={title}>{title}</h3>
                </div>
                <div className="flex flex-col gap-0.5 md:gap-1 z-10">
                    <div className={cn("flex items-center justify-center text-white/90")}>
                        <span className={cn("text-[12px] md:text-[14px] font-bold uppercase tracking-tight px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-white/20")}>{config.label}</span>
                    </div>
                    <div className={cn("flex items-center justify-center gap-0.5 md:gap-1 z-10", "text-white/80")}>
                        <Calendar className="h-2.5 md:h-3.5 w-2.5 md:w-3.5" />
                        <time dateTime={insertedDate} className="text-[7px] md:text-[9px]">
                            {new Date(insertedDate).toLocaleDateString("pt-BR")}
                        </time>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Ocultação */}
            {!estaOculto && (
                <OcultarContextoModal 
                    open={isOcultarModalOpen}
                    onOpenChange={setIsOcultarModalOpen}
                    contextoNome={title}
                    onConfirm={handleConfirmToggleOculto}
                    onCancel={() => setIsOcultarModalOpen(false)} 
                />
            )}
        </>
    )
}