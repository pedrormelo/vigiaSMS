// src/components/popups/visualizarContextoModal/index.tsx
"use client";

// 1. IMPORTAÇÕES (sem alteração)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ArrowLeft, Info, History, FileText, LucideProps, ZoomIn, ZoomOut, RotateCcw,
    FileCheck2, FileX, X,
} from 'lucide-react';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';
import { showDispatchToast, showErrorToast, showSuccessToast } from '@/components/ui/Toasts';
import AbaDetalhes from './abaDetalhes';
import AbaVersoes from './abaVersoes';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types'; 
import type { Contexto } from '@/components/validar/typesDados';
import { StatusContexto } from '@/components/validar/typesDados';

// 4. PROPS UNIFICADAS (sem alteração)
interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: (Contexto | DetalhesContexto) | null; 
    perfil: 'diretor' | 'gerente' | 'membro';
    
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (contextoId: string, versaoId: number) => void;
    aoAlternarVisibilidadeIndicador?: (contextoId: string) => void; 

    isFromHistory?: boolean;
    onDeferir?: (contextoId: string, comentario?: string) => void;
    onIndeferir?: (contextoId: string, comentario: string) => void;
    onCorrigir?: (contextoParaCorrigir: Contexto) => void; 
}
type TipoAba = 'detalhes' | 'versoes';
const BotaoAba = (/* ... (sem alteração) ... */{ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
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
    onDeferir,
    onIndeferir,
    onCorrigir 
}: VisualizarContextoModalProps) {
    
    // --- ESTADOS (sem alteração) ---
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [indeferirOpen, setIndeferirOpen] = useState(false); 
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    // --- HOOK DE NORMALIZAÇÃO (A CORREÇÃO ESTÁ AQUI) ---
    const normalizedData: DetalhesContexto | null = useMemo(() => {
        if (!dadosDoContexto) return null;

        // --- INÍCIO DA CORREÇÃO ---
        // A verificação deve ser pelo campo 'situacao', que SÓ existe no tipo 'Contexto' (de /validar)
        if ('situacao' in dadosDoContexto && dadosDoContexto.situacao) {
            // Se for Contexto (vindo da pág. de validação)
            const dados = dadosDoContexto as Contexto;
            const mappedData: DetalhesContexto = {
                ...dados, 
                title: dados.nome,
                status: dados.situacao,
                insertedDate: dados.data,
                description: dados.detalhes,
                historico: dados.historico || [],
                versoes: [{
                    id: 1, // Assume v1 se não houver 'versoes'
                    nome: "Versão 1",
                    data: dados.data,
                    autor: dados.solicitante,
                    estaOculta: false,
                    status: dados.situacao, // <-- Status da versão é preenchido
                    historico: dados.historico || [] // <-- Histórico da versão é preenchido
                }],
                estaOculto: false,
            };
            return mappedData;
        }
        // --- FIM DA CORREÇÃO ---


        // Se já for DetalhesContexto (vindo da pág. de gerência)
        // Usamos '...dadosDoContexto' para criar uma cópia e não mutar o prop original
        const detalhes = { ...dadosDoContexto } as DetalhesContexto;
        
        // Verifica se o array 'versoes' existe, mas está "incompleto" (sem status/histórico)
        // Isso acontece com os mocks da pág. /gerencia
        if (detalhes.versoes && detalhes.versoes.length > 0 && (detalhes.versoes[0] as any).status === undefined) {
            
            // Recria o array 'versoes' preenchendo os campos faltantes
            detalhes.versoes = detalhes.versoes.map((v, i) => {
                const eAUltimaVersao = i === (detalhes.versoes?.length ?? 0) - 1;
                return {
                    ...v,
                    // Versões anteriores são 'Publicado' por padrão. A última assume o status GERAL.
                    status: eAUltimaVersao ? detalhes.status : StatusContexto.Publicado,
                    // Apenas a ÚLTIMA versão recebe o histórico GERAL (para a timeline)
                    historico: eAUltimaVersao ? (detalhes.historico || []) : []
                };
            });
        }

        if (detalhes.estaOculto === undefined) detalhes.estaOculto = false;
        return detalhes;

    }, [dadosDoContexto]);


    // O RESTANTE DO COMPONENTE (useEffect, handlers, renderFooter, JSX)
    // pode permanecer exatamente o mesmo.
    // ... (lógica de lidarComDownload, handleToggleVersao, etc.) ...
    const alternarTelaCheia = () => {
        setEmTelaCheia(!emTelaCheia);
        setZoomLevel(1);
    };

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes'); 
            setEmTelaCheia(false);
            setZoomLevel(1);
            setIndeferirOpen(false);
        }
    }, [estaAberto]);

    const lidarComDownload = () => {
        if (!normalizedData) return;
        if (normalizedData.type === 'dashboard' && chartContainerRef.current) {
            // (lógica SVG)
        } else if (normalizedData.url) {
            const a = document.createElement('a');
            a.href = normalizedData.url;
            a.download = normalizedData.title || 'arquivo';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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

    const handleCorrigirClick = () => {
        if (dadosDoContexto && onCorrigir && 'situacao' in dadosDoContexto) {
            onCorrigir(dadosDoContexto as Contexto);
        } else if (normalizedData && aoCriarNovaVersao) {
            aoCriarNovaVersao(normalizedData);
        } else {
            console.warn("Tentativa de correção em dados não-Contexto ou sem handler.");
        }
    };
    
    // Handlers de Validação (Deferir/Indeferir)
    const handleDeferirClick = () => {
        if (normalizedData && onDeferir) {
            onDeferir(normalizedData.id, undefined);
            showSuccessToast("Contexto deferido com sucesso!");
            aoFechar();
        }
    };
    const openIndeferirModal = () => setIndeferirOpen(true);
    const cancelIndeferir = () => setIndeferirOpen(false);
    const confirmIndeferir = (comentario: string) => {
        if (!comentario.trim()) { 
            showErrorToast("Justificativa obrigatória", "É necessário inserir uma justificativa para indeferir."); 
            return; 
        }
        if (normalizedData && onIndeferir) {
            onIndeferir(normalizedData.id, comentario.trim());
            showDispatchToast("Contexto indeferido e devolvido com justificativa.");
            setIndeferirOpen(false);
            aoFechar();
        }
    };


    // --- Renderização do Rodapé ---
    const renderFooter = (): React.ReactNode => {
        if (!normalizedData) return null; 
        if (isFromHistory || isEditing) return null; 

        if (perfil === "membro" && normalizedData.status === StatusContexto.AguardandoCorrecao) {
            return (
                <div className="flex justify-center w-full">
                     <p className="text-sm text-gray-500 italic">Use a aba &lsquo;Versões&rsquo; para enviar uma correção.</p>
                </div>
            );
        }

        if (perfil === "gerente" || perfil === "diretor") {
             const podeAgir = (perfil === "gerente" && normalizedData.status === StatusContexto.AguardandoGerente) || 
                              (perfil === "diretor" && normalizedData.status === StatusContexto.AguardandoDiretor);
            
            if (podeAgir) {
                return (
                    <div className="flex items-center justify-between w-full gap-4">
                        <p className="text-sm text-gray-500 hidden md:block">Selecione uma ação para este contexto.</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button onClick={openIndeferirModal} variant="outline" size="sm"
                                className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 rounded-xl px-3 py-2 font-semibold"
                            >
                                <FileX className="mr-1 h-4 w-4" /> Indeferir
                            </Button>
                            <Button onClick={handleDeferirClick} variant="default" size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-2 font-semibold"
                            >
                                <FileCheck2 className="mr-1 h-4 w-4" /> Deferir
                            </Button>
                        </div>
                    </div>
                );
            }
        }
        
        return null;
    };


    if (!estaAberto || !normalizedData) return null; 

    // --- JSX DO MODAL UNIFICADO (sem alteração) ---
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

                        {/* Conteúdo da Aba (Renderiza os componentes importados) */}
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
                                />
                            )}
                            {abaAtiva === 'versoes' && (
                                <AbaVersoes
                                    aoClicarCorrigir={handleCorrigirClick}
                                    dados={normalizedData}
                                    perfil={perfil}
                                    isEditing={isEditing}
                                    aoAlternarVisibilidadeVersao={handleToggleVersao} 
                                />
                            )}
                        </div>
                    </div>

                    {/* Rodapé */}
                    {renderFooter() != null && (
                        <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                           {renderFooter()}
                        </div>
                    )}

                </div>
            </div>

            {/* Modal Tela Cheia (sem alteração) ... */}
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
                            url={normalizedData.url}
                            chartType={normalizedData.chartType}
                            emTelaCheia={true}
                            zoomLevel={zoomLevel}
                        />
                    </div>
                </div>
            )}
            
            {/* Modal de Indeferir (sem alteração) ... */}
            <IndeferirContextoModal
                open={indeferirOpen}
                onOpenChange={setIndeferirOpen}
                onCancel={cancelIndeferir}
                onConfirm={confirmIndeferir}
                contextoNome={normalizedData.title}
                requireComment
            />

            {/* Estilos (sem alteração) ... */}
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