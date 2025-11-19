// src/components/popups/visualizarContextoModal/index.tsx
"use client";

// 1. IMPORTAÇÕES
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ArrowLeft, Info, History, FileText, LucideProps, ZoomIn, ZoomOut, RotateCcw,
    FileCheck2, FileX, X, Clock
} from 'lucide-react';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import DeferirContextoModal from '@/components/popups/deferirContextoModal';
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';
import { showDispatchToast, showErrorToast, showSuccessToast } from '@/components/ui/Toasts';
import AbaDetalhes from './abaDetalhes';
import AbaVersoes from './abaVersoes';

// 2. TIPOS
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { Contexto, StatusContexto } from '@/components/validar/typesDados';

// CORREÇÃO: Define o tipo PartialContexto
type PartialContexto = Partial<Contexto> & { id: string };

// 3. PROPS DO MODAL
interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: Contexto | PartialContexto | null;
    perfil: 'diretor' | 'gerente' | 'membro' | string;

    aoCriarNovaVersao?: (dados: Contexto) => void;
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (contextoId: string, versaoId: number) => void;
    aoAlternarVisibilidadeIndicador?: (contextoId: string) => void;

    isFromHistory?: boolean;

    // --- NOVO: Propriedade para forçar o modo de validação ---
    isValidation?: boolean;

    // --- NOVO: Handlers atualizados para aceitar Promise (Async) ---
    onDeferir?: (versaoId: string, comentario?: string) => void | Promise<void>;
    onIndeferir?: (versaoId: string, comentario: string) => void | Promise<void>;
    // onCorrigir agora aceita a assinatura de validação (id, texto) OU a antiga (objeto)
    onCorrigir?: ((versaoId: string, justificativa: string) => void | Promise<void>) | ((contexto: Contexto) => void);
}

type TipoAba = 'detalhes' | 'versoes';

// 4. COMPONENTE INTERNO: BotaoAba
const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={cn(
        "flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center text-sm gap-2",
        abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
    )}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL ---
