// src/components/contextosCard/fileListItem.tsx
"use client"

import React, { useState } from 'react';
import { Calendar, MoreVertical, Eye, EyeOff, Clock, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { StatusContexto, Versao } from "@/components/validar/typesDados" 
import StatusBadge from "@/components/alerts/statusBadge"
import { Badge } from "@/components/ui/badge" 
import { statusConfig } from "@/components/validar/colunasTable/statusConfig"
import { fileTypeConfig, FileType } from "./contextoCard"
import { toggleVisibilityContexto } from '@/services/contextoService';
import OcultarContextoModal from '@/components/popups/ocultarContextoModal'; 
import { showSuccessToast, showErrorToast } from '@/components/ui/Toasts'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileListItemProps {
    id: string;
    title: string
    type: FileType
    insertedDate: string
    status: StatusContexto;
    versoes?: Versao[];
    className?: string
    onClick?: () => void
    isEditing?: boolean;
    estaOculto?: boolean;
    onToggleOculto?: (id: string) => void;
    isOcultarBloqueado?: boolean;
    ocultarBloqueadoMotivo?: string;
}

export function FileListItem({
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
}: FileListItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon

    const [isOcultarModalOpen, setIsOcultarModalOpen] = useState(false);

    const isPublished = status === StatusContexto.Publicado;
    const isBloqueadoParaOcultar = !estaOculto && isOcultarBloqueado;
    const isDisabled = !isPublished || estaOculto;
    const canToggleHide = estaOculto ? true : (isPublished && !isBloqueadoParaOcultar);
    const toggleTooltip = (() => {
        if (estaOculto) return "Tornar visível este contexto";
        if (!isPublished) return "Apenas contextos publicados podem ser ocultados";
        if (isOcultarBloqueado) return ocultarBloqueadoMotivo || "Este conteúdo está em uso em um dashboard de diretoria.";
        return "Ocultar Contexto";
    })();

    const handleConfirmToggleOculto = async () => {
        if (!onToggleOculto) return;
        
        try {
            await toggleVisibilityContexto(id);
            showSuccessToast(estaOculto ? "Contexto tornado visível!" : "Contexto oculto com sucesso!");
            onToggleOculto(id); 
        } catch (e: any) {
            console.error("Erro ao alternar visibilidade do contexto:", e);
            showErrorToast(e.message || "Falha ao alternar visibilidade.");
        } finally {
            setIsOcultarModalOpen(false);
        }
    }
    
    const handleOpenToggleOculto = (e: Event | React.MouseEvent) => {
        e.stopPropagation(); 
        if (estaOculto) {
            handleConfirmToggleOculto();
        } else {
            if (isOcultarBloqueado) {
                showErrorToast(ocultarBloqueadoMotivo || "Este conteúdo está em uso em um dashboard de diretoria e não pode ser ocultado.");
                return;
            }
            setIsOcultarModalOpen(true);
        }
    }

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
                className={cn("font-bold text-xs", configStatus.className)} 
                title={`${versaoTextoCompleto}. Status: ${statusTexto}`} 
            >
                {versaoTextoAbreviado} ({statusTexto})
            </Badge>
        );
    }

    return (
        <>
            <div
                className={cn(
                    "flex items-center gap-4 p-4 bg-white rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200",
                    isDisabled && "opacity-70 grayscale-[50%] hover:opacity-100 hover:grayscale-0",
                    className,
                )}
                onClick={onClick}
                title={isPublished ? title : `${title} (Status: ${status})`}
            >
                {/* Ícone do tipo de arquivo */}
                <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    config.color
                )}>
                    {(config as any).svg ? (
                        <Image src={(config as any).svg} alt={config.label} width={24} height={24} />
                    ) : IconComponent ? (
                        <IconComponent className="h-6 w-6 text-white" />
                    ) : null}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-base truncate">{title}</h3>
                        {!isPublished && <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(insertedDate).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{config.label}</span>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                    {combinedEditingBadge ? (
                        combinedEditingBadge
                    ) : !isPublished ? (
                        <StatusBadge status={status} />
                    ) : null}
                    
                    {estaOculto && (
                        <Badge className="bg-gray-700/80 text-white border-none py-1 px-2" title="Este contexto está oculto">
                            <EyeOff className="w-3.5 h-3.5 mr-1" />
                            Oculto
                        </Badge>
                    )}
                    {isOcultarBloqueado && (
                        <Badge className="bg-blue-700/90 text-white border-none py-1 px-2" title={ocultarBloqueadoMotivo || "Em uso no dashboard da diretoria"}>
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                            Em uso
                        </Badge>
                    )}
                </div>

                {/* Menu Dropdown */}
                {isEditing && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-white/90 backdrop-blur-md"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <DropdownMenuItem
                                    disabled={!canToggleHide}
                                    className="cursor-pointer font-medium"
                                    title={toggleTooltip}
                                    onSelect={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation();
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
            </div>

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
