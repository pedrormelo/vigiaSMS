"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvailableGraphsPanel } from "@/components/dashboard/graficos-filterBar";

import { ChartCandlestick, FileChartPie, X } from 'lucide-react';

import type { GraphData } from "@/components/dashboard/dasboard-preview";
import React from "react";

interface SelecioneGraficoModalProps {
    open: boolean;
    onClose: () => void;
    graphs: GraphData[];
    onGraphSelect: (graph: GraphData) => void;
}

export function SelecioneGraficoModal({ open, onClose, graphs, onGraphSelect }: SelecioneGraficoModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <FileChartPie className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-regular text-white">Selecione um gráfico</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-opacity-20 text-white hover:text-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AvailableGraphsPanel graphs={graphs} onGraphSelect={onGraphSelect} />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-500 border border-red-700 cursor-pointer text-white rounded-2xl hover:bg-red-600 transition-colors flex items-center gap-2 font-bold"
                    >
                        <X className="w-6 h-6" />
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>
    );
}
