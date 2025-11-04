// src/components/popups/visualizarContextoModal/index.tsx
"use client";

// 1. IMPORTAÇÕES
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ArrowLeft, Info, History, Download, FileText, Plus, User, ChevronDown, FileType as FileIcon, LucideProps, Minimize, ZoomIn, ZoomOut, RotateCcw,
    Eye, EyeOff,
    MessageSquare, FileCheck2, FileX, CheckCircle, Clock, FileWarning, Send, UserCheck, UserCog, Building, Edit, CircleCheckBig, X
} from 'lucide-react';

// 2. COMPONENTES
import StatusBanner from '@/components/ui/status-banner';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { Button } from "@/components/button"; 
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import IndeferirContextoModal from '@/components/popups/IndeferirContextoModal';
import CommentItem from '@/components/notifications/commentItem';
import { statusConfig } from '@/components/validar/colunasTable/statusConfig';
import { showDispatchToast, showErrorToast, showSuccessToast } from '@/components/ui/Toasts';

// 3. TIPOS
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import type { DocType, HistoricoEvento, Contexto } from '@/components/validar/typesDados';
import { StatusContexto} from '@/components/validar/typesDados';
import type { Comment } from "@/constants/types";

// 4. PROPS UNIFICADAS
interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: (Contexto | DetalhesContexto) | null; 
    perfil: 'diretor' | 'gerente' | 'membro';
    
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (contextoId: string, versaoId: number) => void;

    isFromHistory?: boolean;
    onDeferir?: (contextoId: string, comentario?: string) => void;
    onIndeferir?: (contextoId: string, comentario: string) => void;
    onCorrigir?: (contextoParaCorrigir: Contexto) => void; 
}

// --- TIPO DE ABA (RESTAURADO) ---
type TipoAba = 'detalhes' | 'versoes' | 'comentarios';

