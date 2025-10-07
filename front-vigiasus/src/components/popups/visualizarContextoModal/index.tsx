"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {ArrowLeft , Info, History, Eye, FileText, Plus, LucideProps, Link as LinkIcon, Download } from 'lucide-react';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';

// --- TIPOS E INTERFACES ---
interface DetalhesContexto {
    id: string;
    title: string;
    type: FileType;
    insertedDate: string;
    url?: string;
    payload?: any;
}

interface VisualizarContextoModalProps {
    estaAberto: boolean;
    aoFechar: () => void;
    dadosDoContexto: DetalhesContexto | null;
}

type TipoAba = 'conteudo' | 'detalhes' | 'versoes';

// --- DADOS DE EXEMPLO ---
const versoesMock = [
    { id: 3, nome: "Pagamento ESF e ESB - 2025 (v3).pdf", data: "2024-07-15", autor: "Ana" },
    { id: 2, nome: "Pagamento ESF e ESB - 2025 (v2).pdf", data: "2024-07-10", autor: "Carlos" },
    { id: 1, nome: "Pagamento ESF e ESB - 2025 (v1).pdf", data: "2024-06-23", autor: "Carlos" },
];

// --- SUB-COMPONENTES PARA AS ABAS ---

const AbaConteudo = ({ dados }: { dados: DetalhesContexto }) => {
    switch(dados.type) {
        case 'link':
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
                    <LinkIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Link Externo</h3>
                    <p className="text-gray-500 my-2 break-all">{dados.url}</p>
                    <a href={dados.url} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Abrir Link
                    </a>
                </div>
            );
        
        case 'dashboard':
            return (
                <div className="animate-fade-in h-full w-full">
                    {dados.payload ? (
                        <PrevisualizacaoGrafico 
                            tipoGrafico="chart"
                            conjuntoDeDados={dados.payload}
                            titulo={dados.title}
                            previsualizacaoGerada={true}
                        />
                    ) : (
                        <p>Dados do dashboard não disponíveis.</p>
                    )}
                </div>
            );
        
        case 'pdf':
            return (
                 <div className="animate-fade-in h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                    <iframe src={dados.url} width="100%" height="100%" title={dados.title}>
                        <p>O seu navegador não suporta a visualização de PDFs. <a href={dados.url} download>Clique aqui para baixar.</a></p>
                    </iframe>
                </div>
            );

        default: // Para excel, doc, etc.
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Pré-visualização não disponível</h3>
                    <p className="text-gray-500 my-2">A pré-visualização para ficheiros do tipo '{dados.type}' não é suportada diretamente.</p>
                    <a href={dados.url} download className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        <Download className="w-4 h-4" /> Baixar Ficheiro
                    </a>
                </div>
            );
    }
};

const AbaDetalhes = ({ dados }: { dados: DetalhesContexto }) => (
    <div className="space-y-4 animate-fade-in p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-xl font-semibold text-gray-700">Informações do Contexto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-600">
            <p><strong>ID do Documento:</strong> <span className="font-mono">{dados.id}</span></p>
            <p><strong>Tipo de Ficheiro:</strong> {dados.type.toUpperCase()}</p>
            <p><strong>Data de Inserção:</strong> {new Date(dados.insertedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
    </div>
);

const AbaVersoes = () => (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Histórico de Versões</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">
                <Plus className="w-4 h-4" /> Criar Nova Versão
            </button>
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

export function VisualizarContextoModal({ estaAberto, aoFechar, dadosDoContexto }: VisualizarContextoModalProps) {
    const [abaAtiva, setAbaAtiva] = useState<TipoAba>('conteudo');

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva('conteudo');
        }
    }, [estaAberto, dadosDoContexto]);

    if (!estaAberto || !dadosDoContexto) return null;

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl text-white">
                {/* Cabeçalho */}
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0 ">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-6 h-6 text-white flex-shrink-0" />
                        <h2 className="text-2xl font-medium text-white truncate" title={dadosDoContexto.title}>{dadosDoContexto.title}</h2>
                    </div>
                    <Button size="icon" variant="ghost" onClick={aoFechar} className="rounded-full hover:bg-white/20">
              <ArrowLeft className="text-white" />
            </Button>
                </div>


                {/* Corpo do Modal (Abas + Conteúdo) */}
                <div className="flex-1 px-8 pt-8 pb-4 flex flex-col min-h-0">
                    {/* Seletor de Abas (altura fixa) */}
                    <div className="flex space-x-2 bg-gray-100 rounded-2xl p-2 flex-shrink-0 mb-6">
                        <BotaoAba id="conteudo" label="Conteúdo" Icon={Eye} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="detalhes" label="Detalhes" Icon={Info} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                        <BotaoAba id="versoes" label="Versões" Icon={History} abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                    </div>

                    {/* Área de Conteúdo (ocupa o resto do espaço, com scroll se necessário) */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {abaAtiva === 'conteudo' && <AbaConteudo dados={dadosDoContexto} />}
                        {abaAtiva === 'detalhes' && <AbaDetalhes dados={dadosDoContexto} />}
                        {abaAtiva === 'versoes' && <AbaVersoes />}
                    </div>
                </div>
            </div>
        </div>
    );
}