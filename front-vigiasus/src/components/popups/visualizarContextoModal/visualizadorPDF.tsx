"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Expand, FileText, AlertTriangle } from 'lucide-react';

// SOLUÇÃO DEFINITIVA: Apontamos para o arquivo worker local na pasta /public
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface VisualizadorPdfProps {
    url: string;
    emTelaCheia?: boolean;
    aoAlternarTelaCheia?: () => void;
}

export const VisualizadorPdf: React.FC<VisualizadorPdfProps> = ({ url, emTelaCheia = false, aoAlternarTelaCheia }) => {
    const [numPaginas, setNumPaginas] = useState<number | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [pdfError, setPdfError] = useState<string | null>(null);

    function aoCarregarDocumento({ numPages }: { numPages: number }) {
        setNumPaginas(numPages);
        setPaginaAtual(1);
        setCarregando(false);
    }

    function aoFalharCarregamento(error: Error) {
        console.error("Erro detalhado ao carregar PDF:", error);
        setPdfError(`Falha ao carregar o PDF. Detalhe: ${error.message}`);
        setCarregando(false);
    }

    function paginaAnterior() {
        setPaginaAtual(prev => Math.max(prev - 1, 1));
    }

    function proximaPagina() {
        setPaginaAtual(prev => Math.min(prev + 1, numPaginas || 1));
    }

    const Loader = () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="w-12 h-12 mb-4 animate-pulse" />
            <p>Carregando pré-visualização...</p>
        </div>
    );

    const ErrorDisplay = () => (
        <div className="flex flex-col items-center justify-center h-full text-red-700 bg-red-50 p-4 rounded-lg">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="font-bold">Ocorreu um Erro</p>
            <p className="text-sm text-center mt-2">{pdfError}</p>
        </div>
    );

    return (
        <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col relative group">
            <div className="flex-1 overflow-auto flex justify-center items-center p-4">
                <Document
                    file={url}
                    onLoadSuccess={aoCarregarDocumento}
                    onLoadError={aoFalharCarregamento}
                    loading={<Loader />}
                    error={<ErrorDisplay />}
                >
                    {!pdfError && (
                        <Page 
                            pageNumber={paginaAtual} 
                            width={emTelaCheia ? undefined : 450}
                            renderTextLayer={!emTelaCheia}
                        />
                    )}
                </Document>
            </div>
            
            {!carregando && numPaginas && !pdfError && (
                <div className="flex-shrink-0 flex items-center justify-center gap-4 p-2 bg-gray-200/50 backdrop-blur-sm rounded-b-2xl border-t">
                    <button onClick={paginaAnterior} disabled={paginaAtual <= 1} className="p-2 rounded-full hover:bg-gray-300 disabled:opacity-50">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <p className="text-sm font-medium">
                        Página {paginaAtual} de {numPaginas}
                    </p>
                    <button onClick={proximaPagina} disabled={paginaAtual >= numPaginas} className="p-2 rounded-full hover:bg-gray-300 disabled:opacity-50">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
            
            {!emTelaCheia && aoAlternarTelaCheia && !carregando && !pdfError && (
                <button
                    onClick={aoAlternarTelaCheia}
                    className="absolute top-2 right-2 p-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    title="Ver em tela cheia"
                >
                    <Expand className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};