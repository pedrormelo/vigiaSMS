// src/components/contextosCard/fileDetailedListItem.tsx
"use client"

import React, { useState } from 'react';
import { Calendar, MoreVertical, Eye, EyeOff, Clock, ChevronDown, ChevronUp, FileText } from "lucide-react"
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

interface FileDetailedListItemProps {
    id: string;
    title: string
    type: FileType
    insertedDate: string
    status: StatusContexto;
    versoes?: Versao[];
    descricao?: string;
    className?: string
    onClick?: () => void
    isEditing?: boolean;
    estaOculto?: boolean;
    onToggleOculto?: (id: string) => void;
}

export function FileDetailedListItem({
    id,
    title,
    type,
    insertedDate,
    status,
    versoes = [], 
    descricao,
    className,
    onClick,
    isEditing = false,
    estaOculto = false,
    onToggleOculto
}: FileDetailedListItemProps) {
    const config = fileTypeConfig[type]
    const IconComponent = (config as any).icon

    const [isOcultarModalOpen, setIsOcultarModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isPublished = status === StatusContexto.Publicado;
    const isDisabled = !isPublished || estaOculto;
    const canToggleHide = estaOculto ? true : isPublished;

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

    const versoesPublicadas = versoes?.filter(v => !v.estaOculta && v.status === StatusContexto.Publicado) || [];
    const hasDetails = descricao || versoesPublicadas.length > 0;

    return (
        <>
            <div
                className={cn(
                    "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200",
                    isDisabled && "opacity-70 grayscale-[50%]",
                    className,
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50",
                        isDisabled && "hover:opacity-100 hover:grayscale-0"
                    )}
                    onClick={onClick}
                    title={isPublished ? title : `${title} (Status: ${status})`}
                >
                    {/* Ícone do tipo de arquivo */}
                    <div className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0",
                        config.color
                    )}>
                        {(config as any).svg ? (
                            <Image src={(config as any).svg} alt={config.label} width={28} height={28} />
                        ) : IconComponent ? (
                            <IconComponent className="h-7 w-7 text-white" />
                        ) : null}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{title}</h3>
                            {!isPublished && <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(insertedDate).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{config.label}</span>
                            {versoes && versoes.length > 0 && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <span>{versoes.length} {versoes.length === 1 ? 'versão' : 'versões'}</span>
                                </>
                            )}
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
                    </div>

                    {/* Botão Expandir/Recolher */}
                    {hasDetails && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    )}

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
                                        title={!canToggleHide ? "Apenas contextos publicados podem ser ocultados" : (estaOculto ? "Tornar Visível" : "Ocultar Contexto")}
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

                {/* Seção expandida com detalhes */}
                {isExpanded && hasDetails && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                        {descricao && (
                            <div className="mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    Descrição
                                </h4>
                                <p className="text-sm text-gray-600">{descricao}</p>
                            </div>
                        )}
                        
                        {versoesPublicadas.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Histórico de Versões
                                </h4>
                                <div className="space-y-2">
                                    {versoesPublicadas.map((versao, idx) => (
                                        <div 
                                            key={versao.id} 
                                            className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200"
                                        >
                                            <Badge variant="outline" className="text-xs">
                                                v{versoesPublicadas.length - idx}
                                            </Badge>
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(versao.data).toLocaleDateString("pt-BR")}</span>
                                            {versao.motivoNovaVersao && (
                                                <>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-xs italic">{versao.motivoNovaVersao}</span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
