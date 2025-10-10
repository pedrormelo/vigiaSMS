// src/components/popups/addContextoModal/abaDashboard.tsx
import React, { useState } from 'react';
import { Database, Upload, BarChart3, Minimize } from 'lucide-react';
import { useModalAdicionarConteudo } from '@/components/popups/addContextoModal/useAddContentModal'; 
import { SeletorTipoGrafico } from '@/components/popups/addContextoModal/seletorTipoGrafico'; 
import { SecaoDadosManuais } from '@/components/popups/addContextoModal/secaoDadosManuais'; 
import { SecaoUploadArquivo } from '@/components/popups/addContextoModal/secaoUploadArquivo'; 
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico'; 
import { TipoVersao } from '@/components/popups/addContextoModal/types';

type AbaDashboardProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloGrafico' | 'setTituloGrafico'
    | 'detalhesGrafico' | 'setDetalhesGrafico'
    | 'tipoGrafico' | 'aoMudarTipo'
    | 'abaFonteDeDados' | 'setAbaFonteDeDados'
    | 'conjuntoDeDados' | 'definirCoresDoGrafico' // <-- MUDANÇA AQUI
    | 'atualizarCelula' | 'adicionarLinha' | 'removerLinha' | 'adicionarColuna' | 'removerColuna' | 'atualizarNomeColuna'
    | 'arquivoDeDados' | 'setArquivoDeDados' | 'baixarModelo'
    | 'previsualizacaoGerada' | 'setPrevisualizacaoGerada'
    | 'isNewVersionMode'
    | 'selectedVersion'
    | 'tipoVersao'
    | 'setTipoVersao'
    | 'descricaoVersao'
    | 'setDescricaoVersao'
>;

const coresPredefinidas = {
    blue: '#3B82F6', green: '#22C55E', red: '#EF4444',
    yellow: '#EAB308', purple: '#A855F7', orange: '#F97316',
    teal: '#14B8A6', pink: '#EC4899',
};

export const AbaDashboard: React.FC<AbaDashboardProps> = (props) => {
    const {
        tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo, abaFonteDeDados, setAbaFonteDeDados,
        // CORREÇÃO: Recebe o conjunto de dados completo e a nova função.
        conjuntoDeDados, definirCoresDoGrafico,
        atualizarCelula, adicionarLinha, removerLinha, adicionarColuna, removerColuna, atualizarNomeColuna,
        arquivoDeDados, setArquivoDeDados, baixarModelo,
        previsualizacaoGerada, setPrevisualizacaoGerada,
        isNewVersionMode, selectedVersion, tipoVersao, setTipoVersao, descricaoVersao, setDescricaoVersao
    } = props;

    const [graficoEmTelaCheia, setGraficoEmTelaCheia] = useState(false);
    const alternarTelaCheia = () => setGraficoEmTelaCheia(!graficoEmTelaCheia);

    // CORREÇÃO: A lógica agora usa as novas props.
    const handleColorClick = (corHex: string) => {
        const coresAtuais = conjuntoDeDados.cores || [];
        const novasCores = coresAtuais.includes(corHex)
            ? coresAtuais.filter(c => c !== corHex)
            : [...coresAtuais, corHex];
        
        if (novasCores.length > 0) {
            definirCoresDoGrafico(novasCores);
        }
    };

    const coresAtivas = conjuntoDeDados.cores || [];

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
                {/* Coluna 1: Título, Detalhes, Cores e Formulário de Versão */}
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
                            rows={isNewVersionMode ? 2 : 4}
                            className="w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            disabled={isNewVersionMode}
                        />
                    </div>
                    
                    {/* Seletor de Cores */}
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Paleta de Cores</label>
                        <div className="flex items-center gap-2 flex-wrap p-2 bg-gray-100 rounded-lg">
                            {Object.entries(coresPredefinidas).map(([nome, corHex]) => (
                                <button
                                    key={nome}
                                    title={nome}
                                    onClick={() => handleColorClick(corHex)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${coresAtivas.includes(corHex) ? 'ring-2 ring-offset-2 ring-current' : ''}`}
                                    style={{ backgroundColor: corHex, color: corHex }}
                                    disabled={isNewVersionMode}
                                ></button>
                            ))}
                        </div>
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
                        {/* CORREÇÃO: Passa o objeto `conjuntoDeDados` completo */}
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
                        {/* CORREÇÃO: Passa o objeto `conjuntoDeDados` completo */}
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