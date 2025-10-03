// src/components/your-path/AddGraphModal.tsx

"use client";
import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { saveAs } from "file-saver";
import ManualDataEntryTable from "@/components/ui/tabelaAddContexto";

// Tipos e Interfaces
type GraphType = "pie" | "chart" | "line" | "bar";
interface ChartDataset {
    columns: string[];
    rows: (string | number)[][];
}

interface AddGraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (graph: {
        title: string;
        details: string;
        type: GraphType;
        dataFile?: File | null;
        dataset?: ChartDataset;
    }) => void;
}

export function AddGraphModal({ isOpen, onClose, onSubmit }: AddGraphModalProps) {
    // Estados do componente
    const [tab, setTab] = useState<"manual" | "upload">("manual");
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [type, setType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [dataset, setDataset] = useState<ChartDataset>({
        columns: ["Categoria", "Valor"],
        rows: [["", 0]],
    });

    // Funções de lógica
    const handleTypeChange = (t: GraphType) => {
        setType(t);
        if (t === "pie")
            setDataset({ columns: ["Categoria", "Atendimentos"], rows: [["", 0]] });
        if (t === "line")
            setDataset({ columns: ["Mês", "Alta", "Média", "Baixa"], rows: [["", 0, 0, 0]] });
        if (t === "bar" || t === "chart")
            setDataset({ columns: ["Faixa etária", "Cobertura Atual", "Meta"], rows: [["", 0, 0]] });
    };

    const downloadTemplate = () => {
        const header = dataset.columns.join(",") + "\n";
        const csv = header + dataset.rows.map((r: (string | number)[]) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${type}.csv`);
    };

    const addRow = () =>
        setDataset((d: ChartDataset) => ({ ...d, rows: [...d.rows, Array(d.columns.length).fill("")] }));

    const updateCell = (row: number, col: number, value: string) => {
        setDataset((d: ChartDataset) => {
            const rows = d.rows.map((r: (string | number)[], i: number) =>
                i === row ? r.map((c: string | number, j: number) => (j === col ? value : c)) : r
            );
            return { ...d, rows };
        });
    };

    const handleSubmit = () => {
        onSubmit({ title, details, type, dataFile, dataset });
        onClose();
    };

    const resetAndClose = () => {
        setTitle("");
        setDetails("");
        setType("pie");
        setDataFile(null);
        setDataset({ columns: ["Categoria", "Valor"], rows: [["", 0]] });
        onClose();
    };

    if (!isOpen) return null;

    // Renderização do componente
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
                {/* Cabeçalho */}
                <div className="bg-gradient-to-r from-blue-700 to-cyan-400 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Solicitar Nova Dashboard</h2>
                    <button onClick={resetAndClose} className="text-white hover:text-gray-200 rounded-full p-1 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo com Scroll */}
                <div className="overflow-y-auto max-h-[80vh]">
                    {/* Abas de Navegação */}
                    <div className="flex border-b border-gray-200">
                        <button className={`flex-1 py-3 text-center font-medium transition-colors ${tab === "manual" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`} onClick={() => setTab("manual")}>
                            Inserir Dados Manualmente
                        </button>
                        <button className={`flex-1 py-3 text-center font-medium transition-colors ${tab === "upload" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`} onClick={() => setTab("upload")}>
                            Carregar Dados de um Arquivo
                        </button>
                    </div>

                    {/* Conteúdo do Formulário */}
                    <div className="p-6 space-y-6">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Título do Contexto</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex.: Pagamentos ESF / ESB"
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Seleção do tipo de gráfico */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Selecionar Tipo de Gráfico</label>
                            <div className="flex gap-4">
                                {(["pie", "chart", "line", "bar"] as GraphType[]).map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => handleTypeChange(g)}
                                        className={`p-3 rounded-xl border flex items-center justify-center transition ${type === g ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                        title={g === "pie" ? "Pizza" : g === "chart" ? "Barras" : g === "line" ? "Linhas" : "Barra"}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Detalhes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes do Gráfico</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Descreva o contexto, período, etc."
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        {/* Campo de Upload (condicional) */}
                        {tab === "upload" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo CSV/Excel</label>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx"
                                    onChange={(e) => setDataFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border rounded-xl border-gray-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        )}

                        {/* Tabela de Inserção Manual (condicional, agora como um componente) */}
                        {tab === "manual" && (
                            <ManualDataEntryTable
                                dataset={dataset}
                                onUpdateCell={updateCell}
                                onAddRow={addRow}
                            />
                        )}
                    </div>
                </div>

                {/* Rodapé com Botões de Ação */}
                <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200">
                    <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Baixar template
                    </button>
                    <div className="flex gap-3">
                        <button onClick={resetAndClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}