export function VisualizarContextoModal({
    estaAberto,
    aoFechar,
    dadosDoContexto,
    aoCriarNovaVersao,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao,
    aoAlternarVisibilidadeIndicador,
    isFromHistory = false,

    // Recebe a nova prop (default false para não quebrar usos antigos)
    isValidation = false,

    onDeferir,
    onIndeferir,
    onCorrigir
}: VisualizarContextoModalProps) {

    // 5. ESTADOS
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [indeferirOpen, setIndeferirOpen] = useState(false);
    const [deferirOpen, setDeferirOpen] = useState(false);
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    // 6. NORMALIZAÇÃO DE DADOS (useMemo)
    const normalizedData: Contexto | null = useMemo(() => {
        if (!dadosDoContexto) return null;

        if (!('title' in dadosDoContexto && dadosDoContexto.title)) {
            return null;
        }

        const dados = { ...dadosDoContexto } as Contexto;
        if (dados.estaOculto === undefined) dados.estaOculto = false;

        if (!dados.versoes || dados.versoes.length === 0) {
            dados.versoes = [{
                id: 1,
                nome: dados.title || "Versão 1",
                data: dados.insertedDate,
                autor: dados.solicitante || "N/A",
                estaOculta: false,
                status: dados.status,
                historico: dados.historico || []
            }];
        } else {
            dados.versoes = dados.versoes.map((v, i) => {
                const eAUltimaVersao = i === (dados.versoes!.length - 1);
                const statusDaVersao = v.status || (eAUltimaVersao ? dados.status : StatusContexto.Publicado);
                const historicoDaVersao = v.historico || (eAUltimaVersao ? (dados.historico || []) : []);
                return { ...v, status: statusDaVersao, historico: historicoDaVersao };
            });
        }
        return dados;
    }, [dadosDoContexto]);

    // 7. HANDLERS E EFEITOS
    const alternarTelaCheia = () => { setEmTelaCheia(!emTelaCheia); setZoomLevel(1); };

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes');
            setEmTelaCheia(false);
            setZoomLevel(1);
            setIndeferirOpen(false);
            setDeferirOpen(false);
        }
    }, [estaAberto]);

    const lidarComDownload = () => {
        if (!normalizedData) return;
        if (normalizedData.type === 'dashboard' && chartContainerRef.current) {
            /* (lógica SVG) */
        } else if (normalizedData.url) {
            const a = document.createElement('a');
            a.href = normalizedData.url;
            a.download = normalizedData.title || 'arquivo';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
    };

    const handleToggleVersao = (versaoId: number) => {
        if (normalizedData && aoAlternarVisibilidadeVersao) {
            aoAlternarVisibilidadeVersao(normalizedData.id, versaoId);
        }
    };

    const handleToggleContexto = (contextoId: string) => {
        if (normalizedData && aoAlternarVisibilidadeIndicador) {
            aoAlternarVisibilidadeIndicador(contextoId);
        }
    };

    // --- LÓGICA DE VALIDAÇÃO (ATUALIZADA) ---

    const versaoEmJulgamento = useMemo(() => {
        if (!normalizedData?.versoes || normalizedData.versoes.length === 0) return null;
        return normalizedData.versoes.reduce((a, b) => a.id > b.id ? a : b);
    }, [normalizedData]);

    // AQUI: Se isValidation for true, garantimos que pode agir
    const podeAgir = useMemo(() => {
        if (isValidation) return true;

        if (!normalizedData || isFromHistory || isEditing) return false;
        return (perfil === "gerente" && normalizedData.status === StatusContexto.AguardandoGerente) ||
            (perfil === "diretor" && normalizedData.status === StatusContexto.AguardandoDiretor);
    }, [normalizedData, perfil, isFromHistory, isEditing, isValidation]);

    const handleConfirmarDeferimento = async () => {
        if (onDeferir && normalizedData) {
            // Usa ID da versão se disponível, senão do contexto
            const idAlvo = (versaoEmJulgamento as any)?.dbId || normalizedData.id;

            try {
                await onDeferir(idAlvo, undefined);
                showSuccessToast("Contexto deferido com sucesso!");
                setDeferirOpen(false);
                aoFechar();
            } catch (e) {
                console.error("Erro ao deferir:", e);
            }
        }
    };

    const handleDeferirClick = () => {
        setDeferirOpen(true);
    };

    const cancelDeferir = () => {
        setDeferirOpen(false);
    };

    const openIndeferirModal = () => setIndeferirOpen(true);
    const cancelIndeferir = () => setIndeferirOpen(false);

    const confirmIndeferir = async (comentario: string) => {
        if (!comentario.trim()) {
            showErrorToast("Justificativa obrigatória", "É necessário inserir uma justificativa.");
            return;
        }
        if (onIndeferir && normalizedData) {
            const idAlvo = (versaoEmJulgamento as any)?.dbId || normalizedData.id;
            try {
                // Aqui assumimos que é uma indeferimento
                await onIndeferir(idAlvo, comentario.trim());
                showDispatchToast("Ação realizada com sucesso.");
                setIndeferirOpen(false);
                aoFechar();
            } catch (e) {
                console.error("Erro ao indeferir:", e);
            }
        }
    };

    const handleCorrigirClick = () => {
        if (isValidation && onCorrigir && normalizedData) {
            // Se estamos no modo de validação, "Corrigir" significa "Solicitar Correção"
            // Abrimos o modal de justificativa (IndeferirContextoModal serve bem para isso)
            setIndeferirOpen(true);

            // Nota: Teremos que ajustar o confirmIndeferir para saber se chama onIndeferir ou onCorrigir
            // ou assumir que a Navbar passa a função correta em 'onIndeferir' para este caso.
            // Pela implementação da Navbar, passamos handleIndeferir para onIndeferir e handleCorrigir para onCorrigir.
            // O modal visual tem apenas 2 botões de ação principal (Deferir e Indeferir/Corrigir).
            // Vamos assumir que o botão vermelho aciona o fluxo de "Indeferir/Corrigir".
        }
        else if (dadosDoContexto && onCorrigir && 'solicitante' in dadosDoContexto) {
            // Modo legado/edição: onCorrigir espera um Contexto
            (onCorrigir as (contexto: Contexto) => void)(dadosDoContexto as Contexto);
        }
        else if (normalizedData && aoCriarNovaVersao) {
            aoCriarNovaVersao(normalizedData);
        }
    };

    // 9. LÓGICA DE RENDERIZAÇÃO DO RODAPÉ (APENAS BOTÕES)
    const renderAcaoBotoes = (): React.ReactNode => {
        if (!podeAgir) return null;

        return (
            <div className="flex items-center justify-end gap-2 flex-shrink-0 w-full">
                {/* Botão Vermelho: Indeferir ou Corrigir */}
                <Button onClick={openIndeferirModal} variant="outline" size="sm"
                    className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 rounded-xl px-3 py-2 font-semibold"
                >
                    <FileX className="mr-1 h-4 w-4" /> Indeferir / Corrigir
                </Button>

                {/* Botão Verde: Deferir */}
                <Button onClick={handleDeferirClick} variant="default" size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-2 font-semibold"
                >
                    <FileCheck2 className="mr-1 h-4 w-4" /> Deferir
                </Button>
            </div>
        );
    };

    // --- 10. RENDERIZAÇÃO ---
    if (!estaAberto) return null;

    // Loader para dados parciais
    if (!normalizedData) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                            <h2 className="text-2xl font-semibold text-white truncate">A carregar contexto...</h2>
                        </div>
                        <Button size="icon" variant="ghost" onClick={aoFechar} className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0"> <ArrowLeft className="w-6 h-6" /> </Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    const AcaoBotoesNode = renderAcaoBotoes();

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                            <h2 className="text-2xl font-semibold text-white truncate" title={normalizedData.title}>{normalizedData.title}</h2>
                        </div>
                        <Button size="icon" variant="ghost" onClick={aoFechar} className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0"> <ArrowLeft className="w-6 h-6" /> </Button>
                    </div>

                    {/* Corpo */}
                    <div className="flex-1 px-6 sm:px-8 pt-6 pb-4 flex flex-col min-h-0 overflow-hidden">
                        {/* Abas */}
                        <div className="flex space-x-1.5 bg-gray-100 rounded-2xl p-1.5 flex-shrink-0 mb-6">
                            <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            <BotaoAba id="versoes" label="Versões e Histórico" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        </div>

                        {/* Conteúdo da Aba */}
                        <div className={cn("flex-1 min-h-0 overflow-hidden", abaAtiva === 'detalhes' ? 'animate-fade-in' : 'animate-fade-in')}>
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
                                    // Atualizado para usar isValidation e podeAgir
                                    isValidationView={isValidation || !!podeAgir}
                                    podeAgir={!!podeAgir}
                                    versaoEmJulgamento={versaoEmJulgamento}
                                />
                            )}
                            {abaAtiva === 'versoes' && (
                                <AbaVersoes
                                    aoClicarCorrigir={handleCorrigirClick}
                                    dados={normalizedData}
                                    perfil={perfil}
                                    isEditing={isEditing}
                                    isValidationView={isValidation || !!podeAgir}
                                    aoAlternarVisibilidadeVersao={handleToggleVersao}
                                />
                            )}
                        </div>
                    </div>

                    {/* Rodapé (Apenas botões) */}
                    {AcaoBotoesNode && (
                        <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                            {AcaoBotoesNode}
                        </div>
                    )}

                </div>
            </div>

            {/* Modal Tela Cheia */}
            {emTelaCheia && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in">

                    <div className="absolute top-4 right-4 z-[70] flex items-center gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
                        {(normalizedData.type === 'pdf' || normalizedData.type === 'doc') && (
                            <>
                                <Button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} variant="ghost" size="icon" className="text-black hover:bg-black/10 rounded-full w-8 h-8" title="Diminuir Zoom"><ZoomOut className="w-5 h-5" /></Button>
                                <Button onClick={() => setZoomLevel(1)} variant="ghost" size="icon" className="text-black hover:bg-black/10 rounded-full w-8 h-8" title="Resetar Zoom"><RotateCcw className="w-5 h-5" /></Button>
                                <Button onClick={() => setZoomLevel(prev => prev + 0.2)} variant="ghost" size="icon" className="text-black hover:bg-black/10 rounded-full w-8 h-8" title="Aumentar Zoom"><ZoomIn className="w-5 h-5" /></Button>

                            </>
                        )}
                        <Button onClick={alternarTelaCheia} variant="ghost" size="icon" className="text-black hover:bg-black/10 rounded-full w-8 h-8" title="Fechar Tela Cheia"><X className="w-5 h-5" /></Button>
                    </div>

                    <div className="absolute top-4 left-4 z-[70] p-2 px-4 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 max-w-[calc(100%-12rem)]">
                        <h2 className="text-base font-semibold text-black truncate" title={normalizedData.title}>{normalizedData.title || "Visualização"}</h2>
                    </div>

                    <div className="flex-1 min-h-0 w-full h-full overflow-hidden">
                        <VisualizadorDeConteudo
                            tipo={normalizedData.type}
                            titulo={normalizedData.title}
                            payload={normalizedData.payload}
                            descricao={normalizedData.description}
                            url={normalizedData.url}
                            chartType={normalizedData.chartType}
                            emTelaCheia={true}
                            zoomLevel={zoomLevel}
                        />
                    </div>
                </div>
            )}

            {/* Modal de Indeferir */}
            <IndeferirContextoModal
                open={indeferirOpen}
                onOpenChange={setIndeferirOpen}
                onCancel={cancelIndeferir}
                onConfirm={confirmIndeferir}
                contextoNome={normalizedData.title}
                requireComment
            />

            {/* Modal de Confirmação Deferir */}
            <DeferirContextoModal
                open={deferirOpen}
                onOpenChange={setDeferirOpen}
                onCancel={cancelDeferir}
                onConfirm={handleConfirmarDeferimento}
                contextoNome={normalizedData.title}
            />

            {/* Estilos */}
            <style>{`
                 @keyframes fadeIn {
                     from { opacity: 0; }
                     to { opacity: 1; }
                 }
                 .animate-fade-in {
                     animation: fadeIn 0.2s ease-out forwards;
                 }
                 .scrollbar-custom::-webkit-scrollbar { width: 6px; }
                 .scrollbar-custom::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; }
                 .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
                 .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
             `}</style>
        </>
    );
}