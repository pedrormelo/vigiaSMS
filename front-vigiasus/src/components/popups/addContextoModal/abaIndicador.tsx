import React from 'react';
import { useModalAdicionarConteudo } from './useAddContentModal';
import { 
    TrendingUp, TrendingDown, Heart, Landmark, ClipboardList, Users, DollarSign, Building, UserCheck 
} from 'lucide-react';
import { NomeIcone } from './types';

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
>;

const iconesDisponiveis: Record<NomeIcone, React.ReactNode> = {
    Heart: <Heart className="w-5 h-5" />,
    Landmark: <Landmark className="w-5 h-5" />,
    ClipboardList: <ClipboardList className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    TrendingUp: <TrendingUp className="w-5 h-5" />,
    DollarSign: <DollarSign className="w-5 h-5" />,
    Building: <Building className="w-5 h-5" />,
    UserCheck: <UserCheck className="w-5 h-5" />,
};

const PrevisualizacaoIndicador: React.FC<Omit<AbaIndicadorProps, 'setCorIndicador' | 'setIconeIndicador'>> = ({
    tituloIndicador, descricaoIndicador, valorAtualIndicador, unidadeIndicador, textoComparativoIndicador, corIndicador, iconeIndicador
}) => {
    const ePositivo = textoComparativoIndicador.startsWith('+');
    const eNegativo = textoComparativoIndicador.startsWith('-');
    const corTextoComparativo = ePositivo ? 'text-green-600' : eNegativo ? 'text-red-600' : 'text-gray-600';
    const IconeComparativo = ePositivo ? TrendingUp : eNegativo ? TrendingDown : TrendingUp;

    // MUDANÇA: Lógica para a posição da unidade monetária
    const unidadesMonetarias = ["R$", "$", "€"];
    const eUnidadeMonetaria = unidadesMonetarias.includes(unidadeIndicador);

    return (
        <div 
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between min-h-[160px] transition-all"
            style={{ borderLeft: `4px solid ${corIndicador || '#cccccc'}` }}
        >
            <div className="flex justify-between items-start text-gray-400">
                <p className="font-semibold text-gray-600 break-words">{tituloIndicador || "Título"}</p>
                {iconesDisponiveis[iconeIndicador]}
            </div>
            <div className="my-2 text-center">
                {/* MUDANÇA: Renderização condicional da unidade */}
                <p className="text-4xl font-bold text-gray-900 leading-none">
                    {eUnidadeMonetaria && <span className="text-2xl font-medium text-gray-500 mr-1">{unidadeIndicador}</span>}
                    {valorAtualIndicador || "0"}
                    {!eUnidadeMonetaria && unidadeIndicador !== "Nenhum" && <span className="text-2xl font-medium text-gray-500 ml-1">{unidadeIndicador}</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1 break-words">{descricaoIndicador || "Descrição"}</p>
            </div>
            <div className="h-5">
                {textoComparativoIndicador && (
                    <p className={`text-sm font-semibold flex items-center gap-1 ${corTextoComparativo}`}>
                        <IconeComparativo className="w-4 h-4" />
                        {textoComparativoIndicador}
                    </p>
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
    } = props;

    const unidades = ["Nenhum", "%", "R$", "$", "€", "Unidades", "Pessoas", "Atendimentos", "Dias", "Horas", "Minutos", "Mil","Milhares", "Milhões", "Bilhões"];
    const coresPredefinidas = { azul: '#3B82F6', verde: '#22C55E', vermelho: '#EF4444' };
    const estiloInput = "w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50/25 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.5fr)_minmax(0,_1fr)] gap-6 h-full animate-fade-in pb-4">
            
            <div className="flex flex-col space-y-6 pt-1">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Título do Indicador</label>
                    <input type="text" value={tituloIndicador} onChange={(e) => setTituloIndicador(e.target.value)} className={estiloInput} placeholder="Ex: População Atendida"/>
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Descrição</label>
                    <input type="text" value={descricaoIndicador} onChange={(e) => setDescricaoIndicador(e.target.value)} className={estiloInput} placeholder="Ex: Atendimento da Rede Municipal"/>
                </div>
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
                    <input type="text" value={textoComparativoIndicador} onChange={(e) => setTextoComparativoIndicador(e.target.value)} placeholder="Use '+' ou '-' no início (Ex: +4.2%)" className={estiloInput}/>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Ícone e Cor</label>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Ícone</label>
                            <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 rounded-lg">
                                {Object.keys(iconesDisponiveis).map(nomeIcone => (
                                    <button
                                        key={nomeIcone}
                                        onClick={() => setIconeIndicador(nomeIcone as NomeIcone)}
                                        className={`flex items-center justify-center p-2 rounded-lg transition-colors ${iconeIndicador === nomeIcone ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {React.cloneElement(iconesDisponiveis[nomeIcone], { className: "w-5 h-5" })}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Cor</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCorIndicador(coresPredefinidas.azul)} className={`w-8 h-8 rounded-full bg-blue-500 transition-transform hover:scale-110 ${corIndicador === coresPredefinidas.azul ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}></button>
                                <button onClick={() => setCorIndicador(coresPredefinidas.verde)} className={`w-8 h-8 rounded-full bg-green-500 transition-transform hover:scale-110 ${corIndicador === coresPredefinidas.verde ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}></button>
                                <button onClick={() => setCorIndicador(coresPredefinidas.vermelho)} className={`w-8 h-8 rounded-full bg-red-500 transition-transform hover:scale-110 ${corIndicador === coresPredefinidas.vermelho ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}></button>
                                <div className="relative w-8 h-8">
                                    <input type="color" value={corIndicador} onChange={(e) => setCorIndicador(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Escolher cor personalizada"/>
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
                    <PrevisualizacaoIndicador {...props} />
                </div>
            </div>
        </div>
    );
};