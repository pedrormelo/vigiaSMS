// src/components/popups/detalhesContextoModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Info, History, Download, FileText, User, MessageSquare,
    FileIcon, LucideProps, Minimize, ZoomIn, ZoomOut, RotateCcw, FileCheck2, FileX,
    CheckCircle, Clock, FileWarning, Send, UserCheck, UserCog, Building, Edit, // Adicionado Edit
    CircleCheckBig
} from 'lucide-react';
import StatusBanner from '@/components/ui/status-banner';
import { Button } from "@/components/ui/button";
import { Contexto, DocType, StatusContexto, HistoricoEvento } from "@/components/validar/typesDados";
import type { Comment } from "@/constants/types";
import { VisualizadorDeConteudo } from '@/components/popups/visualizarContextoModal/visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { cn } from '@/lib/utils';
import { showDispatchToast, showErrorToast, showSuccessToast } from '@/components/ui/Toasts';
import { statusConfig } from '@/components/validar/colunasTable/statusConfig';
import CommentItem from '@/components/notifications/commentItem';
import { notificationsData } from '@/constants/notificationsData'; // Para buscar mocks
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';

interface DetalhesContextoModalProps {
    contexto: Contexto | null;
    isOpen: boolean;
    onClose: () => void;
    perfil: "diretor" | "gerente" | "membro";
    isFromHistory?: boolean;
    onDeferir?: (contextoId: string, comentario?: string) => void;
    onIndeferir?: (contextoId: string, comentario: string) => void;
    onCorrigir?: (contextoParaCorrigir: Contexto) => void; // Prop para correção
}

type TipoAba = 'detalhes' | 'historico';

// --- COMPONENTES DAS ABAS ---

// AbaDetalhes: Botão Baixar com rounded-2xl
const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, emTelaCheia, zoomLevel
}: { /* ...props */
    dados: Contexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    emTelaCheia: boolean;
    zoomLevel: number;
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in p-1">
            <div className="space-y-6 overflow-y-auto pr-4 h-full pb-4 scrollbar-custom">
                {/* ... (Banner, Descrição, Detalhes Adicionais) ... */}
                <StatusBanner variant="info" title="Visualizando Detalhes Atuais">
                    <div className="text-sm pl-3 leading-relaxed">
                        Estas são as informações mais recentes do contexto.
                    </div>
                </StatusBanner>
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <IconeDocumento type={dados.docType as DocType} />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-base truncate" title={dados.nome}>{dados.nome}</p>
                            <p className="text-sm text-gray-500">{new Date(dados.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    {(dados as any).url && (
                        <Button onClick={aoFazerDownload} variant="default" size="sm" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"> {/* Alterado para rounded-2xl */}
                            <Download className="w-4 h-4 mr-1.5" /> Baixar
                        </Button>
                    )}
                </div>
                {dados.detalhes && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600 flex-shrink-0" /><h3 className="text-base font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-1">{dados.detalhes}</p>
                    </div>
                )}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-4">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-3 rounded-2xl">
                            <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Enviado por</p>
                                <p className="text-gray-600 truncate" title={dados.solicitante}>{dados.solicitante}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Tipo</p>
                                <p className="text-gray-600 uppercase">{dados.docType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl sm:col-span-2">
                            <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Gerência Solicitante</p>
                                <p className="text-gray-600 truncate" title={dados.gerencia}>{dados.gerencia}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Coluna Direita: Visualizador */}
            <div className="h-full min-h-0">
                <VisualizadorDeConteudo
                    tipo={dados.docType as any} url={(dados as any).url} titulo={dados.nome} payload={(dados as any).payload}
                    aoAlternarTelaCheia={aoAlternarTelaCheia} emTelaCheia={emTelaCheia} zoomLevel={zoomLevel}
                />
            </div>
        </div>
    );
};

