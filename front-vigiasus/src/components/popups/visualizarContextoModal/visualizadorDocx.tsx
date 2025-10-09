"use client";

import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { FileWarning, Loader2, Expand } from 'lucide-react';

interface VisualizadorDocxProps {
    url: string;
    emTelaCheia?: boolean;
    aoAlternarTelaCheia?: () => void;
    zoomLevel?: number; // Prop para controlar o zoom
}

// Estilos para controlar o conteúdo renderizado e o zoom
const EstilosDocx = () => (
    <style>{`
        .docx-wrapper {
            background-color: transparent !important;
            padding: 0 !important;
        }
        /* Contêiner que aplica o zoom e sua origem */
        .docx-viewer-container {
            transform-origin: top center;
            transition: transform 0.2s ease-out;
        }
        /* Estilos para o conteúdo renderizado dentro do contêiner */
        .docx-viewer .docx-wrapper section.docx {
            width: 100% !important;
            padding: 2rem !important;
            min-height: auto !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
            background: white !important; /* Fundo branco para simular o papel */
        }
        .docx-viewer img, .docx-viewer svg {
            max-width: 100% !important;
            height: auto !important;
        }
        .docx-viewer table {
            width: 100% !important;
            table-layout: fixed;
            word-wrap: break-word;
        }
    `}</style>
);

export const VisualizadorDocx: React.FC<VisualizadorDocxProps> = ({ url, emTelaCheia = false, aoAlternarTelaCheia, zoomLevel = 1 }) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url || !viewerRef.current) return;

        const carregarDocumento = async () => {
            setLoading(true);
            setError(null);
            if (viewerRef.current) viewerRef.current.innerHTML = "";

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erro de rede: ${response.statusText}`);
                const blob = await response.blob();
                
                if (viewerRef.current) {
                    await renderAsync(blob, viewerRef.current, undefined, {
                        className: "docx-viewer",
                        inWrapper: true,
                        ignoreWidth: true,
                        ignoreHeight: true,
                    });
                }
            } catch (err: any) {
                console.error("Falha ao carregar ou renderizar DOCX:", err);
                setError(`Não foi possível pré-visualizar este arquivo. (Detalhe: ${err.message})`);
            } finally {
                setLoading(false);
            }
        };

        carregarDocumento();
    }, [url]);

    return (
        // O contêiner principal agora controla a rolagem
        <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col relative group border border-gray-200 overflow-auto">
            <EstilosDocx />
            {loading && (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    Carregando documento...
                </div>
            )}
            {error && (
                <div className="flex flex-col items-center justify-center h-full text-red-600 p-4 text-center">
                    <FileWarning className="w-12 h-12 mb-4" />
                    <p className="font-semibold">{error}</p>
                </div>
            )}
            
            {/* Contêiner para aplicar o zoom */}
            <div 
                style={{ transform: `scale(${zoomLevel})` }} 
                className={`docx-viewer-container ${loading || error ? 'hidden' : ''}`}
            >
                {/* O 'div' que renderiza o conteúdo fica aqui dentro */}
                <div ref={viewerRef} />
            </div>
            
            {/* Botão de Tela Cheia */}
            {!emTelaCheia && aoAlternarTelaCheia && !loading && !error && (
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