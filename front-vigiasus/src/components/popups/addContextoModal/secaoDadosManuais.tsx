// src/components/popups/addContextoModal/secaoDadosManuais.tsx
import React, { useRef, useEffect } from "react";
import { Trash2, Plus, GripVertical, Settings } from "lucide-react";
// Certifique-se que FormatoColuna está sendo importado corretamente de types
import { SecaoDadosManuaisProps, FormatoColuna } from "@/components/popups/addContextoModal/types";
import { EntradaTabelaDeDados } from "@/components/popups/addContextoModal/entradaTabelaDeDados";

export const SecaoDadosManuais: React.FC<SecaoDadosManuaisProps> = ({
    conjuntoDeDados, aoAtualizarCelula, aoAdicionarLinha, aoRemoverLinha,
    aoAdicionarColuna, aoRemoverColuna, aoAtualizarNomeColuna,
    aoAtualizarFormatoColuna, definirFormatoDasSeries, formatoSeries
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [conjuntoDeDados.linhas]);

    const formatosDisponiveis: { value: FormatoColuna, label: string }[] = [
        { value: 'number', label: 'Número' },
        { value: 'percent', label: 'Percentual (%)' },
        { value: 'currency', label: 'Moeda (R$)' },
    ];

    return (
        <div className="space-y-4">
            {/* Seção de controle das colunas */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-3 gap-3">
                    <h3 className="text-sm font-semibold text-gray-700">Séries de Dados (Valores)</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={aoAdicionarColuna} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
                            <Plus className="w-3.5 h-3.5" /> Nova Série
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {conjuntoDeDados.colunas.slice(1).map((coluna, indexRelativo) => {
                        const indiceColunaReal = indexRelativo + 1;
                        return (
                            <div key={indiceColunaReal} className="flex items-center gap-2.5 bg-white p-2 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-shadow shadow-sm">
                                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <EntradaTabelaDeDados
                                    eCabecalho
                                    valor={coluna}
                                    aoMudar={(valor) => aoAtualizarNomeColuna(indiceColunaReal, valor)}
                                    placeholder={`Série ${indexRelativo + 1}`}
                                />
                                {conjuntoDeDados.colunas.length > 2 && (
                                    <button onClick={() => aoRemoverColuna(indiceColunaReal)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition shadow-sm">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <label htmlFor="formato-series" className="text-xs text-gray-600">Formato das Séries</label>
                    </div>
                    <select
                        id="formato-series"
                        value={formatoSeries}
                        onChange={(e) => definirFormatoDasSeries(e.target.value as FormatoColuna)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border min-w-[140px] border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Formato aplicado a todas as séries"
                    >
                        {formatosDisponiveis.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabela de Dados */}
            <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto max-h-72 rounded-2xl border border-gray-200 bg-white">
                <table className="min-w-full w-max text-sm table-fixed">
                    <thead className="bg-gray-100 sticky top-0 z-10 border-b justify-center border-gray-200">
                        {/* CORREÇÃO HIDRATAÇÃO: Remover espaços entre os <th> */}
                        <tr>
                            <th className="px-3 py-2.5 text-left w-1/3 min-w-[200px] align-top whitespace-nowrap">
                                <EntradaTabelaDeDados
                                    eCabecalho
                                    valor={conjuntoDeDados.colunas[0]}
                                    aoMudar={(valor) => aoAtualizarNomeColuna(0, valor)}
                                    placeholder="Categoria"
                                    className="text-left"
                                />
                                {/* <div className="text-xs text-gray-500 font-normal mt-1">Texto (Categoria)</div> */}
                            </th>
                            {conjuntoDeDados.colunas.slice(1).map((coluna, indexRelativo) => {
                                const indiceColunaReal = indexRelativo + 1;
                                return (
                                    <th key={indiceColunaReal} className="px-3 py-2.5 text-center min-w-[180px] align-top group relative whitespace-nowrap">
                                        <EntradaTabelaDeDados
                                            eCabecalho
                                            valor={coluna}
                                            aoMudar={(valor) => aoAtualizarNomeColuna(indiceColunaReal, valor)}
                                            placeholder={`Série ${indexRelativo + 1}`}
                                        />
                                        {conjuntoDeDados.colunas.length > 2 && (
                                            <button
                                                onClick={() => aoRemoverColuna(indiceColunaReal)}
                                                className="absolute -top-0 -left-2 p-1 rounded-full text-gray-400 bg-gray-100 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remover Série"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </th>
                                );
                            })}
                            <th className="w-12 px-3 py-2.5"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {conjuntoDeDados.linhas.map((linha, indiceLinha) => (
                            <tr key={indiceLinha} className="border-t border-gray-100 group hover:bg-blue-50/40 transition-colors odd:bg-white even:bg-gray-50/30">
                                <td className="px-3 py-2 w-1/3 min-w-[200px] whitespace-nowrap">
                                    <EntradaTabelaDeDados
                                        valor={linha[0]}
                                        aoMudar={(valor) => aoAtualizarCelula(indiceLinha, 0, valor)}
                                        placeholder="Ex: Janeiro"
                                    />
                                </td>
                                {conjuntoDeDados.colunas.slice(1).map((_, indiceColunaRelativo) => {
                                    const indiceColunaReal = indiceColunaRelativo + 1;
                                    const valorCelula = linha[indiceColunaReal] ?? "";
                                    const tipoInput = 'text';
                                    const fmt = conjuntoDeDados.formatos?.[indiceColunaReal] || formatoSeries;
                                    const placeholder = fmt === 'percent' ? '50' : fmt === 'currency' ? '123,45' : '0';

                                    return (
                                        <td key={indiceColunaReal} className="px-3 py-2 min-w-[180px] whitespace-nowrap">
                                            <EntradaTabelaDeDados
                                                valor={valorCelula}
                                                aoMudar={(valor) => aoAtualizarCelula(indiceLinha, indiceColunaReal, valor)}
                                                placeholder={placeholder}
                                                tipo={tipoInput}
                                                className={fmt !== 'text' ? 'text-right' : 'text-left'}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="w-12 text-center px-2">
                                    {conjuntoDeDados.linhas.length > 1 && (
                                        <button onClick={() => aoRemoverLinha(indiceLinha)} className="text-gray-400 hover:text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Botão Adicionar Linha */}
            <button onClick={aoAdicionarLinha} className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2.5 bg-gray-50 text-gray-700 font-semibold border border-dashed border-gray-300 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition">
                <Plus className="w-4 h-4" /> Adicionar Categoria (linha)
            </button>
        </div>
    );
};