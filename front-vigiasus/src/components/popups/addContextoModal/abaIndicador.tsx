import React from 'react';
import { useModalAdicionarConteudo } from './useAddContentModal';
import { NomeIcone, TipoVersao } from './types';
import { icons as indicatorIcons } from '@/components/indicadores/indicadorCard';

type AbaIndicadorProps = Pick<
    ReturnType<typeof useModalAdicionarConteudo>,
    | 'tituloIndicador' | 'setTituloIndicador'
    | 'descricaoIndicador' | 'setDescricaoIndicador'
    | 'valorAtualIndicador' | 'setValorAtualIndicador'
    | 'valorAlvoIndicador' | 'setValorAlvoIndicador'
    | 'unidadeIndicador' | 'setUnidadeIndicador'
    | 'textoComparativoIndicador' | 'setTextoComparativoIndicador'
    | 'corIndicador' | 'setCorIndicador'
    | 'iconeIndicador' | 'setIconeIndicador'
    | 'isNewVersionMode'
    | 'selectedVersion'
    | 'tipoVersao'
    | 'setTipoVersao'
    | 'descricaoVersao'
    | 'setDescricaoVersao'
>;

const iconMap: Record<NomeIcone, keyof typeof indicatorIcons> = {
    Heart: "cuidados",
    Building: "unidades",
    ClipboardList: "servidores",
    TrendingUp: "atividade",
    Landmark: "cruz",
    Users: "populacao",
    UserCheck: "medicos",
    DollarSign: "atividade",
};

