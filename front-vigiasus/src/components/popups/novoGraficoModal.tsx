"use client";

import React, { useState, useEffect } from "react";
import { X, FileX2, FileSymlink, Download } from "lucide-react";
import { Button } from "@/components/button";
import { saveAs } from "file-saver";
import { FileUploadSection } from "@/components/dashboard/uploadDataForm";
import { ManualDataSection } from "@/components/dashboard/manualDataForm";
import { GraphTypeSelector } from "@/components/dashboard/graficoType";

type GraphType = "pie" | "chart" | "line";

interface ChartDataset {
    columns: string[];
    rows: (string | number)[][];
}

interface NovoGraficoModalProps {
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

export function NovoGraficoModal({ isOpen, onClose, onSubmit }: NovoGraficoModalProps) {
    const [tab, setTab] = useState<"manual" | "upload">("manual");
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [type, setType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [dataset, setDataset] = useState<ChartDataset>({
        columns: ["Categoria", "Valor"],
        rows: [["", 0]],
    });

    // Reseta o estado quando o modal é fechado
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setTitle("");
                setDetails("");
                setType("pie");
                setDataFile(null);
                setDataset({ columns: ["Categoria", "Valor"], rows: [["", 0]] });
                setTab("manual");
            }, 200); // Atraso para evitar piscar de conteúdo
        }
    }, [isOpen]);

    const handleTypeChange = (t: GraphType) => {
        setType(t);
        if (t === "pie") setDataset({ columns: ["Categoria", "Atendimentos"], rows: [["", 0]] });
        if (t === "line") setDataset({ columns: ["Mês", "Alta", "Média", "Baixa"], rows: [["", 0, 0, 0]] });
        if (t === "chart") setDataset({ columns: ["Faixa etária", "Cobertura Atual", "Meta"], rows: [["", 0, 0]] });
    };

    const downloadTemplate = () => {
        const header = dataset.columns.join(",") + "\n";
        const csv = header + dataset.rows.map((r: (string | number)[]) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${type}.csv`);
    };

    const addRow = () => setDataset((d) => ({ ...d, rows: [...d.rows, Array(d.columns.length).fill("")] }));
    const removeRow = (index: number) => setDataset((d) => ({ ...d, rows: d.rows.filter((_, i) => i !== index) }));
    const addColumn = () => setDataset((d) => ({ ...d, columns: [...d.columns, `Coluna ${d.columns.length + 1}`], rows: d.rows.map(row => [...row, ""]) }));
    const removeColumn = (colIndex: number) => {
        if (dataset.columns.length <= 1) return;
        setDataset((d) => ({ columns: d.columns.filter((_, i) => i !== colIndex), rows: d.rows.map(row => row.filter((_, i) => i !== colIndex)) }));
    };
    const updateColumnName = (index: number, newName: string) => setDataset((d) => ({ ...d, columns: d.columns.map((col, i) => (i === index ? newName : col)) }));
    const updateCell = (row: number, col: number, value: string) => {
        setDataset((d) => ({ ...d, rows: d.rows.map((r, i) => i === row ? r.map((c, j) => (j === col ? value : c)) : r) }));
    };

    const handleSubmit = () => {
        const graphData = { title, details, type, dataFile, dataset };
        onSubmit(graphData);
        onClose(); // Fecha o modal após o envio
    };

    const handleCancel = () => {
        onClose(); // Apenas fecha o modal
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Cabeçalho do Modal */}
                <header className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-700">Criar Novo Gráfico</h1>
                        <p className="text-gray-600">Insira manualmente os dados ou faça upload de um arquivo.</p>
                    </div>
                    <button onClick={handleCancel} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Corpo do Modal (com rolagem) */}
                <main className="p-8 overflow-y-auto">
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-8 bg-gray-100 rounded-2xl p-2">
                        <button onClick={() => setTab("manual")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${tab === "manual" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}>
                            <FileX2 className="w-5 h-5 inline mr-2" /> Inserir Dados Manualmente
                        </button>
                        <button onClick={() => setTab("upload")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${tab === "upload" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}>
                            <FileSymlink className="w-5 h-5 inline mr-2" /> Carregar Dados de um Arquivo
                        </button>
                    </div>

                    {/* Campos do Formulário */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-blue-700 mb-2">Título do Gráfico</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Atendimentos de Alta vs Média e Baixa complexidade" className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <GraphTypeSelector selectedType={type} onTypeChange={handleTypeChange} />
                        <div>
                            <label className="block text-lg font-semibold text-blue-700 mb-2">Detalhes do Gráfico</label>
                            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Descreva o contexto, período, fonte dos dados, etc." rows={4} className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all" />
                        </div>
                        {tab === "upload" ? (
                            <FileUploadSection dataFile={dataFile} setDataFile={setDataFile} dataset={dataset} onDownloadTemplate={downloadTemplate} />
                        ) : (
                            <ManualDataSection dataset={dataset} graphType={type} title={title} onAddColumn={addColumn} onAddRow={addRow} onRemoveColumn={removeColumn} onRemoveRow={removeRow} onUpdateColumnName={updateColumnName} onUpdateCell={updateCell} />
                        )}
                    </div>
                </main>

                {/* Rodapé do Modal */}
                <footer className="flex justify-between items-center p-6 border-t border-gray-200 flex-shrink-0 bg-white/50 rounded-b-3xl">
                    <button onClick={downloadTemplate} className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-2xl transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Baixar template
                    </button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel} className="px-8 py-3 text-gray-600 rounded-2xl border-gray-300 hover:bg-gray-50">
                            Cancelar
                        </Button>
                        <Button variant="default" onClick={handleSubmit} className="px-8 py-3 bg-blue-600 rounded-2xl hover:bg-blue-700 text-white" disabled={!title.trim() && (tab === "upload" && !dataFile) || (tab === "manual" && dataset.rows.length === 0)}>
                            Salvar Gráfico
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
}