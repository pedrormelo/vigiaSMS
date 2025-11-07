// src/components/popups/visualizarContextoModal/AbaVersoes.tsx
"use client";

import React, { useState } from 'react';
import { Plus, Edit, ChevronRight, EyeOff, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/alerts/statusBadge';
import { cn } from '@/lib/utils';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { StatusContexto } from '@/components/validar/typesDados';
import LinhaDoTempoValidacao from './linhaDoTempoValidacao';

interface AbaVersoesProps {
    aoClicarCorrigir?: () => void;
    dados: DetalhesContexto;
    perfil: 'diretor' | 'gerente' | 'membro';
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (versaoId: number) => void;
}

const AbaVersoes = ({
    aoClicarCorrigir,
    dados,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao
}: AbaVersoesProps) => {

    const [versaoExpandidaId, setVersaoExpandidaId] = useState<number | null>(null);

    const handleToggleExpand = (id: number) => {
        setVersaoExpandidaId(prevId => (prevId === id ? null : id));
    };

    const podeCriarNovaVersao = perfil === 'membro' && isEditing;
    const todasAsVersoes = dados.versoes || [];
    
    const versoesParaExibir = todasAsVersoes.filter(versao => {
        if (isEditing) {
            return true;
        }
        if (versao.estaOculta) {
            return false;
        }
        return versao.status === StatusContexto.Publicado;
    });
    
    // --- [MODIFICAÇÃO] A lógica 'numeroDeVersoesVisiveis' foi movida para dentro do map ---

    return (
        <div className="animate-fade-in p-1 sm:p-4 h-full overflow-y-auto scrollbar-custom">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
                
                {podeCriarNovaVersao && aoClicarCorrigir && (
                    <Button onClick={aoClicarCorrigir} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2">
                        <Plus className="w-4 h-4 mr-1.5" /> Criar Nova Versão
                    </Button>
                )}
                
                {perfil === 'membro' && dados.status === StatusContexto.AguardandoCorrecao && !isEditing && aoClicarCorrigir && (
                     <Button
                        onClick={aoClicarCorrigir}
                        variant="default"
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 py-2 font-semibold"
                    >
                        <Edit className="mr-1.5 h-4 w-4" /> Corrigir Contexto
                    </Button>
                )}
            </div>
            
            {/* Lista Acordeão de Versões */}
            {versoesParaExibir.length > 0 ? (
                <div className="space-y-3">
                    {versoesParaExibir.sort((a, b) => b.id - a.id).map((versao: Versao) => {
                        const isExpandida = versao.id === versaoExpandidaId;
                        
                        // --- INÍCIO DA CORREÇÃO ---
                        // 1. Verificar se a versão está publicada
                        const isVersaoPublicada = versao.status === StatusContexto.Publicado;
                        
                        // 2. Calcular o número total de versões que são publicadas E não estão ocultas
                        const numeroTotalDeVersoesPublicadasVisiveis = todasAsVersoes.filter(
                            v => v.status === StatusContexto.Publicado && !v.estaOculta
                        ).length;

                        // 3. O switch só pode ser alterado se a versão estiver publicada
                        const canToggle = isVersaoPublicada;
                        
                        // 4. Também não pode ser alterado se for a única versão visível
                        const isUnicaVisivel = isVersaoPublicada && !versao.estaOculta && numeroTotalDeVersoesPublicadasVisiveis === 1;

                        // 5. O switch é desabilitado se (não pode ser alternado) OU (é a única visível)
                        const isSwitchDisabled = !canToggle || isUnicaVisivel;

                        // 6. Determinar o tooltip (title) correto
                        let switchTitle = "";
                        if (isUnicaVisivel) {
                            switchTitle = "Não é possível ocultar a única versão visível.";
                        } else if (!canToggle) {
                            // Esta é a nova regra que corrige o problema da imagem
                            switchTitle = "Apenas versões com status 'Publicado' podem ter a visibilidade alterada.";
                        } else {
                            switchTitle = versao.estaOculta ? "Clique para tornar visível" : "Clique para ocultar";
                        }
                        // --- FIM DA CORREÇÃO ---
                        
                        return (
                            <div
                                key={versao.id}
                                className={cn(
                                    "bg-gray-50 rounded-lg border border-gray-200 transition-all",
                                    isExpandida && "shadow-md",
                                    versao.estaOculta && "opacity-60 bg-gray-100 border-dashed"
                                )}
                            >
                                {/* O Header Clicável */}
                                <div 
                                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleToggleExpand(versao.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <ChevronRight className={cn("w-5 h-5 text-gray-500 transition-transform", isExpandida && "rotate-90")} />
                                        <div>
                                            <p className={cn("font-medium", versao.estaOculta ? "text-gray-600" : "text-gray-800")}>{versao.nome}</p>
                                            <p className="text-sm text-gray-500">por {versao.autor} em {new Date(versao.data).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <StatusBadge status={(versao as any).status || StatusContexto.AguardandoGerente} />
                                        {versao.estaOculta && (
                                            <Badge className="bg-gray-700/80 text-white border-none py-1 px-2" title="Esta versão está oculta">
                                                <EyeOff className="w-3.5 h-3.5" />
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Switch de Ocultar Versão (Modo Edição) */}
                                    {isEditing && perfil === 'membro' && aoAlternarVisibilidadeVersao && (
                                        <div
                                            // 7. Aplicar o estilo de desabilitado ao container
                                            className={cn("flex items-center gap-2 pr-2", isSwitchDisabled && "opacity-50 cursor-not-allowed")}
                                            // 8. Aplicar o title dinâmico
                                            title={switchTitle}
                                            onClick={(e) => e.stopPropagation()} 
                                        >
                                            <label htmlFor={`switch-v${versao.id}`} className={cn(isSwitchDisabled ? "cursor-not-allowed" : "cursor-pointer")}>
                                                {versao.estaOculta ?
                                                    <EyeOff className="w-4 h-4 text-gray-500" /> :
                                                    <Eye className="w-4 h-4 text-blue-600" />
                                                }
                                            </label>
                                            <Switch
                                                id={`switch-v${versao.id}`}
                                                checked={!versao.estaOculta}
                                                onCheckedChange={() => aoAlternarVisibilidadeVersao(versao.id)}
                                                // 9. Aplicar o disabled dinâmico
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
                                            historico={(versao as any).historico || []} 
                                            status={(versao as any).status || StatusContexto.AguardandoGerente} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-8">
                    {isEditing ? "Nenhuma versão encontrada." : "Nenhuma versão publicada encontrada."}
                </p>
            )}
        </div>
    );
};

export default AbaVersoes;