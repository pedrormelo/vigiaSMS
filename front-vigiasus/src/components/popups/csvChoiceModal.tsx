// src/components/popups/csvChoiceModal.tsx
"use client";

import React from "react";
import { LayoutDashboard, FilePlus2, X } from "lucide-react";

interface CsvChoiceModalProps {
    estaAberto: boolean;
    arquivo: File | null;
    onDashboard: () => void;
    onContexto: () => void;
    onClose: () => void;
}

export function CsvChoiceModal({
    estaAberto,
    arquivo,
    onDashboard,
    onContexto,
    onClose,
}: CsvChoiceModalProps) {
    if (!estaAberto || !arquivo) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                        Como processar o arquivo?
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/20 text-white hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-3">
                    <p className="text-sm sm:text-base text-gray-700 mb-4">
                        Arquivo: <span className="font-semibold text-gray-900">{arquivo.name}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6">
                        Escolha como deseja processar este arquivo CSV:
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        {/* Dashboard Option */}
                        <button
                            onClick={onDashboard}
                            className="w-full p-4 sm:p-5 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                                        Dashboard
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Criar um dashboard com os dados do CSV
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Contexto Option */}
                        <button
                            onClick={onContexto}
                            className="w-full p-4 sm:p-5 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <FilePlus2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                                        Contexto Convencional
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Criar um contexto tradicional com os dados
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 rounded-b-2xl sm:rounded-b-3xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 sm:px-5 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: scale(0.95); } 
                    to { opacity: 1; transform: scale(1); } 
                }
                .animate-fade-in { 
                    animation: fadeIn 0.2s ease-out forwards; 
                }
            `}</style>
        </div>
    );
}
