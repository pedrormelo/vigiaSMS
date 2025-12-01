// src/components/popups/visualizarContextoModal/index.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Info, History, FileText, LucideProps, ZoomIn, ZoomOut, RotateCcw,
    FileCheck2, X, CornerUpLeft, Upload
} from 'lucide-react';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import DeferirContextoModal from '@/components/popups/deferirContextoModal';
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';
import { showErrorToast, showSuccessToast } from '@/components/ui/Toasts';
import AbaDetalhes from './abaDetalhes';
import AbaVersoes from './abaVersoes';

import type { Contexto } from '@/components/validar/typesDados';
import { getContextoById, toggleVisibilityContexto, toggleVisibilityVersao } from '@/services/contextoService';
import { normalizarContexto } from '@/lib/normalizers';

// [NOVO]: Importar o hook de usuário para auto-detecção de perfil
import { useCurrentUser } from "@/hooks/useCurrentUser";

type PartialContexto = Partial<Contexto> & { id: string;[key: string]: any };

interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: Contexto | PartialContexto | null;
    // Tornamos opcional para permitir auto-detecção
    perfil?: 'diretor' | 'gerente' | 'membro' | string;
    aoCriarNovaVersao?: (dados: Contexto) => void;
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (contextoId: string, versaoId: number) => void;
    aoAlternarVisibilidadeIndicador?: (contextoId: string) => void;
    isFromHistory?: boolean;
    isValidation?: boolean;
    onDeferir?: (versaoId: string, comentario?: string) => void | Promise<void>;
    onIndeferir?: (versaoId: string, comentario: string) => void | Promise<void>;
    onCorrigir?: (versaoId: string, justificativa: string) => void | Promise<void>;
    usuarioGerenciaId?: string;
}

type TipoAba = 'detalhes' | 'versoes';

const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={cn(
        "flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center text-sm gap-2",
        abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
    )}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);

