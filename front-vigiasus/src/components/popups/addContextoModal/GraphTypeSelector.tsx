import React from "react";
import { GraphTypeSelectorProps, GraphType, GRAPH_TYPES } from "./types";

export const GraphTypeSelector: React.FC<GraphTypeSelectorProps> = ({ selectedType, onTypeChange }) => (
    <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
        <div className="grid grid-cols-3 gap-4">
            {(Object.keys(GRAPH_TYPES) as GraphType[]).map((type) => {
                const { Icon, label } = GRAPH_TYPES[type];
                return (
                    <button key={type} onClick={() => onTypeChange(type)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedType === type ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : "border-gray-200 bg-gray-50/50 hover:border-blue-400"}`}>
                        <Icon className="w-8 h-8 mb-2" />
                        <span className="font-semibold">{label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);