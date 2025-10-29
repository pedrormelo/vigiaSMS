// src/components/popups/detalhesContextoModal.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react'; // Adicionado useRef se for usar
import {
    ArrowLeft, Info, History, Download, FileText, User, MessageSquare,
    FileIcon, LucideProps, Minimize, ZoomIn, ZoomOut, RotateCcw, FileCheck2, FileX,
    CheckCircle, Clock, FileWarning, Send, UserCheck, UserCog, Building, Edit,
    CircleCheckBig
} from 'lucide-react';
import StatusBanner from '@/components/ui/status-banner';
import { Button } from "@/components/ui/button"; // Usando o ui/button
import { Contexto, DocType, StatusContexto, HistoricoEvento } from "@/components/validar/typesDados";
import type { Comment } from "@/constants/types"; // Usando types.ts
import { VisualizadorDeConteudo } from '@/components/popups/visualizarContextoModal/visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { cn } from '@/lib/utils';
import { showDispatchToast, showErrorToast, showSuccessToast } from '@/components/ui/Toasts';
import { statusConfig } from '@/components/validar/colunasTable/statusConfig';
import CommentItem from '@/components/notifications/commentItem';
// Corrigido caminho ou removido se mock não for usado diretamente aqui
// import { notificationsData } from '@/constants/notificationsData';
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';

interface DetalhesContextoModalProps {
    contexto: Contexto | null;
    isOpen: boolean;
    onClose: () => void;
    perfil: "diretor" | "gerente" | "membro";
    isFromHistory?: boolean;
    onDeferir?: (contextoId: string, comentario?: string) => void;
    onIndeferir?: (contextoId: string, comentario: string) => void;
    onCorrigir?: (contextoParaCorrigir: Contexto) => void;
}

type TipoAba = 'detalhes' | 'historico';

// --- COMPONENTES DAS ABAS ---

