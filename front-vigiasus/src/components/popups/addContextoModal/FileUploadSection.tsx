import React from "react";
import { UploadCloud, Download } from "lucide-react";
import { FileUploadSectionProps } from "@/components/popups/addContextoModal/types";

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({ dataFile, setDataFile, onDownloadTemplate }) => (
    <div className="space-y-4">
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50/50 hover:border-blue-400 transition-all">
            <label htmlFor="chart-file-upload" className="cursor-pointer flex flex-col items-center text-blue-600">
                <UploadCloud className="w-10 h-10 mb-2 text-gray-400" />
                <span className="font-semibold">
                    {dataFile ? `Arquivo selecionado: ${dataFile.name}` : "Clique para carregar um arquivo (.csv)"}
                </span>
                <span className="text-sm text-gray-500 mt-1">Tamanho máximo: 5MB</span>
            </label>
            <input id="chart-file-upload" type="file" className="hidden" accept=".csv" onChange={(e) => setDataFile(e.target.files ? e.target.files[0] : null)} />
        </div>
        <button onClick={onDownloadTemplate} className="text-sm w-full flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium hover:underline transition-all">
            <Download className="w-4 h-4"/> Baixar template de exemplo
        </button>
    </div>
);