// --- COMPONENTE: AbaDetalhes (ATUALIZADO) ---
const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, isEditing, emTelaCheia, zoomLevel, isFromHistory
}: {
    dados: DetalhesContexto; 
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    isEditing?: boolean;
    emTelaCheia: boolean;
    zoomLevel: number;
    isFromHistory?: boolean;
}) => {
    
    // --- LÓGICA DE COMENTÁRIO ---
    const [mostrarInputComentario, setMostrarInputComentario] = useState(false);
    const [novoComentario, setNovoComentario] = useState("");

    const handleEnviarComentario = () => {
        if (!novoComentario.trim()) {
            showErrorToast("Comentário vazio", "Por favor, escreva uma mensagem.");
            return;
        }
        console.log("Novo comentário enviado:", novoComentario);
        // Simulação de API
        showSuccessToast("Comentário enviado!");
        setNovoComentario("");
        setMostrarInputComentario(false);
        // TODO: Idealmente, recarregar os dados do histórico/comentários
    };
    // --- FIM LÓGICA COMENTÁRIO ---


    const versoesDisponiveis = dados.versoes || [];
    const versoesVisiveis = isEditing ? versoesDisponiveis : versoesDisponiveis.filter(v => !v.estaOculta);
    const versaoMaisRecenteGeral = versoesDisponiveis.length > 0 ? versoesDisponiveis.reduce((a, b) => a.id > b.id ? a : b) : null;
    const versaoMaisRecenteVisivel = versoesVisiveis.length > 0 ? versoesVisiveis.reduce((a, b) => a.id > b.id ? a : b) : null;
    const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(versaoMaisRecenteVisivel?.id || versaoMaisRecenteGeral?.id || null);

    useEffect(() => {
        const idInicial = versaoMaisRecenteVisivel?.id || versaoMaisRecenteGeral?.id || null;
        setVersaoSelecionadaId(idInicial);
    }, [versaoMaisRecenteVisivel, versaoMaisRecenteGeral, dados, isEditing]);

    const versaoSelecionada = versoesDisponiveis.find(v => v.id === versaoSelecionadaId);
    const listaDropdown = (isEditing ? versoesDisponiveis : versoesVisiveis);

    // Determina se o botão "Comentar" deve aparecer
    const podeComentar = !isEditing && !isFromHistory;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in p-1">
            {/* Coluna da Esquerda: Informações */}
            <div className="space-y-6 overflow-y-auto pr-4 h-full pb-4 scrollbar-custom">
                {/* Banner de Status da Versão */}
                {versoesDisponiveis.length > 0 && versaoSelecionada && (
                    (() => {
                        const isMostRecent = versaoSelecionadaId === (versaoMaisRecenteGeral?.id || -1);
                        const variant = isMostRecent ? 'success' : 'warning';
                        const title = isMostRecent ? 'Visualizando a versão mais recente' : 'Visualizando uma versão anterior';

                        return (
                            <StatusBanner
                                variant={versaoSelecionada.estaOculta ? 'warning' : variant}
                                title={versaoSelecionada.estaOculta ? 'Versão Oculta' : title}
                            >
                                <div className="text-sm pl-3 leading-relaxed">
                                    <div className="font-medium">{versaoSelecionada.nome}</div>
                                    <div className="text-xs mt-1">por {versaoSelecionada.autor} em {new Date(versaoSelecionada.data).toLocaleDateString('pt-BR')}</div>
                                    {versaoSelecionada.estaOculta && <p className="text-xs font-semibold text-orange-700 mt-1">Esta versão está oculta e não é visível para outros perfis.</p>}
                                </div>
                            </StatusBanner>
                        );
                    })()
                )}

                {/* Dropdown de Seleção de Versão */}
                 {listaDropdown.length > 1 && (
                    <div className="mt-4">
                        <label htmlFor="version-select" className="block text-sm font-medium text-gray-700 mb-1">Visualizar outra versão:</label>
                        <div className="relative">
                            <select
                                id="version-select"
                                value={versaoSelecionadaId || ''}
                                onChange={(e) => setVersaoSelecionadaId(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-300 rounded-2xl py-2 px-3 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {listaDropdown.sort((a, b) => b.id - a.id).map(versao => (
                                    <option key={versao.id} value={versao.id}>
                                        {versao.nome} {versao.estaOculta ? '(Oculta)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown className="w-4 h-4" /></div>
                        </div>
                    </div>
                )}
                {/* Mensagem de Versões Ocultas */}
                {listaDropdown.length === 0 && !isEditing && versoesDisponiveis.length > 0 && (
                    <StatusBanner variant='info' title='Versões Ocultas'>
                        <p className="text-sm pl-3">Todas as versões visíveis deste contexto estão ocultas no momento.</p>
                    </StatusBanner>
                )}


                {/* Card do Arquivo/Contexto (COM LAYOUT CORRIGIDO) */}
                 <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                    {/* Informações (flex-1 min-w-0 para truncar) */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <IconeDocumento type={dados.type as DocType} />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-base leading-tight truncate" title={dados.title}>{dados.title}</p>
                            <p className="text-sm text-gray-500">{new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Botões (flex-shrink-0 para não serem empurrados) */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {podeComentar && (
                             <Button 
                                onClick={() => setMostrarInputComentario(!mostrarInputComentario)} 
                                variant="outline" 
                                size="sm"
                                className={cn(
                                    "rounded-2xl bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700",
                                    mostrarInputComentario && "ring-2 ring-yellow-500" // Destaca se a caixa estiver aberta
                                )}
                            >
                                <MessageSquare className="w-4 h-4 mr-1.5" /> Comentar
                            </Button>
                        )}
                        {dados.url && dados.type !== 'indicador' && (
                            <Button onClick={aoFazerDownload} variant="default" size="sm" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white">
                                <Download className="w-4 h-4 mr-1.5" /> Baixar
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- CAIXA DE COMENTÁRIO (MOVIDA PARA CÁ) --- */}
                {mostrarInputComentario && (
                    <div className="pt-4 animate-fade-in border-t border-gray-200">
                        <h3 className="text-base font-semibold text-gray-700 mb-2">Adicionar Comentário</h3>
                        <textarea
                            value={novoComentario}
                            onChange={(e) => setNovoComentario(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Digite seu comentário ou dúvida..."
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => setMostrarInputComentario(false)}>Cancelar</Button>
                            <Button variant="default" size="sm" onClick={handleEnviarComentario} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Send className="w-4 h-4 mr-1.5"/>
                                Enviar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Descrição e Detalhes Adicionais */}
                {dados.description && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /><h3 className="text-base font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-1">{dados.description}</p>
                    </div>
                )}
                 <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-4">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {dados.solicitante && (<div className="flex items-center gap-3 p-3 rounded-lg"><User className="w-5 h-5 text-gray-500 flex-shrink-0" /><div><p className="font-medium text-gray-800">Enviado por</p><p className="text-gray-600 truncate" title={dados.solicitante}>{dados.solicitante}</p></div></div>)}
                        <div className="flex items-center gap-3 p-3 rounded-lg"><FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" /><div><p className="font-medium text-gray-800">Tipo</p><p className="text-gray-600 uppercase">{dados.type}</p></div></div>
                        {dados.gerencia && (
                            <div className="flex items-center gap-3 p-3 rounded-lg sm:col-span-2">
                                <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-800">Gerência Solicitante</p>
                                    <p className="text-gray-600 truncate" title={dados.gerencia}>{dados.gerencia}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Coluna da Direita: Visualizador */}
            <div className="h-full min-h-0">
                <VisualizadorDeConteudo
                    tipo={dados.type}
                    url={dados.url}
                    titulo={dados.title}
                    payload={dados.payload}
                    chartType={dados.chartType}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                    emTelaCheia={emTelaCheia}
                    zoomLevel={zoomLevel}
                />
            </div>
        </div>
    );
};

// --- COMPONENTE: AbaVersoes (RESTAURADO) ---
const AbaVersoes = ({
    aoClicarCorrigir,
    dados,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao // Esta prop é (versaoId: number) => void
}: {
    aoClicarCorrigir?: () => void;
    dados: DetalhesContexto;
    perfil: VisualizarContextoModalProps['perfil'];
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (versaoId: number) => void;
}) => {

    const podeCriarNovaVersao = perfil === 'membro' && isEditing;
    const todasAsVersoes = dados.versoes || [];
    const numeroDeVersoesVisiveis = todasAsVersoes.filter(v => !v.estaOculta).length;
    const versoesParaExibir = isEditing ? todasAsVersoes : todasAsVersoes.filter(v => !v.estaOculta);

    return (
        <div className="animate-fade-in p-1 sm:p-4 h-full overflow-y-auto scrollbar-custom">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
                
                {/* Botão "Criar Nova Versão" (para modo de edição) */}
                {podeCriarNovaVersao && aoClicarCorrigir && (
                    <Button onClick={aoClicarCorrigir} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2">
                        <Plus className="w-4 h-4 mr-1.5" /> Criar Nova Versão
                    </Button>
                )}
                
                {/* Botão "Corrigir" (para fluxo de validação) */}
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
            {versoesParaExibir.length > 0 ? (
                <ul className="space-y-3">
                    {versoesParaExibir.sort((a, b) => b.id - a.id).map((versao: Versao) => {
                        const isUltimaVersaoVisivel = !versao.estaOculta && numeroDeVersoesVisiveis === 1;
                        return (
                            <li
                                key={versao.id}
                                className={cn(
                                    "p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center transition-colors",
                                    isEditing ? "hover:bg-gray-100" : "",
                                    versao.estaOculta && "opacity-60 bg-gray-100 border-dashed"
                                )}
                            >
                                <div>
                                    <p className={cn("font-medium", versao.estaOculta ? "text-gray-600" : "text-gray-800")}>{versao.nome}</p>
                                    <p className="text-sm text-gray-500">por {versao.autor} em {new Date(versao.data).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {isEditing && perfil === 'membro' && aoAlternarVisibilidadeVersao && (
                                    <div
                                        className={cn("flex items-center gap-2", isUltimaVersaoVisivel && "opacity-50 cursor-not-allowed")}
                                        title={isUltimaVersaoVisivel ? "Não é possível ocultar a única versão visível." : (versao.estaOculta ? "Clique para tornar visível" : "Clique para ocultar")}
                                    >
                                        <label htmlFor={`switch-v${versao.id}`} className={cn(isUltimaVersaoVisivel ? "cursor-not-allowed" : "cursor-pointer")}>
                                            {versao.estaOculta ?
                                                <EyeOff className="w-4 h-4 text-gray-500" /> :
                                                <Eye className="w-4 h-4 text-blue-600" />
                                            }
                                        </label>
                                        <Switch
                                            id={`switch-v${versao.id}`}
                                            checked={!versao.estaOculta}
                                            // CORREÇÃO: Chama a prop recebida (que é o handler)
                                            onCheckedChange={() => aoAlternarVisibilidadeVersao(versao.id)}
                                            disabled={isUltimaVersaoVisivel}
                                            aria-label={versao.estaOculta ? "Tornar versão visível" : "Ocultar versão"}
                                            className='focus:ring-2 ring-blue-300 ring-offset-1'
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center text-gray-500 mt-8">
                    {isEditing ? "Nenhuma versão encontrada." : "Nenhuma versão visível encontrada."}
                </p>
            )}
        </div>
    );
};

// --- COMPONENTE: AbaComentariosEHistorico (ATUALIZADO - Sem lista de histórico detalhado) ---
const AbaComentariosEHistorico = ({ dados }: { dados: DetalhesContexto | null }) => {
    // Definindo etapas do workflow
    const etapasWorkflow = [
        { nome: "Submetido", status: [StatusContexto.AguardandoGerente, StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: Send },
        { nome: "Análise Gerente", status: [StatusContexto.AguardandoDiretor, StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCog },
        { nome: "Análise Diretor", status: [StatusContexto.Publicado, StatusContexto.Deferido, StatusContexto.Indeferido, StatusContexto.AguardandoCorrecao], icon: UserCheck },
        { nome: "Finalizado", status: [StatusContexto.Publicado, StatusContexto.Indeferido], icon: CircleCheckBig}
    ];

    const historicoEventos = useMemo(() => dados?.historico || [], [dados?.historico]);
    const statusAtual = dados?.status; 

    if (!dados || !statusAtual) {
         return <div className="animate-fade-in p-4 h-full overflow-y-auto scrollbar-custom"><p>Carregando histórico...</p></div>;
    }

    // Lógica para determinar o índice da etapa atual
    let indiceEtapaAtual = etapasWorkflow.findIndex(etapa => etapa.status.includes(statusAtual));
     if (indiceEtapaAtual === -1 && (statusAtual === StatusContexto.Publicado || statusAtual === StatusContexto.Indeferido)) {
        indiceEtapaAtual = etapasWorkflow.length - 1; 
    }

    // Lógica para etapa devolvida
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
         const eventosRelevantes = historicoEventos.filter(e => {
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
    }, [historicoEventos]);

    return (
        <div className="animate-fade-in p-1 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-custom pb-4 space-y-8 pr-3">
                {/* Timeline Visual */}
                <div>
                    <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 px-3">
                        <History size={18} /> Linha do Tempo da Validação
                    </h3>
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
                </div>
                
                {/* Seção de Comentários Existentes */}
                <div className="px-3">
                    <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <MessageSquare size={18} /> Comentários e Justificativas ({comentariosParaExibir.length})
                    </h3>
                    {comentariosParaExibir.length > 0 ? (
                        <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-custom border shadow-inner border-gray-200 rounded-xl p-4 bg-gray-50/25">
                            {comentariosParaExibir.map((comment) => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">Nenhum comentário adicionado.</p>
                    )}
                </div>
                
            </div>
        </div>
    );
};

// --- COMPONENTE BotaoAba (Restaurado para 3 abas) ---
const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={cn(
        "flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex justify-center items-center text-sm gap-2",
        abaAtiva === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
    )}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL (ATUALIZADO) ---
export function VisualizarContextoModal({
    estaAberto,
    aoFechar,
    dadosDoContexto, 
    aoCriarNovaVersao,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao,
    isFromHistory = false,
    onDeferir,
    onIndeferir,
    onCorrigir 
}: VisualizarContextoModalProps) {
    
    // --- ESTADOS ---
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [indeferirOpen, setIndeferirOpen] = useState(false); 
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    // --- HOOK DE NORMALIZAÇÃO (sem alteração) ---
    const normalizedData: DetalhesContexto | null = useMemo(() => {
        if (!dadosDoContexto) return null;

        if ('title' in dadosDoContexto) {
            const detalhes = dadosDoContexto as DetalhesContexto;
            if (!detalhes.historico && detalhes.versoes) {
                detalhes.historico = detalhes.versoes.map(v => ({ data: v.data, autor: v.autor, acao: v.nome }));
            }
            return dadosDoContexto as DetalhesContexto;
        }

        const dados = dadosDoContexto as Contexto;
        const mappedData: DetalhesContexto = {
            ...dados, 
            title: dados.nome,
            status: dados.situacao,
            insertedDate: dados.data,
            description: dados.detalhes,
            historico: dados.historico || [],
            versoes: dados.historico?.map((h, i) => ({ 
                id: i + 1, 
                nome: `Versão ${i + 1}`, 
                data: h.data, 
                autor: h.autor,
                estaOculta: false
            })) || [],
        };
        return mappedData;

    }, [dadosDoContexto]);


    const alternarTelaCheia = () => {
        setEmTelaCheia(!emTelaCheia);
        setZoomLevel(1);
    };

    // Reseta o estado ao abrir
    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes'); // Sempre começa em detalhes
            setEmTelaCheia(false);
            setZoomLevel(1);
            setIndeferirOpen(false);
        }
    }, [estaAberto]);

    // Handler para o download (sem alteração)
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

    // --- CORREÇÃO BUG TOGGLE ---
    // Este handler é passado para a AbaVersoes.
    // Ele recebe o versaoId e chama a prop principal com o contextoId.
    const handleToggleVersao = (versaoId: number) => {
        if (normalizedData && aoAlternarVisibilidadeVersao) {
            aoAlternarVisibilidadeVersao(normalizedData.id, versaoId);
        }
    };
    
    // --- Handlers de Validação (sem alteração) ---
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

    // Handler unificado para "Corrigir" ou "Criar Nova Versão"
    const handleCorrigirClick = () => {
        if (!dadosDoContexto) return; 
        
        if (onCorrigir && 'nome' in dadosDoContexto) {
            onCorrigir(dadosDoContexto as Contexto); 
        } 
        else if (aoCriarNovaVersao && normalizedData) {
            aoCriarNovaVersao(normalizedData);
        }
    };


    // --- Renderização do Rodapé (ATUALIZADO) ---
    const renderFooter = (): React.ReactNode => {
        if (!normalizedData) return null; 
        
        // 1. Se veio do Histórico ou está em Modo de Edição, não mostra rodapé de ações.
        if (isFromHistory || isEditing) return null;

        // 2. Se for Membro e precisar corrigir
        if (perfil === "membro" && normalizedData.status === StatusContexto.AguardandoCorrecao) {
            return (
                <div className="flex justify-center w-full">
                     <p className="text-sm text-gray-500 italic">Use a aba &lsquo;Versões&rsquo; para enviar uma correção.</p>
                </div>
            );
        }

        // 3. Se for Gerente ou Diretor e puder agir
        if (perfil === "gerente" || perfil === "diretor") {
             const podeAgir = (perfil === "gerente" && normalizedData.status === StatusContexto.AguardandoGerente) || (perfil === "diretor" && normalizedData.status === StatusContexto.AguardandoDiretor);
            
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
        
        // 4. Se for qualquer perfil em modo de visualização simples (sem ações pendentes)
        // O rodapé simplesmente não é renderizado (retorna null)
        return null;
    };


    if (!estaAberto || !normalizedData) return null; 

    // --- LÓGICA DE VISIBILIDADE DAS ABAS ---
    const mostrarAbaComentarios = (isEditing && perfil === 'membro');


    // --- JSX DO MODAL UNIFICADO ---
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
                        {/* Abas (Atualizado) */}
                        <div className="flex space-x-1.5 bg-gray-100 rounded-2xl p-1.5 flex-shrink-0 mb-6">
                            <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            <BotaoAba id="versoes" label="Versões" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            
                            {/* Aba de Comentários/Histórico condicional */}
                            {mostrarAbaComentarios && (
                                <BotaoAba id="comentarios" label="Histórico & Comentários" Icon={MessageSquare} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                            )}
                        </div>

                        {/* Conteúdo da Aba (Atualizado) */}
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
                                />
                            )}
                            {abaAtiva === 'versoes' && (
                                <AbaVersoes
                                    aoClicarCorrigir={handleCorrigirClick}
                                    dados={normalizedData}
                                    perfil={perfil}
                                    isEditing={isEditing}
                                    // --- CORREÇÃO DO BUG DO TOGGLE ---
                                    // Passa o handler correto que inclui o ID do contexto
                                    aoAlternarVisibilidadeVersao={handleToggleVersao} 
                                />
                            )}
                            {/* Renderização condicional do conteúdo */}
                            {abaAtiva === 'comentarios' && mostrarAbaComentarios && (
                                <AbaComentariosEHistorico
                                    dados={normalizedData}
                                />
                            )}
                        </div>
                    </div>

                    {/* --- RODAPÉ ATUALIZADO --- */}
                    {/* Renderiza o container do rodapé APENAS se renderFooter() não for nulo */}
                    {renderFooter() != null && (
                        <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                           {renderFooter()}
                        </div>
                    )}

                </div>
            </div>

            {/* --- MODAL TELA CHEIA ATUALIZADO --- */}
            {emTelaCheia && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in">
                    
                    {/* Controles Flutuantes (Direita) */}
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

                    {/* Título Flutuante (Esquerda) */}
                    <div className="absolute top-4 left-4 z-[70] p-2 px-4 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 max-w-[calc(100%-12rem)]">
                        <h2 className="text-base font-semibold text-black truncate" title={normalizedData.title}>{normalizedData.title || "Visualização"}</h2>
                    </div>
                    
                    {/* Conteúdo (sem padding) */}
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
            
            {/* Modal de Indeferir */}
            <IndeferirContextoModal
                open={indeferirOpen}
                onOpenChange={setIndeferirOpen}
                onCancel={cancelIndeferir}
                onConfirm={confirmIndeferir}
                contextoNome={normalizedData.title}
                requireComment
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