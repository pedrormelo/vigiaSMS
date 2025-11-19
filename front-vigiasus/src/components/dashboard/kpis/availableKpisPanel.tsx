"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import type { IndicatorMetric } from "@/services/dashboardService";

interface AvailableKpisPanelProps {
    metrics: IndicatorMetric[];
    onSelect: (metric: IndicatorMetric) => void;
}

function buildSearchTarget(metric: IndicatorMetric) {
    const pieces = [metric.title, metric.gerenciaNome, metric.diretoriaNome, metric.descricao]
        .filter((part): part is string => !!part && part.trim().length > 0);
    return pieces.join(" ").toLowerCase();
}

function formatValue(metric: IndicatorMetric): string {
    const value = metric.valorAtualTexto || "0";
    const unit = metric.unidade?.trim();
    if (!unit) return value;
    if (["R$", "$", "€"].includes(unit)) {
        return `${unit} ${value}`;
    }
    return `${value} ${unit}`;
}

export function AvailableKpisPanel({ metrics, onSelect }: AvailableKpisPanelProps) {
    const [search, setSearch] = useState("");
    const enhancedMetrics = useMemo(() => {
        return metrics.map((metric) => ({
            metric,
            haystack: buildSearchTarget(metric)
        }));
    }, [metrics]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return enhancedMetrics
            .filter(({ haystack }) => {
                if (!query) return true;
                return haystack.includes(query);
            })
            .map(({ metric }) => metric);
    }, [enhancedMetrics, search]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-light text-blue-700">Indicadores disponíveis</h2>
                    <p className="text-sm text-slate-500">Escolha até 5 KPIs publicados para compor a vitrine da diretoria.</p>
                </div>
                <div className="min-w-[260px] md:w-80">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        onSearch={() => undefined}
                        placeholder="Pesquisar por título, gerência ou descrição"
                    />
                </div>
            </div>

            <div className="grid gap-4 max-h-[420px] overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((metric) => (
                    <button
                        key={metric.id}
                        type="button"
                        onClick={() => onSelect(metric)}
                        className="group text-left rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
                    >
                        <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                            {metric.gerenciaNome || "Gerência"}
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-slate-800 line-clamp-2">
                            {metric.title}
                        </h3>
                        {metric.descricao && (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                {metric.descricao}
                            </p>
                        )}
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">{formatValue(metric)}</span>
                            {metric.textoComparativo && (
                                <span className="text-xs font-medium text-emerald-600">
                                    {metric.textoComparativo}
                                </span>
                            )}
                        </div>
                        {metric.valorAlvoTexto && (
                            <div className="mt-2 text-xs text-slate-500">
                                Meta: {metric.valorAlvoTexto}
                            </div>
                        )}
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
                        <p className="text-sm">Nenhum indicador encontrado com os filtros atuais.</p>
                        <p className="text-xs">Ajuste a busca ou limpe os filtros para visualizar novamente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
