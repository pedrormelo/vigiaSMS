// src/components/popups/visualizarContextoModal/AbaDetalhes.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Download, Info, MessageCircle, ChevronDown, User,
    FileType as FileIcon, Building, Send, Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import StatusBanner from '@/components/ui/status-banner';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
//import type { DocType } from '@/components/validar/typesDados';
import { StatusContexto } from '@/components/validar/typesDados';
import { showSuccessToast } from '@/components/ui/Toasts';
import { diretoriasConfig } from '@/constants/diretorias'; 
import { FileType } from '@/components/contextosCard/contextoCard';
// [MODIFICAÇÃO] Importar o config de status para usar no banner
import { statusConfig } from '@/components/validar/colunasTable/statusConfig';

// Props (Interface permanece a mesma)
interface AbaDetalhesProps {
    dados: DetalhesContexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: (conteudo: Partial<DetalhesContexto>) => void;
    isEditing?: boolean;
    emTelaCheia: boolean;
    zoomLevel: number;
    isFromHistory?: boolean;
    aoAlternarVisibilidadeContexto?: (contextoId: string) => void;
    isValidationView?: boolean;
    podeAgir?: boolean;
    versaoEmJulgamento?: Versao | null;
    motivoBloqueioOcultar?: string;
}

const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, isEditing, emTelaCheia, zoomLevel, isFromHistory,
    aoAlternarVisibilidadeContexto,
    isValidationView = false,
    podeAgir = false,
    versaoEmJulgamento = null,
    motivoBloqueioOcultar
}: AbaDetalhesProps) => {

    // --- ESTADOS INTERNOS ---
    const [mostrarInputComentario, setMostrarInputComentario] = useState(false);
    const [novoComentario, setNovoComentario] = useState("");

    const nomeGerencia = useMemo(() => {
        if (!dados.gerencia) return 'N/A';
        for (const key of Object.keys(diretoriasConfig)) {
            const diretoria = diretoriasConfig[key];
            const gerenciaEncontrada = diretoria.gerencias.find(g => g.id === dados.gerencia);
            if (gerenciaEncontrada) {
                return gerenciaEncontrada.nome; 
            }
        }
        return dados.gerencia; 
    }, [dados.gerencia]);


    const handleEnviarComentario = () => {
        if (!novoComentario.trim()) return;
        console.log("Enviando comentário para o contexto:", dados.id, "Comentário:", novoComentario);
        showSuccessToast("Comentário enviado.");
        setNovoComentario("");
        setMostrarInputComentario(false);
    };

    // --- LÓGICA DE VERSÕES (REFINADA v3) ---
    
    // [CORREÇÃO] Memoizar a lista base para garantir estabilidade da referência (ESLint Fix)
    const versoesDisponiveis = useMemo(() => dados.versoes || [], [dados.versoes]);
    
    // 1. Encontrar todas as versões publicadas
    const versoesPublicadas = useMemo(() => 
        versoesDisponiveis.filter(v => v.status === StatusContexto.Publicado), 
        [versoesDisponiveis]
    );

    // 2. Filtrar publicadas visíveis (respeitando isEditing)
    // [FIX v4] Apenas publicadas E não ocultas (a menos que editando)
    const versoesPublicadasEVisiveis = useMemo(() =>
        versoesPublicadas.filter(v => isEditing || !v.estaOculta),
        [versoesPublicadas, isEditing]
    );
        
    // 3. Encontrar a MAIS RECENTE GERAL (para fallback e modo edição)
    const versaoMaisRecenteGeral = useMemo(() => 
        versoesDisponiveis.length > 0 ? versoesDisponiveis.reduce((a, b) => a.id > b.id ? a : b) : null,
        [versoesDisponiveis]
    );
        
    // 4. Encontrar a MAIS RECENTE PUBLICADA E VISÍVEL (a "verdadeira" mais recente para visualização)
    const versaoMaisRecentePublicadaVisivel = useMemo(() =>
        versoesPublicadasEVisiveis.length > 0 ? versoesPublicadasEVisiveis.reduce((a, b) => a.id > b.id ? a : b) : null,
        [versoesPublicadasEVisiveis]
    );

    const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(null);

    // 5. [FIX v5] useEffect atualizado para SEMPRE priorizar versão PUBLICADA quando disponível
    useEffect(() => {
        if (isValidationView && versaoEmJulgamento) {
            // 1. Prioridade: Modo Validação foca na versão em julgamento
            setVersaoSelecionadaId(versaoEmJulgamento.id);
        
        } else if (versaoMaisRecentePublicadaVisivel) { 
            // 2. SEMPRE prioriza mostrar a versão PUBLICADA mais recente (se existir)
            // Isso garante que ao abrir o modal, o usuário vê primeiro o que está publicado
            setVersaoSelecionadaId(versaoMaisRecentePublicadaVisivel.id);

        } else if (isEditing && versaoMaisRecenteGeral) { 
            // 3. Modo Edição SEM versão publicada: Mostra a mais recente (pendente)
            setVersaoSelecionadaId(versaoMaisRecenteGeral.id);
        
        } else if (versaoMaisRecenteGeral) {
            // 4. Fallback geral
            setVersaoSelecionadaId(versaoMaisRecenteGeral.id);
        } else {
            setVersaoSelecionadaId(null);
        }
    }, [isValidationView, versaoEmJulgamento, isEditing, versaoMaisRecenteGeral, versaoMaisRecentePublicadaVisivel]);


    const versaoSelecionada = versoesDisponiveis.find(v => v.id === versaoSelecionadaId);

    const dadosParaExibir = useMemo(() => {
        if (!versaoSelecionada) return dados;
        return {
            ...dados,
            title: versaoSelecionada.nome || dados.title,
            description: versaoSelecionada.descricao ?? dados.description,
            url: versaoSelecionada.url ?? dados.url,
            payload: versaoSelecionada.payload ?? dados.payload,
            type: (versaoSelecionada.type as FileType) || dados.type,
            chartType: versaoSelecionada.chartType ?? dados.chartType,
            insertedDate: versaoSelecionada.data || dados.insertedDate,
        };
    }, [dados, versaoSelecionada]);
    
    // 6. [FIX v6] Dropdown deve mostrar versões apropriadas:
    // - Em modo edição: TODAS as versões (publicadas e não publicadas)
    // - Em modo visualização: APENAS versões publicadas E visíveis (ocultar ocultas de usuários normais)
    const listaDropdown = isEditing ? versoesDisponiveis : versoesPublicadasEVisiveis;

    const podeComentar = !isEditing && !isFromHistory;
    const statusAtual = versaoSelecionada?.status || dados.status;
    const isPublishedGeral = statusAtual === StatusContexto.Publicado; // Status da versão em exibição
    const tipoLabel = dadosParaExibir.type === 'indicador' ? 'Indicador' : 'Contexto';
    const estaOcultoContexto = dados.estaOculto ?? false;
    const canToggleHide = estaOcultoContexto ? true : (isPublishedGeral && !motivoBloqueioOcultar);
    const toggleTooltip = estaOcultoContexto
        ? `Desocultar ${tipoLabel}`
        : (!isPublishedGeral
            ? `Apenas ${tipoLabel}s com status 'Publicado' podem ter a visibilidade alterada.`
            : (motivoBloqueioOcultar || `Ocultar ${tipoLabel}`));

    // --- [INÍCIO DA MODIFICAÇÃO v4] ---
    const renderBanner = () => {
        // 1. Prioridade: Visão de Validação (Obrigatória)
        if (isValidationView && podeAgir && versaoEmJulgamento) {
            return (
                <StatusBanner
                    variant='warning'
                    title={`Em Julgamento: ${versaoEmJulgamento.nome}`}
                >
                    <div className="text-sm pl-3 leading-relaxed">
                        <div className="font-medium text-yellow-900">Esta é a versão aguardando sua análise.</div>
                        <div className="text-xs mt-1 text-yellow-800">
                            por {versaoEmJulgamento.autor} em {new Date(versaoEmJulgamento.data).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </StatusBanner>
            );
        }

        // Se nenhuma versão estiver selecionada (carregando/vazio), não mostra banner
        if (!versaoSelecionada) return null;

        // 2. Prioridade: A versão *selecionada* NÃO está publicada
        // (Este é o caso da imagem: v2 selecionada, status 'Aguardando Diretor')
        if (versaoSelecionada.status !== StatusContexto.Publicado) {
            // Pega a cor/texto do statusConfig
            const configStatus = statusConfig[versaoSelecionada.status || StatusContexto.AguardandoGerente] || { text: versaoSelecionada.status, className: "bg-yellow-100 text-yellow-800" };
            
            // Define o banner com base na cor (vermelho para correção, amarelo para pendente)
            const variant = (versaoSelecionada.status === StatusContexto.AguardandoCorrecao) ? 'danger' : 'warning';
            const title = (versaoSelecionada.status === StatusContexto.AguardandoCorrecao) ? 'Aguardando Correção' : 'Contexto em Análise';

            return (
                <StatusBanner
                    variant={variant}
                    title={title}
                >
                    <div className="text-sm pl-3 leading-relaxed">
                        <div className={cn("font-medium", variant === 'danger' ? 'text-red-900' : 'text-yellow-900')}>
                            {versaoSelecionada.nome}
                        </div>
                        <div className={cn("text-xs mt-1", variant === 'danger' ? 'text-red-800' : 'text-yellow-800')}>
                            Status atual: {configStatus.text}
                        </div>
                    </div>
                </StatusBanner>
            );
        }

        // 3. Prioridade: Contexto Publicado (Visão normal de versões)
        if (!isValidationView) {
            // [FIX] A comparação de "mais recente" usa 'versaoMaisRecentePublicadaVisivel'
            const isMostRecentPublicada = versaoSelecionadaId === (versaoMaisRecentePublicadaVisivel?.id || -1);
            const variant = isMostRecentPublicada ? 'success' : 'warning';
            const title = isMostRecentPublicada ? 'Visualizando a versão mais recente' : 'Visualizando uma versão anterior';

            return (
                <StatusBanner
                    variant={versaoSelecionada.estaOculta ? 'warning' : variant}
                    title={versaoSelecionada.estaOculta ? 'Versão Oculta' : title}
                >
                    <div className="text-sm pl-3 leading-relaxed">
                        <div className="font-medium">{versaoSelecionada.nome}</div>
                        <div className="text-xs mt-1">por {versaoSelecionada.autor} em {new Date(versaoSelecionada.data).toLocaleDateString('pt-BR')}</div>
                        {versaoSelecionada.estaOculta && <p className="text-xs font-semibold text-orange-700 mt-1">Esta versão está oculta.</p>}
                    </div>
                </StatusBanner>
            );
        }
        
        // 4. Fallback (não deve acontecer)
        return null;
    };
    // --- [FIM DA MODIFICAÇÃO v4] ---

    return (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full animate-fade-in p-1">
            {/* Coluna da Esquerda: Informações */}
            <div className="space-y-3 sm:space-y-6 overflow-y-auto pr-2 sm:pr-4 h-full pb-3 sm:pb-4 scrollbar-custom">

                {/* --- [MODIFICAÇÃO] Renderiza o banner da v4 --- */}
                {renderBanner()}
                {/* --- FIM DA SEÇÃO DO BANNER --- */}


                {/* Dropdown de Seleção de Versão */}
                {/* [FIX v4] A lista (listaDropdown) agora é filtrada corretamente para modo visualização */}
                {listaDropdown.length > 1 && (
                    <div className="mt-4">
                        <label htmlFor="version-select" className={cn(
                            "block text-sm font-medium text-gray-700 mb-1",
                            (isValidationView) && "text-gray-400"
                        )}>
                            Visualizar outra versão:
                        </label>
                        <div className="relative">
                            <select
                                id="version-select"
                                value={versaoSelecionadaId || ''}
                                onChange={(e) => setVersaoSelecionadaId(Number(e.target.value))}
                                className={cn(
                                    "w-full appearance-none bg-white border border-gray-300 rounded-2xl py-2 px-3 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    (isValidationView) && "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                                )}
                                disabled={isValidationView}
                                title={
                                    isValidationView ? "A seleção de versão é desabilitada durante a validação." :
                                    "Selecionar versão"
                                }
                            >
                                {listaDropdown.sort((a, b) => b.id - a.id).map(versao => (
                                    <option key={versao.id} value={versao.id}>
                                        v{versao.id} - {versao.nome} {versao.estaOculta ? '(Oculta)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><ChevronDown className="w-4 h-4" /></div>
                        </div>
                    </div>
                )}

                {/* Mensagem de Versões Ocultas */}
                {/* [FIX v4] Compara 'listaDropdown' (filtrada) com 'versoesPublicadas' (não filtrada por oculto) */}
                {listaDropdown.length === 0 && versoesPublicadas.length > 0 && !isEditing && (
                    <StatusBanner variant='info' title='Versões Ocultas'>
                        <p className="text-sm pl-3">Todas as versões publicadas deste contexto estão ocultas no momento.</p>
                    </StatusBanner>
                )}


                {/* Card do Arquivo/Contexto (com Switch de Ocultar) */}
                <div className="bg-gray-50 rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <IconeDocumento type={dadosParaExibir.type as FileType} />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight truncate" title={dadosParaExibir.title}>{dadosParaExibir.title}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{new Date(dadosParaExibir.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                            
                            {!['indicador', 'link'].includes(dadosParaExibir.type) && (
                                <Button 
                                    onClick={aoFazerDownload} 
                                    variant="default" 
                                    size="sm" 
                                    className="rounded-lg sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 px-2 sm:px-3 py-2 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-semibold" 
                                    title="Baixar arquivo original"
                                >
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Baixar</span>
                                </Button>
                            )}

                            {podeComentar && (
                                <button
                                    type="button"
                                    onClick={() => setMostrarInputComentario(v => !v)}
                                    aria-pressed={mostrarInputComentario}
                                    aria-controls="comentario-panel"
                                    aria-expanded={mostrarInputComentario}
                                    className={cn(
                                        "relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 font-semibold rounded-lg sm:rounded-2xl transition-all text-xs sm:text-sm h-8 sm:h-9",
                                        mostrarInputComentario
                                            ? "bg-white text-blue-700 border border-blue-300 shadow-sm ring-2 ring-blue-300"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    )}
                                    title={mostrarInputComentario ? "Fechar comentários" : "Comentar"}
                                >
                                    <MessageCircle className='w-3 h-3 sm:w-4 sm:h-4' />
                                    <span className="hidden sm:inline">{mostrarInputComentario ? 'Comentando' : 'Comentar'}</span>
                                    {mostrarInputComentario && (
                                        <span
                                            aria-hidden
                                            className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white shadow"
                                        />
                                    )}
                                </button>
                            )}
                        </div>

                    </div>

                    {isEditing && aoAlternarVisibilidadeContexto && (
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between gap-3">
                            <label
                                htmlFor="ocultar-contexto"
                                className={cn(
                                    "text-sm font-medium text-gray-700",
                                    (!canToggleHide && !estaOcultoContexto) && "text-gray-400" 
                                )}
                            >
                                Ocultar {tipoLabel}
                            </label>
                            <Switch
                                id="ocultar-contexto"
                                checked={estaOcultoContexto}
                                onCheckedChange={() => aoAlternarVisibilidadeContexto(dados.id)}
                                disabled={!canToggleHide} 
                                title={toggleTooltip}
                            />
                        </div>
                    )}
                </div>

                {/* --- SEÇÃO DE COMENTÁRIO --- */}
                {mostrarInputComentario && (
                    <div className="animate-fade-in" id="comentario-panel">
                        <div className="bg-gray-50 rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-inner">
                            <label className="text-xs sm:text-sm font-semibold text-gray-700" htmlFor="novo-comentario-input">
                                Adicionar Novo Comentário
                            </label>
                            <textarea
                                id="novo-comentario-input"
                                value={novoComentario}
                                onChange={(e) => setNovoComentario(e.target.value)}
                                rows={3}
                                placeholder="Escreva um comentário..."
                                className="w-full mt-1 sm:mt-2 resize-none rounded-lg sm:rounded-xl border border-gray-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none focus:ring-3 focus:ring-blue-400 ring-offset-2"
                            />
                            <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setMostrarInputComentario(false)} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 h-8 sm:h-9">Cancelar</Button>
                                <Button variant="default" size="sm" onClick={handleEnviarComentario} disabled={!novoComentario.trim()} className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-8 sm:h-9">
                                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">Enviar</span><span className="sm:hidden">OK</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                {/* --- FIM DA SEÇÃO DE COMENTÁRIO --- */}

                {/* Descrição */}
                {dadosParaExibir.description && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg sm:rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /><h3 className="text-sm sm:text-base font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed pl-1">{dadosParaExibir.description}</p>
                    </div>
                )}

                {/* DETALHES ADICIONAIS */}
                <div className="border-t border-gray-200 pt-3 sm:pt-6">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-4">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">

                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Enviado por</p>
                                <p className="text-gray-600 truncate text-xs sm:text-sm" title={dados.solicitante}>{dados.solicitante || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Tipo</p>
                                <p className="text-gray-600 uppercase">{dadosParaExibir.type}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg sm:col-span-2">
                            <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Gerência Solicitante</p>
                                <p className="text-gray-600 truncate" title={nomeGerencia}>{nomeGerencia}</p> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coluna da Direita: Visualizador (desktop/tablet). Em mobile exibimos só o CTA. */}
            <div className="h-full min-h-[200px] sm:min-h-[280px] hidden sm:block">
                <VisualizadorDeConteudo
                    tipo={dadosParaExibir.type}
                    url={dadosParaExibir.url}
                    titulo={dadosParaExibir.title}
                    payload={dadosParaExibir.payload}
                    descricao={dadosParaExibir.description}
                    chartType={dadosParaExibir.chartType}
                    aoAlternarTelaCheia={() => aoAlternarTelaCheia(dadosParaExibir)}
                    emTelaCheia={emTelaCheia}
                    zoomLevel={zoomLevel}
                />
            </div>

            {/* Mobile: botão abre visualização em tela cheia, mantendo layout limpo. */}
            <div className="sm:hidden">
                <Button
                    onClick={() => aoAlternarTelaCheia(dadosParaExibir)}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 text-sm"
                    title="Abrir visualização em tela cheia"
                >
                    <Eye className="w-4 h-4" />
                    Visualizar documento
                </Button>
            </div>
        </div>
    );
};

export default AbaDetalhes;