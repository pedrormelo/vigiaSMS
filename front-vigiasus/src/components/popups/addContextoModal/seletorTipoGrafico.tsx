import React from "react";
import { SeletorTipoGraficoProps, TipoGrafico, TIPOS_GRAFICOS } from "@/components/popups/addContextoModal/types";

// ---  NOME DO COMPONENTE E PROPS ---
export const SeletorTipoGrafico: React.FC<SeletorTipoGraficoProps> = ({ tipoSelecionado, aoMudarTipo }) => (
    <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
        <div className="grid grid-cols-3 gap-4">
            {(Object.keys(TIPOS_GRAFICOS) as TipoGrafico[]).map((tipo) => {
                const { Icon, rotulo } = TIPOS_GRAFICOS[tipo];
                return (
                    <button key={tipo} onClick={() => aoMudarTipo(tipo)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${tipoSelecionado === tipo ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : "border-gray-200 text-gray-600 bg-gray-50/50 hover:text-blue-400 hover:border-blue-400"}`}>
                        <Icon className="w-8 h-8 mb-2" />
                        <span className="font-semibold">{rotulo}</span>
                    </button>
                );
            })}
        </div>
    </div>
);