// src/components/validar/ContextoTable.tsx
import React from "react";
import { Column, Contexto, StatusContexto } from "./typesDados";

interface Props {
    data: Contexto[];
    columns: Column<Contexto>[];
    onUpdate?: (id: string, novo: StatusContexto) => void;
}

export default function ContextoTable({ data, columns, onUpdate }: Props) {
    return (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-300">
            <table className="w-full text-left">
                {/* Cabeçalho da tabela */}
                <thead className="bg-blue-400">
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {/* Corpo da tabela */}
                <tbody className="divide-y divide-gray-200">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {columns.map((col) => (
                                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
                                    {col.render
                                        ? col.render(row, onUpdate)
                                        : (row[col.key as keyof Contexto] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}