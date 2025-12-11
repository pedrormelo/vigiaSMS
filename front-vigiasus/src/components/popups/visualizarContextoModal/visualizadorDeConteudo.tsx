// src/components/popups/visualizarContextoModal/visualizadorDeConteudo.tsx
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Link as LinkIcon, Download, FileText, BarChart3, Presentation } from 'lucide-react';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import type { FileType } from '@/components/contextosCard/contextoCard';
import { VisualizadorIndicador } from './visualizadorIndicador';
import { DetalhesContexto, ConjuntoDeDadosGrafico } from '@/components/popups/addContextoModal/types';
import SpinnerCarregamento from '@/components/ui/spinner-carregamento';

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
    <SpinnerCarregamento
        mensagem={label}
        tamanho="medio"
        className="h-full min-h-[180px] bg-gray-50 rounded-lg sm:rounded-2xl border border-gray-100"
    />
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
        <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center border border-gray-100">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">Pré-visualização não disponível</h3>
            <p className="text-gray-500 my-1 sm:my-2 text-xs sm:text-sm max-w-xs mx-auto">
                {motivo || `O visualizador para ficheiros do tipo '${tipo}' não está disponível no momento.`}
            </p>
            {url && (
                <a href={url} download className="mt-3 sm:mt-6 flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Baixar Original</span><span className="sm:hidden">Baixar</span>
                </a>
            )}
        </div>
    );

    // Se não houver URL para tipos de arquivo, mostra erro específico
    if ((tipo === 'pdf' || tipo === 'doc' || tipo === 'planilha' || tipo === 'apresentacao') && !url) {
        return renderFallback("O arquivo solicitado não foi encontrado no servidor.");
    }

    switch (tipo) {
        case 'link':
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center">
                    <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-2 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700">Link Externo</h3>
                    <p className="text-gray-500 my-1 sm:my-2 break-all px-2 sm:px-4 text-xs sm:text-sm">{url}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                        Aceder ao Link
                    </a>
                </div>
            );

        case 'dashboard':
            const dadosDoDashboard = payload as ConjuntoDeDadosGrafico;
            if (!dadosDoDashboard) return renderFallback("Dados do gráfico não encontrados.");
            return (
                <div className="animate-fade-in h-full w-full flex flex-col">
                    <div className="w-full h-full min-h-[200px] sm:min-h-[300px] p-1 sm:p-2">
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
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-green-50/50 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center border border-green-100">
                    <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-2 sm:mb-4 opacity-80" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Ficheiro Excel</h3>
                    <p className="text-gray-600 my-1 sm:my-2 max-w-xs text-xs sm:text-sm">As planilhas devem ser baixadas para visualização completa.</p>
                    <a href={url} download className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors shadow-md text-xs sm:text-sm">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Baixar Planilha</span><span className="sm:hidden">Baixar</span>
                    </a>
                </div>
            );

        case 'apresentacao':
            return (
                <div className="animate-fade-in h-full flex flex-col items-center justify-center bg-amber-50/50 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center border border-amber-100">
                    <Presentation className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500 mb-2 sm:mb-4 opacity-80" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Apresentação</h3>
                    <p className="text-gray-600 my-1 sm:my-2 max-w-xs text-xs sm:text-sm">As apresentações devem ser baixadas para visualização completa.</p>
                    <a href={url} download className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 bg-amber-500 text-white font-medium rounded-full hover:bg-amber-600 transition-colors shadow-md text-xs sm:text-sm">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Baixar Apresentação</span><span className="sm:hidden">Baixar</span>
                    </a>
                </div>
            );

        default:
            return renderFallback();
    }
};