"use client";

import { X, Gauge, ArrowLeft } from "lucide-react";
import type { IndicatorMetric } from "@/services/dashboardService";
import { AvailableKpisPanel } from "@/components/dashboard/kpis/availableKpisPanel";

interface SelecioneKpiModalProps {
    open: boolean;
    onClose: () => void;
    metrics: IndicatorMetric[];
    onSelect: (metric: IndicatorMetric) => void;
}

export function SelecioneKpiModal({ open, onClose, metrics, onSelect }: SelecioneKpiModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl">
                <header className="flex items-center justify-between bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 text-white rounded-t-[40px] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl">
                            <Gauge className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold">Escolha indicadores</h2>
                            <p className="text-sm text-white/80">Selecione KPIs publicados para compor a vitrine desta diretoria.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0 flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto px-8 py-6">
                    <AvailableKpisPanel metrics={metrics} onSelect={onSelect} />
                </main>

                <footer className="flex justify-center bg-slate-50 px-8 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </button>
                </footer>
            </div>
        </div>
    );
}
