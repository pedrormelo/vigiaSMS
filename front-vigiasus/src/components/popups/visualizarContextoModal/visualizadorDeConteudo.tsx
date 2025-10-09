"use client";

import React from 'react';
import { Link as LinkIcon, Download, FileText } from 'lucide-react';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import type { FileType } from '@/components/contextosCard/contextoCard';

/**
 * Propriedades para o componente VisualizadorDeConteudo.
 */
interface VisualizadorProps {
    tipo: FileType;
    url?: string;
    titulo: string;
    payload?: any; // Dados para dashboards (gráficos)
}

/**
 * Componente responsável por renderizar a visualização de diferentes tipos de conteúdo
 * dentro de um modal.
 */
export const VisualizadorDeConteudo: React.FC<VisualizadorProps> = ({ tipo, url, titulo, payload }) => {
    
    // Renderiza um componente de fallback para tipos de ficheiro sem pré-visualização.
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

    // Usa um switch para decidir qual visualização renderizar.
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
                            tipoGrafico="chart" // Pode ser dinâmico no futuro, se necessário
                            conjuntoDeDados={payload}
                            titulo={titulo}
                            previsualizacaoGerada={true}
                        />
                    ) : (
                        <p>Dados do dashboard não disponíveis para visualização.</p>
                    )}
                </div>
            );
        

        default: // Para 'excel', 'doc', 'resolucao', etc.
            return renderFallback();
    }
};