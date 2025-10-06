import React, { useState } from 'react';
import { Database, Upload, BarChart3, Minimize } from 'lucide-react';
import { useModalAdicionarConteudo } from '@/components/popups/addContextoModal/useAddContentModal'; 
import { SeletorTipoGrafico } from '@/components/popups/addContextoModal/seletorTipoGrafico'; 
import { SecaoDadosManuais } from '@/components/popups/addContextoModal/secaoDadosManuais'; 
import { SecaoUploadArquivo } from '@/components/popups/addContextoModal/secaoUploadArquivo'; 
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico'; 
import { ConjuntoDeDadosGrafico } from '@/components/popups/addContextoModal/types'; 

type AbaDashboardProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloGrafico' | 'setTituloGrafico'
    | 'detalhesGrafico' | 'setDetalhesGrafico'
    | 'tipoGrafico' | 'aoMudarTipo'
    | 'abaFonteDeDados' | 'setAbaFonteDeDados'
    | 'conjuntoDeDados'
    | 'atualizarCelula' | 'adicionarLinha' | 'removerLinha' | 'adicionarColuna' | 'removerColuna' | 'atualizarNomeColuna'
    | 'arquivoDeDados' | 'setArquivoDeDados' | 'baixarModelo'
>;

export const AbaDashboard: React.FC<AbaDashboardProps> = (props) => {
    const {
        tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo, abaFonteDeDados, setAbaFonteDeDados,
        conjuntoDeDados, atualizarCelula, adicionarLinha, removerLinha, adicionarColuna, removerColuna, atualizarNomeColuna,
        arquivoDeDados, setArquivoDeDados, baixarModelo
    } = props;

    const [conjuntoDeDadosPrevisualizacao, setConjuntoDeDadosPrevisualizacao] = useState<ConjuntoDeDadosGrafico | null>(null);
    const [previsualizacaoGerada, setPrevisualizacaoGerada] = useState(false);
    const [graficoEmTelaCheia, setGraficoEmTelaCheia] = useState(false);

    const gerarPrevisualizacao = () => {
        setConjuntoDeDadosPrevisualizacao(conjuntoDeDados);
        setPrevisualizacaoGerada(true);
    };

    const alternarTelaCheia = () => {
        setGraficoEmTelaCheia(!graficoEmTelaCheia);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
                
                <div className="flex flex-col space-y-6 pt-1">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Título do Gráfico</label>
                        <input type="text" value={tituloGrafico} onChange={(e) => setTituloGrafico(e.target.value)} placeholder="Ex.: Atendimentos por Complexidade" className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"/>
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Detalhes do Gráfico</label>
                        <textarea value={detalhesGrafico} onChange={(e) => setDetalhesGrafico(e.target.value)} placeholder="Descreva o contexto, período, fonte dos dados, etc." rows={8} className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"/>
                    </div>
                </div>

                <div className="flex flex-col space-y-6 border-x-0 lg:border-x border-gray-200 px-0 lg:px-6">
                    <SeletorTipoGrafico tipoSelecionado={tipoGrafico} aoMudarTipo={aoMudarTipo} />
                    <div className="pt-4">
                        <label className="block text-lg font-medium text-gray-700 mb-2">Fonte dos Dados</label>
                        <div className="flex space-x-2 mb-4 bg-gray-100 rounded-xl p-1">
                            <button onClick={() => setAbaFonteDeDados("manual")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${ abaFonteDeDados === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200" }`}><Database className="w-4 h-4" /> Dados Manuais</button>
                            <button onClick={() => setAbaFonteDeDados("upload")} className={`flex-1 text-sm py-2 px-4 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 ${ abaFonteDeDados === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200" }`}><Upload className="w-4 h-4" /> Upload de Arquivo</button>
                        </div>
                        {abaFonteDeDados === 'manual' ? ( 
                            <SecaoDadosManuais 
                                conjuntoDeDados={conjuntoDeDados} aoAtualizarNomeColuna={atualizarCelula} onAddRow={adicionarLinha} onRemoveRow={removerLinha}
                                onAddColumn={adicionarColuna} onRemoveColumn={removerColuna} onUpdateColumnName={atualizarNomeColuna}
                            /> 
                        ) : ( 
                            <SecaoUploadArquivo arquivoDeDados={arquivoDeDados} setArquivoDeDados={setArquivoDeDados} aoBaixarModelo={baixarModelo} /> 
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-4 h-full pt-1">
                    <label className="block text-lg font-medium text-gray-700 flex-shrink-0">Pré-visualização</label>
                    <div className="flex-1 min-h-0">
                        <PrevisualizacaoGrafico 
                            tipoGrafico={tipoGrafico} 
                            conjuntoDeDados={conjuntoDeDadosPrevisualizacao} 
                            titulo={tituloGrafico} 
                            previsualizacaoGerada={previsualizacaoGerada} 
                            aoAlternarTelaCheia={alternarTelaCheia}
                        />
                    </div>
                    <button onClick={gerarPrevisualizacao} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow flex-shrink-0">
                        <BarChart3 className="w-5 h-5" /> Gerar Gráfico
                    </button>
                </div>
            </div>

            {graficoEmTelaCheia && (
                <div className="fixed inset-0 bg-white z-[60] p-4 lg:p-8 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-semibold text-gray-800">{tituloGrafico || "Gráfico em Tela Cheia"}</h2>
                        <button 
                            onClick={alternarTelaCheia}
                            className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                            title="Fechar tela cheia"
                        >
                            <Minimize className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 w-full h-full">
                        <PrevisualizacaoGrafico
                            tipoGrafico={tipoGrafico}
                            conjuntoDeDados={conjuntoDeDadosPrevisualizacao}
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