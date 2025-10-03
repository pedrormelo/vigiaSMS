import React from 'react';
import { UploadCloud, FileText, Link, Eye, Trash2 } from 'lucide-react';
import { useAddContentModal } from './useAddContentModal';

// A definição de props do componente não muda
type ContextoTabProps = Pick<
    ReturnType<typeof useAddContentModal>,
    | 'contextTitle' | 'setContextTitle'
    | 'contextDetails' | 'setContextDetails'
    | 'contextFile' | 'setContextFile'
    | 'contextUrl' | 'setContextUrl'
    | 'isDraggingOver' | 'handleDrop' | 'handleDragOver' | 'handleDragEnter' | 'handleDragLeave'
    | 'handleFileSelected' | 'handleUrlButtonClick'
    | 'getContextSourceName' | 'formatFileSize'
>;

export const ContextoTab: React.FC<ContextoTabProps> = ({
    contextTitle, setContextTitle,
    contextDetails, setContextDetails,
    contextFile, setContextFile,
    contextUrl, setContextUrl,
    isDraggingOver, handleDrop, handleDragOver, handleDragEnter, handleDragLeave,
    handleFileSelected, handleUrlButtonClick,
    getContextSourceName, formatFileSize
}) => {
    return (
        // MUDANÇA: Adicionamos um contêiner com altura total e rolagem vertical.
        // Isso garante que apenas esta aba role, independentemente da outra.
        <div className="h-full overflow-y-auto pr-4">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Título do Contexto</label>
                    <input type="text" value={contextTitle} onChange={(e) => setContextTitle(e.target.value)} placeholder="Título para descrever o contexto (Ex: Relatório de Metas 2025)" className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"/>
                </div>
                
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
                
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Contexto</label>
                    <textarea value={contextDetails} onChange={(e) => setContextDetails(e.target.value)} placeholder="Descreva aqui o contexto e sua relevância." rows={4} className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"/>
                </div>
            </div>
        </div>
    );
};