// src/components/popups/visualizarContextoModal/visualizadorDeConteudo.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkIcon, Download, FileText, Loader2 } from 'lucide-react';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { VisualizadorDocx } from './visualizadorDocx';
import { VisualizadorIndicador } from './visualizadorIndicador';
import { DetalhesContexto, ConjuntoDeDadosGrafico } from '@/components/popups/addContextoModal/types';

const VisualizadorPdf = dynamic(() => import('./visualizadorPDF').then(mod => mod.VisualizadorPdf), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <p>A carregar visualizador de PDF...</p>
        </div>
    ),
});

interface VisualizadorProps {
    tipo: FileType;
    url?: string;
    titulo: string;
    payload?: any;
    chartType?: DetalhesContexto['chartType'];
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
    zoomLevel?: number;
}

export const VisualizadorDeConteudo: React.FC<VisualizadorProps> = ({ tipo, url, titulo, payload, chartType, aoAlternarTelaCheia, emTelaCheia = false, zoomLevel = 1 }) => {

    const renderFallback = () => (
        <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Pré-visualização não disponível</h3>
            <p className="text-gray-500 my-2">A pré-visualização para ficheiros do tipo '{tipo}' não é suportada.</p>
            {url && (
                <a href={url} download className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4" /> Baixar Ficheiro
                </a>
            )}
        </div>
    );

    switch (tipo) {
        case 'link':
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
                    <LinkIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Link Externo</h3>
                    <p className="text-gray-500 my-2 break-all">{url}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Abrir Link
                    </a>
                </div>
            );

        case 'dashboard':
            const dadosDoDashboard = payload as ConjuntoDeDadosGrafico;

            return (
                <div className="animate-fade-in h-full w-full">
                    {dadosDoDashboard ? (
                        <PrevisualizacaoGrafico
                            tipoGrafico={chartType || 'chart'}
                            conjuntoDeDados={dadosDoDashboard}
                            titulo={titulo}
                            previsualizacaoGerada={true}
                            aoAlternarTelaCheia={aoAlternarTelaCheia}
                            emTelaCheia={emTelaCheia}
                        />
                    ) : (
                        <p>Dados do dashboard não disponíveis para visualização.</p>
                    )}
                </div>
            );

        case 'indicador':
            return (
                <div className="animate-fade-in h-full w-full flex items-center justify-center">
                    {payload ? (
                        <VisualizadorIndicador
                            title={titulo}
                            description={payload.description}
                            valorAtual={payload.valorAtual}
                            unidade={payload.unidade}
                            textoComparativo={payload.textoComparativo}
                            cor={payload.cor}
                            icone={payload.icone}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl h-full">
                            <FileText className="w-12 h-12 text-yellow-500 mb-3" />
                            <h3 className="font-semibold text-yellow-700">Dados do Indicador Indisponíveis</h3>
                            <p className="text-sm text-yellow-600">Não foi possível carregar os detalhes para este indicador.</p>
                        </div>
                    )}
                </div>
            );

        case 'pdf':
            if (!url) return renderFallback();
            return (
                <VisualizadorPdf
                    url={url}
                    emTelaCheia={emTelaCheia}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                    zoomLevel={zoomLevel}
                />
            );

        case 'doc':
            if (!url) return renderFallback();
            return (
                <VisualizadorDocx
                    url={url}
                    emTelaCheia={emTelaCheia}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                    zoomLevel={zoomLevel}
                />
            );

        default:
            return renderFallback();
    }
};