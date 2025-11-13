"use client";

import React, { useState, useEffect } from "react";
import {
    X, Paperclip, FilePlus2, FileSymlink, LayoutDashboard,
    PieChart, BarChart3, LineChart, Link, Eye, Trash2,
    UploadCloud, FileText, Plus, Database, Upload, Download
} from "lucide-react";
import { saveAs } from "file-saver";
import { AddLinkModal } from "@/components/popups/addLinkModal";

// --- TIPOS E INTERFACES ---

type ActiveTab = "contexto" | "dashboard";
type DataSourceTab = "manual" | "upload";
type GraphType = "pie" | "chart" | "line";

interface ChartDataset {
    columns: string[];
    rows: (string | number)[][];
}

interface AddContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { type: ActiveTab; payload: any }) => void;
    initialTab?: ActiveTab;
}

interface GraphTypeSelectorProps {
    selectedType: GraphType;
    onTypeChange: (type: GraphType) => void;
}

interface ManualDataSectionProps {
    dataset: ChartDataset;
    title: string;
    graphType: GraphType;
    onUpdateCell: (row: number, col: number, value: string) => void;
    onAddRow: () => void;
    onRemoveRow: (index: number) => void;
    onAddColumn: () => void;
    onRemoveColumn: (colIndex: number) => void;
    onUpdateColumnName: (index: number, newName: string) => void;
}

interface FileUploadSectionProps {
    dataFile: File | null;
    setDataFile: (file: File | null) => void;
    onDownloadTemplate: () => void;
}


// --- COMPONENTES DE PLACEHOLDER (Para manter o arquivo autocontido) ---

