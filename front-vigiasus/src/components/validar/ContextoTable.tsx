// src/components/validar/ContextoTable.tsx
import React from "react";
import { Column, Contexto, StatusContexto } from "./typesDados";
import { Inbox, LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
}

interface Props {
    data: Contexto[];
    columns: Column<Contexto>[];
    onRowClick?: (row: Contexto) => void; 
    onUpdate?: (id: string, novo: StatusContexto) => void;
    // Nova prop opcional para personalizar a mensagem de vazio
    emptyState?: EmptyStateProps;
    containerId?: string;
    headerIdMap?: Partial<Record<string, string>>;
}

export default function ContextoTable({ data, columns, onRowClick, onUpdate, emptyState, containerId, headerIdMap }: Props) {
    // Configuração padrão (para a página de pendências)
    const defaultEmptyState = {
        title: "Tudo limpo por aqui!",
        description: "Não há solicitações pendentes no momento.",
        icon: Inbox
    };

    const activeEmptyState = emptyState || defaultEmptyState;
    const Icon = activeEmptyState.icon || Inbox;

    return (
        <div
            className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-custom bg-white rounded-3xl border border-gray-300"
            id={containerId}
        > 
            <table className="w-full text-left border-collapse">
                <thead className="bg-blue-400 sticky top-0 z-10"> 
                    <tr>
                        {columns.map((col) => {
                            const key = String(col.key);
                            return (
                                <th
                                    key={key}
                                    className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                    id={headerIdMap?.[key]}
                                >
                                {col.header}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200">
                    {data.length === 0 ? (
                        /* Estado Vazio Dinâmico */
                        <tr>
                            <td colSpan={columns.length} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <Icon className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-lg font-medium text-gray-600">{activeEmptyState.title}</p>
                                    <p className="text-sm">{activeEmptyState.description}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => {
                            // Key composta: usa ID + versão (ou index como fallback) para evitar duplicação quando o mesmo contexto aparece com versões diferentes
                            const versaoId = row.versoes?.[0]?.dbId || row.versoes?.[0]?.id || index;
                            const uniqueKey = `${row.id}-${versaoId}`;
                            
                            return (
                                <tr 
                                    key={uniqueKey} 
                                    className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-middle">
                                            {col.render
                                                ? col.render(row, onUpdate)
                                                : (row[col.key as keyof Contexto] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}