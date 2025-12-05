// src/components/popups/visualizarContextoModal/abaVersoes.tsx
"use client";

import React, { useState, ComponentProps } from 'react';
import { Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/alerts/statusBadge';
import { cn } from '@/lib/utils';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { StatusContexto } from '@/components/validar/typesDados';
import LinhaDoTempoValidacao from './linhaDoTempoValidacao';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TipoHistorico = ComponentProps<typeof LinhaDoTempoValidacao>['historico'];

interface VersaoComHistorico extends Omit<Versao, 'historico'> {
    historico?: TipoHistorico;
    estaOculta?: boolean;
    isOculta?: boolean;
}

// Helper para leitura do estado oculto
const getEstaOculta = (v: any): boolean => {
    return v.estaOculta ?? v.isOculta ?? false;
};

interface AbaVersoesProps {
    aoClicarCorrigir?: () => void;
    dados: DetalhesContexto;
    perfil: 'diretor' | 'gerente' | 'membro' | string;
    isEditing?: boolean;
    isValidationView?: boolean;
    aoAlternarVisibilidadeVersao?: (versaoId: number) => void;
    // [CORREÇÃO]: Adicionando a prop faltante na interface
    canViewFullHistory: boolean;
}

const AbaVersoes = ({
    aoClicarCorrigir,
    dados,
    perfil,
    isEditing,
    isValidationView = false,
    aoAlternarVisibilidadeVersao,
    canViewFullHistory // Agora o TS reconhece esta prop
}: AbaVersoesProps) => {

    const [versaoExpandidaId, setVersaoExpandidaId] = useState<number | string | null>(null);

    const handleToggleExpand = (id: number | string) => {
        setVersaoExpandidaId(prev => prev === id ? null : id);
    };

    const listaVersoes = (dados.versoes || [])
        .filter(() => true)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // 🎯 Encontrar a versão mais recente PUBLICADA
    const versaoMaisRecente = listaVersoes.find(v => v.status === StatusContexto.Publicado);
    const versaoMaisRecenteId = versaoMaisRecente?.id;

    const totalVisiveis = listaVersoes.filter(v => !getEstaOculta(v)).length;
    const isSingleVersionTotal = listaVersoes.length === 1;

    return (
        <div className="h-full flex flex-col animate-fade-in">
            
            {/* Botão de Nova Versão */}
            {isEditing && !isValidationView && (
                <div className="mb-6">
                    <Button 
                        onClick={aoClicarCorrigir} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Nova Versão / Correção
                    </Button>
                </div>
            )}

            {/* Lista de Versões */}
            {listaVersoes.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                    <TooltipProvider>
                        {listaVersoes.map((versaoBase, index) => {
                            const versao = versaoBase as VersaoComHistorico;
                            const uniqueKey = versao.id || index;
                            
                            const isExpandida = versaoExpandidaId === versao.id;
                            const isOculta = getEstaOculta(versao);
                            const canToggleVisibility = versao.status === StatusContexto.Publicado;

                            // LÓGICA DE BLOQUEIO DE UI
                            const isSwitchLocked = isSingleVersionTotal;
                            const isLastVisibleVersion = !isOculta && totalVisiveis <= 1;
                            const isSwitchDisabled = isSwitchLocked || !canToggleVisibility || !aoAlternarVisibilidadeVersao || isLastVisibleVersion;
                            const checkedState = isSwitchLocked ? true : !isOculta;

                            let reasonDisabled = "";
                            if (isSwitchLocked) {
                                reasonDisabled = "Regra de Negócio: A única versão do contexto deve estar sempre ativa.";
                            } else if (!canToggleVisibility) {
                                reasonDisabled = "Apenas versões publicadas podem ser geridas.";
                            } else if (isLastVisibleVersion) {
                                reasonDisabled = "Segurança: Deve manter pelo menos uma versão visível.";
                            }

                            return (
                                <div 
                                    key={uniqueKey} 
                                    className={cn(
                                        "border rounded-xl transition-all duration-200 overflow-hidden",
                                        isExpandida ? "bg-blue-50/30 border-blue-200 shadow-sm" : "bg-white border-gray-200 hover:border-blue-200"
                                    )}
                                >
                                    <div className="p-3 flex items-center gap-3">
                                        <button 
                                            onClick={() => handleToggleExpand(versao.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", isExpandida && "rotate-90")} />
                                        </button>

                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleExpand(versao.id)}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                                    v{versao.id}
                                                </span>
                                                <span className="font-semibold text-gray-800 text-sm">
                                                    {versao.nome}
                                                </span>
                                                {/* ✅ Mostrar "Atual" apenas para a versão mais recente publicada */}
                                                {versao.id === versaoMaisRecenteId && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200">
                                                        Atual
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{new Date(versao.data).toLocaleDateString('pt-BR')}</span>
                                                <span>•</span>
                                                <span className="truncate max-w-[120px]" title={versao.autor}>{versao.autor}</span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <StatusBadge status={versao.status || StatusContexto.AguardandoGerente} />
                                        </div>

                                        {/* Switch de Visibilidade */}
                                        {isEditing && (
                                            <Tooltip delayDuration={200}>
                                                <TooltipTrigger asChild>
                                                    <div 
                                                        className={cn(
                                                            "flex-shrink-0 pl-2 border-l border-gray-100 relative transition-opacity",
                                                            isSwitchDisabled && "opacity-50 cursor-not-allowed grayscale"
                                                        )}
                                                        onClick={(e) => isSwitchDisabled && e.stopPropagation()}
                                                    >
                                                        <Switch
                                                            checked={checkedState}
                                                            onCheckedChange={() => {
                                                                if (!isSwitchDisabled && aoAlternarVisibilidadeVersao) {
                                                                    aoAlternarVisibilidadeVersao(versao.id);
                                                                }
                                                            }}
                                                            disabled={isSwitchDisabled}
                                                            className={cn(
                                                                'focus:ring-2 ring-blue-300 ring-offset-1 data-[state=checked]:bg-blue-600',
                                                                isSwitchDisabled && "cursor-not-allowed"
                                                            )}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                
                                                {isSwitchDisabled && (
                                                    <TooltipContent side="left" className="max-w-[200px] bg-gray-800 text-white border-gray-700">
                                                        <p className="text-xs flex items-start gap-2">
                                                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
                                                            {reasonDisabled}
                                                        </p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        )}
                                    </div>
                                    
                                    {isExpandida && (
                                        <div className="p-4 border-t border-gray-200 bg-white">
                                            <LinhaDoTempoValidacao 
                                                historico={versao.historico || []} 
                                                status={versao.status || StatusContexto.AguardandoGerente} 
                                                // [CORREÇÃO] Passa a propriedade para a Linha do Tempo
                                                canViewFullHistory={canViewFullHistory}
                                                versionLabel={`v${versao.id}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </TooltipProvider>
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-8">
                    {isEditing || isValidationView ? "Nenhuma versão encontrada." : "Nenhuma versão publicada encontrada."}
                </p>
            )}
        </div>
    );
};

export default AbaVersoes;