const GraphTypeSelector: React.FC<GraphTypeSelectorProps> = ({ selectedType, onTypeChange }) => (
    <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
        <div className="grid grid-cols-3 gap-4">
            {(['pie', 'chart', 'line'] as GraphType[]).map((type) => {
                const Icon = { pie: PieChart, chart: BarChart3, line: LineChart }[type];
                const label = { pie: "Pizza", chart: "Barras", line: "Linha" }[type];
                return (
                    <button key={type} onClick={() => onTypeChange(type)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedType === type ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" : "border-gray-200 bg-gray-50/50 hover:border-blue-400"}`}>
                        <Icon className="w-8 h-8 mb-2" />
                        <span className="font-semibold">{label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

const ManualDataSection: React.FC<ManualDataSectionProps> = ({ dataset, onUpdateCell, onAddRow, onRemoveRow }) => (
     <div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr className="text-left">
                        {dataset.columns.map((col, i) => <th key={i} className="px-4 py-2 font-medium text-gray-600">{col}</th>)}
                        <th className="w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {dataset.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-t border-gray-200">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-1">
                                    <input type="text" value={cell} onChange={(e) => onUpdateCell(rIdx, cIdx, e.target.value)} className="w-full px-2 py-1 rounded-md border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                                </td>
                            ))}
                            <td className="text-center">
                                {dataset.rows.length > 1 && (
                                    <button onClick={() => onRemoveRow(rIdx)} className="text-gray-400 hover:text-red-600 p-1 rounded-full">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <button onClick={onAddRow} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Linha
        </button>
    </div>
);

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ dataFile, setDataFile, onDownloadTemplate }) => (
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


// --- COMPONENTE MODAL UNIFICADO ---
export function AddContentModal({ isOpen, onClose, onSubmit, initialTab = 'contexto' }: AddContentModalProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [dataSourceTab, setDataSourceTab] = useState<DataSourceTab>('manual');

    // Estado para a aba "Contexto"
    const [contextTitle, setContextTitle] = useState("");
    const [contextDetails, setContextDetails] = useState("");
    const [contextFile, setContextFile] = useState<File | null>(null);
    const [contextUrl, setContextUrl] = useState("");

    // Estado para a aba "Dashboard"
    const [graphTitle, setGraphTitle] = useState("");
    const [graphDetails, setGraphDetails] = useState("");
    const [graphType, setGraphType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [dataset, setDataset] = useState<ChartDataset>({ columns: ["Categoria", "Valor"], rows: [["", 0]] });

    const resetAllState = () => {
        setContextTitle(""); setContextDetails(""); setContextFile(null); setContextUrl("");
        setGraphTitle(""); setGraphDetails(""); setGraphType("pie");
        setDataFile(null); setDataset({ columns: ["Categoria", "Valor"], rows: [["", 0]] });
        setActiveTab(initialTab);
        setDataSourceTab('manual');
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        } else {
            setTimeout(resetAllState, 200);
        }
    }, [isOpen, initialTab]);

    const handleCancel = () => { onClose(); };

    const handleSubmit = () => {
        if (activeTab === 'contexto') {
            onSubmit({ type: 'contexto', payload: { title: contextTitle, details: contextDetails, file: contextFile, url: contextUrl } });
        } else {
            onSubmit({ type: 'dashboard', payload: { title: graphTitle, details: graphDetails, type: graphType, dataFile, dataset } });
        }
        onClose();
    };
    
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const handleUrlButtonClick = () => {
        setIsLinkModalOpen(true);
    };
    const handleConfirmLink = (url: string) => {
        // Modal já dispara toast de sucesso; aqui apenas ajustamos estado
        setContextUrl(url);
        setContextFile(null);
        setIsLinkModalOpen(false);
    };
    
    const handleFileSelected = (file: File | null) => {
        if (file) {
            setContextFile(file);
            setContextUrl("");
        }
    };

    const handleTypeChange = (t: GraphType) => {
        setGraphType(t);
        if (t === "pie") setDataset({ columns: ["Categoria", "Atendimentos"], rows: [["", 0]] });
        if (t === "line") setDataset({ columns: ["Mês", "Alta", "Média", "Baixa"], rows: [["", 0, 0, 0]] });
        if (t === "chart") setDataset({ columns: ["Faixa etária", "Cobertura Atual", "Meta"], rows: [["", 0, 0]] });
    };
    const addRow = () => setDataset((d) => ({ ...d, rows: [...d.rows, Array(d.columns.length).fill("")] }));
    const removeRow = (index: number) => setDataset((d) => ({ ...d, rows: d.rows.filter((_, i) => i !== index) }));
    const updateCell = (row: number, col: number, value: string) => setDataset((d) => ({ ...d, rows: d.rows.map((r, i) => i === row ? r.map((c, j) => (j === col ? value : c)) : r) }));
    const addColumn = () => setDataset((d) => ({ columns: [...d.columns, `Coluna ${d.columns.length + 1}`], rows: d.rows.map(row => [...row, ""]) }));
    const removeColumn = (colIndex: number) => { if (dataset.columns.length <= 1) return; setDataset((d) => ({ columns: d.columns.filter((_, i) => i !== colIndex), rows: d.rows.map(row => row.filter((_, i) => i !== colIndex)) })); };
    const updateColumnName = (index: number, newName: string) => setDataset((d) => ({ ...d, columns: d.columns.map((col, i) => (i === index ? newName : col)) }));

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelected(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    const downloadTemplate = () => {
        const header = dataset.columns.join(",") + "\n";
        const placeholderRows = Array(2).fill(Array(dataset.columns.length).fill("dado")).map(r => r.join(",")).join("\n");
        const csv = header + placeholderRows;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${graphType}.csv`);
    };

    if (!isOpen) return null;

    const isSubmitDisabled = activeTab === 'contexto' ? !contextTitle.trim() : !graphTitle.trim();

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const getContextSourceName = () => {
        if (contextFile) return contextFile.name;
        if (contextUrl) return contextUrl;
        return "Nenhum arquivo ou link selecionado";
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-opacity-20 rounded-lg flex items-center justify-center">{activeTab === 'contexto' ? <FilePlus2 className="w-6 h-6 text-white" /> : <LayoutDashboard className="w-6 h-6 text-white" />}</div>
                        <h2 className="text-2xl font-regular text-white">{activeTab === 'contexto' ? 'Adicionar Novo Contexto' : 'Criar Novo Dashboard'}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-opacity-20 text-white hover:text-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-8 flex flex-col overflow-hidden">
                    <div className="flex space-x-2 mb-8 bg-gray-100 rounded-2xl p-2 flex-shrink-0">
                        <button onClick={() => setActiveTab("contexto")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${activeTab === "contexto" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><FilePlus2 className="w-5 h-5 mr-2" /> Contexto (Arquivo/Link)</button>
                        <button onClick={() => setActiveTab("dashboard")} className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex justify-center items-center ${activeTab === "dashboard" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-800"}`}><LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard (Gráfico)</button>
                    </div>

                    <div className="overflow-y-auto pr-2">
                        {activeTab === 'contexto' && (
                            <div className="space-y-6 animate-fade-in">
                                <div><label className="block text-lg font-medium text-gray-700 mb-2">Título do Contexto</label><input type="text" value={contextTitle} onChange={(e) => setContextTitle(e.target.value)} placeholder="Título para descrever o contexto (Ex: Relatório de Metas 2025)" className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"/></div>
                                
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">Anexar Fonte</label>
                                    <div className="flex gap-2 items-stretch">
                                        <div onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} className={`flex-1 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col justify-center items-center ${isDraggingOver ? 'border-blue-500 bg-blue-50 animate-pulse-border' : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'}`}>
                                            <input id="context-file-input" type="file" onChange={(e) => handleFileSelected(e.target.files ? e.target.files[0] : null)} className="hidden"/>
                                            <label htmlFor="context-file-input" className="cursor-pointer w-full flex flex-col items-center justify-center">
                                                {(contextFile || contextUrl) ? (
                                                    <>
                                                        {contextFile && <FileText className="w-10 h-10 text-blue-600 mb-3" />}
                                                        {contextUrl && <Link className="w-10 h-10 text-green-600 mb-3" />}
                                                        <p className="font-semibold text-gray-800 break-all">{getContextSourceName()}</p>
                                                        {contextFile && <p className="text-sm text-gray-500">{formatFileSize(contextFile.size)}</p>}
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                                                        <p className="font-semibold text-gray-700">Arraste e solte o arquivo</p>
                                                        <p className="text-sm text-gray-500">ou <span className="text-blue-600 font-semibold">clique para selecionar</span></p>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button onClick={handleUrlButtonClick} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center" title="Adicionar link">
                                                <Link className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button disabled={!contextUrl} onClick={() => window.open(contextUrl, '_blank')} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed" title="Visualizar Link">
                                                <Eye className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button disabled={!contextFile && !contextUrl} onClick={() => { setContextFile(null); setContextUrl(""); }} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed" title="Remover">
                                                <Trash2 className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div><label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Contexto</label><textarea value={contextDetails} onChange={(e) => setContextDetails(e.target.value)} placeholder="Descreva aqui o contexto e sua relevância." rows={4} className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"/></div>
                            </div>
                        )}

                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-fade-in">
                               <div><label className="block text-lg font-medium text-gray-700 mb-2">Título do Gráfico</label><input type="text" value={graphTitle} onChange={(e) => setGraphTitle(e.target.value)} placeholder="Ex.: Atendimentos por Complexidade" className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"/></div>
                               <GraphTypeSelector selectedType={graphType} onTypeChange={handleTypeChange} />
                               <div><label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Gráfico</label><textarea value={graphDetails} onChange={(e) => setGraphDetails(e.target.value)} placeholder="Descreva o contexto, período, fonte dos dados, etc." rows={3} className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"/></div>
                               
                               <div className="pt-4">
                                   <label className="block text-lg font-medium text-gray-700 mb-2">Fonte dos Dados</label>
                                   <div className="flex space-x-2 mb-4 bg-gray-100 rounded-xl p-1">
                                        <button onClick={() => setDataSourceTab("manual")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${dataSourceTab === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                           <Database className="w-4 h-4" /> Dados Manuais
                                        </button>
                                        <button onClick={() => setDataSourceTab("upload")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${dataSourceTab === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                           <Upload className="w-4 h-4" /> Upload de Arquivo
                                        </button>
                                   </div>

                                   {dataSourceTab === 'manual' ? (
                                       <ManualDataSection
                                            dataset={dataset}
                                            graphType={graphType}
                                            title={graphTitle}
                                            onUpdateCell={updateCell}
                                            onAddRow={addRow}
                                            onRemoveRow={removeRow}
                                            onAddColumn={addColumn}
                                            onRemoveColumn={removeColumn}
                                            onUpdateColumnName={updateColumnName}
                                        />
                                   ) : (
                                       <FileUploadSection
                                            dataFile={dataFile}
                                            setDataFile={setDataFile}
                                            onDownloadTemplate={downloadTemplate}
                                       />
                                   )}
                               </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4 flex-shrink-0 border-t border-gray-200 rounded-b-[40px]">
                    <button onClick={handleCancel} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-bold">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSubmitDisabled} className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        <FileSymlink className="w-5 h-5" />
                        {activeTab === 'contexto' ? 'Salvar Contexto' : 'Salvar Dashboard'}
                    </button>
                </div>
            </div>
                </div>
        );
}

{/* Modal de Link renderizado em nível superior para evitar conflito de z-index.
        NOTA: Este export separado permite uso em outros locais se necessário. */}
export function AddContentModalWithLinkWrapper(props: AddContentModalProps) {
    return (
        <>
            <AddContentModal {...props} />
        </>
    );
}

const styles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes pulse-border {
      0% { border-color: #3B82F6; } /* blue-500 */
      50% { border-color: #93C5FD; } /* blue-300 */
      100% { border-color: #3B82F6; }
    }
    .animate-pulse-border {
      animation: pulse-border 1.5s ease-in-out infinite;
    }
`;
if (typeof window !== 'undefined') { const styleSheet = document.createElement("style"); styleSheet.type = "text/css"; styleSheet.innerText = styles; document.head.appendChild(styleSheet); }