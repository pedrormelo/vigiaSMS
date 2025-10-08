// src/components/popups/visualizarContextoModal/index.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Info, History, Download, FileText, Plus, LucideProps } from 'lucide-react';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import IconeDocumento from '@/components/validar/iconeDocumento';

// --- TIPOS E INTERFACES ---
interface DetalhesContexto {
    id: string;
    title: string;
    type: FileType;
    insertedDate: string;
    url?: string;
    payload?: any;
    description?: string;
}

interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: DetalhesContexto | null;
    aoCriarNovaVersao?: (dados: DetalhesContexto) => void;
}

type TipoAba = 'detalhes' | 'versoes';

// --- DADOS DE EXEMPLO ---
const versoesMock = [
    { id: 3, nome: "Pagamento ESF e ESB - 2025 (v3).pdf", data: "2024-07-15", autor: "Ana" },
    { id: 2, nome: "Pagamento ESF e ESB - 2025 (v2).pdf", data: "2024-07-10", autor: "Carlos" },
    { id: 1, nome: "Pagamento ESF e ESB - 2025 (v1).pdf", data: "2024-06-23", autor: "Carlos" },
];

// --- SUB-COMPONENTE: Aba Detalhes ---
const AbaDetalhes = ({ dados, aoFazerDownload, chartContainerRef }: { dados: DetalhesContexto; aoFazerDownload: () => void; chartContainerRef: React.RefObject<HTMLDivElement>; }) => (
    <div className="space-y-6 animate-fade-in p-4">
        {/* Seção do Arquivo */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <IconeDocumento type={dados.type} />
                <div>
                    <p className="font-semibold text-gray-800">{dados.title}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <button onClick={aoFazerDownload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Baixar
            </button>
        </div>

        {/* Seção de Descrição */}
        {dados.description && (
             <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Descrição</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border">{dados.description}</p>
            </div>
        )}

        {/* Seção de Pré-visualização para Gráficos */}
        {dados.type === 'dashboard' && dados.payload && (
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pré-visualização do Gráfico</h3>
                {/* O 'ref' agora está neste 'div' que envolve o gráfico */}
                <div ref={chartContainerRef} className="h-[400px] w-full">
                     <PrevisualizacaoGrafico
                        tipoGrafico="chart"
                        conjuntoDeDados={dados.payload}
                        titulo={dados.title}
                        previsualizacaoGerada={true}
                    />
                </div>
            </div>
        )}
    </div>
);


// --- SUB-COMPONENTE: Aba Versões ---
const AbaVersoes = ({ aoCriarNovaVersao, dados }: { aoCriarNovaVersao?: (dados: DetalhesContexto) => void; dados: DetalhesContexto; }) => (
    <div className="animate-fade-in p-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
            {aoCriarNovaVersao && (
                <button
                    onClick={() => aoCriarNovaVersao(dados)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition"
                >
                    <Plus className="w-4 h-4" /> Criar Nova Versão
                </button>
            )}
        </div>
        <ul className="space-y-3">
            {versoesMock.map(versao => (
                <li key={versao.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors">
                    <div>
                        <p className="font-medium text-gray-800">{versao.nome}</p>
                        <p className="text-sm text-gray-500">por {versao.autor} em {new Date(versao.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button className="text-sm text-blue-600 font-semibold hover:underline">Ver</button>
                </li>
            ))}
        </ul>
    </div>
);

// --- SUB-COMPONENTE: Botão de Aba ---
interface BotaoAbaProps {
    id: TipoAba;
    label: string;
    Icon: React.ElementType<LucideProps>;
    abaAtiva: TipoAba;
    setAbaAtiva: (aba: TipoAba) => void;
}

const BotaoAba: React.FC<BotaoAbaProps> = ({ id, label, Icon, abaAtiva, setAbaAtiva }) => (
    <button onClick={() => setAbaAtiva(id)} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === id ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
        <Icon className="w-5 h-5 mr-2" /> {label}
    </button>
);


// --- COMPONENTE PRINCIPAL DO MODAL ---
export function VisualizarContextoModal({ estaAberto, aoFechar, dadosDoContexto, aoCriarNovaVersao }: VisualizarContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('detalhes');
    // Esta é a nossa nova ref, apontando para um simples elemento div
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('detalhes');
        }
    }, [estaAberto]);
    
    const lidarComDownload = () => {
        if (!dadosDoContexto) return;

        // Se for um gráfico, usamos a nossa nova ref
        if (dadosDoContexto.type === 'dashboard' && chartContainerRef.current) {
            // Procuramos pelo elemento SVG dentro do nosso div de referência
            const svg = chartContainerRef.current.querySelector('svg');
            
            if (svg) {
                // Adiciona o namespace XML necessário para o SVG ser válido
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
            // Para outros arquivos, o método continua o mesmo
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
            <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Cabeçalho */}
                <div className="px-8 py-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <h2 className="text-2xl font-semibold text-gray-800 truncate" title={dadosDoContexto.title}>{dadosDoContexto.title}</h2>
                    </div>
                    <button onClick={aoFechar} className="p-2 text-gray-500 hover:text-gray-800 cursor-pointer rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className="flex-1 px-8 pt-8 pb-4 flex flex-col min-h-0">
                    <div className="flex space-x-2 bg-gray-100 rounded-2xl p-2 flex-shrink-0 mb-6">
                        <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="versoes" label="Versões" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto py-2 pr-2">
                        {abaAtiva === 'detalhes' && <AbaDetalhes dados={dadosDoContexto} aoFazerDownload={lidarComDownload} chartContainerRef={chartContainerRef} />}
                        {abaAtiva === 'versoes' && <AbaVersoes aoCriarNovaVersao={aoCriarNovaVersao} dados={dadosDoContexto}/>}
                    </div>
                </div>
            </div>
        </div>
    );
}