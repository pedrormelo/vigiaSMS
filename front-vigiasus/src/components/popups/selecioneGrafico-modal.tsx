"use client";

import { FileChartPie, X } from "lucide-react";
import type { GraphData } from "@/components/dashboard/dasboard-preview";
import { AvailableGraphsPanel } from "@/components/dashboard/graficos-filterBar";

interface SelecioneGraficoModalProps {
    open: boolean;
    onClose: () => void;
    graphs: GraphData[];
    onGraphSelect: (graph: GraphData) => void;
}

export function SelecioneGraficoModal({ open, onClose, graphs, onGraphSelect }: SelecioneGraficoModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
            <div className="relative flex max-h-[95vh] md:max-h-[92vh] w-full max-w-sm md:max-w-5xl flex-col overflow-hidden rounded-2xl md:rounded-[40px] bg-white shadow-2xl">
                <header className="flex items-start md:items-center justify-between bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-4 md:px-8 py-3 md:py-4 text-white rounded-t-2xl md:rounded-t-[40px] flex-shrink-0 gap-2">
                    <div className="flex items-start md:items-center gap-2 md:gap-3 flex-1">
                        <div className="flex h-8 md:h-10 w-8 md:w-10 items-center justify-center rounded-lg md:rounded-2xl flex-shrink-0">
                            <FileChartPie className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-2xl font-semibold">Selecione um Gráfico</h2>
                            <p className="text-xs md:text-sm text-white/80">Escolha dashboards publicados para preencher o layout desta diretoria.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 md:w-9 md:h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-lg md:rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
                    <AvailableGraphsPanel graphs={graphs} onGraphSelect={onGraphSelect} />
                </main>
            </div>
        </div>
    );
}