export function VisualizarContextoModal({
    estaAberto,
    aoFechar,
    dadosDoContexto,
    aoCriarNovaVersao,
    perfil: perfilProp, // Renomeado para distinguir do hook
    isEditing,
    aoAlternarVisibilidadeVersao,
    aoAlternarVisibilidadeIndicador,
    isFromHistory = false,
    isValidation = false,
    onDeferir,
    onIndeferir,
    onCorrigir,
    usuarioGerenciaId: gerenciaIdProp
}: VisualizarContextoModalProps) {

    // [CORREÇÃO DE TIPAGEM]: O hook retorna o objeto do usuário diretamente
    const currentUser = useCurrentUser();

    // Prioriza a prop passada, senão usa o do hook (role)
    const perfil = perfilProp || currentUser.role || 'membro';
    // Prioriza a prop passada, senão usa o do hook (gerenciaId)
    const usuarioGerenciaId = gerenciaIdProp || currentUser.gerenciaId;

    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const [correcaoOpen, setCorrecaoOpen] = useState(false);
    const [deferirOpen, setDeferirOpen] = useState(false);

    const [dadosLocais, setDadosLocais] = useState<Contexto | PartialContexto | null>(dadosDoContexto);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        setDadosLocais(dadosDoContexto);
    }, [dadosDoContexto]);

    useEffect(() => {
        if (estaAberto && dadosDoContexto?.id) {
            const fetchFullDetails = async () => {
                setIsLoadingDetails(true);
                try {
                    const fullData = await getContextoById(dadosDoContexto.id);
                    if (fullData) {
                        setDadosLocais(fullData);
                    }
                } catch (error) {
                    console.error("Erro ao carregar detalhes completos do contexto:", error);
                } finally {
                    setIsLoadingDetails(false);
                }
            };

            fetchFullDetails();
        }
    }, [estaAberto, dadosDoContexto?.id]);

    // --- Lógica de Permissão para ver Histórico ---
    const contextoGerenciaId = useMemo(() => {
        if (!dadosLocais?.gerencia) return '';
        return dadosLocais.gerencia as string;
    }, [dadosLocais?.gerencia]);

    const canViewApprovalHistory = useMemo(() => {
        const isAdmin = perfil === 'diretor' || perfil === 'gerente';
        const isMemberOfContextGerencia = usuarioGerenciaId && contextoGerenciaId &&
            (usuarioGerenciaId === contextoGerenciaId);

        if (isValidation) return true;
        return isAdmin || !!isMemberOfContextGerencia;
    }, [perfil, usuarioGerenciaId, contextoGerenciaId, isValidation]);

    // --- Normalização ---
    const normalizedData: Contexto | null = useMemo(() => {
        if (!dadosLocais) return null;

        let dados: Contexto;
        try {
            dados = normalizarContexto(dadosLocais);
        } catch (error) {
            console.error("Erro ao normalizar dados no modal:", error);
            return null;
        }

        if (!canViewApprovalHistory) {
            if (dados.versoes && dados.versoes.length > 0) {
                dados.versoes = dados.versoes.map(v => {
                    const historicoOriginal = v.historico || [];
                    const historicoFiltrado = historicoOriginal.filter(h => {
                        const s = String(h.statusNovo).toUpperCase();
                        return s.includes('CRIADO') || s.includes('PUBLICADO') || s.includes('INDEFERIDO');
                    });
                    return { ...v, historico: historicoFiltrado };
                });
            }
            if (dados.historico && dados.historico.length > 0) {
                dados.historico = dados.historico.filter(h => {
                    const s = String(h.statusNovo).toUpperCase();
                    return s.includes('PUBLICADO') || s.includes('INDEFERIDO') || s.includes('CRIADO');
                });
            }
        }

        return dados;
    }, [dadosLocais, canViewApprovalHistory]);

    // --- Handlers de Toggle ---
    const handleToggleVersao = async (versaoId: number) => {
        if (!normalizedData || !aoAlternarVisibilidadeVersao) return;
        try {
            await toggleVisibilityVersao(normalizedData.id, versaoId);
            if (aoAlternarVisibilidadeVersao) {
                aoAlternarVisibilidadeVersao(normalizedData.id, versaoId);
            }
            showSuccessToast(`Visibilidade da versão ${versaoId} atualizada.`);
        } catch (e: any) {
            showErrorToast(e.message || "Erro ao atualizar visibilidade da versão.");
        }
    };

    const handleToggleContexto = async (contextoId: string) => {
        if (!normalizedData || !aoAlternarVisibilidadeIndicador) return;
        try {
            await toggleVisibilityContexto(contextoId);
            if (aoAlternarVisibilidadeIndicador) {
                aoAlternarVisibilidadeIndicador(contextoId);
            }
            showSuccessToast("Visibilidade do contexto atualizada.");
        } catch (e: any) {
            showErrorToast(e.message || "Erro ao atualizar visibilidade do contexto.");
        }
    };

    const alternarTelaCheia = () => { setEmTelaCheia(!emTelaCheia); setZoomLevel(1); };

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes');
            setEmTelaCheia(false);
            setZoomLevel(1);
            setCorrecaoOpen(false);
            setDeferirOpen(false);
        }
    }, [estaAberto]);

    const lidarComDownload = () => {
        if (!normalizedData?.url) return;
        const a = document.createElement('a');
        a.href = normalizedData.url;
        a.download = normalizedData.title || 'arquivo';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const versaoEmJulgamento = useMemo(() => {
        if (!normalizedData?.versoes || normalizedData.versoes.length === 0) return null;

        return normalizedData.versoes.reduce((prev, current) => {
            const prevNum = (prev as any).versaoNumero || (prev as any).numero || 0;
            const currNum = (current as any).versaoNumero || (current as any).numero || 0;

            if (prevNum !== 0 || currNum !== 0) {
                return prevNum > currNum ? prev : current;
            }
            return new Date(prev.data).getTime() > new Date(current.data).getTime() ? prev : current;
        });
    }, [normalizedData]);

    // [LÓGICA DE PERMISSÃO ROBUSTA]
    const podeAgir = useMemo(() => {
        if (!normalizedData || isFromHistory || isEditing) return false;

        // 1. Se veio explicitamente para validar
        if (isValidation) return true;

        // 2. Se for Membro e estiver em correção
        if (perfil === 'membro' && aoCriarNovaVersao && versaoEmJulgamento) {
            const statusParaChecar = versaoEmJulgamento.status || '';
            const statusStr = String(statusParaChecar).toLowerCase().replace(/_/g, ' ');
            return statusStr.includes('correção') || statusStr.includes('correcao') || statusStr.includes('aguardando correcao');
        }

        // 3. Lógica de Auto-Detecção (Funciona para Notificações)
        if ((perfil === 'gerente' || perfil === 'diretor') && versaoEmJulgamento) {
            const rawStatus = String(versaoEmJulgamento.status || "").toUpperCase();
            const status = rawStatus.replace(/\s+/g, '_');

            if (perfil === 'gerente' && status.includes('AGUARDANDO_GERENTE')) return true;
            if (perfil === 'diretor' && status.includes('AGUARDANDO_DIRETOR')) return true;
        }

        return false;
    }, [normalizedData, perfil, isFromHistory, isEditing, isValidation, aoCriarNovaVersao, versaoEmJulgamento]);

    const handleConfirmarDeferimento = async () => {
        if (onDeferir && normalizedData) {
            // Garante dbId
            const alvo = versaoEmJulgamento as any;
            const idAlvo = alvo?.dbId || alvo?.id;
            try {
                await onDeferir(String(idAlvo), undefined);
                setDeferirOpen(false);
                aoFechar();
            } catch (e) { }
        }
    };

    const confirmCorrecao = async (justificativa: string) => {
        if (!justificativa.trim()) { showErrorToast("Justificativa obrigatória"); return; }
        if (onCorrigir && normalizedData) {
            // Garante dbId
            const alvo = versaoEmJulgamento as any;
            const idAlvo = alvo?.dbId || alvo?.id;
            try {
                await onCorrigir(String(idAlvo), justificativa.trim());
                setCorrecaoOpen(false);
                aoFechar();
            } catch (e) { }
        }
    };

    const handleMembroEnviarCorrecao = () => {
        if (aoCriarNovaVersao && normalizedData) aoCriarNovaVersao(normalizedData);
    };

    const renderAcaoBotoes = () => {
        if (!podeAgir) return null;

        if (!isValidation && perfil === 'membro') {
            return (
                <Button onClick={handleMembroEnviarCorrecao} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 shadow-sm">
                    <Upload className="mr-2 h-4 w-4" /> Enviar Correção
                </Button>
            );
        }

        return (
            <div className="flex gap-2">
                <Button onClick={() => setCorrecaoOpen(true)} variant="outline" className="bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 rounded-xl">
                    <CornerUpLeft className="mr-1 h-4 w-4" /> Solicitar Correção
                </Button>
                <Button onClick={() => setDeferirOpen(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                    <FileCheck2 className="mr-1 h-4 w-4" /> Deferir
                </Button>
            </div>
        );
    };

    if (!estaAberto) return null;

    // [PROTEÇÃO CONTRA CRASH]: Garante que normalizedData existe antes de renderizar
    if (!normalizedData) return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                        <h2 className="text-2xl font-semibold text-white truncate">A carregar...</h2>
                    </div>
                    <Button size="icon" variant="ghost" onClick={aoFechar} className="bg-white/15 text-white hover:bg-white/30 rounded-2xl"> <ArrowLeft className="w-6 h-6" /> </Button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        </div>
    );

    const AcaoBotoesNode = renderAcaoBotoes();

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                            {/* Uso de optional chaining para segurança extra */}
                            <h2 className="text-2xl font-semibold text-white truncate">{normalizedData?.title}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLoadingDetails && (
                                <div className="bg-white/20 px-3 py-1 rounded-full text-xs text-white animate-pulse">
                                    Atualizando...
                                </div>
                            )}
                            <Button size="icon" variant="ghost" onClick={aoFechar} className="bg-white/15 text-white hover:bg-white/30 rounded-2xl"> <ArrowLeft className="w-6 h-6" /> </Button>
                        </div>
                    </div>

                    {/* Corpo */}
                    <div className="flex-1 px-6 sm:px-8 pt-6 pb-4 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex space-x-1.5 bg-gray-100 rounded-2xl p-1.5 flex-shrink-0 mb-6">
                            <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            <BotaoAba id="versoes" label="Versões e Histórico" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        </div>

                        <div className={cn("flex-1 min-h-0 overflow-hidden", 'animate-fade-in')}>
                            {abaAtiva === 'detalhes' && (
                                <AbaDetalhes
                                    dados={normalizedData}
                                    aoFazerDownload={lidarComDownload}
                                    aoAlternarTelaCheia={alternarTelaCheia}
                                    isEditing={isEditing}
                                    emTelaCheia={emTelaCheia}
                                    zoomLevel={zoomLevel}
                                    isFromHistory={isFromHistory}
                                    aoAlternarVisibilidadeContexto={handleToggleContexto}
                                    isValidationView={isValidation || !!podeAgir}
                                    podeAgir={!!podeAgir}
                                    versaoEmJulgamento={versaoEmJulgamento}
                                />
                            )}
                            {abaAtiva === 'versoes' && (
                                <AbaVersoes
                                    aoClicarCorrigir={handleMembroEnviarCorrecao}
                                    dados={normalizedData}
                                    perfil={perfil}
                                    isEditing={isEditing}
                                    isValidationView={isValidation || !!podeAgir}
                                    aoAlternarVisibilidadeVersao={handleToggleVersao}
                                    canViewFullHistory={!!canViewApprovalHistory}
                                />
                            )}
                        </div>
                    </div>

                    {/* Rodapé */}
                    {AcaoBotoesNode && (
                        <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                            {AcaoBotoesNode}
                        </div>
                    )}
                </div>
            </div>

            {/* Modais Auxiliares */}
            <IndeferirContextoModal
                open={correcaoOpen}
                onOpenChange={setCorrecaoOpen}
                onCancel={() => setCorrecaoOpen(false)}
                onConfirm={confirmCorrecao}
                contextoNome={normalizedData?.title || ''}
                requireComment
                customTitle="Solicitar Correção"
                customDescription="Descreva o que precisa ser ajustado."
                confirmText="Enviar para Correção"
                confirmButtonClass="bg-amber-600 hover:bg-amber-700 text-white"
            />

            <DeferirContextoModal
                open={deferirOpen}
                onOpenChange={setDeferirOpen}
                onCancel={() => setDeferirOpen(false)}
                onConfirm={handleConfirmarDeferimento}
                contextoNome={normalizedData?.title || ''}
            />

            {emTelaCheia && normalizedData && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in">
                    <div className="absolute top-4 right-4 z-[70] flex items-center gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
                        {(normalizedData.type === 'pdf' || normalizedData.type === 'doc') && (
                            <>
                                <Button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} variant="ghost" size="icon" className="rounded-full w-8 h-8"><ZoomOut className="w-5 h-5" /></Button>
                                <Button onClick={() => setZoomLevel(1)} variant="ghost" size="icon" className="rounded-full w-8 h-8"><RotateCcw className="w-5 h-5" /></Button>
                                <Button onClick={() => setZoomLevel(prev => prev + 0.2)} variant="ghost" size="icon" className="rounded-full w-8 h-8"><ZoomIn className="w-5 h-5" /></Button>
                            </>
                        )}
                        <Button onClick={alternarTelaCheia} variant="ghost" size="icon" className="rounded-full w-8 h-8"><X className="w-5 h-5" /></Button>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full overflow-hidden">
                        <VisualizadorDeConteudo tipo={normalizedData.type} titulo={normalizedData.title} payload={normalizedData.payload} descricao={normalizedData.description} url={normalizedData.url} chartType={normalizedData.chartType} emTelaCheia={true} zoomLevel={zoomLevel} />
                    </div>
                </div>
            )}
        </>
    );
}