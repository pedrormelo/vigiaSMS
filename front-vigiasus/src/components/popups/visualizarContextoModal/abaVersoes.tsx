// src/components/popups/visualizarContextoModal/abaVersoes.tsx
"use client";

import React, { useState, ComponentProps } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/alerts/statusBadge';
import { cn } from '@/lib/utils';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { StatusContexto } from '@/components/validar/typesDados';
import LinhaDoTempoValidacao from './linhaDoTempoValidacao';

// Extrai o tipo da prop 'historico' diretamente do componente para garantir consistência
type TipoHistorico = ComponentProps<typeof LinhaDoTempoValidacao>['historico'];

// Estende a interface Versao para incluir o histórico que vem do backend
interface VersaoComHistorico extends Versao {
    historico?: TipoHistorico;
}

interface AbaVersoesProps {
    aoClicarCorrigir?: () => void;
    dados: DetalhesContexto;
    perfil: 'diretor' | 'gerente' | 'membro';
    isEditing?: boolean;
    isValidationView?: boolean;
    aoAlternarVisibilidadeVersao?: (versaoId: number) => void;
}

const AbaVersoes = ({
    aoClicarCorrigir,
    dados,
    perfil,
    isEditing,
    isValidationView = false,
    aoAlternarVisibilidadeVersao
}: AbaVersoesProps) => {

    const [versaoExpandidaId, setVersaoExpandidaId] = useState<number | null>(null);

    const handleToggleExpand = (id: number) => {
        setVersaoExpandidaId(prev => prev === id ? null : id);
    };

    // Filtra e ordena as versões
    const listaVersoes = (dados.versoes || [])
        .filter(() => { 
            // [CORREÇÃO] Removido o argumento 'v' para evitar o erro 'no-unused-vars'
            return true; 
        })
        .sort((a, b) => b.id - a.id); // Mais recentes primeiro

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
                    {listaVersoes.map((versaoBase) => {
                        // Cast seguro para o tipo estendido
                        const versao = versaoBase as VersaoComHistorico;
                        
                        const isExpandida = versaoExpandidaId === versao.id;
                        const isOculta = versao.estaOculta;
                        
                        // 1. Permissão básica: Só pode alternar se estiver PUBLICADO
                        const canToggleVisibility = versao.status === StatusContexto.Publicado;
                        
                        // 2. Regra de Negócio: Se houver APENAS UMA versão, não pode desativar (ocultar)
                        // (Mas se estiver oculta por algum motivo, pode ativar)
                        const isOnlyVersion = listaVersoes.length === 1;
                        const preventHiding = isOnlyVersion && !isOculta;

                        // Combina todas as restrições
                        const isSwitchDisabled = !canToggleVisibility || !aoAlternarVisibilidadeVersao || preventHiding;

                        // Define o título do tooltip para explicar por que está desativado
                        let titleTooltip = isOculta ? "Versão Oculta" : "Versão Visível";
                        if (isSwitchDisabled) {
                            if (!canToggleVisibility) titleTooltip = "Indisponível (Apenas versões publicadas)";
                            else if (preventHiding) titleTooltip = "Não é possível ocultar a única versão disponível";
                        }

                        return (
                            <div 
                                key={versao.id} 
                                className={cn(
                                    "border rounded-xl transition-all duration-200 overflow-hidden",
                                    isExpandida ? "bg-blue-50/30 border-blue-200 shadow-sm" : "bg-white border-gray-200 hover:border-blue-200"
                                )}
                            >
                                <div className="p-3 flex items-center gap-3">
                                    {/* Botão de Expandir */}
                                    <button 
                                        onClick={() => handleToggleExpand(versao.id)}
                                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", isExpandida && "rotate-90")} />
                                    </button>

                                    {/* Informações Principais */}
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleExpand(versao.id)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-800 text-sm">
                                                {versao.nome}
                                            </span>
                                            {versao.status === StatusContexto.Publicado && (
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

                                    {/* Status Badge */}
                                    <div className="flex-shrink-0">
                                        <StatusBadge status={versao.status || StatusContexto.AguardandoGerente} />
                                    </div>

                                    {/* Switch de Visibilidade */}
                                    {isEditing && (
                                        <div className="flex-shrink-0 pl-2 border-l border-gray-100" title={titleTooltip}>
                                            <Switch
                                                checked={!isOculta}
                                                onCheckedChange={() => aoAlternarVisibilidadeVersao && aoAlternarVisibilidadeVersao(versao.id)}
                                                disabled={isSwitchDisabled}
                                                aria-label={versao.estaOculta ? "Tornar versão visível" : "Ocultar versão"}
                                                className='focus:ring-2 ring-blue-300 ring-offset-1'
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Conteúdo Colapsável (A Linha do Tempo) */}
                                {isExpandida && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <LinhaDoTempoValidacao 
                                            historico={versao.historico || []} 
                                            status={versao.status || StatusContexto.AguardandoGerente} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
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