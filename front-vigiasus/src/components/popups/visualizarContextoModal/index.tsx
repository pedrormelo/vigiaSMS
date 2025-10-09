"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Info, History, Download, FileText, Plus, User, ChevronDown, FileType as FileIcon, Star, LucideProps, Minimize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { FileType } from '@/components/contextosCard/contextoCard';
import type { DetalhesContexto } from '@/components/popups/addContextoModal/types'; 
import { VisualizadorDeConteudo } from './visualizadorDeConteudo';
import IconeDocumento from '@/components/validar/iconeDocumento';

interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: DetalhesContexto | null;
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
}

type TipoAba = 'detalhes' | 'versoes';

const AbaDetalhes = ({ dados, aoFazerDownload, aoAlternarTelaCheia }: { dados: DetalhesContexto; aoFazerDownload: () => void; aoAlternarTelaCheia: () => void; }) => {
    
    const versoesDisponiveis = dados.versoes || [];
    const versaoMaisRecente = versoesDisponiveis.length > 0 ? versoesDisponiveis.reduce((a, b) => a.id > b.id ? a : b) : null;
    const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(versaoMaisRecente?.id || null);
    const versaoSelecionada = versoesDisponiveis.find(v => v.id === versaoSelecionadaId);

    useEffect(() => {
        if (versaoMaisRecente) {
            setVersaoSelecionadaId(versaoMaisRecente.id);
        }
    }, [versaoMaisRecente, dados]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in p-1">
            {/* Coluna da Esquerda: Informações */}
            <div className="space-y-6 overflow-y-auto pr-4 h-full">
                {versoesDisponiveis.length > 0 && versaoSelecionada && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-900 p-4 rounded-r-lg shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Versão Selecionada</p>
                                <p className="text-sm text-green-800">{versaoSelecionada.nome}, por {versaoSelecionada.autor} em {new Date(versaoSelecionada.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        {versoesDisponiveis.length > 1 && (
                            <div className="relative">
                                <label htmlFor="version-select" className="block text-sm font-medium text-gray-700 mb-1">Visualizar outra versão:</label>
                                <select id="version-select" value={versaoSelecionadaId || ''} onChange={(e) => setVersaoSelecionadaId(Number(e.target.value))} className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 px-3 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {versoesDisponiveis.sort((a, b) => b.id - a.id).map(versao => (<option key={versao.id} value={versao.id}>{versao.nome}</option>))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700"><ChevronDown className="w-4 h-4" /></div>
                            </div>
                        )}
                    </div>
                )}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <IconeDocumento type={dados.type} />
                        <div>
                            <p className="font-semibold text-gray-800">{dados.title}</p>
                            <p className="text-sm text-gray-500">{new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <button onClick={aoFazerDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"><Download className="w-4 h-4" /> Baixar</button>
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
                        {dados.solicitante && (<div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"><User className="w-5 h-5 text-gray-500"/><div><p className="font-semibold text-gray-800">Enviado por</p><p className="text-gray-600">{dados.solicitante}</p></div></div>)}
                         <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"><FileIcon className="w-5 h-5 text-gray-500"/><div><p className="font-semibold text-gray-800">Tipo de Arquivo</p><p className="text-gray-600 uppercase">{dados.type}</p></div></div>
                     </div>
                </div>
            </div>
            
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

const AbaVersoes = ({ aoCriarNovaVersao, dados }: { aoCriarNovaVersao?: (dados: DetalhesContexto) => void; dados: DetalhesContexto; }) => {
    const versoesDisponiveis = dados.versoes || [];
    return (
        <div className="animate-fade-in p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
                {aoCriarNovaVersao && (<button onClick={() => aoCriarNovaVersao(dados)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition"><Plus className="w-4 h-4" /> Criar Nova Versão</button>)}
            </div>
            {versoesDisponiveis.length > 0 ? (
                <ul className="space-y-3">
                    {versoesDisponiveis.sort((a, b) => b.id - a.id).map(versao => (
                        <li key={versao.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <div><p className="font-medium text-gray-800">{versao.nome}</p><p className="text-sm text-gray-500">por {versao.autor} em {new Date(versao.data).toLocaleDateString('pt-BR')}</p></div>
                            <button className="text-sm text-blue-600 font-semibold hover:underline">Ver</button>
                        </li>
                    ))}
                </ul>
            ) : (<p className="text-center text-gray-500 mt-8">Nenhuma versão anterior foi encontrada para este contexto.</p>)}
        </div>
    );
};

const BotaoAba = ({ id, label, Icon, abaAtiva, setAbaAtiva }: { id: TipoAba; label: string; Icon: React.ElementType<LucideProps>; abaAtiva: TipoAba; setAbaAtiva: (aba: TipoAba) => void; }) => (
    <button onClick={() => setAbaAtiva(id)} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === id ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:bg-gray-50"}`}><Icon className="w-5 h-5 mr-2" /> {label}</button>
);

export function VisualizarContextoModal({ estaAberto, aoFechar, dadosDoContexto, aoCriarNovaVersao }: VisualizarContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    const [emTelaCheia, setEmTelaCheia] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

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
    
        const lidarComDownload = () => {
        if (!dadosDoContexto) return;
        if (dadosDoContexto.type === 'dashboard' && chartContainerRef.current) {
            const svg = chartContainerRef.current.querySelector('svg');
            if (svg) {
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                const svgData = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${dadosDoContexto.title}.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                console.error("Elemento SVG do gráfico não encontrado.");
                alert("Não foi possível baixar o gráfico. Tente novamente.");
            }
        } else if (dadosDoContexto.url) {
            const a = document.createElement('a');
            a.href = dadosDoContexto.url;
            a.download = dadosDoContexto.title || 'arquivo';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };
    
    if (!estaAberto || !dadosDoContexto) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                        <h2 className="text-2xl font-regular text-white truncate" title={dadosDoContexto.title}>{dadosDoContexto.title}</h2>
                    </div>
                    <button onClick={aoFechar} className="w-8 h-8 bg-white/20 text-white hover:bg-white/30 cursor-pointer rounded-full flex items-center justify-center transition-colors flex-shrink-0"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 px-8 pt-8 pb-4 flex flex-col min-h-0">
                    <div className="flex space-x-2 bg-gray-100 rounded-2xl p-2 flex-shrink-0 mb-6">
                        <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="versoes" label="Versões" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                    </div>

                    <div className="h-[60vh]">
                        {abaAtiva === 'detalhes' && <AbaDetalhes dados={dadosDoContexto} aoFazerDownload={lidarComDownload} aoAlternarTelaCheia={alternarTelaCheia} />}
                        {abaAtiva === 'versoes' && <AbaVersoes aoCriarNovaVersao={aoCriarNovaVersao} dados={dadosDoContexto}/>}
                    </div>
                </div>
            </div>

            {emTelaCheia && (
                 <div className="fixed inset-0 bg-gray-800 z-[60] flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center p-4 bg-white/10 text-white flex-shrink-0">
                        <h2 className="text-xl font-semibold">{dadosDoContexto.title || "Visualização"}</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.2))} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Diminuir Zoom"><ZoomOut className="w-6 h-6" /></button>
                            <button onClick={() => setZoomLevel(1)} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Resetar Zoom"><RotateCcw className="w-5 h-5" /></button>
                            <button onClick={() => setZoomLevel(prev => prev + 0.2)} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Aumentar Zoom"><ZoomIn className="w-6 h-6" /></button>
                        </div>
                        <button onClick={alternarTelaCheia} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Fechar Tela Cheia"><Minimize className="w-6 h-6" /></button>
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