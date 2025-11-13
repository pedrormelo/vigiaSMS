// components/graph-type-selector.tsx
import React from "react";
import { ChartPie, ChartBar, ChartLine } from "lucide-react";

type GraphType = "pie" | "chart" | "line";

interface GraphTypeSelectorProps {
    selectedType: GraphType;
    onTypeChange: (type: GraphType) => void;
}

export function GraphTypeSelector({ selectedType, onTypeChange }: GraphTypeSelectorProps) {
    const graphTypes = [
        { key: "pie" as const, label: "Pizza", icon: ChartPie },
        { key: "chart" as const, label: "Barras", icon: ChartBar },
        { key: "line" as const, label: "Linhas", icon: ChartLine },
    ] as const;

    return (
        <div>
            <label className="block text-lg font-semibold text-blue-700 mb-3">
                Selecionar Tipo de Gráfico
            </label>
            <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {graphTypes.map((graph) => {
                        const Icon = graph.icon;
                        return (
                            <button
                                key={graph.key}
                                onClick={() => onTypeChange(graph.key)}
                                className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                                    selectedType === graph.key
                                        ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                                }`}
                                title={graph.label}
                            >
                                <Icon className="w-7 h-7 mb-1" />
                                <span className="text-sm font-medium">{graph.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}