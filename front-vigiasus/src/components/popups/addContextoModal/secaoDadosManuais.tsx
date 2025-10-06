import React from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { SecaoDadosManuaisProps } from "@/components/popups/addContextoModal/types";
import { EntradaTabelaDeDados } from "@/components/popups/addContextoModal/entradaTabelaDeDados";

export const SecaoDadosManuais: React.FC<SecaoDadosManuaisProps> = ({ 
    conjuntoDeDados, 
    aoAtualizarCelula, 
    aoAdicionarLinha, 
    aoRemoverLinha,
    aoAdicionarColuna,
    aoRemoverColuna,
    aoAtualizarNomeColuna
}) => {
    return (
        <div className="space-y-4">
            {/* PAINEL DE CONTROLE DAS SÉRIES (COLUNAS) */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Séries de Dados (Valores)
                    </h3>
                    <button 
                        onClick={aoAdicionarColuna} 
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition"
                    >
                        <Plus className="w-3 h-3" /> Adicionar Série
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conjuntoDeDados.colunas.slice(1).map((coluna, index) => (
                        <div 
                            key={index} 
                            className="flex items-center gap-2 bg-white p-1.5 rounded-lg border"
                        >
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <EntradaTabelaDeDados 
                                eCabecalho
                                valor={coluna} 
                                aoMudar={(valor) => aoAtualizarNomeColuna(index + 1, valor)}
                                placeholder={`Série ${index + 1}`}
                            />
                            {conjuntoDeDados.colunas.length > 2 && (
                                <button 
                                    onClick={() => aoRemoverColuna(index + 1)} 
                                    className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TABELA */}
            <div className="overflow-auto max-h-64 rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 text-left w-1/3 min-w-[200px]">
                                <EntradaTabelaDeDados 
                                    eCabecalho 
                                    valor={conjuntoDeDados.colunas[0]} 
                                    aoMudar={(valor) => aoAtualizarNomeColuna(0, valor)} 
                                    placeholder="Categoria"
                                    className="text-left"
                                />
                            </th>
                            {conjuntoDeDados.colunas.slice(1).map((coluna, index) => (
                                <th 
                                    key={index} 
                                    className="p-3 text-center min-w-[150px] font-medium text-gray-600"
                                >
                                    {coluna || `Série ${index + 1}`}
                                </th>
                            ))}
                            <th className="w-12 p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {conjuntoDeDados.linhas.map((linha, indiceLinha) => (
                            <tr key={indiceLinha} className="border-t border-gray-200 group">
                                <td className="p-2 w-1/3 min-w-[200px]">
                                    <EntradaTabelaDeDados 
                                        valor={linha[0]} 
                                        aoMudar={(valor) => aoAtualizarCelula(indiceLinha, 0, valor)} 
                                        placeholder="Ex: Janeiro"
                                    />
                                </td>
                                {linha.slice(1).map((celula, indiceCelula) => (
                                    <td key={indiceCelula} className="p-2 min-w-[150px]">
                                        <EntradaTabelaDeDados 
                                            valor={celula}
                                            aoMudar={(valor) => aoAtualizarCelula(indiceLinha, indiceCelula + 1, valor)} 
                                            placeholder="0"
                                            tipo="number"
                                        />
                                    </td>
                                ))}
                                <td className="w-12 text-center">
                                    {conjuntoDeDados.linhas.length > 1 && (
                                        <button 
                                            onClick={() => aoRemoverLinha(indiceLinha)} 
                                            className="text-gray-400 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* BOTÃO DE ADICIONAR LINHA */}
            <button 
                onClick={aoAdicionarLinha} 
                className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-gray-50 text-gray-700 font-semibold border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition"
            >
                <Plus className="w-4 h-4" /> Adicionar Categoria (Linha)
            </button>
        </div>
    );
};