const PrevisualizacaoIndicador: React.FC<{
    titulo: string;
    descricao: string;
    valorAtual: string;
    unidade: string;
    textoComparativo: string;
    cor: string;
    icone: NomeIcone;
    changeType: 'positive' | 'negative' | 'neutral';
}> = ({
    titulo, descricao, valorAtual, unidade, textoComparativo, cor, icone, changeType
}) => {
    
    const corTextoComparativo = 
        changeType === 'positive' ? 'text-green-600' :
        changeType === 'negative' ? 'text-red-600' :
        'text-gray-600';

    const unidadesMonetarias = ["R$", "$", "€"];
    const eUnidadeMonetaria = unidadesMonetarias.includes(unidade);

    const IconeDoCard = indicatorIcons[iconMap[icone]];

    return (
        <div 
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between min-h-[160px] transition-all"
            style={{ borderLeft: `4px solid ${cor || '#cccccc'}` }}
        >
            <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-600 break-words pr-2">{titulo || "Título"}</p>
                <div className="text-gray-400">{IconeDoCard}</div>
            </div>
            <div className="my-2 text-center">
                <p className="text-4xl font-bold text-gray-900 leading-none">
                    {eUnidadeMonetaria && <span className="text-2xl font-medium text-gray-500 mr-1">{unidade}</span>}
                    {valorAtual || "0"}
                    {!eUnidadeMonetaria && unidade !== "Nenhum" && <span className="text-2xl font-medium text-gray-500 ml-1">{unidade}</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1 break-words">{descricao || "Descrição"}</p>
            </div>
            <div className="h-5">
                {textoComparativo && (
                    <div className={`text-sm font-semibold flex items-center gap-1 ${corTextoComparativo}`}>
                        {changeType === "positive" && <span>▲</span>}
                        {changeType === "negative" && <span>▼</span>}
                        {changeType === "neutral" && <span className="font-bold">—</span>}
                        <span>{textoComparativo.replace(/^(\+|-|—)\s*/, "")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


export const AbaIndicador: React.FC<AbaIndicadorProps> = (props) => {
    const {
        tituloIndicador, setTituloIndicador,
        descricaoIndicador, setDescricaoIndicador,
        valorAtualIndicador, setValorAtualIndicador,
        valorAlvoIndicador, setValorAlvoIndicador,
        unidadeIndicador, setUnidadeIndicador,
        textoComparativoIndicador, setTextoComparativoIndicador,
        corIndicador, setCorIndicador,
        iconeIndicador, setIconeIndicador,
        isNewVersionMode,
        selectedVersion,
        tipoVersao,
        setTipoVersao,
        descricaoVersao,
        setDescricaoVersao,
    } = props;

    const getChangeType = (): 'positive' | 'negative' | 'neutral' => {
        if (textoComparativoIndicador.startsWith('+')) return 'positive';
        if (textoComparativoIndicador.startsWith('-')) return 'negative';
        return 'neutral';
    };

    const unidades = ["Nenhum", "%", "R$", "$", "€", "Unidades", "Pessoas", "Atendimentos", "Dias", "Horas", "Minutos", "Mil","Milhares", "Milhões", "Bilhões"];
    
    // 1. Objeto de cores expandido, com os nomes e códigos hexadecimais correspondentes
    const coresPredefinidas = {
        blue: '#3B82F6',
        green: '#22C55E',
        red: '#EF4444',
        yellow: '#EAB308',
        purple: '#A855F7',
        orange: '#F97316',
        teal: '#14B8A6',
        pink: '#EC4899',
    };

    const estiloInput = "w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
            
            <div className="flex flex-col space-y-6 pt-1">
                 <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-2 items-end">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Título do Indicador
                            {isNewVersionMode && (
                                <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md align-middle">
                                    NOVA VERSÃO
                                </span>
                            )}
                        </label>
                        <input type="text" value={tituloIndicador} onChange={(e) => setTituloIndicador(e.target.value)} className={estiloInput} placeholder="Ex: População Atendida" disabled={isNewVersionMode}/>
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
                    <label className="block text-lg font-medium text-gray-700 mb-2">Descrição</label>
                    <input type="text" value={descricaoIndicador} onChange={(e) => setDescricaoIndicador(e.target.value)} className={estiloInput} placeholder="Ex: Atendimento da Rede Municipal" disabled={isNewVersionMode}/>
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
                                placeholder="Ex: O valor foi atualizado com base no novo censo."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col space-y-6 border-x-0 lg:border-x border-gray-200 px-0 lg:px-6 overflow-y-auto pr-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Valor Atual</label>
                        <input type="text" value={valorAtualIndicador} onChange={(e) => setValorAtualIndicador(e.target.value)} className={estiloInput} placeholder="Ex: 68 milhões"/>
                    </div>
                     <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Unidade</label>
                        <select value={unidadeIndicador} onChange={(e) => setUnidadeIndicador(e.target.value)} className={estiloInput}>
                            {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Valor Alvo (Meta)</label>
                    <input type="text" value={valorAlvoIndicador} onChange={(e) => setValorAlvoIndicador(e.target.value)} className={estiloInput} placeholder="Opcional"/>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Texto Comparativo</label>
                    <input type="text" value={textoComparativoIndicador} onChange={(e) => setTextoComparativoIndicador(e.target.value)} placeholder="Use '+', '-' ou '—' no início" className={estiloInput}/>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Ícone e Cor</label>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Ícone</label>
                            <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 rounded-lg">
                                {(Object.keys(iconMap) as NomeIcone[]).map(nomeIcone => (
                                    <button
                                        key={nomeIcone}
                                        onClick={() => setIconeIndicador(nomeIcone)}
                                        className={`flex items-center justify-center p-2 rounded-lg transition-colors ${iconeIndicador === nomeIcone ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-200'}`}
                                        disabled={isNewVersionMode}
                                        title={nomeIcone}
                                    >
                                        {React.cloneElement(indicatorIcons[iconMap[nomeIcone]], { className: "w-5 h-5" })}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Cor</label>
                            {/* 2. Renderização dinâmica dos botões de cor */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {Object.entries(coresPredefinidas).map(([nome, corHex]) => (
                                    <button
                                        key={nome}
                                        title={nome}
                                        onClick={() => setCorIndicador(corHex)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${corIndicador === corHex ? 'ring-2 ring-offset-2 ring-current' : ''}`}
                                        style={{ backgroundColor: corHex, color: corHex }}
                                        disabled={isNewVersionMode}
                                    ></button>
                                ))}
                                <div className="relative w-8 h-8">
                                    <input type="color" value={corIndicador} onChange={(e) => setCorIndicador(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Escolher cor personalizada" disabled={isNewVersionMode}/>
                                    <div className="w-8 h-8 rounded-full border-2 border-dashed pointer-events-none" style={{ borderColor: corIndicador }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col h-full pt-1">
                 <h3 className="text-lg font-medium text-gray-700 mb-2">Pré-visualização</h3>
                <div className="w-full max-w-xs mx-auto mt-4">
                    <PrevisualizacaoIndicador
                        titulo={tituloIndicador}
                        descricao={descricaoIndicador}
                        valorAtual={valorAtualIndicador}
                        unidade={unidadeIndicador}
                        textoComparativo={textoComparativoIndicador}
                        cor={corIndicador}
                        icone={iconeIndicador}
                        changeType={getChangeType()}
                    />
                </div>
            </div>
        </div>
    );
};