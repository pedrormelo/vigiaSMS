// src/components/popups/visualizarContextoModal/visualizadorPDF.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Expand, FileText, AlertTriangle } from 'lucide-react';

interface VisualizadorPdfProps {
    url: string;
    emTelaCheia?: boolean;
    aoAlternarTelaCheia?: () => void;
    zoomLevel?: number;
}

export const VisualizadorPdf: React.FC<VisualizadorPdfProps> = ({ url, emTelaCheia = false, aoAlternarTelaCheia, zoomLevel = 1 }) => {
    const [numPaginas, setNumPaginas] = useState<number | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [pdfError, setPdfError] = useState<string | null>(null);

    // MELHORIA: Configura o worker dentro de um useEffect para garantir que só rode no cliente
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // Usa caminho absoluto para evitar falha de resolução em ambientes com basePath
                const workerUrl = `${window.location.origin}/pdf.worker.min.mjs`;
                pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
            }
        } catch (err) {
            console.error('Erro ao configurar worker do PDF:', err);
        }
    }, []);

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
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-4 animate-pulse" />
            <p className="text-xs sm:text-sm">Carregando pré-visualização...</p>
        </div>
    );

    const ErrorDisplay = () => (
        <div className="flex flex-col items-center justify-center h-full text-red-700 bg-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-4" />
            <p className="font-bold text-sm sm:text-base">Ocorreu um Erro</p>
            <p className="text-xs sm:text-sm text-center mt-1.5 sm:mt-2">{pdfError}</p>
        </div>
    );

    // Se não houver URL, evitamos inicializar o Document (origem do erro sendWithPromise)
    if (!url) {
        return (
            <div className="w-full h-full bg-gray-50 rounded-lg sm:rounded-2xl border border-gray-200 flex items-center justify-center p-3 sm:p-6 text-gray-600 text-xs sm:text-sm">
                Nenhum arquivo PDF disponível para esta versão.
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-100 rounded-lg sm:rounded-2xl flex flex-col relative group z-0">
            <div className="flex-1 overflow-auto flex justify-center p-1 sm:p-2 relative z-0">
                <Document
                    key={url}
                    file={url}
                    onLoadSuccess={aoCarregarDocumento}
                    onLoadError={aoFalharCarregamento}
                    loading={<Loader />}
                    error={<ErrorDisplay />}
                >
                    {!pdfError && (
                        <Page 
                            pageNumber={paginaAtual} 
                            scale={zoomLevel} 
                            renderTextLayer={!emTelaCheia}
                        />
                    )}
                </Document>
            </div>
            
            {!carregando && numPaginas && !pdfError && (
                <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-4 p-1.5 sm:p-2 bg-gray-200/50 backdrop-blur-sm rounded-b-lg sm:rounded-b-2xl border-t relative z-10">
                    <button onClick={paginaAnterior} disabled={paginaAtual <= 1} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-300 disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center">
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <p className="text-xs sm:text-sm font-medium">
                        Página {paginaAtual} de {numPaginas}
                    </p>
                    <button onClick={proximaPagina} disabled={paginaAtual >= numPaginas} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-300 disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            )}
            
            {!emTelaCheia && aoAlternarTelaCheia && !carregando && !pdfError && (
                <button
                    onClick={aoAlternarTelaCheia}
                    className="absolute bottom-14 sm:top-2 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full text-gray-700 hover:bg-white hover:text-gray-900 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all z-20 pointer-events-auto shadow-sm h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
                    title="Ver em tela cheia"
                >
                    <Expand className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            )}
        </div>
    );
};