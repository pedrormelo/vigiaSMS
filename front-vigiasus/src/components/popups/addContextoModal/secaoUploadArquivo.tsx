// src/components/popups/addContextoModal/secaoUploadArquivo.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";
import { SecaoUploadArquivoProps } from "@/components/popups/addContextoModal/types";
import { showErrorToast, showWarningToast, showSuccessToast } from "@/components/ui/Toasts";
import { uploadAndParseCsv } from "@/services/csvUploadService";
import { useGlobalDragDrop } from "@/components/providers/globalDragDropProvider";

// ATUALIZADO: Apenas CSV para upload de dashboard
const DASHBOARD_ACCEPT_STRING = ".csv";
const DASHBOARD_ALLOWED_EXTENSIONS = [".csv"];
const LIMITE_TAMANHO_MB = 5; 
const LIMITE_TAMANHO_BYTES = LIMITE_TAMANHO_MB * 1024 * 1024;

interface SecaoUploadArquivoExtendedProps extends SecaoUploadArquivoProps {
    aoProcessarDataset?: (dataset: any, avisos: string[]) => void;
}

export const SecaoUploadArquivo: React.FC<SecaoUploadArquivoExtendedProps> = ({ 
    arquivoDeDados, 
    setArquivoDeDados, 
    aoBaixarModelo,
    aoProcessarDataset
}) => {
    const [arrastandoSobre, setArrastandoSobre] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const dragCountRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { onDrop, removeDropZone } = useGlobalDragDrop();
    const dropZoneIdRef = useRef<string>('');

    const validarEProcessarArquivo = useCallback(async (arquivo: File | null) => {
        if (!arquivo) {
            return;
        }

        if (arquivo.size > LIMITE_TAMANHO_BYTES) {
            showErrorToast("Arquivo muito grande", `O tamanho máximo permitido é de ${LIMITE_TAMANHO_MB} MB.`);
            setArquivoDeDados(null);
            return;
        }

        const extensao = "." + arquivo.name.split('.').pop()?.toLowerCase();
        if (!DASHBOARD_ALLOWED_EXTENSIONS.includes(extensao)) {
            showErrorToast("Formato de arquivo inválido", "Por favor, selecione um arquivo .csv");
            setArquivoDeDados(null);
            return;
        }

        setArquivoDeDados(arquivo);
        
        // Auto-processar o arquivo após validação
        if (aoProcessarDataset) {
            setCarregando(true);
            try {
                const { dataset, avisos } = await uploadAndParseCsv(arquivo);
                
                // Exibir avisos
                if (avisos && avisos.length > 0) {
                    avisos.forEach(aviso => showWarningToast("CSV Info", aviso));
                }
                
                // Chamar callback com dados processados
                aoProcessarDataset(dataset, avisos);
                showSuccessToast("Arquivo processado", `${dataset.colunas.length} colunas e ${dataset.linhas.length} linhas carregadas.`);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo';
                showErrorToast("Erro ao processar CSV", message);
                setArquivoDeDados(null);
            } finally {
                setCarregando(false);
            }
        }
    }, [aoProcessarDataset, setArquivoDeDados]);

    const aoAlterarArquivo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        validarEProcessarArquivo(e.target.files ? e.target.files[0] : null);
        e.target.value = '';
    }, [validarEProcessarArquivo]);

    // Drag and drop handlers com counter para evitar bugss
    const aoEntrarNaArea = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current++;
        setArrastandoSobre(true);
    }, []);

    const aoSairDaArea = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current--;
        if (dragCountRef.current === 0) {
            setArrastandoSobre(false);
        }
    }, []);

    const aoArrastarSobre = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const aoSoltarArquivo = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current = 0;
        setArrastandoSobre(false);
        
        // Extrai arquivo do drop (suporta múltiplos arquivos, pega o primeiro)
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validarEProcessarArquivo(files[0]);
        }
    }, [validarEProcessarArquivo]);

    const aoClicarPraUpload = useCallback(() => {
        inputRef.current?.click();
    }, []);

    // Integração com drag-drop global
    useEffect(() => {
        const handleGlobalDrop = (files: FileList) => {
            if (files && files.length > 0) {
                const isCsv = files[0].name.toLowerCase().endsWith('.csv');
                if (isCsv) {
                    validarEProcessarArquivo(files[0]);
                } else {
                    showErrorToast("Arquivo inválido", "Por favor, solte um arquivo .csv");
                }
            }
        };

        dropZoneIdRef.current = onDrop(handleGlobalDrop);

        return () => {
            if (dropZoneIdRef.current) {
                removeDropZone(dropZoneIdRef.current);
            }
        };
    }, [onDrop, removeDropZone, validarEProcessarArquivo]);

    return (
        <div className="space-y-3 sm:space-y-4 w-full">
            <div 
                onDrop={aoSoltarArquivo}
                onDragOver={aoArrastarSobre}
                onDragEnter={aoEntrarNaArea}
                onDragLeave={aoSairDaArea}
                onClick={aoClicarPraUpload}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        aoClicarPraUpload();
                    }
                }}
                className={`p-4 sm:p-6 border-2 border-dashed rounded-2xl text-center transition-all relative cursor-pointer select-none ${
                    carregando ? 'border-blue-400 bg-blue-50/50 opacity-75' :
                    arrastandoSobre ? 'border-blue-500 bg-blue-100 scale-105' : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
            >
                {carregando && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-xs sm:text-sm text-gray-700 font-medium">Processando...</span>
                        </div>
                    </div>
                )}
                <div className={`flex flex-col items-center ${carregando ? 'opacity-50' : ''}`}>
                    <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base text-gray-700 break-words px-2">
                        {arquivoDeDados ? `✓ ${arquivoDeDados.name}` : "Arraste o CSV aqui"}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 mt-1 px-2">
                        ou <span className="text-blue-600 font-semibold">clique para selecionar</span>
                    </span>
                    <span className="text-xs text-gray-400 mt-2 px-2 leading-relaxed">
                        Máx: {LIMITE_TAMANHO_MB} MB | Limite: 25 linhas × 25 colunas
                    </span>
                </div>
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden" 
                    accept={DASHBOARD_ACCEPT_STRING} 
                    onChange={aoAlterarArquivo} 
                    disabled={carregando}
                />
            </div>

            <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4 w-full">
                <div className="text-xs sm:text-sm font-semibold text-blue-900 flex items-center gap-2 flex-wrap">
                    <span>💡 Dicas para seu CSV</span>
                </div>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-1.5 list-disc list-inside pl-1">
                    <li className="break-words"><strong>Primeira coluna</strong>: Categorias (meses, regiões, etc)</li>
                    <li className="break-words"><strong>Demais colunas</strong>: Valores numéricos (série de dados)</li>
                    <li className="break-words"><strong>Delimitador</strong>: Vírgula, ponto-e-vírgula ou tab (auto-detectado)</li>
                    <li className="break-words"><strong>Formatos</strong>: números, moeda (R$), percentual (%)</li>
                    <li className="break-words"><strong>Limite</strong>: Até 25 linhas e 25 colunas serão importadas</li>
                </ul>
            </div>

            <button 
                onClick={aoBaixarModelo} 
                className="text-xs sm:text-sm w-full flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium hover:underline transition-all py-2 px-2 rounded-lg hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={carregando}
            >
                <Download className="w-4 h-4 flex-shrink-0" /> Baixar template de exemplo (.csv)
            </button>
        </div>
    );
};