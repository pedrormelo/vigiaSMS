// src/components/popups/visualizarContextoModal/visualizadorDeConteudo.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkIcon, Download, FileText, Loader2, BarChart3 } from 'lucide-react';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { VisualizadorIndicador } from './visualizadorIndicador';
import { DetalhesContexto, ConjuntoDeDadosGrafico } from '@/components/popups/addContextoModal/types';

// Carregamento dinâmico para evitar peso inicial e erros de SSR
const VisualizadorPdf = dynamic(() => import('./visualizadorPDF').then(mod => mod.VisualizadorPdf), {
    ssr: false,
    loading: () => <LoadingState label="A carregar PDF..." />,
});

const VisualizadorDocx = dynamic(() => import('./visualizadorDocx').then(mod => mod.VisualizadorDocx), {
    ssr: false,
    loading: () => <LoadingState label="A carregar Documento..." />,
});

const LoadingState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <p>{label}</p>
    </div>
);

interface VisualizadorProps {
    tipo: FileType;
    url?: string;
    titulo: string;
    payload?: any;
    descricao?: string;
    chartType?: DetalhesContexto['chartType'];
    aoAlternarTelaCheia?: () => void;
    emTelaCheia?: boolean;
    zoomLevel?: number;
}

export const VisualizadorDeConteudo: React.FC<VisualizadorProps> = ({ tipo, url, titulo, payload, descricao, chartType, aoAlternarTelaCheia, emTelaCheia = false, zoomLevel = 1 }) => {

    const renderFallback = (motivo?: string) => (
        <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Pré-visualização não disponível</h3>
            <p className="text-gray-500 my-2 text-sm max-w-xs mx-auto">
                {motivo || `O visualizador para ficheiros do tipo '${tipo}' não está disponível no momento.`}
            </p>
            {url && (
                <a href={url} download className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm text-sm">
                    <Download className="w-4 h-4" /> Baixar Original
                </a>
            )}
        </div>
    );

    // Se não houver URL para tipos de arquivo, mostra erro específico
    if ((tipo === 'pdf' || tipo === 'doc' || tipo === 'planilha') && !url) {
        return renderFallback("O arquivo solicitado não foi encontrado no servidor.");
    }

    switch (tipo) {
        case 'link':
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 text-center">
                    <LinkIcon className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Link Externo</h3>
                    <p className="text-gray-500 my-2 break-all px-4">{url}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
                        Aceder ao Link
                    </a>
                </div>
            );

        case 'dashboard':
            const dadosDoDashboard = payload as ConjuntoDeDadosGrafico;
            if (!dadosDoDashboard) return renderFallback("Dados do gráfico não encontrados.");
            return (
                <div className="animate-fade-in h-full w-full flex flex-col">
                    <div className="w-full h-full min-h-[300px] p-2">
                        <PrevisualizacaoGrafico
                            tipoGrafico={chartType || 'chart'}
                            conjuntoDeDados={dadosDoDashboard}
                            titulo={titulo}
                            aoAlternarTelaCheia={aoAlternarTelaCheia}
                            emTelaCheia={emTelaCheia}
                        />
                    </div>
                </div>
            );

        case 'indicador':
            return (
                <div className="animate-fade-in h-full w-full flex items-center justify-center bg-gray-50/50">
                    {payload ? (
                        <VisualizadorIndicador
                            title={titulo}
                            description={descricao || payload.description}
                            valorAtual={payload.valorAtual}
                            unidade={payload.unidade}
                            textoComparativo={payload.textoComparativo}
                            cor={payload.cor}
                            icone={payload.icone}
                        />
                    ) : renderFallback("Dados do indicador incompletos.")}
                </div>
            );

        case 'pdf':
            return (
                <VisualizadorPdf
                    url={url!}
                    emTelaCheia={emTelaCheia}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                    zoomLevel={zoomLevel}
                />
            );

        case 'doc':
            return (
                <VisualizadorDocx
                    url={url!}
                    emTelaCheia={emTelaCheia}
                    aoAlternarTelaCheia={aoAlternarTelaCheia}
                    zoomLevel={zoomLevel}
                />
            );
        
        case 'planilha':
            // Para Excel, por enquanto mostramos fallback com download, pois preview web é complexo
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-green-50/50 rounded-2xl p-6 text-center border border-green-100">
                    <BarChart3 className="w-16 h-16 text-green-500 mb-4 opacity-80" />
                    <h3 className="text-xl font-semibold text-gray-800">Ficheiro Excel</h3>
                    <p className="text-gray-600 my-2 max-w-xs">As planilhas devem ser baixadas para visualização completa.</p>
                    <a href={url} download className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors shadow-md">
                        <Download className="w-4 h-4" /> Baixar Planilha
                    </a>
                </div>
            );

        default:
            return renderFallback();
    }
};