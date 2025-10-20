// src/components/popups/detalhesContextoModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Info, History, Download, FileText, Plus, User,
    ChevronDown, FileType as FileIcon, LucideProps, Minimize,
    ZoomIn, ZoomOut, RotateCcw, FileCheck2, FileX, BookAlert,
    CheckCircle, Clock, XCircle, FileWarning, Send, UserCheck, UserCog, Building // Ícones adicionados para o timeline
} from 'lucide-react';
import StatusBanner from '@/components/ui/status-banner';
import { Button } from "@/components/ui/button"; // Usar o Button padrão
import { Contexto, DocType, StatusContexto, HistoricoEvento } from "@/components/validar/typesDados"; // Ajustar importações
import { VisualizadorDeConteudo } from '@/components/popups/visualizarContextoModal/visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { cn } from '@/lib/utils';
// Importar Versao simulada (pode ser removido se não usar explicitamente)
import { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { showDispatchToast, showErrorToast } from '@/components/ui/Toasts';
import { statusConfig } from '@/components/validar/colunasTable/statusConfig'; // Importar statusConfig

interface DetalhesContextoModalProps {
  contexto: Contexto | null;
  isOpen: boolean;
  onClose: () => void;
  perfil: "diretor" | "gerente" | "membro";
  isFromHistory?: boolean;
  onDeferir?: (contextoId: string, comentario?: string) => void;
  onIndeferir?: (contextoId: string, comentario: string) => void;
}

type TipoAba = 'detalhes' | 'versoes'; // 'versoes' agora representa o Histórico/Timeline

// --- COMPONENTES DAS ABAS ---

// AbaDetalhes: Mostra informações e o visualizador (com botões arredondados)
const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, emTelaCheia, zoomLevel
}: {
    dados: Contexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    emTelaCheia: boolean;
    zoomLevel: number;
}) => {
    // Simula versões a partir do histórico
    const versoesDisponiveis = dados.historico?.map((h, index) => ({
        id: index + 1,
        nome: `Versão ${index + 1} (${new Date(h.data).toLocaleDateString('pt-BR')}) - ${h.acao.substring(0, 30)}...`,
        data: h.data,
        autor: h.autor,
    })) || [{ id: 1, nome: `Versão Inicial (${new Date(dados.data).toLocaleDateString('pt-BR')})`, data: dados.data, autor: dados.solicitante }];

    const versaoMaisRecente = versoesDisponiveis[versoesDisponiveis.length - 1];
    const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(versaoMaisRecente?.id || null);
    const versaoSelecionada = versoesDisponiveis.find(v => v.id === versaoSelecionadaId);

    useEffect(() => {
        if (versaoMaisRecente) {
            setVersaoSelecionadaId(versaoMaisRecente.id);
        }
    }, [versaoMaisRecente, dados]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-fade-in p-1">
            {/* Coluna Esquerda: Informações */}
            <div className="space-y-4 overflow-y-auto pr-2 h-full pb-4 scrollbar-custom">
                 {versaoSelecionada && (
                    <StatusBanner
                        variant={versaoSelecionadaId === versaoMaisRecente.id ? 'info' : 'warning'}
                        title={versaoSelecionadaId === versaoMaisRecente.id ? 'Visualizando Versão Atual' : 'Visualizando Versão Anterior'}
                    >
                         <div className="text-sm pl-3 leading-relaxed">
                            <div className="font-medium">{versaoSelecionada.nome}</div>
                            <div className="text-xs mt-1">por {versaoSelecionada.autor} em {new Date(versaoSelecionada.data).toLocaleDateString('pt-BR')}</div>
                        </div>
                    </StatusBanner>
                 )}
                {versoesDisponiveis.length > 1 && (
                    <div>
                        <label htmlFor="version-select-validar" className="block text-sm font-medium text-gray-700 mb-1">Visualizar outra versão:</label>
                        <div className="relative">
                            <select
                                id="version-select-validar" value={versaoSelecionadaId || ''} onChange={(e) => setVersaoSelecionadaId(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-300 rounded-full py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" // Arredondado
                            >
                                {versoesDisponiveis.sort((a, b) => b.id - a.id).map(versao => (<option key={versao.id} value={versao.id}>{versao.nome}</option>))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700"><ChevronDown className="w-4 h-4" /></div>
                        </div>
                    </div>
                )}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <IconeDocumento type={dados.docType as DocType} />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate" title={dados.nome}>{dados.nome}</p>
                            <p className="text-xs text-gray-500">{new Date(dados.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    {dados.url && (
                        <Button onClick={aoFazerDownload} variant="outline" size="sm" className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex-shrink-0">
                             <Download className="w-4 h-4 mr-1.5" /> Baixar
                        </Button>
                    )}
                </div>
                {dados.detalhes && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-600 flex-shrink-0" /><h3 className="text-sm font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-xs leading-relaxed pl-1">{dados.detalhes}</p>
                    </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                             <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                             <div>
                                <p className="font-medium text-gray-800">Enviado por</p>
                                <p className="text-gray-600 truncate" title={dados.solicitante}>{dados.solicitante}</p>
                             </div>
                        </div>
                         <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                            <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                             <div>
                                <p className="font-medium text-gray-800">Tipo</p>
                                <p className="text-gray-600 uppercase">{dados.docType}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Visualizador */}
            <div className="h-full min-h-0">
                 <VisualizadorDeConteudo
                    tipo={dados.docType as any} url={dados.url} titulo={dados.nome} payload={dados.payload}
                    aoAlternarTelaCheia={aoAlternarTelaCheia} emTelaCheia={emTelaCheia} zoomLevel={zoomLevel}
                />
            </div>
        </div>
    );
};

// AbaVersoes: Mostra o histórico visual e detalhado
const AbaVersoes = ({ dados }: { dados: Contexto }) => {
    const etapasWorkflow = [
        { nome: "Submetido", status: [StatusContexto.AguardandoGerente, StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: Send },
        { nome: "Análise Gerente", status: [StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCog },
        { nome: "Análise Diretor", status: [StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCheck },
        { nome: "Finalizado", status: [StatusContexto.Publicado, StatusContexto.Indeferido], icon: Building }
    ];
    const historicoEventos = dados.historico || [];
    const statusAtual = dados.situacao;
    let indiceEtapaAtual = -1;
    for (let i = etapasWorkflow.length - 1; i >= 0; i--) { if (etapasWorkflow[i].status.includes(statusAtual)) { indiceEtapaAtual = i; break; } }
    let indiceEtapaDevolvida = -1;
    if (statusAtual === StatusContexto.AguardandoCorrecao) {
        indiceEtapaDevolvida = etapasWorkflow.findIndex(etapa => historicoEventos.some(h => h.acao.toLowerCase().includes(etapa.nome.split(' ')[1]?.toLowerCase() || '')) && (etapa.nome === "Análise Gerente" || etapa.nome === "Análise Diretor"));
        if (indiceEtapaDevolvida === -1 && historicoEventos.some(h => h.acao.toLowerCase().includes("submetido"))) { indiceEtapaDevolvida = 1; }
        indiceEtapaAtual = 0;
    }
    const getUltimoEventoParaEtapa = (etapaIndex: number): HistoricoEvento | undefined => {
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

    return (
        <div className="animate-fade-in p-1 h-full overflow-y-auto scrollbar-custom pb-4">
            <div className="flex items-start justify-between pt-4 px-4 mb-6">
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
                                <div className={cn("h-10 w-10 rounded-full border-2 flex items-center justify-center mb-2 transition-colors", corFundoIcone, isConcluida || isFinalizada ? "border-green-200" : isAtual ? "border-blue-200" : isDevolvida ? "border-orange-200" : "border-gray-200" )}>
                                    <IconeStatus size={20} className={cn("transition-colors", corIcone)} />
                                </div>
                                <p className={cn("text-xs font-semibold transition-colors", corTexto)}>{etapa.nome}</p>
                                {evento && !isPendente && ( <> <p className="mt-1 text-[10px] text-gray-500"> {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {' às '} {new Date(evento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} </p> <p className="text-[10px] text-gray-500 truncate w-full" title={evento.autor}>por {evento.autor}</p> </> )}
                                {isDevolvida && (<p className="text-[10px] font-medium text-orange-600 mt-1">Devolvido</p>)}
                            </div>
                            {index < etapasWorkflow.length - 1 && (<div className={`flex-1 mt-[19px] h-0.5 transition-colors ${isConcluida || isFinalizada ? 'bg-green-300' : 'bg-gray-200'} min-w-[10px]`}></div>)}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="px-3 mt-4">
                 <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2"><History size={18}/> Detalhes do Histórico</h3>
                {historicoEventos.length > 0 ? (
                    <ul className="space-y-3">
                        {[...historicoEventos].reverse().map((evento, index) => (
                            <li key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-xs">
                                <p className="font-medium text-gray-800">{evento.acao}</p>
                                <p className="text-gray-500 mt-1">{evento.autor} em {new Date(evento.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                            </li>
                        ))}
                    </ul>
                ) : (<p className="text-center text-gray-500 text-sm mt-8">Nenhum histórico detalhado encontrado.</p>)}
            </div>
        </div>
    );
};

// BotaoAba: Componente auxiliar para os botões das abas (com cantos arredondados)
const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={cn( "flex-1 py-2 px-4 rounded-full font-semibold transition-all flex justify-center items-center text-sm gap-2", abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50" )}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL ---
export default function DetalhesContextoModal({
    contexto, isOpen, onClose, perfil, isFromHistory = false,
    onDeferir, onIndeferir
}: DetalhesContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [comentario, setComentario] = useState("");

    const alternarTelaCheia = () => { setEmTelaCheia(!emTelaCheia); setZoomLevel(1); };

    useEffect(() => { if (isOpen) { setAbaAtiva('detalhes'); setEmTelaCheia(false); setZoomLevel(1); setComentario(""); } }, [isOpen]);

    const lidarComDownload = () => {
        if (!contexto?.url) { showErrorToast("Download não disponível", "Não há URL de arquivo associada."); return; }
        const a = document.createElement('a'); a.href = contexto.url;
        const nomeArquivo = contexto.url.substring(contexto.url.lastIndexOf('/') + 1) || contexto.nome || 'arquivo';
        a.download = nomeArquivo; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    const handleDeferirClick = () => { if (contexto && onDeferir) { onDeferir(contexto.id, comentario || undefined); showDispatchToast("Contexto deferido com sucesso!"); onClose(); } };
    const handleIndeferirClick = () => { if (!comentario.trim()) { showErrorToast("Comentário obrigatório", "É necessário inserir um comentário/justificativa para indeferir."); return; } if (contexto && onIndeferir) { onIndeferir(contexto.id, comentario); showErrorToast("Contexto indeferido."); onClose(); } };

    if (!isOpen || !contexto) return null;

    // Define quais botões mostrar no rodapé (com layout de comentário melhorado)
    const renderFooter = (): React.ReactNode => {
        if (isFromHistory) return null;
        if (perfil === "membro") { return (<p className="text-sm text-gray-500 w-full text-center">Visualizando detalhes do contexto.</p>); }
        if (perfil === "gerente" || perfil === "diretor") {
             const podeAgir = (perfil === "gerente" && contexto.situacao === StatusContexto.AguardandoGerente) || (perfil === "diretor" && contexto.situacao === StatusContexto.AguardandoDiretor);
             if (!podeAgir) { const statusTexto = statusConfig[contexto.situacao]?.text || contexto.situacao; return <p className="text-sm text-gray-500 italic w-full text-center">Status atual: {statusTexto}. Nenhuma ação pendente.</p>; }
            return (
                <div className="flex flex-col gap-3 w-full">
                    <div>
                         <label htmlFor="comentario-validacao" className="sr-only">Comentário/Justificativa</label>
                        <textarea id="comentario-validacao" placeholder="Adicionar comentário/justificativa (obrigatório para indeferir)..." rows={2}
                            className="w-full border border-gray-300 rounded-xl py-2 px-4 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-y leading-tight bg-white shadow-sm"
                            value={comentario} onChange={(e) => setComentario(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end items-center gap-3 flex-shrink-0 mt-1">
                         <Button onClick={handleIndeferirClick} variant="outline" size="sm" className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100 rounded-full px-5 py-2.5" disabled={!comentario.trim()}> <FileX className="mr-1.5 h-4 w-4" /> Indeferir </Button>
                         <Button onClick={handleDeferirClick} variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2.5"> <FileCheck2 className="mr-1.5 h-4 w-4" /> Deferir </Button>
                    </div>
                 </div>
            );
        }
        return null;
    };

    return (
        <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Cabeçalho */}
                 <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-6 py-3 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white/20 rounded-lg"> <FileText className="w-4 h-4 text-white" /> </div>
                        <h2 className="text-xl font-semibold text-white truncate" title={contexto.nome}> {isFromHistory ? 'Detalhes Históricos' : 'Análise de Contexto'} - {contexto.nome} </h2>
                    </div>
                    <Button size="icon" variant="ghost" onClick={onClose} className="w-8 h-8 bg-white/15 text-white hover:bg-white/30 rounded-lg flex-shrink-0"> <ArrowLeft className="w-5 h-5" /> </Button>
                 </div>
                 {/* Corpo Principal */}
                 <div className="flex-1 px-6 pt-6 pb-4 flex flex-col min-h-0 overflow-hidden">
                     <div className="flex space-x-1.5 bg-gray-100 rounded-full p-1 flex-shrink-0 mb-4">
                        <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="versoes" label="Histórico" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {abaAtiva === 'detalhes' && (<AbaDetalhes dados={contexto} aoFazerDownload={lidarComDownload} aoAlternarTelaCheia={alternarTelaCheia} emTelaCheia={emTelaCheia} zoomLevel={zoomLevel} />)}
                        {abaAtiva === 'versoes' && <AbaVersoes dados={contexto} />}
                    </div>
                </div>
                 {/* Rodapé */}
                 {renderFooter() && ( <div className="px-6 py-4 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]"> {renderFooter()} </div> )}
            </div>
        </div>

            {/* Modal Tela Cheia */}
            {emTelaCheia && (
                 <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[60] flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center p-3 bg-black/30 text-white flex-shrink-0">
                        <h2 className="text-lg font-semibold truncate px-2" title={contexto.nome}>{contexto.nome || "Visualização"}</h2>
                        <div className="flex items-center gap-1">
                            {(contexto.docType === 'pdf' || contexto.docType === 'doc') && (
                                <>
                                <Button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" title="Diminuir Zoom"><ZoomOut className="w-5 h-5" /></Button>
                                <Button onClick={() => setZoomLevel(1)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" title="Resetar Zoom"><RotateCcw className="w-4 h-4" /></Button>
                                <Button onClick={() => setZoomLevel(prev => prev + 0.2)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" title="Aumentar Zoom"><ZoomIn className="w-5 h-5" /></Button>
                                </>
                            )}
                            <Button onClick={alternarTelaCheia} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" title="Fechar Tela Cheia"><Minimize className="w-5 h-5" /></Button>
                        </div>
                    </div>
                     <div className="flex-1 min-h-0 w-full h-full overflow-auto p-4">
                         <VisualizadorDeConteudo tipo={contexto.docType as any} titulo={contexto.nome} payload={contexto.payload} url={contexto.url} emTelaCheia={true} zoomLevel={zoomLevel} />
                    </div>
                </div>
            )}
            {/* Estilos */}
            <style>{`
                 @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; } .scrollbar-custom::-webkit-scrollbar { width: 6px; } .scrollbar-custom::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; } .scrollbar-custom::-webkit-scrollbar-track { background: transparent; } .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
             `}</style>
         </>
    );
}