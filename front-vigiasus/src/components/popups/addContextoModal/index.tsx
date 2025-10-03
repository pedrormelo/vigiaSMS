"use client";

import React from "react";
import { X, FilePlus2, LayoutDashboard, FileSymlink } from "lucide-react";
import { AddContentModalProps } from "./types";
import { useAddContentModal } from "./useAddContentModal";
import { ContextoTab } from "./ContextoTab";
import { DashboardTab } from "./DashboardTab";

const ModalStyles = () => (
    <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes pulse-border {
          0% { border-color: #3B82F6; }
          50% { border-color: #93C5FD; }
          100% { border-color: #3B82F6; }
        }
        .animate-pulse-border {
          animation: pulse-border 1.5s ease-in-out infinite;
        }
    `}</style>
);

export function AddContentModal(props: AddContentModalProps) {
    const {
        activeTab, setActiveTab,
        handleCancel, handleSubmit,
        isSubmitDisabled,
        ...hookReturns
    } = useAddContentModal(props);

    if (!props.isOpen) return null;

    return (
        <>
            <ModalStyles />
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`bg-white rounded-[40px] w-full ${activeTab === 'dashboard' ? 'max-w-7xl' : 'max-w-4xl'} max-h-[90vh] flex flex-col shadow-2xl transition-all duration-300`}>
                    
                    {/* CABEÇALHO (Altura Fixa) */}
                    <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-opacity-20 rounded-lg flex items-center justify-center">
                                {activeTab === 'contexto' ? <FilePlus2 className="w-6 h-6 text-white" /> : <LayoutDashboard className="w-6 h-6 text-white" />}
                            </div>
                            <h2 className="text-2xl font-regular text-white">{activeTab === 'contexto' ? 'Adicionar Novo Contexto' : 'Criar Novo Dashboard'}</h2>
                        </div>
                        <button onClick={handleCancel} className="w-8 h-8 bg-opacity-20 text-white hover:text-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    {/* ÁREA DE CONTEÚDO PRINCIPAL */}
                    <div className="flex-1 p-8 pt-0 flex flex-col overflow-hidden">
                        {/* SELETOR DE ABAS (Altura Fixa) */}
                        <div className="flex space-x-2 my-8 bg-gray-100 rounded-2xl p-2 flex-shrink-0">
                            <button onClick={() => setActiveTab("contexto")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${activeTab === "contexto" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><FilePlus2 className="w-5 h-5 mr-2" /> Contexto (Arquivo/Link)</button>
                            <button onClick={() => setActiveTab("dashboard")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${activeTab === "dashboard" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard (Gráfico)</button>
                        </div>
                        
                        {/* CONTÊINER FINAL PARA A ABA ATIVA */}
                        <div className="flex-1 min-h-0">
                            {activeTab === 'contexto' ? (
                                <ContextoTab {...hookReturns} />
                            ) : (
                                <DashboardTab {...hookReturns} />
                            )}
                        </div>
                    </div>

                    {/* RODAPÉ (Altura Fixa) */}
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                        <button onClick={handleCancel} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-bold">Cancelar</button>
                        <button onClick={handleSubmit} disabled={isSubmitDisabled} className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                            <FileSymlink className="w-5 h-5" />
                            {activeTab === 'contexto' ? 'Salvar Contexto' : 'Salvar Dashboard'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}