// AbaDetalhes (sem alterações na lógica interna, apenas na animação via classe pai)
const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, emTelaCheia, zoomLevel
}: {
    dados: Contexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    emTelaCheia: boolean;
    zoomLevel: number;
}) => {
    return (
        // Removido animate-fade-in daqui, será aplicado no container pai da aba
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full p-1">
            <div className="space-y-6 overflow-y-auto pr-4 h-full pb-4 scrollbar-custom">
                {/* Banner de Status */}
                <StatusBanner variant="info" title="Visualizando Detalhes Atuais">
                    <div className="text-sm pl-3 leading-relaxed">
                        Estas são as informações mais recentes do contexto.
                    </div>
                </StatusBanner>
                {/* Card do Arquivo/Contexto */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <IconeDocumento type={dados.docType as DocType} />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-base truncate" title={dados.nome}>{dados.nome}</p>
                            <p className="text-sm text-gray-500">{new Date(dados.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    {/* Botão Baixar */}
                    {(dados as any).url && (
                        <Button onClick={aoFazerDownload} variant="default" size="sm" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                            <Download className="w-4 h-4 mr-1.5" /> Baixar
                        </Button>
                    )}
                </div>
                {/* Descrição */}
                {dados.detalhes && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600 flex-shrink-0" /><h3 className="text-base font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-1">{dados.detalhes}</p>
                    </div>
                )}
                {/* Detalhes Adicionais */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-4">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Enviado por</p>
                                <p className="text-gray-600 truncate" title={dados.solicitante}>{dados.solicitante}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Tipo</p>
                                <p className="text-gray-600 uppercase">{dados.docType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg sm:col-span-2">
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


// AbaHistorico (sem alterações na lógica interna, apenas na animação via classe pai)
const AbaHistorico = ({ dados }: { dados: Contexto }) => {
    // Definindo etapas do workflow dentro do componente
    const etapasWorkflow = [
        { nome: "Submetido", status: [StatusContexto.AguardandoGerente, StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: Send },
        { nome: "Análise Gerente", status: [StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCog },
        { nome: "Análise Diretor", status: [StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCheck },
        { nome: "Finalizado", status: [StatusContexto.Publicado, StatusContexto.Indeferido], icon: CircleCheckBig}
    ];

    const historicoEventos = dados.historico || [];
    const statusAtual = dados.situacao;

    // Lógica para determinar o índice da etapa atual (simplificada)
    let indiceEtapaAtual = etapasWorkflow.findIndex(etapa => etapa.status.includes(statusAtual));
     if (indiceEtapaAtual === -1 && (statusAtual === StatusContexto.Publicado || statusAtual === StatusContexto.Indeferido)) {
        indiceEtapaAtual = etapasWorkflow.length - 1; // Marca 'Finalizado' como atual se publicado/indeferido
    }

    // Lógica para etapa devolvida (simplificada)
    let indiceEtapaDevolvida = -1;
    if (statusAtual === StatusContexto.AguardandoCorrecao) {
        const ultimoEventoAnalise = [...historicoEventos].reverse().find(h =>
            h.acao.toLowerCase().includes("análise gerente") || h.acao.toLowerCase().includes("análise diretor")
        );
         if (ultimoEventoAnalise?.acao.toLowerCase().includes("análise diretor")) {
             indiceEtapaDevolvida = 2;
         } else if (ultimoEventoAnalise?.acao.toLowerCase().includes("análise gerente")) {
             indiceEtapaDevolvida = 1;
         } else {
             indiceEtapaDevolvida = 1;
         }
        indiceEtapaAtual = 0;
    }

    const getUltimoEventoParaEtapa = (etapaIndex: number): HistoricoEvento | undefined => {
        const etapa = etapasWorkflow[etapaIndex];
        let eventosRelevantes = historicoEventos.filter(e => {
            const acaoLower = e.acao.toLowerCase();
            if (etapa.nome === "Submetido" && acaoLower.includes("submetido")) return true;
            if (etapa.nome === "Análise Gerente" && acaoLower.includes("análise gerente")) return true;
            if (etapa.nome === "Análise Diretor" && acaoLower.includes("análise diretor")) return true;
            if (etapa.nome === "Finalizado" && (acaoLower.includes("finalizado como publicado") || acaoLower.includes("finalizado como indeferido") || acaoLower.includes("indeferido"))) return true;
            return false;
        });
        return eventosRelevantes.length > 0 ? eventosRelevantes[eventosRelevantes.length - 1] : undefined;
    };

    const comentariosParaExibir: Comment[] = React.useMemo(() => {
        const commentsFromProp = (dados as any).comentarios as Comment[] | undefined;
        if (commentsFromProp) return commentsFromProp;
        return historicoEventos
            .filter(h => h.acao.toLowerCase().includes("justificativa:") || h.acao.toLowerCase().includes("comentário:"))
            .map((h, index): Comment => {
                const textMatch = h.acao.match(/(?:justificativa|comentário):\s*(.*)/i);
                const eventDate = new Date(h.data);
                return {
                    id: index,
                    author: h.autor,
                    text: textMatch ? textMatch[1].trim() : h.acao,
                    time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    date: eventDate.toLocaleDateString('pt-BR'),
                    isMyComment: false,
                    role: h.autor.toLowerCase().includes("gerente") ? "gerencia" :
                          h.autor.toLowerCase().includes("diretor") ? "diretoria" : "info",
                };
            });
    }, [dados, historicoEventos]);

    return (
        // Removido animate-fade-in daqui
        <div className="p-1 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-custom pb-4 space-y-8 pr-3">
                {/* Timeline Visual */}
                <div className="flex items-start justify-between pt-4 px-4">
                    {etapasWorkflow.map((etapa, index) => {
                        const evento = getUltimoEventoParaEtapa(index);
                        const isFinalizada = (statusAtual === StatusContexto.Publicado || statusAtual === StatusContexto.Indeferido) && index <= indiceEtapaAtual;
                        const isConcluida = !isFinalizada && index < indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isAtual = !isFinalizada && index === indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isDevolvida = index === indiceEtapaDevolvida;
                        const isPendente = index > indiceEtapaAtual && !isDevolvida && !isFinalizada;

                        let corIcone = "text-gray-400"; let corTexto = "text-gray-500"; let corFundoIcone = "bg-gray-100";
                        let IconeStatus = etapa.icon;

                        if (isConcluida || isFinalizada) {
                            corIcone = "text-green-600"; corTexto = "text-green-700"; corFundoIcone = "bg-green-100"; IconeStatus = CheckCircle;
                        } else if (isAtual) {
                            corIcone = "text-blue-600"; corTexto = "text-blue-700"; corFundoIcone = "bg-blue-100 animate-pulse"; IconeStatus = Clock;
                        } else if (isDevolvida) {
                            corIcone = "text-orange-600"; corTexto = "text-orange-700"; corFundoIcone = "bg-orange-100"; IconeStatus = FileWarning;
                        }

                        return (
                            <React.Fragment key={etapa.nome}>
                                <div className="flex flex-col items-center text-center w-32 flex-shrink-0">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl border flex items-center justify-center mb-2 transition-colors",
                                        corFundoIcone,
                                        isConcluida || isFinalizada ? "border-green-200" :
                                        isAtual ? "border-blue-200" :
                                        isDevolvida ? "border-orange-200" :
                                        "border-gray-200"
                                    )}>
                                        <IconeStatus size={20} className={cn("transition-colors", corIcone)} />
                                    </div>
                                    <p className={cn("text-xs font-semibold transition-colors", corTexto)}>{etapa.nome}</p>
                                    {evento && !isPendente && (
                                        <>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                {' às '}
                                                {new Date(evento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate w-full" title={evento.autor}>por {evento.autor}</p>
                                        </>
                                    )}
                                    {isDevolvida && (<p className="text-xs font-medium text-orange-600 mt-1">Devolvido</p>)}
                                </div>
                                {index < etapasWorkflow.length - 1 && (
                                    <div className={`flex-1 mt-[19px] h-0.5 transition-colors ${
                                        (isConcluida || isFinalizada || (isAtual && index < indiceEtapaAtual)) ? 'bg-green-300' : 'bg-gray-200'
                                    } min-w-[10px]`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                {/* Seção de Comentários Existentes */}
                <div className="px-3">
                    <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <MessageSquare size={18} /> Comentários e Justificativas ({comentariosParaExibir.length})
                    </h3>
                    {comentariosParaExibir.length > 0 ? (
                        <div className="space-y-4 max-h-48 overflow-y-auto scrollbar-custom border shadow-inner border-gray-200 rounded-xl p-4 bg-gray-50/25">
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
                    <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2"><History size={18} /> Histórico Detalhado</h3>
                    {historicoEventos.length > 0 ? (
                        <ul className="space-y-3 max-h-48 overflow-y-auto scrollbar-custom">
                            {[...historicoEventos].reverse().map((evento, index) => (
                                <li key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm">
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

// BotaoAba (sem alterações)
const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={cn(
        "flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center text-sm gap-2",
        abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
    )}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL ---
export default function DetalhesContextoModal({
    contexto, isOpen, onClose, perfil, isFromHistory = false,
    onDeferir, onIndeferir, onCorrigir
}: DetalhesContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [indeferirOpen, setIndeferirOpen] = useState(false);

    const alternarTelaCheia = () => { setEmTelaCheia(!emTelaCheia); setZoomLevel(1); };

    useEffect(() => {
        if (isOpen) {
            setAbaAtiva('detalhes');
            setEmTelaCheia(false);
            setZoomLevel(1);
            setIndeferirOpen(false);
        }
    }, [isOpen]);

    const lidarComDownload = () => {
        const url = (contexto as any)?.url as string | undefined;
        if (!url) { showErrorToast("Download não disponível", "Não há URL de ficheiro associada."); return; }
        const a = document.createElement('a'); a.href = url;
        const nomeArquivo = url.substring(url.lastIndexOf('/') + 1) || contexto?.nome || 'ficheiro';
        a.download = nomeArquivo; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const handleDeferirClick = () => {
        if (contexto && onDeferir) {
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
            showDispatchToast("Contexto indeferido e devolvido com justificativa.");
            setIndeferirOpen(false);
            onClose();
        }
    };
    const handleCorrigirClick = () => {
        if (contexto && onCorrigir) {
            onCorrigir(contexto);
        }
    };

    if (!isOpen || !contexto) return null;

    // Rodapé (sem alterações na lógica interna)
    const renderFooter = (): React.ReactNode => {
        // ... (lógica existente do renderFooter) ...
         if (isFromHistory) return null;

        if (perfil === "membro" && contexto.situacao === StatusContexto.AguardandoCorrecao) {
            return (
                <div className="flex justify-center w-full">
                    <Button
                        onClick={handleCorrigirClick}
                        variant="default"
                        size="sm" // Ajustado para sm
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 py-2 font-semibold" // Ajustado padding/font
                    >
                        <Edit className="mr-1.5 h-4 w-4" /> Corrigir Contexto
                    </Button>
                </div>
            );
        }

        if (perfil === "gerente" || perfil === "diretor") {
             const podeAgir = (perfil === "gerente" && contexto.situacao === StatusContexto.AguardandoGerente) || (perfil === "diretor" && contexto.situacao === StatusContexto.AguardandoDiretor);
            if (!podeAgir) {
                const statusTexto = statusConfig[contexto.situacao]?.text || contexto.situacao;
                return <p className="text-sm text-gray-500 italic w-full text-center">Status atual: {statusTexto}. Nenhuma ação pendente.</p>;
            }
            return (
                <div className="flex items-center justify-between w-full gap-4">
                    <p className="text-sm text-gray-500 hidden md:block">Selecione uma ação para este contexto.</p> {/* Esconde em telas pequenas */}
                    <div className="flex items-center gap-2 flex-shrink-0"> {/* Diminuido gap */}
                        <Button onClick={openIndeferirModal} variant="outline" size="sm"
                            className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 rounded-xl px-3 py-2 font-semibold" // Ajustado padding
                        >
                            <FileX className="mr-1 h-4 w-4" /> Indeferir
                        </Button>
                        <Button onClick={handleDeferirClick} variant="default" size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 py-2 font-semibold" // Ajustado padding
                        >
                            <FileCheck2 className="mr-1 h-4 w-4" /> Deferir
                        </Button>
                    </div>
                </div>
            );
        }

        if (perfil === "membro") {
             return (<p className="text-sm text-gray-500 w-full text-center">Visualizando detalhes do contexto.</p>);
        }

        return null;
    };


    return (
        <>
            {/* Estrutura Principal do Modal */}
            {/* Adicionada a classe animate-fade-in */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Cabeçalho */}
                     <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-6 py-3 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md"> <FileText className="w-5 h-5 text-white" /> </div>
                            <h2 className="text-xl font-semibold text-white truncate" title={contexto.nome}>
                                 {isFromHistory ? 'Detalhes Históricos' : 'Análise de Contexto'} - {contexto.nome}
                             </h2>
                        </div>
                        <Button size="icon" variant="ghost" onClick={onClose} className="w-8 h-8 bg-white/15 text-white hover:bg-white/30 hover:text-white rounded-xl flex-shrink-0"> <ArrowLeft className="w-5 h-5" /> </Button>
                    </div>
                    {/* Corpo Principal */}
                    <div className="flex-1 px-6 pt-4 pb-4 flex flex-col min-h-0 overflow-hidden">
                        {/* Abas */}
                        <div className="flex space-x-1.5 bg-gray-100 rounded-xl p-1.5 flex-shrink-0 mb-4">
                            <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            <BotaoAba id="historico" label="Histórico" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        </div>
                        {/* Conteúdo da Aba */}
                         {/* Aplica a animação aqui quando a aba muda */}
                        <div className={cn("flex-1 min-h-0 overflow-hidden", abaAtiva === 'detalhes' ? 'animate-fade-in' : 'animate-fade-in')}>
                            {abaAtiva === 'detalhes' && (<AbaDetalhes dados={contexto} aoFazerDownload={lidarComDownload} aoAlternarTelaCheia={alternarTelaCheia} emTelaCheia={emTelaCheia} zoomLevel={zoomLevel} />)}
                            {abaAtiva === 'historico' && <AbaHistorico dados={contexto} />}
                        </div>
                    </div>
                    {/* Rodapé */}
                    {renderFooter() && (
                        <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-3xl">
                           {renderFooter()}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tela Cheia */}
            {emTelaCheia && (
                // Adicionada a classe animate-fade-in
                <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[60] flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center p-3 bg-black/30 text-white flex-shrink-0">
                        <h2 className="text-base font-semibold truncate px-2" title={contexto.nome}>{contexto.nome || "Visualização"}</h2>
                        <div className="flex items-center gap-1">
                            {/* Verifica o tipo antes de mostrar botões de zoom */}
                            {(contexto.docType === 'pdf' || contexto.docType === 'doc') && (
                                <>
                                    <Button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl w-8 h-8" title="Diminuir Zoom"><ZoomOut className="w-4 h-4" /></Button>
                                    <Button onClick={() => setZoomLevel(1)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl w-8 h-8" title="Resetar Zoom"><RotateCcw className="w-4 h-4" /></Button>
                                    <Button onClick={() => setZoomLevel(prev => prev + 0.2)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl w-8 h-8" title="Aumentar Zoom"><ZoomIn className="w-4 h-4" /></Button>
                                </>
                            )}
                            <Button onClick={alternarTelaCheia} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl w-8 h-8" title="Fechar Tela Cheia"><Minimize className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full overflow-auto p-4">
                        <VisualizadorDeConteudo tipo={contexto.docType as any} titulo={contexto.nome} payload={(contexto as any).payload} url={(contexto as any).url} emTelaCheia={true} zoomLevel={zoomLevel} />
                    </div>
                </div>
            )}
            {/* Estilos */}
            {/* ***** MODIFICAÇÃO: Removido 'transform: scale' do keyframes fadeIn ***** */}
            <style>{`
                 /* Keyframes APENAS com fade de opacidade */
                 @keyframes fadeIn {
                     from { opacity: 0; }
                     to { opacity: 1; }
                 }
                 /* Classe que aplica a animação */
                 .animate-fade-in {
                     animation: fadeIn 0.2s ease-out forwards;
                 }
                 /* Estilos do scrollbar (mantidos) */
                 .scrollbar-custom::-webkit-scrollbar { width: 6px; }
                 .scrollbar-custom::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; }
                 .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
                 .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
             `}</style>

            {/* Modal Indeferir (sem alterações) */}
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