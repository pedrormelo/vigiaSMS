// src/components/popups/addContextoModal/abaDashboard.tsx
import React, { useState } from 'react';
import { Database, Upload, Minimize } from 'lucide-react';
import { useModalAdicionarConteudo } from '@/components/popups/addContextoModal/useAddContentModal';
import { SeletorTipoGrafico } from '@/components/popups/addContextoModal/seletorTipoGrafico';
import { SecaoDadosManuais } from '@/components/popups/addContextoModal/secaoDadosManuais';
import { SecaoUploadArquivo } from '@/components/popups/addContextoModal/secaoUploadArquivo';
import { PrevisualizacaoGrafico } from '@/components/popups/addContextoModal/previsualizacaoGrafico';
import { TipoVersao, FormatoColuna } from '@/components/popups/addContextoModal/types';
import { cn } from "@/lib/utils"; // <-- Importação do 'cn'

type AbaDashboardProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloGrafico' | 'setTituloGrafico'
    | 'detalhesGrafico' | 'setDetalhesGrafico'
    | 'tipoGrafico' | 'aoMudarTipo'
    | 'abaFonteDeDados' | 'setAbaFonteDeDados'
    | 'conjuntoDeDados' | 'definirCoresDoGrafico'
    | 'atualizarCelula' | 'adicionarLinha' | 'removerLinha' | 'adicionarColuna' | 'removerColuna' | 'atualizarNomeColuna'
    | 'arquivoDeDados' | 'setArquivoDeDados' | 'baixarModelo'
    | 'isNewVersionMode'
    | 'selectedVersion'
    | 'tipoVersao'
    | 'setTipoVersao'
    | 'descricaoVersao'
    | 'setDescricaoVersao'
    | 'atualizarFormatoColuna' // <-- Prop corrigida (estava faltando)
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
        conjuntoDeDados, definirCoresDoGrafico,
        atualizarCelula, adicionarLinha, removerLinha, adicionarColuna, removerColuna, atualizarNomeColuna,
        arquivoDeDados, setArquivoDeDados, baixarModelo,
        isNewVersionMode, selectedVersion, tipoVersao, setTipoVersao, descricaoVersao, setDescricaoVersao,
        atualizarFormatoColuna
    } = props;

    const [graficoEmTelaCheia, setGraficoEmTelaCheia] = useState(false);
    const alternarTelaCheia = () => setGraficoEmTelaCheia(!graficoEmTelaCheia);

    // --- Lógica de Validação ---
    const MIN_DETALHES_LENGTH = 15;
    const isDetalhesValido = detalhesGrafico.trim().length >= MIN_DETALHES_LENGTH;
    const showDetalhesWarning = !isDetalhesValido && detalhesGrafico.length > 0;
    // --- Fim da Lógica ---

    const generateColorTheme = (baseColor: string): string[] => {
        const hexToHsl = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            const max = Math.max(r, g, b); const min = Math.min(r, g, b);
            let h: number = 0, s: number; const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            } else { h = s = 0; }
            return [h * 360, s * 100, l * 100];
        };
        const hslToHex = (h: number, s: number, l: number) => {
            l /= 100; const a = s * Math.min(l, 1 - l) / 100;
            const f = (n: number) => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };
        const [h, s, l] = hexToHsl(baseColor);
        return [ baseColor, hslToHex((h + 60) % 360, Math.max(s - 20, 30), Math.min(l + 10, 80)), hslToHex((h + 120) % 360, Math.max(s - 10, 40), Math.max(l - 15, 25)), hslToHex((h + 180) % 360, Math.max(s - 15, 35), Math.min(l + 5, 75)), hslToHex((h + 240) % 360, Math.max(s - 5, 45), Math.max(l - 10, 30)), ];
    };
    const handleColorClick = (corHex: string) => { const novoTema = generateColorTheme(corHex); definirCoresDoGrafico(novoTema); };
    const corTemaAtiva = conjuntoDeDados.cores?.[0] || '#3B82F6';

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
                {/* Coluna Esquerda */}
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
                                type="text" value={tituloGrafico} onChange={(e) => setTituloGrafico(e.target.value)}
                                placeholder="Ex.: Atendimentos por Complexidade"
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={isNewVersionMode}
                            />
                        </div>
                        {isNewVersionMode && (
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">Versão</label>
                                <div className="flex items-center justify-center w-full h-[50px] px-4 py-3 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 font-semibold">
                                    {selectedVersion || "Calculando..."}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CAMPO DE DETALHES ATUALIZADO --- */}
                    {!isNewVersionMode && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="dashboard-detalhes" className="block text-lg font-medium text-gray-700">
                                    Detalhes do Gráfico
                                </label>
                                <span className={cn(
                                    "text-xs font-medium",
                                    showDetalhesWarning ? "text-red-500" : (isDetalhesValido ? "text-green-600" : "text-gray-500")
                                )}>
                                    {detalhesGrafico.length} / {MIN_DETALHES_LENGTH}
                                </span>
                            </div>
                            <textarea
                                id="dashboard-detalhes"
                                value={detalhesGrafico} onChange={(e) => setDetalhesGrafico(e.target.value)}
                                placeholder="Descreva o contexto, período, fonte dos dados, etc. (mín. 15 caracteres)"
                                rows={4}
                                className={cn(
                                    "w-full px-4 py-3 border bg-gray-50/25 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none",
                                    showDetalhesWarning ? 
                                    "border-red-300 focus:ring-red-500" : 
                                    (isDetalhesValido ? 
                                    "border-green-300 focus:ring-green-500" : 
                                    "border-gray-200 focus:ring-blue-500"),
                                    isNewVersionMode && "disabled:bg-gray-100 disabled:cursor-not-allowed"
                                )}
                                disabled={isNewVersionMode}
                            />
                            {showDetalhesWarning && !isDetalhesValido && (
                                <p className="text-xs text-red-500 mt-1.5">
                                    Os detalhes são obrigatórios (mín. {MIN_DETALHES_LENGTH} caracteres).
                                </p>
                            )}
                        </div>
                    )}
                    {/* --- FIM DA ATUALIZAÇÃO --- */}


                     <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Tema de Cores</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap p-2 rounded-2xl">
                                {Object.entries(coresPredefinidas).map(([nome, corHex]) => (
                                    <button
                                        key={nome} title={`Tema ${nome}`} onClick={() => handleColorClick(corHex)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${corTemaAtiva === corHex ? 'ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                        style={{ backgroundColor: corHex }} disabled={false}
                                    ></button>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 p-2 bg-white rounded-2xl border border-gray-200">
                                <span className="text-xs text-gray-600 mr-2">Tema atual:</span>
                                {conjuntoDeDados.cores?.slice(0, 5).map((cor, index) => (
                                    <div key={index} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: cor }} title={cor}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                     {isNewVersionMode && (
                        <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                            <h3 className="text-lg font-semibold text-blue-800">Detalhes da Nova Versão</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da Alteração</label>
                                <select
                                    value={tipoVersao} onChange={(e) => setTipoVersao(e.target.value as TipoVersao)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={TipoVersao.CORRECAO}>Correção de Informação Incorreta</option>
                                    <option value={TipoVersao.ATUALIZACAO_MENSAL}>Atualização Mensal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição das Alterações (Obrigatório)</label>
                                <textarea
                                    value={descricaoVersao} onChange={(e) => setDescricaoVersao(e.target.value)}
                                    placeholder="Ex: Atualização dos dados para o mês de Setembro."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna Central */}
                <div className="flex flex-col space-y-6 border-x-0 lg:border-x border-gray-200 px-0 lg:px-6">
                    <SeletorTipoGrafico tipoSelecionado={tipoGrafico} aoMudarTipo={aoMudarTipo} />
                    <div className="pt-4">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            {isNewVersionMode ? "Novos Dados do Gráfico" : "Fonte dos Dados"}
                        </label>
                        <div className="flex space-x-2 mb-4 bg-gray-100 rounded-2xl p-1">
                            <button onClick={() => setAbaFonteDeDados("manual")} className={`flex-1 text-sm py-2 px-4 rounded-2xl font-semibold transition-all flex justify-center items-center gap-2 ${abaFonteDeDados === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}><Database className="w-4 h-4" /> Dados Manuais</button>
                            <button onClick={() => setAbaFonteDeDados("upload")} className={`flex-1 text-sm py-2 px-4 rounded-2xl font-semibold transition-all flex justify-center items-center gap-2 ${abaFonteDeDados === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}><Upload className="w-4 h-4" /> Upload de Arquivo</button>
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
                                aoAtualizarFormatoColuna={atualizarFormatoColuna}
                            />
                        ) : (
                            <SecaoUploadArquivo arquivoDeDados={arquivoDeDados} setArquivoDeDados={setArquivoDeDados} aoBaixarModelo={baixarModelo} />
                        )}
                    </div>
                </div>

                {/* Coluna Direita */}
                <div className="flex flex-col space-y-4 h-full pt-1">
                     <label className="block text-lg font-medium text-gray-700 flex-shrink-0">Pré-visualização</label>
                     <div className="flex-1 min-h-0 h-full">
                        <PrevisualizacaoGrafico
                            tipoGrafico={tipoGrafico} 
                            conjuntoDeDados={conjuntoDeDados}
                            titulo={tituloGrafico}
                            aoAlternarTelaCheia={alternarTelaCheia}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Tela Cheia */}
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
                            emTelaCheia={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
};