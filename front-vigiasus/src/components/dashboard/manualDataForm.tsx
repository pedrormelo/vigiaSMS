"use client";

import React, { useMemo, FC } from "react";
import { Plus, Trash2, Settings, BarChart3, Database } from "lucide-react";
import { StatsCard } from "@/components/ui/cardGrafico";
import { DataTableInput } from "@/components/ui/dataTable";
import { ChartPreview } from "@/components/dashboard/previaGrafico";

// As interfaces de props do componente principal não mudam
interface ManualDataSectionProps {
    dataset: {
        columns: string[];
        rows: (string | number)[][];
    };
    graphType: "pie" | "chart" | "line";
    title: string;
    onAddColumn: () => void;
    onAddRow: () => void;
    onRemoveColumn: (index: number) => void;
    onRemoveRow: (index: number) => void;
    onUpdateColumnName: (index: number, name: string) => void;
    onUpdateCell: (row: number, col: number, value: string) => void;
}

// ============================================================================
// 🔹 1. SUB-COMPONENTE: PREVIEW E ESTATÍSTICAS (Sem alterações)
// ============================================================================
interface DashboardPreviewProps {
    graphType: ManualDataSectionProps['graphType'];
    dataset: ManualDataSectionProps['dataset'];
    title: string;
    filledDataCount: number;
}

const DashboardPreview: FC<DashboardPreviewProps> = ({ graphType, dataset, title, filledDataCount }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-4 shadow-md">
            <ChartPreview graphType={graphType} dataset={dataset} title={title} />
        </div>
        <div className="grid grid-cols-3 gap-4">
            <StatsCard value={dataset.columns.length} label="Colunas" color="blue" icon={<Database className="w-4 h-4" />} />
            <StatsCard value={dataset.rows.length} label="Linhas" color="green" icon={<BarChart3 className="w-4 h-4" />} />
            <StatsCard value={filledDataCount} label="Dados" color="purple" icon={<Settings className="w-4 h-4" />} />
        </div>
    </div>
);

// ============================================================================
// 🔹 2. SUB-COMPONENTE: CONTROLES DA TABELA (Atualizado)
// ============================================================================
interface TableControlsProps {
    onAddColumn: () => void;
    onAddRow: () => void; // Adicionamos a prop onAddRow aqui
}

const TableControls: FC<TableControlsProps> = ({ onAddColumn, onAddRow }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Estrutura de Dados
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Adicione ou remova linhas e colunas para montar sua tabela.
                </p>
            </div>
            {/* MUDANÇA: Agrupamos os botões de adicionar aqui */}
            <div className="flex gap-3">
                <button
                    onClick={onAddRow}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Linha
                </button>
                <button
                    onClick={onAddColumn}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Coluna
                </button>
            </div>
        </div>
    </div>
);

// ============================================================================
// 🔹 3. SUB-COMPONENTE: TABELA INTERATIVA (Atualizado)
// ============================================================================
interface InteractiveTableProps {
    dataset: ManualDataSectionProps['dataset'];
    filledDataCount: number;
    getColumnIcon: (index: number) => string;
    onUpdateColumnName: (index: number, name: string) => void;
    onRemoveColumn: (index: number) => void;
    onUpdateCell: (row: number, col: number, value: string) => void;
    onRemoveRow: (index: number) => void;
    // onAddRow foi removido daqui
}

const InteractiveTable: FC<InteractiveTableProps> = ({
    dataset,
    filledDataCount,
    getColumnIcon,
    onUpdateColumnName,
    onRemoveColumn,
    onUpdateCell,
    onRemoveRow,
}) => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    {/* ... O thead da tabela permanece o mesmo ... */}
                    <tr>
                        {dataset.columns.map((col, cIdx) => (
                            <th key={`header-${cIdx}`} className="p-4 relative group text-center min-w-[200px]">
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="text-lg">{getColumnIcon(cIdx)}</span>
                                        <DataTableInput value={col} onChange={(value) => onUpdateColumnName(cIdx, value)} placeholder={`Coluna ${cIdx + 1}`} className="font-semibold text-blue-900 bg-white border-blue-200" />
                                    </div>
                                    {dataset.columns.length > 1 && (
                                        <button onClick={() => onRemoveColumn(cIdx)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Remover coluna">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className="p-4 w-20 text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {/* ... O tbody da tabela permanece o mesmo ... */}
                    {dataset.rows.map((row, rIdx) => (
                        <tr key={`row-${rIdx}`} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 transition-colors group">
                            {row.map((cell, cIdx) => (
                                <td key={`cell-${rIdx}-${cIdx}`} className="p-3">
                                    <DataTableInput value={cell} onChange={(value) => onUpdateCell(rIdx, cIdx, value)} placeholder={cIdx === 0 ? "Rótulo" : "Valor"} type={cIdx === 0 ? "text" : "number"} />
                                </td>
                            ))}
                            <td className="p-3 text-center">
                                {dataset.rows.length > 1 && (
                                    <button onClick={() => onRemoveRow(rIdx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100" title="Remover linha">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                {/* MUDANÇA: Rodapé simplificado, apenas para informações */}
                <tfoot className="bg-gray-50 border-t">
                    <tr>
                        <td colSpan={dataset.columns.length + 1} className="px-6 py-4 text-sm text-gray-600">
                            {dataset.rows.length} linha(s) • {filledDataCount} dados preenchidos
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
);


// ============================================================================
// 🔹 COMPONENTE PRINCIPAL (ORQUESTRADOR - Atualizado)
// ============================================================================
export function ManualDataSection(props: ManualDataSectionProps) {
    const { dataset } = props;

    const filledDataCount = useMemo(() => {
        return dataset.rows.reduce((total, row) => total + row.filter((cell) => cell !== "").length, 0);
    }, [dataset.rows]);

    const getColumnIcon = (index: number) => {
        const icons = ["📊", "📈", "🎯", "🔢", "⭐"];
        return icons[index % icons.length];
    };

    return (
        <div className="space-y-8">
            <DashboardPreview
                graphType={props.graphType}
                dataset={props.dataset}
                title={props.title}
                filledDataCount={filledDataCount}
            />
            {/* MUDANÇA: Passamos onAddRow e onAddColumn para o TableControls */}
            <TableControls 
                onAddRow={props.onAddRow}
                onAddColumn={props.onAddColumn} 
            />
            {/* MUDANÇA: InteractiveTable não precisa mais da prop onAddRow */}
            <InteractiveTable
                dataset={props.dataset}
                filledDataCount={filledDataCount}
                getColumnIcon={getColumnIcon}
                onUpdateColumnName={props.onUpdateColumnName}
                onRemoveColumn={props.onRemoveColumn}
                onUpdateCell={props.onUpdateCell}
                onRemoveRow={props.onRemoveRow}
            />
        </div>
    );
}