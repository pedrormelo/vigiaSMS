"use client";

import { useState } from "react";
import { X, Paperclip, Link, Eye, Trash2, Plus } from "lucide-react";

interface ContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between rounded-t-4xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Adicionar Novo Contexto</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título do Contexto</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Pagamentos ESF / ESB"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* File Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Arquivo</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={selectedFile}
                                onChange={(e) => setSelectedFile(e.target.value)}
                                placeholder="Nenhum Arquivo Selecionado"
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Anexar arquivo">
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Adicionar link">
                                <Link className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Visualizar">
                                <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Remover">
                                <Trash2 className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Details Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes do Contexto</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus auctor turpis et facilisis imperdiet, velit rutrum accumsan orci, vel fringilla lectus sapien et libero. Curabitur molestudae sem nec orci cursus, ut maximus mi tincidunt. Aliquam facilisis rutrum non mi suscipit, nec hendrerit libero dictum. Phasellus sollicitudin dui sed sapien tempus sit vulputate velit pretium."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-bold"
                    >
                        <X className="w-4 h-4" />
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        SUBMETER
                    </button>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-bold">
                        <Eye className="w-4 h-4" />
                        DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
}