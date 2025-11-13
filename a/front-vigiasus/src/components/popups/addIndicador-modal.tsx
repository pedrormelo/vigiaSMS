
"use client";

import { useState } from "react";
import { X, Paperclip, Link, Eye, Trash2, Plus, FilePlus2, FileX2, FileSymlink, LayoutDashboard } from "lucide-react";

interface ContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: unknown) => void;
}

export function ContextModal({ isOpen, onClose, onSubmit }: ContextModalProps) {
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [selectedFile, setSelectedFile] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            title,
            details,
            selectedFile,
        });
        setTitle("");
        setDetails("");
        setSelectedFile("");
        onClose();
    };

    const handleCancel = () => {
        setTitle("");
        setDetails("");
        setSelectedFile("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <FilePlus2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-regular text-white">Adicionar Novo Contexto</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-opacity-20 text-white hover:text-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Title Field */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Título do Contexto</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Coloque aqui um titulo para descrever o contexto (Não precisa ser o nome do arquivo!)"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* File Selection */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Selecionar Arquivo</label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                value={selectedFile}
                                onChange={(e) => setSelectedFile(e.target.value)}
                                placeholder="Nenhum Arquivo Selecionado"
                                className="flex-1 px-4 py-3 border cursor-pointer border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <button className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50 transition-colors" title="Anexar arquivo">
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50 transition-colors" title="Adicionar link">
                                <Link className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50 transition-colors" title="Visualizar">
                                <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-50 transition-colors" title="Remover">
                                <Trash2 className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Details Field */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Contexto</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Descreva aqui o contexto que você quer adicionar e o porque dele ser relevante."
                            rows={4}
                            className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-[#E0440E] border border-[#B22E00] cursor-pointer text-white rounded-2xl hover:bg-red-600 transition-colors flex items-center gap-2 font-bold"
                    >
                        <FileX2 className="w-6 h-6" />
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-500 cursor-pointer text-white rounded-2xl hover:bg-[#02B917] transition-colors flex items-center gap-2 font-bold"
                    >
                        <FileSymlink className="w-6 h-6" />
                        SUBMETER
                    </button>
                    <button className="px-6 py-2 bg-purple-500 cursor-pointer text-white rounded-2xl hover:bg-purple-600 transition-colors flex items-center gap-2 font-bold">
                        <LayoutDashboard className="w-6 h-6" />
                        DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
}
