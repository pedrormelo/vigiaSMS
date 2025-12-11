"use client";

import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { FileWarning, Loader2, Expand } from 'lucide-react';

interface VisualizadorDocxProps {
    url: string;
    emTelaCheia?: boolean;
    aoAlternarTelaCheia?: () => void;
    zoomLevel?: number;
}

const EstilosDocx = () => (
    <style>{`
        .docx-wrapper { background-color: transparent !important; padding: 0 !important; }
        .docx-viewer-container { transform-origin: top center; transition: transform 0.2s ease-out; }
        .docx-viewer .docx-wrapper section.docx { width: 100% !important; padding: 2rem !important; min-height: auto !important; box-shadow: none !important; margin-bottom: 0 !important; background: white !important; }
        .docx-viewer img, .docx-viewer svg { max-width: 100% !important; height: auto !important; }
        .docx-viewer table { width: 100% !important; table-layout: fixed; word-wrap: break-word; }
    `}</style>
);

export const VisualizadorDocx: React.FC<VisualizadorDocxProps> = ({ url, emTelaCheia = false, aoAlternarTelaCheia, zoomLevel = 1 }) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url) return;
        let active = true;

        const carregarDocumento = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erro ${response.status}: Ficheiro não encontrado`);
                const contentType = response.headers.get('Content-Type')?.toLowerCase() || '';
                const isPpt = contentType.includes('presentation') || url.toLowerCase().includes('.ppt') || url.toLowerCase().includes('.pptx');
                if (isPpt) throw new Error('Apresentação não é visualizada aqui; faça o download.');
                const blob = await response.blob();
                
                if (active && viewerRef.current) {
                    viewerRef.current.innerHTML = ""; // Limpa anterior
                    await renderAsync(blob, viewerRef.current, undefined, {
                        className: "docx-viewer",
                        inWrapper: true,
                        ignoreWidth: true,
                        ignoreHeight: true,
                    });
                }
            } catch (err: any) {
                if (active) {
                    console.error("Falha DOCX:", err);
                    setError("Erro ao carregar documento. Verifique se o arquivo existe.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        carregarDocumento();
        return () => { active = false; };
    }, [url]);

    return (
        <div className="w-full h-full bg-gray-50 rounded-lg sm:rounded-2xl flex flex-col relative group border border-gray-200 overflow-hidden">
            <EstilosDocx />
            
            <div className="flex-1 overflow-auto scrollbar-custom p-1.5 sm:p-2 md:p-4 flex justify-center">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-1.5 sm:gap-2">
                        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 animate-spin text-blue-500" />
                        <span className="text-xs sm:text-sm">Processando documento...</span>
                    </div>
                )}
                
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-red-600 p-3 sm:p-4 text-center">
                        <FileWarning className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-50" />
                        <p className="font-medium text-xs sm:text-sm">{error}</p>
                    </div>
                )}
                
                <div 
                    style={{ transform: `scale(${zoomLevel})` }} 
                    className={`docx-viewer-container w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl transition-opacity duration-300 ${loading || error ? 'opacity-0 absolute' : 'opacity-100'}`}
                >
                    <div ref={viewerRef} />
                </div>
            </div>
            
            {!emTelaCheia && aoAlternarTelaCheia && !loading && !error && (
                <button
                    onClick={aoAlternarTelaCheia}
                    className="absolute bottom-12 sm:top-2 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full text-gray-600 hover:bg-white hover:text-gray-900 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shadow-sm h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
                    title="Expandir"
                >
                    <Expand className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            )}
        </div>
    );
};