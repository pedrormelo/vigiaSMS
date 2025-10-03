import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { ActiveTab, DataSourceTab, GraphType, ChartDataset, AddContentModalProps } from "./types";
import { showWarningToast, showErrorToast, showInfoToast } from "@/components/ui/Toasts"; // Importamos showInfoToast

export const useAddContentModal = ({ isOpen, onClose, onSubmit, initialTab = 'contexto' }: AddContentModalProps) => {
    // --- ESTADO ---
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [dataSourceTab, setDataSourceTab] = useState<DataSourceTab>('manual');
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [contextTitle, setContextTitle] = useState("");
    const [contextDetails, setContextDetails] = useState("");
    const [contextFile, setContextFile] = useState<File | null>(null);
    const [contextUrl, setContextUrl] = useState("");
    const [graphTitle, setGraphTitle] = useState("");
    const [graphDetails, setGraphDetails] = useState("");
    const [graphType, setGraphType] = useState<GraphType>("pie");
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [dataset, setDataset] = useState<ChartDataset>({
        columns: ["Categoria", "Valor"],
        rows: [["Exemplo de Categoria", 100]],
    });

    // --- FUNÇÕES E EFEITOS ---
    
    const resetAllState = () => {
        setContextTitle(""); setContextDetails(""); setContextFile(null); setContextUrl("");
        setGraphTitle(""); setGraphDetails(""); setGraphType("pie");
        setDataFile(null);
        setDataset({
            columns: ["Categoria", "Valor"],
            rows: [["Exemplo de Categoria", 100]],
        });
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

    const handleSubmit = () => {
        if (activeTab === 'contexto') {
            onSubmit({ type: 'contexto', payload: { title: contextTitle, details: contextDetails, file: contextFile, url: contextUrl } });
        } else {
            onSubmit({ type: 'dashboard', payload: { title: graphTitle, details: graphDetails, type: graphType, dataFile, dataset } });
        }
        onClose();
    };
    
    const handleFileSelected = (file: File | null) => {
        if (file) { setContextFile(file); setContextUrl(""); }
    };
    
    const handleUrlButtonClick = () => {
        const url = prompt("Por favor, insira a URL:");
        if (url) { setContextUrl(url); setContextFile(null); }
    };

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

    // MUDANÇA: Lógica aprimorada para PRESERVAR dados ao trocar de gráfico
    const handleTypeChange = (t: GraphType) => {
        setGraphType(t);

        const targetTemplates = {
            pie: { columns: ["Categoria", "Valor"], defaultRows: [["", ""]] },
            chart: { columns: ["Grupo", "Valor 1", "Valor 2"], defaultRows: [["", "", ""]] },
            line: { columns: ["Eixo X", "Linha A", "Linha B"], defaultRows: [["", "", ""]] },
        };

        setDataset(currentDataset => {
            const currentColumns = currentDataset.columns;
            const currentRows = currentDataset.rows;
            const target = targetTemplates[t];
            
            let newColumns = target.columns.slice(0, currentColumns.length);
            for(let i=0; i<currentColumns.length; i++){
                newColumns[i] = currentColumns[i];
            }

            let newRows = currentRows.map(row => row.slice(0, target.columns.length));
            
            // Adiciona ou remove colunas para corresponder ao novo tipo
            const diff = target.columns.length - newColumns.length;

            if (diff > 0) { // Adicionar colunas
                for (let i = 0; i < diff; i++) {
                    newColumns.push(target.columns[newColumns.length]);
                    newRows.forEach(row => row.push(""));
                }
                showInfoToast("Tabela ajustada", "Novas colunas foram adicionadas para este tipo de gráfico.");
            } else if (diff < 0) { // Remover colunas
                newColumns = newColumns.slice(0, target.columns.length);
                newRows = newRows.map(row => row.slice(0, target.columns.length));
                showInfoToast("Tabela ajustada", "Colunas extras foram removidas para este tipo de gráfico.");
            }

            return { columns: newColumns, rows: newRows.length > 0 ? newRows : target.defaultRows };
        });
    };

    const addRow = () => {
        if (dataset.rows.length >= 25) {
            showWarningToast("Limite de 25 linhas atingido.");
            return;
        }
        setDataset((d) => ({ ...d, rows: [...d.rows, Array(d.columns.length).fill("")] }));
    };

    const removeRow = (index: number) => setDataset((d) => ({ ...d, rows: d.rows.filter((_, i) => i !== index) }));

    const updateCell = (row: number, col: number, value: string) => {
        if (col > 0) {
            const isNumeric = /^-?\d*\.?\d*$/.test(value);
            if (!isNumeric) {
                showErrorToast("Valor inválido.", "Apenas números são permitidos nesta coluna.");
                return;
            }
        }
        setDataset((d) => ({ ...d, rows: d.rows.map((r, i) => i === row ? r.map((c, j) => (j === col ? value : c)) : r) }));
    };

    const addColumn = () => {
        if (dataset.columns.length >= 30) {
            showWarningToast("Limite de 30 colunas atingido.");
            return;
        }
        setDataset((d) => ({ ...d, columns: [...d.columns, `Série ${d.columns.length}`], rows: d.rows.map(row => [...row, ""]) }));
    };

    const removeColumn = (colIndex: number) => {
        if (colIndex === 0) {
            showErrorToast("Ação não permitida", "A coluna de categorias não pode ser removida.");
            return;
        }
        if (dataset.columns.length <= 2) {
            showErrorToast("Ação não permitida", "O gráfico precisa de pelo menos uma coluna de valores.");
            return;
        }
        setDataset((d) => ({ columns: d.columns.filter((_, i) => i !== colIndex), rows: d.rows.map(row => row.filter((_, i) => i !== colIndex)) }));
    };

    const updateColumnName = (index: number, newName: string) => setDataset((d) => ({ ...d, columns: d.columns.map((col, i) => (i === index ? newName : col)) }));

    const downloadTemplate = () => {
        const header = dataset.columns.join(",") + "\n";
        const placeholderRows = Array(2).fill(Array(dataset.columns.length).fill("dado")).map(r => r.join(",")).join("\n");
        const csv = header + placeholderRows;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${graphType}.csv`);
    };

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

    const isSubmitDisabled = activeTab === 'contexto' ? !contextTitle.trim() : !graphTitle.trim();

    return {
        activeTab, setActiveTab, dataSourceTab, setDataSourceTab, isDraggingOver,
        contextTitle, setContextTitle, contextDetails, setContextDetails,
        contextFile, setContextFile, contextUrl, setContextUrl,
        graphTitle, setGraphTitle, graphDetails, setGraphDetails,
        graphType, dataFile, setDataFile, dataset,
        handleCancel: onClose, handleSubmit, handleFileSelected, handleUrlButtonClick,
        handleDragEnter, handleDragLeave, handleDragOver, handleDrop,
        handleTypeChange, addRow, removeRow, updateCell, addColumn,
        removeColumn, updateColumnName, downloadTemplate,
        isSubmitDisabled, formatFileSize, getContextSourceName,
    };
};