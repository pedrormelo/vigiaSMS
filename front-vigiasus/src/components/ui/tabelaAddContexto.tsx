// src/components/ui/tabelaAddContexto.tsx

import React from "react";
import { Plus } from "lucide-react";

// Tipos para as props que o componente vai receber
interface ChartDataset {
    columns: string[];
    rows: (string | number)[][];
}

interface ManualDataEntryTableProps {
    dataset: ChartDataset;
    onUpdateCell: (row: number, col: number, value: string) => void;
    onAddRow: () => void;
}

export default function ManualDataEntryTable({
    dataset,
    onUpdateCell,
    onAddRow,
}: ManualDataEntryTableProps) {
    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                    <tr>
                        {dataset.columns.map((c: string, i: number) => (
                            <th
                                key={i}
                                scope="col"
                                className="px-6 py-3 font-medium tracking-wider"
                            >
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {dataset.rows.map((row: (string | number)[], rIdx: number) => {
                        const normalizedRow = [...row];
                        while (normalizedRow.length < dataset.columns.length) {
                            normalizedRow.push("");
                        }

                        return (
                            <tr
                                key={rIdx}
                                className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                            >
                                {normalizedRow.map((cell: string | number, cIdx: number) => (
                                    <td key={cIdx} className="px-6 py-2">
                                        <input
                                            className="w-full bg-transparent p-2 text-center outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 rounded-md"
                                            value={cell}
                                            onChange={(e) =>
                                                onUpdateCell(rIdx, cIdx, e.target.value)
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="p-2 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={onAddRow}
                    className="w-full text-sm px-3 py-2 bg-blue-50 text-blue-700 font-semibold border border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Adicionar Nova Linha
                </button>
            </div>
        </div>
    );
}