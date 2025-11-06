// src/components/popups/visualizarContextoModal/AbaDetalhes.tsx
"use client";

import React, { useState, useEffect } from 'react';
// 1. IMPORTAÇÕES
import {
    Download, Info, MessageCircle, ChevronDown, User,
    FileType as FileIcon, Building, Send, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import StatusBanner from '@/components/ui/status-banner';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
// 2. TIPAGEM
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import type { DocType } from '@/components/validar/typesDados';
import { StatusContexto } from '@/components/validar/typesDados';
import { showSuccessToast } from '@/components/ui/Toasts';

// 3. PROPS
interface AbaDetalhesProps {
    dados: DetalhesContexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    isEditing?: boolean;
    emTelaCheia: boolean;
    zoomLevel: number;
    isFromHistory?: boolean;
    aoAlternarVisibilidadeContexto?: (contextoId: string) => void;

    // Props específicas da Validação
    isValidationView?: boolean;
    podeAgir?: boolean;
    versaoEmJulgamento?: Versao | null;
}

const AbaDetalhes = ({
    dados, aoFazerDownload, aoAlternarTelaCheia, isEditing, emTelaCheia, zoomLevel, isFromHistory,
    aoAlternarVisibilidadeContexto,
    isValidationView = false,
    podeAgir = false,
    versaoEmJulgamento = null
}: AbaDetalhesProps) => {

    // --- ESTADOS INTERNOS ---
    const [mostrarInputComentario, setMostrarInputComentario] = useState(false);
    const [novoComentario, setNovoComentario] = useState("");

    const handleEnviarComentario = () => {
        if (!novoComentario.trim()) return;
        // Lógica de envio (ex: API call)
        console.log("Enviando comentário para o contexto:", dados.id, "Comentário:", novoComentario);
        showSuccessToast("Comentário enviado.");
        setNovoComentario("");
        setMostrarInputComentario(false);
    };

    // --- LÓGICA DE VERSÕES ---
    const versoesDisponiveis = dados.versoes || [];
    const versoesVisiveis = isEditing ? versoesDisponiveis : versoesDisponiveis.filter(v => !v.estaOculta);
    const versaoMaisRecenteGeral = versoesDisponiveis.length > 0 ? versoesDisponiveis.reduce((a, b) => a.id > b.id ? a : b) : null;
    const versaoMaisRecenteVisivel = versoesVisiveis.length > 0 ? versoesVisiveis.reduce((a, b) => a.id > b.id ? a : b) : null;

    const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(null);

    useEffect(() => {
        // Se estiver na tela de validação e tiver uma versão em julgamento,
        // força a seleção para essa versão.
        if (isValidationView && versaoEmJulgamento) {
            setVersaoSelecionadaId(versaoEmJulgamento.id);
        } else {
            // Comportamento padrão (pág. gerência): seleciona a mais recente visível
            const idInicial = versaoMaisRecenteVisivel?.id || versaoMaisRecenteGeral?.id || null;
            setVersaoSelecionadaId(idInicial);
        }
    }, [isValidationView, versaoEmJulgamento, versaoMaisRecenteVisivel, versaoMaisRecenteGeral, dados, isEditing]);


    const versaoSelecionada = versoesDisponiveis.find(v => v.id === versaoSelecionadaId);
    const listaDropdown = (isEditing ? versoesDisponiveis : versoesVisiveis);
    const podeComentar = !isEditing && !isFromHistory;

    const isPublished = dados.status === StatusContexto.Publicado;
    // --- (CORREÇÃO 1) ---
    const canToggleHide = dados.estaOculto ? true : isPublished; // Corrigido de 'estaOcularo' para 'estaOculto'
    const tipoLabel = dados.type === 'indicador' ? 'Indicador' : 'Contexto';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in p-1">
            {/* Coluna da Esquerda: Informações */}
            <div className="space-y-6 overflow-y-auto pr-4 h-full pb-4 scrollbar-custom">

                {/* --- SEÇÃO DO BANNER --- */}

                {isValidationView && podeAgir && versaoEmJulgamento ? (
                    // 1. BANNER AMARELO (Validação)
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

                ) : !isValidationView && versoesDisponiveis.length > 0 && versaoSelecionada ? (
                    // 2. BANNER VERDE/LARANJA (Visualização Padrão - pág. Gerência)
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
                                    {versaoSelecionada.estaOculta && <p className="text-xs font-semibold text-orange-700 mt-1">Esta versão está oculta.</p>}
                                </div>
                            </StatusBanner>
                        );
                    })()
                ) : null}
                {/* --- FIM DA SEÇÃO DO BANNER --- */}


                {/* Dropdown de Seleção de Versão (Desabilitado na validação) */}
                {listaDropdown.length > 1 && (
                    <div className="mt-4">
                        <label htmlFor="version-select" className={cn(
                            "block text-sm font-medium text-gray-700 mb-1",
                            isValidationView && "text-gray-400"
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
                                    isValidationView && "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                                )}
                                disabled={isValidationView}
                                title={isValidationView ? "A seleção de versão é desabilitada durante a validação." : "Selecionar versão"}
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


                {/* Card do Arquivo/Contexto (com Switch de Ocultar) */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <IconeDocumento type={dados.type as DocType} />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-base leading-tight truncate" title={dados.title}>{dados.title}</p>
                                <p className="text-sm text-gray-500">{new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                            {podeComentar && (
                                <button
                                    type="button"
                                    onClick={() => setMostrarInputComentario(v => !v)}
                                    aria-pressed={mostrarInputComentario}
                                    aria-controls="comentario-panel"
                                    aria-expanded={mostrarInputComentario}
                                    className={cn(
                                        "relative flex items-center gap-2 px-3 py-2 font-semibold rounded-2xl transition-all",
                                        mostrarInputComentario
                                            ? "bg-white text-blue-700 border border-blue-300 shadow-sm ring-2 ring-blue-300"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    )}
                                    title={mostrarInputComentario ? "Fechar comentários" : "Comentar"}
                                >
                                    <MessageCircle className='w-4 h-4' />
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

                    {/* Switch de Visibilidade (para o Contexto Inteiro) */}
                    {isEditing && aoAlternarVisibilidadeContexto && (
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between gap-3">
                            <label
                                htmlFor="ocultar-contexto"
                                className={cn(
                                    "text-sm font-medium text-gray-700",
                                    !canToggleHide && "text-gray-400"
                                )}
                            >
                                Ocultar {tipoLabel}
                            </label>
                            <Switch
                                id="ocultar-contexto"
                                checked={dados.estaOculto || false}
                                onCheckedChange={() => aoAlternarVisibilidadeContexto(dados.id)}
                                disabled={!canToggleHide}
                                title={
                                    !canToggleHide
                                        ? "Apenas contextos publicados podem ser ocultados"
                                        : (dados.estaOculto ? `Desocultar ${tipoLabel}` : `Ocultar ${tipoLabel}`)
                                }
                            />
                        </div>
                    )}
                </div>

                {/* --- SEÇÃO DE COMENTÁRIO --- */}
                {mostrarInputComentario && (
                    <div className="animate-fade-in" id="comentario-panel">
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3 shadow-inner">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="novo-comentario-input">
                                Adicionar Novo Comentário
                            </label>
                            <textarea
                                id="novo-comentario-input"
                                value={novoComentario}
                                onChange={(e) => setNovoComentario(e.target.value)}
                                rows={3}
                                placeholder="Escreva um comentário..."
                                className="w-full mt-2 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-3 focus:ring-blue-400 ring-offset-2"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setMostrarInputComentario(false)} className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancelar</Button>
                                <Button variant="default" size="sm" onClick={handleEnviarComentario} disabled={!novoComentario.trim()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="w-4 h-4 mr-1.5" /> Enviar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                {/* --- FIM DA SEÇÃO DE COMENTÁRIO --- */}

                {/* Descrição */}
                {dados.description && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /><h3 className="text-base font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 text-sm leading-relaxed pl-1">{dados.description}</p>
                    </div>
                )}

                {/* Detalhes Adicionais (COM CORREÇÕES) */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-4">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                        {/* --- (CORREÇÃO 2) --- */}
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Enviado por</p>
                                <p className="text-gray-600 truncate" title={dados.solicitante}>{dados.solicitante || 'N/A'}</p>
                            </div>
                        </div>

                        {/* --- (CORREÇÃO 3) --- */}
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Tipo</p>
                                <p className="text-gray-600 uppercase">{dados.type}</p>
                            </div>
                        </div>

                        {/* --- (CORREÇÃO 4) --- */}
                        <div className="flex items-center gap-3 p-3 rounded-lg sm:col-span-2">
                            <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Gerência Solicitante</p>
                                <p className="text-gray-600 truncate" title={dados.gerencia}>{dados.gerencia || 'N/A'}</p>
                            </div>
                        </div>
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

export default AbaDetalhes;