// src/components/popups/addContextoModal/index.tsx
"use client";

import React from "react";
import { FilePlus2, LayoutDashboard, FileSymlink, Gauge, ArrowLeft } from "lucide-react";
import { ModalAdicionarConteudoProps } from "@/components/popups/addContextoModal/types";
import { useModalAdicionarConteudo } from "@/components/popups/addContextoModal/useAddContentModal";
import { AbaContexto } from "@/components/popups/addContextoModal/abaContexto";
import { AbaDashboard } from "@/components/popups/addContextoModal/abaDashboard";
import { AbaIndicador } from "@/components/popups/addContextoModal/abaIndicador";
import { AddLinkModal } from "@/components/popups/addContextoModal/addLinkModal";

const EstilosModal = () => (
    <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    `}</style>
);

export function ModalAdicionarConteudo(props: ModalAdicionarConteudoProps) {
    const {
        abaAtiva, setAbaAtiva,
        aoCancelar, aoSubmeter,
        submissaoDesativada,
        isNewVersionMode,
        ...retornosDoHook
    } = useModalAdicionarConteudo(props);

    if (!props.estaAberto) return null;

    return (
        <>
            <EstilosModal />
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                {/* Largura e altura consistentes para todas as abas */}
                <div className={`bg-white rounded-[20px] sm:rounded-[40px] w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl transition-all duration-300 overscroll-contain`}>

                    <header className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between rounded-t-[20px] sm:rounded-t-[40px] flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3">

                            {/* --- INÍCIO DA MODIFICAÇÃO --- */}
                            {/* O 'div' branco arredondado foi removido daqui. */}
                            {/* Os ícones agora são renderizados diretamente. */}
                            {abaAtiva === 'contexto' && <FilePlus2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                            {abaAtiva === 'dashboard' && <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                            {abaAtiva === 'indicador' && <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                            {/* --- FIM DA MODIFICAÇÃO --- */}

                            <h2 className="text-base sm:text-2xl font-regular text-white">
                                {isNewVersionMode ? 'Criar Nova Versão' : (
                                    abaAtiva === 'contexto' ? 'Adicionar Novo Contexto' :
                                        abaAtiva === 'dashboard' ? 'Criar Novo Dashboard' :
                                            'Adicionar Novo Indicador'
                                )}
                            </h2>
                        </div>
                        <button onClick={aoCancelar} className="w-11 h-11 sm:w-8 sm:h-8 bg-opacity-20 text-white hover:text-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-colors flex-shrink-0"><ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                    </header>

                    <div className="flex-1 p-3 sm:p-8 flex flex-col min-h-0 overflow-y-auto overscroll-contain">
                        {!isNewVersionMode && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-8 bg-gray-100 rounded-2xl p-2 flex-shrink-0">
                                <button onClick={() => setAbaAtiva("contexto")} className={`flex-1 h-11 sm:h-auto sm:py-3 px-4 sm:px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === "contexto" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><FilePlus2 className="w-5 h-5 mr-2" /> Contexto</button>
                                <button onClick={() => setAbaAtiva("dashboard")} className={`flex-1 h-11 sm:h-auto sm:py-3 px-4 sm:px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === "dashboard" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard</button>
                                <button onClick={() => setAbaAtiva("indicador")} className={`flex-1 h-11 sm:h-auto sm:py-3 px-4 sm:px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${abaAtiva === "indicador" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><Gauge className="w-5 h-5 mr-2" /> Indicador</button>
                            </div>
                        )}

                        <div className="flex-1 min-h-0">
                            {abaAtiva === 'contexto' && <AbaContexto {...retornosDoHook} isNewVersionMode={isNewVersionMode} />}
                            {abaAtiva === 'dashboard' && <AbaDashboard {...retornosDoHook} isNewVersionMode={isNewVersionMode} />}
                            {abaAtiva === 'indicador' && <AbaIndicador {...retornosDoHook} isNewVersionMode={isNewVersionMode} />}
                        </div>
                    </div>

                    <footer className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[20px] sm:rounded-b-[40px]">
                        <button onClick={aoCancelar} className="h-11 sm:h-auto px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-bold">Cancelar</button>
                        <button onClick={aoSubmeter} disabled={submissaoDesativada} className="h-11 sm:h-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <FileSymlink className="w-5 h-5" />
                            Submeter
                        </button>
                    </footer>
                </div>
            </div>
            {/* Modal de Link */}
            <AddLinkModal
                open={retornosDoHook.linkModalAberto}
                onClose={retornosDoHook.aoCancelarLink}
                onConfirm={retornosDoHook.aoConfirmarLink}
                initialUrl={retornosDoHook.urlContexto}
            />
        </>
    );
}