// AbaHistorico: Sem campo de adicionar comentário (sem alterações)
const AbaHistorico = ({ dados }: { dados: Contexto }) => {
    // ... (Conteúdo da AbaHistorico permanece igual)
    const etapasWorkflow = [ /* ... */
        { nome: "Submetido", status: [StatusContexto.AguardandoGerente, StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: Send },
        { nome: "Análise Gerente", status: [StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCog },
        { nome: "Análise Diretor", status: [StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCheck },
        { nome: "Finalizado", status: [StatusContexto.Publicado, StatusContexto.Indeferido], icon: CircleCheckBig}
    ];
    const historicoEventos = dados.historico || [];
    const statusAtual = dados.situacao;
    let indiceEtapaAtual = -1; /* ... */
    for (let i = etapasWorkflow.length - 1; i >= 0; i--) {
        if (etapasWorkflow[i].status.includes(statusAtual)) {
            indiceEtapaAtual = i;
            break;
        }
    }
    let indiceEtapaDevolvida = -1; /* ... */
    if (statusAtual === StatusContexto.AguardandoCorrecao) {
        indiceEtapaDevolvida = etapasWorkflow.findIndex(etapa =>
            historicoEventos.some(h => h.acao.toLowerCase().includes(etapa.nome.split(' ')[1]?.toLowerCase() || '')) && (etapa.nome === "Análise Gerente" || etapa.nome === "Análise Diretor")
        );
        if (indiceEtapaDevolvida === -1 && historicoEventos.some(h => h.acao.toLowerCase().includes("submetido"))) {
            indiceEtapaDevolvida = 1;
        }
        indiceEtapaAtual = 0;
    }
    const getUltimoEventoParaEtapa = (etapaIndex: number): HistoricoEvento | undefined => { /* ... */
        const etapa = etapasWorkflow[etapaIndex];
        let eventosRelevantes = historicoEventos.filter(e => {
            const acaoLower = e.acao.toLowerCase();
            if (etapa.nome === "Submetido") return acaoLower.includes("submetido");
            if (etapa.nome === "Análise Gerente") return acaoLower.includes("gerente");
            if (etapa.nome === "Análise Diretor") return acaoLower.includes("diretor");
            if (etapa.nome === "Finalizado") return acaoLower.includes("finalizado como publicado") || acaoLower.includes("finalizado como indeferido") || acaoLower.includes("indeferido");
            return false;
        });
        return eventosRelevantes.length > 0 ? eventosRelevantes[eventosRelevantes.length - 1] : undefined;
    };
    const comentariosParaExibir: Comment[] = React.useMemo(() => { /* ... */
        const notificacao = notificationsData.find(notif => notif.contextoId === dados.id);
        return notificacao?.comments || [];
    }, [dados.id]);

    return (
        <div className="animate-fade-in p-1 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-custom pb-4 space-y-8 pr-3">
                {/* Timeline Visual */}
                <div className="flex items-start justify-between pt-4 px-4">
                    {etapasWorkflow.map((etapa, index) => {
                        const evento = getUltimoEventoParaEtapa(index);
                        const isConcluida = index < indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isAtual = index === indiceEtapaAtual && index !== indiceEtapaDevolvida && statusAtual !== StatusContexto.Publicado && statusAtual !== StatusContexto.Indeferido;
                        const isDevolvida = index === indiceEtapaDevolvida;
                        const isFinalizada = (statusAtual === StatusContexto.Publicado || statusAtual === StatusContexto.Indeferido) && index <= indiceEtapaAtual;
                        const isPendente = index > indiceEtapaAtual && !isDevolvida && !isFinalizada;
                        let corIcone = "text-gray-400"; let corTexto = "text-gray-500"; let corFundoIcone = "bg-gray-100";
                        let IconeStatus = etapa.icon;
                        if (isConcluida || isFinalizada) { corIcone = "text-green-600"; corTexto = "text-green-700"; corFundoIcone = "bg-green-100"; IconeStatus = CheckCircle; }
                        else if (isAtual) { corIcone = "text-blue-600"; corTexto = "text-blue-700"; corFundoIcone = "bg-blue-100 animate-pulse"; IconeStatus = Clock; }
                        else if (isDevolvida) { corIcone = "text-orange-600"; corTexto = "text-orange-700"; corFundoIcone = "bg-orange-100"; IconeStatus = FileWarning; }

                        return (
                            <React.Fragment key={etapa.nome}>
                                <div className="flex flex-col items-center text-center w-32 flex-shrink-0">
                                    <div className={cn("h-10 w-10 rounded-2xl border-2 flex items-center justify-center mb-2 transition-colors", corFundoIcone, isConcluida || isFinalizada ? "border-green-200" : isAtual ? "border-blue-200" : isDevolvida ? "border-orange-200" : "border-gray-200")}>
                                        <IconeStatus size={20} className={cn("transition-colors", corIcone)} />
                                    </div>
                                    <p className={cn("text-sm font-semibold transition-colors", corTexto)}>{etapa.nome}</p>
                                    {evento && !isPendente && (<> <p className="mt-1 text-xs text-gray-500"> {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {' às '} {new Date(evento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} </p> <p className="text-xs text-gray-500 truncate w-full" title={evento.autor}>por {evento.autor}</p> </>)}
                                    {isDevolvida && (<p className="text-xs font-medium text-orange-600 mt-1">Devolvido</p>)}
                                </div>
                                {index < etapasWorkflow.length - 1 && (<div className={`flex-1 mt-[19px] h-0.5 transition-colors ${isConcluida || isFinalizada ? 'bg-green-300' : 'bg-gray-200'} min-w-[10px]`}></div>)}
                            </React.Fragment>
                        );
                    })}
                </div>
                {/* Seção de Comentários Existentes */}
                <div className="px-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <MessageSquare size={20} /> Comentários e Justificativas ({comentariosParaExibir.length})
                    </h3>
                    {comentariosParaExibir.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-custom border shadow-inner border-gray-200 rounded-2xl p-4 bg-gray-50/25">
                            {comentariosParaExibir.map((comment) => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">Nenhum comentário adicionado.</p>
                    )}
                </div>
                {/* Histórico Detalhado (Lista) */}
                <div className="px-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><History size={20} /> Histórico de Ações</h3>
                    {historicoEventos.length > 0 ? (
                        <ul className="space-y-3">
                            {[...historicoEventos].reverse().map((evento, index) => (
                                <li key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm">
                                    <p className="font-medium text-gray-800">{evento.acao}</p>
                                    <p className="text-xs text-gray-500 mt-1">{evento.autor} em {new Date(evento.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 text-sm mt-8">Nenhum histórico detalhado encontrado.</p>)}
                </div>
            </div>
        </div>
    );
};

// BotaoAba: Componente auxiliar (sem alterações)
const BotaoAba = ({ /* ...props */ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => ( /* ... */
    <button onClick={() => setAbaAtiva(id)} className={cn(
        "flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center text-base gap-2", // Mantido rounded-2xl para abas
        abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
    )}>
        <Icon className="w-5 h-5" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL ---
export default function DetalhesContextoModal({
    contexto, isOpen, onClose, perfil, isFromHistory = false,
    onDeferir, onIndeferir, onCorrigir // Adicionado onCorrigir
}: DetalhesContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    // Removido campo de justificativa no rodapé; comentário para indeferir será coletado em modal dedicado
    const [indeferirOpen, setIndeferirOpen] = useState(false);

    const alternarTelaCheia = () => { /* ... */ setEmTelaCheia(!emTelaCheia); setZoomLevel(1); };

    useEffect(() => { /* ... */
        if (isOpen) {
            setAbaAtiva('detalhes');
            setEmTelaCheia(false);
            setZoomLevel(1);
            setIndeferirOpen(false);
        }
    }, [isOpen]);

    const lidarComDownload = () => { /* ... */
    const url = (contexto as any)?.url as string | undefined;
    if (!url) { showErrorToast("Download não disponível", "Não há URL de arquivo associada."); return; }
    const a = document.createElement('a'); a.href = url;
    const nomeArquivo = url.substring(url.lastIndexOf('/') + 1) || contexto?.nome || 'arquivo';
        a.download = nomeArquivo; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    const handleDeferirClick = () => { /* ... */
        if (contexto && onDeferir) {
            // Deferir sem comentário, já que o campo foi removido
            onDeferir(contexto.id, undefined);
            showSuccessToast("Contexto deferido com sucesso!");
            onClose();
        }
    };
    const openIndeferirModal = () => setIndeferirOpen(true);
    const cancelIndeferir = () => setIndeferirOpen(false);
    const confirmIndeferir = (comentario: string) => {
        if (!comentario.trim()) { showErrorToast("Justificativa obrigatória", "É necessário inserir uma justificativa para indeferir."); return; }
        if (contexto && onIndeferir) {
            onIndeferir(contexto.id, comentario.trim());
            showSuccessToast("Contexto indeferido.");
            setIndeferirOpen(false);
            onClose();
        }
    };
    const handleCorrigirClick = () => { // Handler para correção
        if (contexto && onCorrigir) {
            onCorrigir(contexto);
            // onClose(); // Opcional: Fechar este modal ao iniciar a correção
        }
    };

    if (!isOpen || !contexto) return null;

    // Rodapé agora mostra Justificativa + Botões Deferir/Indeferir OU Botão Corrigir
    const renderFooter = (): React.ReactNode => {
        if (isFromHistory) return null; // Sem ações no histórico

        // Lógica para Membro corrigir
        if (perfil === "membro" && contexto.situacao === StatusContexto.AguardandoCorrecao) {
            return (
                <div className="flex justify-center w-full"> {/* Centraliza o botão */}
                    <Button
                        onClick={handleCorrigirClick}
                        variant="default"
                        size="default"
                        // Estilo atualizado: Laranja, rounded-2xl
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6 py-3 font-bold"
                    >
                        <Edit className="mr-2 h-5 w-5" /> Corrigir Contexto
                    </Button>
                </div>
            );
        }

        // Lógica para Gerente e Diretor agirem
        if (perfil === "gerente" || perfil === "diretor") {
            const podeAgir = (perfil === "gerente" && contexto.situacao === StatusContexto.AguardandoGerente) || (perfil === "diretor" && contexto.situacao === StatusContexto.AguardandoDiretor);
            if (!podeAgir) {
                const statusTexto = statusConfig[contexto.situacao]?.text || contexto.situacao;
                return <p className="text-base text-gray-500 italic w-full text-center">Status atual: {statusTexto}. Nenhuma ação pendente.</p>;
            }
            return (
                <div className="flex items-center justify-between w-full gap-4">
                    <p className="text-sm text-gray-500">Selecione uma ação para este contexto.</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button onClick={openIndeferirModal} variant="outline" size="default"
                            className="bg-red-400 border-red-300 text-white hover:text-white hover:bg-red-500 rounded-2xl px-4 py-2 font-bold"
                        >
                            <FileX className="mr-1.5 h-4 w-4" /> Indeferir
                        </Button>
                        <Button onClick={handleDeferirClick} variant="default" size="default"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-4 py-2 font-bold"
                        >
                            <FileCheck2 className="mr-1.5 h-4 w-4" /> Deferir
                        </Button>
                    </div>
                </div>
            );
        }

        // Se for membro e status não for 'AguardandoCorrecao'
        if (perfil === "membro") {
            return (<p className="text-base text-gray-500 w-full text-center">Visualizando detalhes do contexto.</p>);
        }

        return null;
    };

    return (
        <>
            {/* Estrutura Principal do Modal */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-[40px] w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Cabeçalho */}
                    <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                        {/* ... (sem alterações) ... */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg"> <FileText className="w-6 h-6 text-white" /> </div>
                            <h2 className="text-2xl font-semibold text-white truncate" title={contexto.nome}> {isFromHistory ? 'Detalhes Históricos' : 'Análise de Contexto'} - {contexto.nome} </h2>
                        </div>
                        <Button size="icon" variant="ghost" onClick={onClose} className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0"> <ArrowLeft className="w-6 h-6" /> </Button>
                    </div>
                    {/* Corpo Principal */}
                    <div className="flex-1 px-8 pt-6 pb-4 flex flex-col min-h-0 overflow-hidden">
                        {/* Abas */}
                        <div className="flex space-x-2 bg-gray-100 rounded-2xl p-2 flex-shrink-0 mb-6">
                            <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            <BotaoAba id="historico" label="Histórico" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        </div>
                        {/* Conteúdo da Aba */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {abaAtiva === 'detalhes' && (<AbaDetalhes dados={contexto} aoFazerDownload={lidarComDownload} aoAlternarTelaCheia={alternarTelaCheia} emTelaCheia={emTelaCheia} zoomLevel={zoomLevel} />)}
                            {/* AbaHistorico não precisa mais da prop onAddComentario */}
                            {abaAtiva === 'historico' && <AbaHistorico dados={contexto} />}
                        </div>
                    </div>
                    {/* Rodapé */}
                    {renderFooter() && (<div className="px-8 py-4 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]"> {renderFooter()} </div>)}
                </div>
            </div>

            {/* Modal Tela Cheia - Botões com rounded-2xl */}
            {emTelaCheia && (
                <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[60] flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center p-3 bg-black/30 text-white flex-shrink-0">
                        <h2 className="text-lg font-semibold truncate px-2" title={contexto.nome}>{contexto.nome || "Visualização"}</h2>
                        <div className="flex items-center gap-1">
                            {(contexto.docType === 'pdf' || contexto.docType === 'doc') && (
                                <>
                                    {/* Alterado para rounded-2xl */}
                                    <Button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl" title="Diminuir Zoom"><ZoomOut className="w-5 h-5" /></Button>
                                    <Button onClick={() => setZoomLevel(1)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl" title="Resetar Zoom"><RotateCcw className="w-4 h-4" /></Button>
                                    <Button onClick={() => setZoomLevel(prev => prev + 0.2)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl" title="Aumentar Zoom"><ZoomIn className="w-5 h-5" /></Button>
                                </>
                            )}
                            {/* Alterado para rounded-2xl */}
                            <Button onClick={alternarTelaCheia} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-2xl" title="Fechar Tela Cheia"><Minimize className="w-5 h-5" /></Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full overflow-auto p-4">
                        <VisualizadorDeConteudo tipo={contexto.docType as any} titulo={contexto.nome} payload={(contexto as any).payload} url={(contexto as any).url} emTelaCheia={true} zoomLevel={zoomLevel} />
                    </div>
                </div>
            )}
            {/* Estilos */}
            <style>{`
                 /* ... */
                 @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; } .scrollbar-custom::-webkit-scrollbar { width: 6px; } .scrollbar-custom::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; } .scrollbar-custom::-webkit-scrollbar-track { background: transparent; } .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
             `}</style>

            {/* Modal Indeferir */}
            <IndeferirContextoModal
                open={indeferirOpen}
                onOpenChange={setIndeferirOpen}
                onCancel={cancelIndeferir}
                onConfirm={confirmIndeferir}
                contextoNome={contexto.nome}
                requireComment
            />
        </>
    );
}