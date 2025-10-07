import React, { useState } from "react";
import { UploadCloud, Download } from "lucide-react";
import { SecaoUploadArquivoProps } from "@/components/popups/addContextoModal/types";
import { showErrorToast } from "@/components/ui/Toasts";

export const SecaoUploadArquivo: React.FC<SecaoUploadArquivoProps> = ({ arquivoDeDados, setArquivoDeDados, aoBaixarModelo }) => {
    const [arrastandoSobre, setArrastandoSobre] = useState(false);

    const validarEProcessarArquivo = (arquivo: File | null) => {
        if (!arquivo) {
            return;
        }

        const LIMITE_TAMANHO_MB = 0.0001;
        const LIMITE_TAMANHO_BYTES = LIMITE_TAMANHO_MB * 1024 * 1024;

        if (arquivo.size > LIMITE_TAMANHO_BYTES) {
            showErrorToast("Arquivo muito grande", `O tamanho máximo permitido é de ${LIMITE_TAMANHO_MB} MB.`);
            setArquivoDeDados(null);
            return;
        }

        if (!arquivo.name.toLowerCase().endsWith('.csv')) {
            showErrorToast("Formato de arquivo inválido", "Por favor, selecione um arquivo no formato .csv.");
            setArquivoDeDados(null);
            return;
        }

        setArquivoDeDados(arquivo);
    };

    const aoAlterarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        validarEProcessarArquivo(e.target.files ? e.target.files[0] : null);
        e.target.value = '';
    };

    const aoArrastarSobre = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const aoEntrarNaArea = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setArrastandoSobre(true); };
    const aoSairDaArea = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setArrastandoSobre(false); };
    const aoSoltarArquivo = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setArrastandoSobre(false);
        const arquivo = e.dataTransfer.files?.[0] || null;
        validarEProcessarArquivo(arquivo);
    };

    return (
        <div className="space-y-4">
            <div 
                onDrop={aoSoltarArquivo}
                onDragOver={aoArrastarSobre}
                onDragEnter={aoEntrarNaArea}
                onDragLeave={aoSairDaArea}
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${arrastandoSobre ? 'border-blue-500 bg-blue-50 animate-pulse-border' : 'border-gray-300 bg-gray-50/50 hover:border-blue-400'}`}
            >
                <label htmlFor="chart-file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 mb-2 text-gray-400" />
                    <span className="font-semibold text-gray-700">
                        {arquivoDeDados ? `Arquivo selecionado: ${arquivoDeDados.name}` : "Arraste e solte o arquivo"}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                        ou <span className="text-blue-600 font-semibold">clique para selecionar (.csv)</span>
                    </span>
                    <span className="text-xs text-gray-400 mt-2">Tamanho máximo: 15 MB</span>
                </label>
                <input id="chart-file-upload" type="file" className="hidden" accept=".csv" onChange={aoAlterarArquivo} />
            </div>
            <button onClick={aoBaixarModelo} className="text-sm w-full flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium hover:underline transition-all">
                <Download className="w-4 h-4"/> Baixar template de exemplo
            </button>
        </div>
    );
};