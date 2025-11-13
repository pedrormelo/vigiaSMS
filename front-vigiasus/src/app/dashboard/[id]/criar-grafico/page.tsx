"use client";

import React, { useState } from "react";

import {
    ArrowLeft, FileX2, Download, FileSymlink, ChartPie, ChartBar, ChartLine
} from "lucide-react";

import { Button } from "@/components/button";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

import {
    ConfirmButton,
    CancelButton,
    CommentButton,
    DangerButton,
    WarningButton,
    SuccessButton,
    InfoButton,
    PurpleButton,
    EditButton,
    SaveButton,
} from "@/components/ui/action-buttons"


type GraphType = "pie" | "chart" | "line";

interface ChartDataset {
    columns: string[];
    rows: (string | number)[][];
}

interface NovoGraficoPageProps {
    onSubmit?: (graph: {
        title: string;
        details: string;
        type: GraphType;
        dataFile?: File | null;
        dataset?: ChartDataset;
    }) => void;
}

export default function NovoGraficoPage({ onSubmit }: NovoGraficoPageProps) {
    const router = useRouter();
    const [tab, setTab] = useState<"manual" | "upload">("manual");
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [type, setType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [dataset, setDataset] = useState<ChartDataset>({
        columns: ["Categoria", "Valor"],
        rows: [["", 0]],
    });

    // Change columns when type changes
    const handleTypeChange = (t: GraphType) => {
        setType(t);
        if (t === "pie")
            setDataset({ columns: ["Categoria", "Atendimentos"], rows: [["", 0]] });
        if (t === "line")
            setDataset({ columns: ["Mês", "Alta", "Média", "Baixa"], rows: [["", 0, 0, 0]] });
        if (t === "chart")
            setDataset({ columns: ["Faixa etária", "Cobertura Atual", "Meta"], rows: [["", 0, 0]] });
    };

    // Download template CSV
    const downloadTemplate = () => {
        const header = dataset.columns.join(",") + "\n";
        const csv = header + dataset.rows.map((r: (string | number)[]) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${type}.csv`);
    };

    const addRow = () =>
        setDataset((d: ChartDataset) => ({ ...d, rows: [...d.rows, Array(d.columns.length).fill("")] }));

    const removeRow = (index: number) =>
        setDataset((d: ChartDataset) => ({ ...d, rows: d.rows.filter((_, i) => i !== index) }));

    const addColumn = () => {
        const newColumnName = `Coluna ${dataset.columns.length + 1}`;
        setDataset((d: ChartDataset) => ({
            columns: [...d.columns, newColumnName],
            rows: d.rows.map(row => [...row, ""]),
        }));
    };

    const removeColumn = (colIndex: number) => {
        if (dataset.columns.length <= 1) return; // Manter pelo menos uma coluna
        setDataset((d: ChartDataset) => ({
            columns: d.columns.filter((_, i) => i !== colIndex),
            rows: d.rows.map(row => row.filter((_, i) => i !== colIndex)),
        }));
    };

    const updateColumnName = (index: number, newName: string) => {
        setDataset((d: ChartDataset) => ({
            ...d,
            columns: d.columns.map((col, i) => (i === index ? newName : col)),
        }));
    };

    const updateCell = (row: number, col: number, value: string) => {
        setDataset((d: ChartDataset) => {
            const rows = d.rows.map((r: (string | number)[], i: number) =>
                i === row ? r.map((c: string | number, j: number) => (j === col ? value : c)) : r
            );
            return { ...d, rows };
        });
    };

    const handleSubmit = () => {
        const graphData = {
            title,
            details,
            type,
            dataFile,
            dataset,
        };

        if (onSubmit) {
            onSubmit(graphData);
        } else {
            console.log("Novo gráfico:", graphData);
            // Aqui você pode adicionar lógica para salvar na API
        }

        // Redirecionar de volta ou mostrar sucesso
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    //const graphIcons = {
      //  "pie-icon": () => (
//<ChartPie className="h-9 w-9 text-white"></ChartPie>
     //   ),
     //   "bar-icon": () => (
//<ChartBar className="h-9 w-9 text-white"></ChartBar>
       // ),
//"line-icon": () => (
       //     <ChartLine className="h-9 w-9 text-white"></ChartLine>
     //   ),
   // };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar
                    </button>
                    <h1 className="text-4xl font-bold text-blue-700 mb-2">Criar Novo Gráfico</h1>
                    <p className="text-gray-600">Insira manualmente os dados ou faça upload de um arquivo compatível</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-8 bg-gray-100 rounded-2xl p-2">
                        <button
                            onClick={() => setTab("manual")}
                            className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${tab === "manual"
                                ? "bg-white text-blue-600 shadow-md"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            <FileX2 className="w-5 h-5 inline mr-2" />
                            Inserir Dados Manualmente
                        </button>
                        <button
                            onClick={() => setTab("upload")}
                            className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${tab === "upload"
                                ? "bg-white text-blue-600 shadow-md"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            <FileSymlink className="w-5 h-5 inline mr-2" />
                            Carregar Dados de um Arquivo
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6 mb-8">
                        {/* Título */}
                        <div>
                            <label className="block text-lg font-semibold text-blue-700 mb-2">
                                Título do Gráfico
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex.: Atendimentos de Alta vs Média e Baixa complexidade"
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Seleção do tipo de gráfico */}
                        <div>
                            <label className="block text-lg font-semibold text-blue-700 mb-3">
                                Selecionar Tipo de Gráfico
                            </label>
                            <div className="flex justify-center">
                                {/** Simpler, more maintainable graph type selection with icon components **/}
                                {(() => {
                                    const graphTypes = [
                                        { key: "pie", label: "Pizza", icon: ChartPie },
                                        { key: "chart", label: "Barras", icon: ChartBar },
                                        { key: "line", label: "Linhas", icon: ChartLine },
                                    ] as const;
                                    return (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {graphTypes.map((g) => {
                                                const Icon = g.icon;
                                                return (
                                                    <button
                                                        key={g.key}
                                                        onClick={() => handleTypeChange(g.key as GraphType)}
                                                        className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${type === g.key
                                                            ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                                                            : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                                                            }`}
                                                        title={g.label}
                                                    >
                                                        <Icon className="w-7 h-7 mb-1" />
                                                        <span className="text-sm font-medium">{g.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}

                            </div>
                        </div>

                        {/* Detalhes */}
                        <div>
                            <label className="block text-lg font-semibold text-blue-700 mb-2">
                                Detalhes do Gráfico
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Descreva o contexto, período, fonte dos dados, etc."
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                            />
                        </div>

                        {/* Upload CSV/Excel quando na aba de upload */}
                        {tab === "upload" && (
                            <div>
                                <label className="block text-lg font-semibold text-blue-700 mb-2">
                                    Arquivo CSV/Excel
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => setDataFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-blue-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <div className="mt-3 flex justify-start">
                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-2xl transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Baixar template CSV
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tabela dinâmica para dados manuais */}
                        {tab === "manual" && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-lg font-semibold text-blue-700">
                                        Dados do Gráfico
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addColumn}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-2xl hover:bg-green-200 transition-colors text-sm font-medium"
                                        >
                                            + Coluna
                                        </button>
                                        <button
                                            onClick={addRow}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-colors text-sm font-medium"
                                        >
                                            + Linha
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto bg-gray-50 rounded-3xl p-4">
                                    <table className="w-full border-collapse">
                                        {/* Header Row */}
                                        <thead>
                                            <tr>
                                                {dataset.columns.map((col: string, cIdx: number) => (
                                                    <th key={`header-${cIdx}`} className="p-2">
                                                        <div className="flex flex-col">
                                                            <input
                                                                type="text"
                                                                value={col}
                                                                onChange={(e) => updateColumnName(cIdx, e.target.value)}
                                                                className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-2xl font-semibold text-blue-800 text-center"
                                                                placeholder="Nome da coluna"
                                                            />
                                                            {dataset.columns.length > 1 && (
                                                                <button
                                                                    onClick={() => removeColumn(cIdx)}
                                                                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                                                                >
                                                                    Remover
                                                                </button>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="p-2 w-16"></th>
                                            </tr>
                                        </thead>
                                        {/* Data Rows */}
                                        <tbody>
                                            {dataset.rows.map((row: (string | number)[], rIdx: number) => (
                                                <tr key={`row-${rIdx}`}>
                                                    {row.map((cell: string | number, cIdx: number) => (
                                                        <td key={`cell-${rIdx}-${cIdx}`} className="p-2">
                                                            <input
                                                                type="text"
                                                                value={cell}
                                                                onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                                placeholder="Valor"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="p-2">
                                                        {dataset.rows.length > 1 && (
                                                            <button
                                                                onClick={() => removeRow(rIdx)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                                                                title="Remover linha"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-2xl transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar template
                        </button>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="px-8 py-3 text-gray-600 rounded-2xl border-gray-300 hover:bg-gray-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-blue-600 rounded-2xl hover:bg-blue-700 text-white"
                                disabled={!title.trim() && (tab === "upload" && !dataFile) || (tab === "manual" && dataset.rows.length === 0)}
                            >
                                Salvar Gráfico
                            </Button>

                            {/* Example Usage Scenarios */}
                            <div className=" gap-6">
                                {/* Form Example */}
                                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 p-6 space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Exemplo: Formulário</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Paciente</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Digite o nome"
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <CancelButton size="sm">Cancelar</CancelButton>
                                            <SaveButton size="sm">Salvar</SaveButton>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar Example */}
                                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 p-6 space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Exemplo: Barra de Ações</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <EditButton size="sm">Editar</EditButton>
                                        <InfoButton size="sm">Detalhes</InfoButton>
                                        <CommentButton size="sm">Comentar</CommentButton>
                                        <WarningButton size="sm">Alertar</WarningButton>
                                        <DangerButton size="sm">Excluir</DangerButton>
                                        <ConfirmButton size="sm">Confirmar</ConfirmButton>
                                        <SuccessButton size="sm">Aprovar</SuccessButton>
                                        <PurpleButton size="sm">Custom</PurpleButton>

                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
        </main>
    );
}
