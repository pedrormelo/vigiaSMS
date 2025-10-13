// src/components/popups/addContextoModal/abaContexto.tsx
import React from 'react';
import { UploadCloud, FileText, Link as LinkIcon, Eye, Trash2 } from 'lucide-react';
import { useModalAdicionarConteudo } from '@/components/popups/addContextoModal/useAddContentModal';
import { TipoVersao } from '@/components/popups/addContextoModal/types';

type AbaContextoProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloContexto' | 'setTituloContexto'
    | 'detalhesContexto' | 'setDetalhesContexto'
    | 'arquivoContexto' | 'setArquivoContexto'
    | 'urlContexto' | 'setUrlContexto'
    | 'arrastandoSobre' | 'aoSoltarArquivo' | 'aoArrastarSobre' | 'aoEntrarNaArea' | 'aoSairDaArea'
    | 'aoSelecionarArquivo' | 'aoClicarBotaoUrl'
    | 'obterNomeFonteContexto' | 'formatarTamanhoArquivo'
    | 'isNewVersionMode'
    | 'selectedVersion'
    | 'tipoVersao'
    | 'setTipoVersao'
    | 'descricaoVersao'
    | 'setDescricaoVersao'
>;

export const AbaContexto: React.FC<AbaContextoProps> = ({
    tituloContexto, setTituloContexto,
    detalhesContexto, setDetalhesContexto,
    arquivoContexto, setArquivoContexto,
    urlContexto, setUrlContexto,
    arrastandoSobre, aoSoltarArquivo, aoArrastarSobre, aoEntrarNaArea, aoSairDaArea,
    aoSelecionarArquivo, aoClicarBotaoUrl,
    obterNomeFonteContexto, formatarTamanhoArquivo,
    isNewVersionMode,
    selectedVersion,
    tipoVersao,
    setTipoVersao,
    descricaoVersao,
    setDescricaoVersao,
}) => {
    return (
        <div className="h-full overflow-y-auto pr-4">
            <div className="space-y-6 animate-fade-in">

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-2 items-end">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Título do Contexto
                            {isNewVersionMode && (
                                <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md align-middle">
                                    NOVA VERSÃO
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={tituloContexto}
                            onChange={(e) => setTituloContexto(e.target.value)}
                            placeholder="Título para descrever o contexto"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={isNewVersionMode}
                        />
                    </div>
                    
                    {isNewVersionMode && (
                        <div>
                             <label className="block text-lg font-medium text-gray-700 mb-2">Versão</label>
                             <div className="flex items-center justify-center w-full h-[50px] px-4 py-3 border border-transparent rounded-2xl bg-gray-100 text-gray-500 font-semibold">
                                 {selectedVersion || "Calculando..."}
                             </div>
                        </div>
                    )}
                </div>

                {isNewVersionMode && (
                    <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                        <h3 className="text-lg font-semibold text-blue-800">Detalhes da Nova Versão</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da Alteração</label>
                            <select
                                value={tipoVersao}
                                onChange={(e) => setTipoVersao(e.target.value as TipoVersao)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={TipoVersao.CORRECAO}>Correção de Informação Incorreta</option>
                                <option value={TipoVersao.ATUALIZACAO_MENSAL}>Atualização Mensal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição das Alterações (Obrigatório)</label>
                            <textarea
                                value={descricaoVersao}
                                onChange={(e) => setDescricaoVersao(e.target.value)}
                                placeholder="Ex: Corrigidos os valores da tabela X na página 2."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                        {isNewVersionMode ? "Anexar Novo Arquivo (Obrigatório)" : "Anexar Fonte"}
                    </label>
                    <div className="flex gap-2 items-stretch">
                        <div onDrop={aoSoltarArquivo} onDragOver={aoArrastarSobre} onDragEnter={aoEntrarNaArea} onDragLeave={aoSairDaArea} className={`flex-1 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col justify-center items-center ${arrastandoSobre ? 'border-blue-500 bg-blue-50 animate-pulse-border' : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'}`}>
                            <input id="context-file-input" type="file" onChange={(e) => aoSelecionarArquivo(e.target.files ? e.target.files[0] : null)} className="hidden"/>
                            <label htmlFor="context-file-input" className="cursor-pointer w-full flex flex-col items-center justify-center">
                                {(arquivoContexto || urlContexto) ? (
                                    <>
                                        {arquivoContexto && <FileText className="w-10 h-10 text-blue-600 mb-3" />}
                                        {urlContexto && <LinkIcon className="w-10 h-10 text-green-600 mb-3" />}
                                        <p className="font-semibold text-gray-800 break-all">{obterNomeFonteContexto()}</p>
                                        {arquivoContexto && <p className="text-sm text-gray-500">{formatarTamanhoArquivo(arquivoContexto.size)}</p>}
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
                            <button onClick={aoClicarBotaoUrl} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center" title="Adicionar link">
                                <LinkIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <button disabled={!urlContexto} onClick={() => window.open(urlContexto, '_blank')} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed" title="Visualizar Link">
                                <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            <button disabled={!arquivoContexto && !urlContexto} onClick={() => { setArquivoContexto(null); setUrlContexto(""); }} className="px-4 py-3 border border-gray-200 cursor-pointer rounded-2xl hover:bg-gray-100 transition-colors h-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed" title="Remover">
                                <Trash2 className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {!isNewVersionMode && (
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Contexto</label>
                        <textarea value={detalhesContexto} onChange={(e) => setDetalhesContexto(e.target.value)} placeholder="Descreva aqui o contexto e sua relevância." rows={4} className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"/>
                    </div>
                )}
            </div>
        </div>
    );
};