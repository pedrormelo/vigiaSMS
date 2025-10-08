import React, { useState } from 'react';
import { Database, Upload, BarChart3, Minimize } from 'lucide-react';
import { useModalAdicionarConteudo } from '@/components/popups/addContextoModal/useAddContentModal'; 
import { SeletorTipoGrafico } from '@/components/popups/addContextoModal/seletorTipoGrafico'; 
import { SecaoDadosManuais } from '@/components/popups/addContextoModal/secaoDadosManuais'; 
import { SecaoUploadArquivo } from '@/components/popups/addContextoModal/secaoUploadArquivo'; 
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico'; 
import { TipoVersao } from '@/components/popups/addContextoModal/types';

// ✅ TIPO DE PROPS ATUALIZADO PARA INCLUIR TODAS AS PROPS DE VERSIONAMENTO
type AbaDashboardProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloGrafico' | 'setTituloGrafico'
    | 'detalhesGrafico' | 'setDetalhesGrafico'
    | 'tipoGrafico' | 'aoMudarTipo'
    | 'abaFonteDeDados' | 'setAbaFonteDeDados'
    | 'conjuntoDeDados'
    | 'atualizarCelula' | 'adicionarLinha' | 'removerLinha' | 'adicionarColuna' | 'removerColuna' | 'atualizarNomeColuna'
    | 'arquivoDeDados' | 'setArquivoDeDados' | 'baixarModelo'
    | 'previsualizacaoGerada' | 'setPrevisualizacaoGerada'
    // Props de versionamento agora incluídas
    | 'isNewVersionMode'
    | 'selectedVersion'
    | 'tipoVersao'
    | 'setTipoVersao'
    | 'descricaoVersao'
    | 'setDescricaoVersao'
>;

export const AbaDashboard: React.FC<AbaDashboardProps> = (props) => {
    const {
        tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo, abaFonteDeDados, setAbaFonteDeDados,
        conjuntoDeDados, atualizarCelula, adicionarLinha, removerLinha, adicionarColuna, removerColuna, atualizarNomeColuna,
        arquivoDeDados, setArquivoDeDados, baixarModelo,
        previsualizacaoGerada, setPrevisualizacaoGerada,
        // ✅ RECEBE AS PROPS DE VERSIONAMENTO
        isNewVersionMode,
        selectedVersion,
        tipoVersao,
        setTipoVersao,
        descricaoVersao,
        setDescricaoVersao
    } = props;

    const [graficoEmTelaCheia, setGraficoEmTelaCheia] = useState(false);

    const alternarTelaCheia = () => {
        setGraficoEmTelaCheia(!graficoEmTelaCheia);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
                {/* Coluna 1: Título, Detalhes e Formulário de Versão */}
                <div className="flex flex-col space-y-6 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-2 items-end">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                Título do Gráfico
                                {isNewVersionMode && (
                                    <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md align-middle">
                                        NOVA VERSÃO
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={tituloGrafico}
                                onChange={(e) => setTituloGrafico(e.target.value)}
                                placeholder="Ex.: Atendimentos por Complexidade"
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
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Gráfico</label>
                        <textarea
                            value={detalhesGrafico}
                            onChange={(e) => setDetalhesGrafico(e.target.value)}
                            placeholder="Descreva o contexto, período, fonte dos dados, etc."
                            rows={isNewVersionMode ? 2 : 4} // Reduz a altura no modo de nova versão
                            className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            disabled={isNewVersionMode}
                        />
                    </div>
                    
                    {/* ✅ FORMULÁRIO DE NOVA VERSÃO PARA DASHBOARD */}
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
                                    placeholder="Ex: Atualização dos dados para o mês de Setembro."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Coluna 2: Configurações do Gráfico e Dados */}
                <div className="flex flex-col space-y-6 border-x-0 lg:border-x border-gray-200 px-0 lg:px-6">
                    <SeletorTipoGrafico tipoSelecionado={tipoGrafico} aoMudarTipo={aoMudarTipo} />
                    <div className="pt-4">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                           {isNewVersionMode ? "Novos Dados do Gráfico" : "Fonte dos Dados"}
                        </label>
                        <div className="flex space-x-2 mb-4 bg-gray-100 rounded-xl p-1">
                            <button onClick={() => setAbaFonteDeDados("manual")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${ abaFonteDeDados === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200" }`}><Database className="w-4 h-4" /> Dados Manuais</button>
                            <button onClick={() => setAbaFonteDeDados("upload")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${ abaFonteDeDados === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200" }`}><Upload className="w-4 h-4" /> Upload de Arquivo</button>
                        </div>
                        {abaFonteDeDados === 'manual' ? ( 
                            <SecaoDadosManuais 
                                conjuntoDeDados={conjuntoDeDados}
                                aoAtualizarCelula={atualizarCelula}
                                aoAdicionarLinha={adicionarLinha}
                                aoRemoverLinha={removerLinha}
                                aoAdicionarColuna={adicionarColuna}
                                aoRemoverColuna={removerColuna}
                                aoAtualizarNomeColuna={atualizarNomeColuna}
                            /> 
                        ) : ( 
                            <SecaoUploadArquivo arquivoDeDados={arquivoDeDados} setArquivoDeDados={setArquivoDeDados} aoBaixarModelo={baixarModelo} /> 
                        )}
                    </div>
                </div>

                {/* Coluna 3: Pré-visualização */}
                <div className="flex flex-col space-y-4 h-full pt-1">
                    <label className="block text-lg font-medium text-gray-700 flex-shrink-0">Pré-visualização</label>
                    <div className="flex-1 min-h-0">
                        <PrevisualizacaoGrafico 
                            tipoGrafico={tipoGrafico} 
                            conjuntoDeDados={conjuntoDeDados} 
                            titulo={tituloGrafico} 
                            previsualizacaoGerada={previsualizacaoGerada} 
                            aoAlternarTelaCheia={alternarTelaCheia} 
                        />
                    </div>
                    <button onClick={() => setPrevisualizacaoGerada(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow flex-shrink-0">
                        <BarChart3 className="w-5 h-5" /> 
                        {previsualizacaoGerada ? "Atualizar Gráfico" : "Gerar Gráfico"}
                    </button>
                </div>
            </div>

            {/* Modal de Tela Cheia */}
            {graficoEmTelaCheia && (
                 <div className="fixed inset-0 bg-white z-[60] p-4 lg:p-8 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-semibold text-gray-800">{tituloGrafico || "Gráfico em Tela Cheia"}</h2>
                        <button onClick={alternarTelaCheia} className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors" title="Fechar tela cheia"><Minimize className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full">
                        <PrevisualizacaoGrafico 
                            tipoGrafico={tipoGrafico} 
                            conjuntoDeDados={conjuntoDeDados} 
                            titulo={tituloGrafico} 
                            previsualizacaoGerada={previsualizacaoGerada} 
                            emTelaCheia={true} 
                        />
                    </div>
                </div>
            )}
        </>
    );
};