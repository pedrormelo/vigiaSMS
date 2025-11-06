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
        // --- INÍCIO DA CORREÇÃO ---
        // Adicionado: 
        // 1. max-h-[600px] (limita a altura em 600 pixels)
        // 2. overflow-y-auto (adiciona a barra de rolagem vertical quando necessário)
        // 3. scrollbar-custom (aplica o estilo de rolagem personalizado do app)
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-custom bg-white rounded-3xl border border-gray-300"> 
        {/* --- FIM DA CORREÇÃO --- */}
            
            {/* Adicionado sticky top-0 para o cabeçalho */}
            <table className="w-full text-left">
                {/* Cabeçalho da tabela */}
                <thead className="bg-blue-400 sticky top-0 z-10"> 
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