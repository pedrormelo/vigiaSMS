import React from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { ManualDataSectionProps } from "./types";
import { DataTableInput } from "./DataTableInput";

export const ManualDataSection: React.FC<ManualDataSectionProps> = ({ 
    dataset, 
    onUpdateCell, 
    onAddRow, 
    onRemoveRow,
    onAddColumn,
    onRemoveColumn,
    onUpdateColumnName
}) => {
    return (
        <div className="space-y-4">
            {/* PAINEL DE CONTROLE DAS SÉRIES (COLUNAS) - Sem alterações */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Séries de Dados (Valores)</h3>
                    <button 
                        onClick={onAddColumn} 
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition"
                    >
                        <Plus className="w-3 h-3" /> Adicionar Série
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dataset.columns.slice(1).map((col, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border">
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <DataTableInput 
                                isHeader
                                value={col} 
                                onChange={(value) => onUpdateColumnName(index + 1, value)}
                                placeholder={`Série ${index + 1}`}
                            />
                            {dataset.columns.length > 2 && (
                                <button 
                                    onClick={() => onRemoveColumn(index + 1)} 
                                    className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TABELA DE DADOS COM ROLAGEM INTERNA */}
            <div className="rounded-lg border border-gray-200 bg-white">
                {/* MUDANÇA: A tabela agora é dividida em duas partes: Cabeçalho Fixo e Corpo Rolável */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left w-1/3 min-w-[200px]">
                                    <DataTableInput 
                                        isHeader 
                                        value={dataset.columns[0]} 
                                        onChange={(value) => onUpdateColumnName(0, value)} 
                                        placeholder="Categoria"
                                        className="text-left"
                                    />
                                </th>
                                {dataset.columns.slice(1).map((col, index) => (
                                    <th key={index} className="p-3 text-center min-w-[150px] font-medium text-gray-600">
                                        {col || `Série ${index + 1}`}
                                    </th>
                                ))}
                                <th className="w-12 p-3"></th>
                            </tr>
                        </thead>
                    </table>
                </div>
                {/* MUDANÇA: O corpo da tabela (tbody) agora está dentro de uma div com altura fixa e rolagem */}
                <div className="overflow-auto max-h-48"> {/* <-- AQUI ESTÁ A MÁGICA! */}
                    <table className="w-full text-sm">
                        <tbody>
                            {dataset.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-t border-gray-200 group">
                                    {/* As células (td) precisam ter a mesma largura das colunas do cabeçalho (th) */}
                                    <td className="p-2 w-1/3 min-w-[200px]">
                                        <DataTableInput 
                                            value={row[0]} 
                                            onChange={(value) => onUpdateCell(rIdx, 0, value)} 
                                            placeholder="Ex: Janeiro"
                                        />
                                    </td>
                                    {row.slice(1).map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2 min-w-[150px]">
                                            <DataTableInput 
                                                value={cell}
                                                onChange={(value) => onUpdateCell(rIdx, cIdx + 1, value)} 
                                                placeholder="0"
                                                type="number"
                                            />
                                        </td>
                                    ))}
                                    <td className="w-12 text-center">
                                        {dataset.rows.length > 1 && (
                                            <button onClick={() => onRemoveRow(rIdx)} className="text-gray-400 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BOTÃO DE ADICIONAR LINHA - Sem alterações */}
            <button 
                onClick={onAddRow} 
                className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-gray-50 text-gray-700 font-semibold border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition"
            >
                <Plus className="w-4 h-4" /> Adicionar Categoria (Linha)
            </button>
        </div>
    );
};