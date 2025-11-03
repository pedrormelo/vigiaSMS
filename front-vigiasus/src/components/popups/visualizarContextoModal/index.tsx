// src/components/popups/visualizarContextoModal/index.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Info, History, Download, FileText, Plus, User, ChevronDown, FileType as FileIcon, LucideProps, Minimize, ZoomIn, ZoomOut, RotateCcw,
    Eye, EyeOff // <-- Ícones de visibilidade
} from 'lucide-react';
import StatusBanner from '@/components/ui/status-banner';
import type { DetalhesContexto, Versao } from '@/components/popups/addContextoModal/types';
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';
import type { DocType } from '@/components/validar/typesDados';
import { Button } from '@/components/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: DetalhesContexto | null;
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
    perfil: 'diretor' | 'gerente' | 'membro';
    isEditing?: boolean;
    aoAlternarVisibilidadeVersao?: (contextoId: string, versaoId: number) => void;
}


type TipoAba = 'detalhes' | 'versoes';

// --- COMPONENTE AbaDetalhes (Sem alterações nesta etapa) ---
const AbaDetalhes = ({
    dados,
    aoFazerDownload,
    aoAlternarTelaCheia,
    isEditing
}: {
    dados: DetalhesContexto;
    aoFazerDownload: () => void;
    aoAlternarTelaCheia: () => void;
    isEditing?: boolean;
}) => {
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in p-1">
            {/* Coluna da Esquerda: Informações */}
            <div className="space-y-6 overflow-y-auto pr-4 h-full">
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

                {listaDropdown.length === 0 && !isEditing && versoesDisponiveis.length > 0 && (
                    <StatusBanner variant='info' title='Versões Ocultas'>
                        <p className="text-sm pl-3">Todas as versões visíveis deste contexto estão ocultas no momento.</p>
                    </StatusBanner>
                )}

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <IconeDocumento type={dados.type as DocType} />
                        <div>
                            <p className="font-semibold text-gray-800 text-base leading-tight truncate" title={dados.title}>{dados.title}</p>
                            <p className="text-sm text-gray-500">{new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    {dados.url && dados.type !== 'indicador' && (
                        <button onClick={aoFazerDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors">
                            <Download className="w-4 h-4" /> Baixar
                        </button>
                    )}
                </div>
                {dados.description && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-blue-800">Descrição</h3></div>
                        <p className="text-gray-700 leading-relaxed pl-1">{dados.description}</p>
                    </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Detalhes Adicionais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {dados.solicitante && (<div className="flex items-center gap-3 p-3 rounded-2xl"><User className="w-5 h-5 text-gray-500" /><div><p className="font-semibold text-gray-800">Enviado por</p><p className="text-gray-600">{dados.solicitante}</p></div></div>)}
                        <div className="flex items-center gap-3 p-3 rounded-2xl"><FileIcon className="w-5 h-5 text-gray-500" /><div><p className="font-semibold text-gray-800">Tipo de Arquivo</p><p className="text-gray-600 uppercase">{dados.type}</p></div></div>
                    </div>
                </div>
            </div>

            {/* Coluna da Direita: Visualizador */}
            <div className="h-full overflow-y-auto">
                <VisualizadorDeConteudo
                    tipo={dados.type}
                    url={dados.url}
                    titulo={dados.title}
                    payload={dados.payload}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                />
            </div>
        </div>
    );
};

// --- COMPONENTE AbaVersoes (Modificado) ---
const AbaVersoes = ({
    aoCriarNovaVersao,
    dados,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao
}: {
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
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
        <div className="animate-fade-in p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
                {aoCriarNovaVersao && podeCriarNovaVersao && (
                    <button onClick={() => aoCriarNovaVersao(dados)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">
                        <Plus className="w-4 h-4" /> Criar Nova Versão
                    </button>
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
                                {/* Informações da Versão */}
                                <div>
                                    <p className={cn("font-medium", versao.estaOculta ? "text-gray-600" : "text-gray-800")}>{versao.nome}</p>
                                    <p className="text-sm text-gray-500">por {versao.autor} em {new Date(versao.data).toLocaleDateString('pt-BR')}</p>
                                </div>

                                {/* --- ATUALIZADO: Switch de Visibilidade --- */}
                                {isEditing && perfil === 'membro' && aoAlternarVisibilidadeVersao && (
                                    <div
                                        className={cn("flex items-center gap-2", isUltimaVersaoVisivel && "opacity-50 cursor-not-allowed")}
                                        title={isUltimaVersaoVisivel ? "Não é possível ocultar a única versão visível." : (versao.estaOculta ? "Clique para tornar visível" : "Clique para ocultar")}
                                    >
                                        {/* O Ícone agora é o label e fica ANTES do switch */}
                                        <label
                                            htmlFor={`switch-v${versao.id}`}
                                            className={cn(isUltimaVersaoVisivel ? "cursor-not-allowed" : "cursor-pointer")}
                                        >
                                            {versao.estaOculta ?
                                                <EyeOff className="w-4 h-4 text-gray-500" /> :
                                                <Eye className="w-4 h-4 text-blue-600" />
                                            }
                                        </label>
                                        <Switch
                                            id={`switch-v${versao.id}`}
                                            checked={!versao.estaOculta}
                                            onCheckedChange={() => aoAlternarVisibilidadeVersao(versao.id)}
                                            disabled={isUltimaVersaoVisivel}
                                            aria-label={versao.estaOculta ? "Tornar versão visível" : "Ocultar versão"}
                                            className='focus:ring-2 ring-blue-300 ring-offset-1'
                                        />
                                        {/* REMOVIDO o texto "Visível/Oculto" e o ícone duplicado */}
                                    </div>
                                )}

                                {/* Botão "Ver" (Apenas se não estiver em modo de edição) */}
                                {!isEditing && (
                                    <button className="text-sm text-blue-600 font-semibold hover:underline">Ver</button>
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

// --- COMPONENTE BotaoAba (Sem alterações) ---
const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === id ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:bg-gray-50"}`}><Icon className="w-5 h-5 mr-2" /> {label}</button>
);

// --- COMPONENTE PRINCIPAL DO MODAL (Sem alterações) ---
export function VisualizarContextoModal({
    estaAberto,
    aoFechar,
    dadosDoContexto,
    aoCriarNovaVersao,
    perfil,
    isEditing,
    aoAlternarVisibilidadeVersao
}: VisualizarContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    const alternarTelaCheia = () => {
        setEmTelaCheia(!emTelaCheia);
        setZoomLevel(1);
    };

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes');
            setEmTelaCheia(false);
            setZoomLevel(1);
        }
    }, [estaAberto]);

    // Handler para o download
    const lidarComDownload = () => {
        if (!dadosDoContexto) return;
        if (dadosDoContexto.type === 'dashboard' && chartContainerRef.current) {
            // (lógica SVG)
        } else if (dadosDoContexto.url) {
            const a = document.createElement('a');
            a.href = dadosDoContexto.url;
            a.download = dadosDoContexto.title || 'arquivo';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    // Handler para o Toggle
    const handleToggleVersao = (versaoId: number) => {
        if (dadosDoContexto && aoAlternarVisibilidadeVersao) {
            aoAlternarVisibilidadeVersao(dadosDoContexto.id, versaoId);
        }
    };

    if (!estaAberto || !dadosDoContexto) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                        <h2 className="text-2xl font-semibold text-white truncate" title={dadosDoContexto.title}>{dadosDoContexto.title}</h2>
                    </div>
                    {/* Botão Voltar/Fechar */}
                    <Button size="icon" variant="ghost" onClick={aoFechar} className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0"> <ArrowLeft className="w-6 h-6" /> </Button>
                </div>

                <div className="flex-1 px-8 pt-8 pb-4 flex flex-col min-h-0 overflow-y-auto">
                    {/* Abas */}
                    <div className="flex space-x-2 bg-gray-100 rounded-2xl p-2 flex-shrink-0 mb-6">
                        <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="versoes" label="Versões" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                    </div>

                    {/* Conteúdo da Aba */}
                    <div className="h-[60vh]">
                        {abaAtiva === 'detalhes' && (
                            <AbaDetalhes
                                dados={dadosDoContexto}
                                aoFazerDownload={lidarComDownload}
                                aoAlternarTelaCheia={alternarTelaCheia}
                                isEditing={isEditing}
                            />
                        )}
                        {abaAtiva === 'versoes' && (
                            <AbaVersoes
                                aoCriarNovaVersao={aoCriarNovaVersao}
                                dados={dadosDoContexto}
                                perfil={perfil}
                                isEditing={isEditing}
                                aoAlternarVisibilidadeVersao={handleToggleVersao}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tela Cheia */}
            {emTelaCheia && (
                <div className="fixed inset-0 bg-gray-800 z-[60] p-4 lg:p-8 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-semibold text-white">{dadosDoContexto.title || "Gráfico em Tela Cheia"}</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white" title="Diminuir Zoom"><ZoomOut className="w-6 h-6" /></button>
                            <button onClick={() => setZoomLevel(1)} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white" title="Resetar Zoom"><RotateCcw className="w-5 h-5" /></button>
                            <button onClick={() => setZoomLevel(prev => prev + 0.2)} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white" title="Aumentar Zoom"><ZoomIn className="w-6 h-6" /></button>
                            <button onClick={alternarTelaCheia} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white" title="Fechar tela cheia"><Minimize className="w-6 h-6" /></button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full overflow-auto">
                        <VisualizadorDeConteudo
                            tipo={dadosDoContexto.type}
                            titulo={dadosDoContexto.title}
                            payload={dadosDoContexto.payload}
                            url={dadosDoContexto.url}
                            emTelaCheia={true}
                            zoomLevel={zoomLevel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}