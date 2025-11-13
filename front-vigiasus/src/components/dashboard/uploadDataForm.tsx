// components/file-upload-section.tsx
import React from "react";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

interface FileUploadSectionProps {
    dataFile: File | null;
    setDataFile: (file: File | null) => void;
    dataset: {
        columns: string[];
        rows: (string | number)[][];
    };
    onDownloadTemplate: () => void;
}

export function FileUploadSection({
    dataFile,
    setDataFile,
    dataset,
    onDownloadTemplate
}: FileUploadSectionProps) {
    return (
        <div className="space-y-6">
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
                        onClick={onDownloadTemplate}
                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-2xl transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar template CSV
                    </button>
                </div>
            </div>

            {/* Preview do arquivo selecionado */}
            {dataFile && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-green-700 font-medium">
                        Arquivo selecionado: {dataFile.name}
                    </p>
                    <p className="text-green-600 text-sm">
                        Tamanho: {(dataFile.size / 1024).toFixed(2)} KB
                    </p>
                </div>
            )}
        </div>
    );
}