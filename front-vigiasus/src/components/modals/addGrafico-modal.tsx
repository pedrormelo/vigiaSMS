"use client";

import { useState } from "react";
import { X, FileX2, FileSymlink } from "lucide-react";

type GraphType = "pie" | "chart" | "line";

interface AddGraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (graph: {
        title: string;
        details: string;
        type: GraphType;
        dataFile?: File | null;
    }) => void;
}

export function AddGraphModal({ isOpen, onClose, onSubmit }: AddGraphModalProps) {
    const [tab, setTab] = useState<"manual" | "upload">("manual");
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [type, setType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({ title, details, type, dataFile });
        setTitle("");
        setDetails("");
        setType("pie");
        setDataFile(null);
        onClose();
    };

    const resetAndClose = () => {
        setTitle("");
        setDetails("");
        setType("pie");
        setDataFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-cyan-400 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Solicitar Nova Dashboard</h2>
                    <button
                        onClick={resetAndClose}
                        className="text-white hover:text-gray-200 rounded-full p-1 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 text-center font-medium ${tab === "manual" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                        onClick={() => setTab("manual")}
                    >
                        Inserir Dados Manualmente
                    </button>
                    <button
                        className={`flex-1 py-3 text-center font-medium ${tab === "upload" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                            }`}
                        onClick={() => setTab("upload")}
                    >
                        Carregar Dados de um Arquivo
                    </button>
                </div>

                {/* Body */}
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
                            {(["pie", "chart", "line"] as GraphType[]).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setType(g)}
                                    className={`p-3 rounded-xl border flex items-center justify-center transition ${type === g ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    title={g === "pie" ? "Pizza" : g === "chart" ? "Barras" : "Linhas"}
                                >
                                    {g === "pie" && <span className="material-icons">pie_chart</span>}
                                    {g === "chart" && <span className="material-icons">bar_chart</span>}
                                    {g === "line" && <span className="material-icons">show_chart</span>}
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

                    {/* Upload CSV/Excel quando na aba de upload */}
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
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 px-6 py-4 bg-gray-50">
                    <button
                        onClick={resetAndClose}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 font-semibold"
                    >
                        <FileX2 className="w-5 h-5" />
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 font-semibold"
                    >
                        <FileSymlink className="w-5 h-5" />
                        Submeter
                    </button>
                </div>
            </div>
        </div>
    );
}
