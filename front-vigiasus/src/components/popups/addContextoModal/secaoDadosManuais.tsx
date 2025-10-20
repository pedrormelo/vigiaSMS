// src/components/popups/addContextoModal/secaoDadosManuais.tsx
import React, { useRef, useEffect } from "react";
import { Trash2, Plus, GripVertical, Settings } from "lucide-react";
// Certifique-se que FormatoColuna está sendo importado corretamente de types
import { SecaoDadosManuaisProps, FormatoColuna } from "@/components/popups/addContextoModal/types";
import { EntradaTabelaDeDados } from "@/components/popups/addContextoModal/entradaTabelaDeDados";

export const SecaoDadosManuais: React.FC<SecaoDadosManuaisProps> = ({
    conjuntoDeDados, aoAtualizarCelula, aoAdicionarLinha, aoRemoverLinha,
    aoAdicionarColuna, aoRemoverColuna, aoAtualizarNomeColuna,
    aoAtualizarFormatoColuna // <-- Garantir que está na desestruturação
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
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Séries de Dados (Valores)</h3>
                    <button onClick={aoAdicionarColuna} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 font-semibold rounded-2xl hover:bg-blue-200 transition">
                        <Plus className="w-3 h-3" /> Adicionar Série
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conjuntoDeDados.colunas.slice(1).map((coluna, indexRelativo) => {
                        const indiceColunaReal = indexRelativo + 1;
                        return (
                            <div key={indiceColunaReal} className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200">
                                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <EntradaTabelaDeDados
                                    eCabecalho
                                    valor={coluna}
                                    aoMudar={(valor) => aoAtualizarNomeColuna(indiceColunaReal, valor)}
                                    placeholder={`Série ${indexRelativo + 1}`}
                                />
                                {conjuntoDeDados.colunas.length > 2 && (
                                    <button onClick={() => aoRemoverColuna(indiceColunaReal)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tabela de Dados */}
            <div ref={scrollContainerRef} className="overflow-auto max-h-64 rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        {/* CORREÇÃO HIDRATAÇÃO: Remover espaços entre os <th> */}
                        <tr><th className="p-3 text-left w-1/3 min-w-[200px] align-top">
                                <EntradaTabelaDeDados
                                    eCabecalho
                                    valor={conjuntoDeDados.colunas[0]}
                                    aoMudar={(valor) => aoAtualizarNomeColuna(0, valor)}
                                    placeholder="Categoria"
                                    className="text-left"
                                />
                                <div className="text-xs text-gray-500 font-normal mt-1">Texto (Categoria)</div>
                            </th>{conjuntoDeDados.colunas.slice(1).map((coluna, indexRelativo) => {
                                const indiceColunaReal = indexRelativo + 1;
                                const formatoAtual = conjuntoDeDados.formatos?.[indiceColunaReal] || 'number';
                                return (
                                    <th key={indiceColunaReal} className="p-3 text-center min-w-[170px] align-top group relative">
                                        <EntradaTabelaDeDados
                                            eCabecalho
                                            valor={coluna}
                                            aoMudar={(valor) => aoAtualizarNomeColuna(indiceColunaReal, valor)}
                                            placeholder={`Série ${indexRelativo + 1}`}
                                        />
                                        <div className="relative mt-1">
                                            <select
                                                value={formatoAtual}
                                                // Verifica se a função existe antes de chamar (defensivo)
                                                onChange={(e) => {
                                                    if (typeof aoAtualizarFormatoColuna === 'function') {
                                                        aoAtualizarFormatoColuna(indiceColunaReal, e.target.value as FormatoColuna);
                                                    } else {
                                                        console.error("Erro: aoAtualizarFormatoColuna não é uma função. Props recebidas:", { aoAtualizarFormatoColuna });
                                                    }
                                                }}
                                                className="w-full text-xs appearance-none bg-gray-200 border border-gray-300 rounded-md py-1 px-2 pr-6 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                title="Selecionar formato dos dados"
                                            >
                                                {formatosDisponiveis.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                            <Settings className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                                        </div>
                                        {conjuntoDeDados.colunas.length > 2 && (
                                            <button
                                                onClick={() => aoRemoverColuna(indiceColunaReal)}
                                                className="absolute -top-1 -right-1 p-1 rounded-full text-gray-400 bg-gray-100 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remover Série"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </th>
                                );
                            })}<th className="w-12 p-3"></th></tr>
                    </thead>
                    <tbody>
                        {conjuntoDeDados.linhas.map((linha, indiceLinha) => (
                             <tr key={indiceLinha} className="border-t border-gray-200 group hover:bg-blue-50/30 transition-colors">
                                <td className="p-2 w-1/3 min-w-[200px]">
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
                                    const placeholder = conjuntoDeDados.formatos?.[indiceColunaReal] === 'percent' ? '50' :
                                                        conjuntoDeDados.formatos?.[indiceColunaReal] === 'currency' ? '123,45' : '0';

                                    return (
                                        <td key={indiceColunaReal} className="p-2 min-w-[170px]">
                                            <EntradaTabelaDeDados
                                                valor={valorCelula}
                                                aoMudar={(valor) => aoAtualizarCelula(indiceLinha, indiceColunaReal, valor)}
                                                placeholder={placeholder}
                                                tipo={tipoInput}
                                                className={conjuntoDeDados.formatos?.[indiceColunaReal] !== 'text' ? 'text-right' : 'text-left'}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="w-12 text-center">
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
            <button onClick={aoAdicionarLinha} className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-gray-50 text-gray-700 font-semibold border border-dashed border-gray-300 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition">
                <Plus className="w-4 h-4" /> Adicionar Categoria (Linha)
            </button>
        </div>
    );
};