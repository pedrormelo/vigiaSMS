"use client";

import React from 'react';
import { Link as LinkIcon, Download, FileText } from 'lucide-react';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { VisualizadorPdf } from './visualizadorPDF';
import { VisualizadorDocx } from './visualizadorDocx';

interface VisualizadorProps {
    tipo: FileType;
    url?: string;
    titulo: string;
    payload?: any;
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
    zoomLevel?: number;
}

export const VisualizadorDeConteudo: React.FC<VisualizadorProps> = ({ tipo, url, titulo, payload, aoAlternarTelaCheia, emTelaCheia = false, zoomLevel = 1 }) => {
    
    const renderFallback = () => (
        <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Pré-visualização não disponível</h3>
            <p className="text-gray-500 my-2">A pré-visualização para ficheiros do tipo '{tipo}' não é suportada.</p>
            {url && (
                <a href={url} download className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4" /> Baixar Ficheiro
                </a>
            )}
        </div>
    );

    switch(tipo) {
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
            return (
                <div className="animate-fade-in h-full w-full">
                    {payload ? (
                        <PrevisualizacaoGrafico 
                            tipoGrafico="chart"
                            conjuntoDeDados={payload}
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