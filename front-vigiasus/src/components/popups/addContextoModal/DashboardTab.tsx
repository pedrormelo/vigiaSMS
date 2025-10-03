import React, { useState } from 'react';
import { Database, Upload, BarChart3 } from 'lucide-react';
import { useAddContentModal } from './useAddContentModal';
import { GraphTypeSelector } from './GraphTypeSelector';
import { ManualDataSection } from './ManualDataSection';
import { FileUploadSection } from './FileUploadSection';
import { ChartPreview } from './ChartPreview';
import { ChartDataset } from './types';
import { TwoColumnLayout } from './duasColunasModal';

type DashboardTabProps = Pick<
    ReturnType<typeof useAddContentModal>,
    | 'graphTitle' | 'setGraphTitle'
    | 'graphDetails' | 'setGraphDetails'
    | 'graphType' | 'handleTypeChange'
    | 'dataSourceTab' | 'setDataSourceTab'
    | 'dataset'
    | 'updateCell' | 'addRow' | 'removeRow' | 'addColumn' | 'removeColumn' | 'updateColumnName'
    | 'dataFile' | 'setDataFile' | 'downloadTemplate'
>;

export const DashboardTab: React.FC<DashboardTabProps> = (props) => {
    const {
        graphTitle, setGraphTitle,
        graphDetails, setGraphDetails,
        graphType, handleTypeChange,
        dataSourceTab, setDataSourceTab,
        dataset,
        updateCell, addRow, removeRow, addColumn, removeColumn, updateColumnName,
        dataFile, setDataFile, downloadTemplate
    } = props;

    const [previewDataset, setPreviewDataset] = useState<ChartDataset | null>(null);
    const [isPreviewGenerated, setIsPreviewGenerated] = useState(false);

    const handleGeneratePreview = () => {
        setPreviewDataset(dataset);
        setIsPreviewGenerated(true);
    };

    const leftColumnContent = (
        <>
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Título do Gráfico</label>
                <input
                    type="text"
                    value={graphTitle}
                    onChange={(e) => setGraphTitle(e.target.value)}
                    placeholder="Ex.: Atendimentos por Complexidade"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
            </div>

            <GraphTypeSelector selectedType={graphType} onTypeChange={handleTypeChange} />

            <div className="pt-4">
                <label className="block text-lg font-medium text-gray-700 mb-2">Fonte dos Dados</label>
                <div className="flex space-x-2 mb-4 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setDataSourceTab("manual")}
                        className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${
                            dataSourceTab === "manual"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        <Database className="w-4 h-4" /> Dados Manuais
                    </button>
                    <button
                        onClick={() => setDataSourceTab("upload")}
                        className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${
                            dataSourceTab === "upload"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        <Upload className="w-4 h-4" /> Upload de Arquivo
                    </button>
                </div>

                {/* CORREÇÃO APLICADA AQUI */}
                {dataSourceTab === 'manual' ? (
                    <ManualDataSection
                        dataset={dataset}
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

            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Gráfico</label>
                <textarea
                    value={graphDetails}
                    onChange={(e) => setGraphDetails(e.target.value)}
                    placeholder="Descreva o contexto, período, fonte dos dados, etc."
                    rows={4}
                    className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
                />
            </div>
        </>
    );

    const rightColumnContent = (
        <>
            <label className="block text-lg font-medium text-gray-700 flex-shrink-0">Pré-visualização</label>
            <div className="flex-1 min-h-0">
                <ChartPreview
                    graphType={graphType}
                    dataset={previewDataset}
                    title={graphTitle}
                    isPreviewGenerated={isPreviewGenerated}
                />
            </div>
            <button
                onClick={handleGeneratePreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow flex-shrink-0"
            >
                <BarChart3 className="w-5 h-5" />
                Gerar Gráfico de Pré-visualização
            </button>
        </>
    );

    return (
        <div className="h-full animate-fade-in">
            <TwoColumnLayout
                leftColumn={leftColumnContent}
                rightColumn={rightColumnContent}
            />
        </div>
    );
};