// src/app/gerencia/[id]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Edit, Eye, SearchX } from 'lucide-react';

// Hooks
import { useDebounce } from "@/hooks/useDebounce";

// Componentes da UI e Popups
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import GerenciaDashboardPreview from "@/components/gerencia/dashboard/gerencia-dashboard-preview";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal/index";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import StatusBadge from "@/components/alerts/statusBadge";
import StatusBanner from "@/components/ui/status-banner";
import { useStaleness } from "@/hooks/useStaleness";

// Tipos e Dados
import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, NomeIcone, Versao, SubmitData } from "@/components/popups/addContextoModal/types";
import { diretoriasConfig } from "@/constants/diretorias"; 
import { mockGraphs } from "@/constants/graphData"; 
// --- 1. IMPORTAR O ENUM DE STATUS ---
import { StatusContexto } from "@/components/validar/typesDados";

// Tipos de Dados Locais
type IndicatorData = Omit<React.ComponentProps<typeof IndicatorCard>, "onClick"> & {
    id: string;
    unidade: string;
    versoes: Versao[];
    insertedDate: string;
    status: StatusContexto; // <-- Propriedade de status é necessária
};

// --- DADOS MOCKADOS (COM STATUS ADICIONADO) ---
const indicators: IndicatorData[] = [
    { id: "ind-1", title: "População Atendida", value: "68 milhões", unidade: "Milhões", subtitle: "Atendimento da Rede Municipal", change: "+32% em relação ao PMQA", changeType: "positive", borderColor: "border-l-blue-500", iconType: "cuidados", insertedDate: "2025-10-13T12:00:00.000Z", versoes: [{ id: 1, nome: "v1 - População Atendida", data: "2025-08-10", autor: "Carlos" }, { id: 2, nome: "v2 - População Atendida", data: "2025-09-15", autor: "Ana" }], status: StatusContexto.Publicado },
    { id: "ind-2", title: "Unidades de Saúde", value: "200", unidade: "Unidades", subtitle: "Unidades ativas", change: "— Sem alteração", changeType: "neutral", borderColor: "border-l-green-500", iconType: "unidades", insertedDate: "2025-09-01", versoes: [{ id: 1, nome: "v1 - Unidades de Saúde", data: "2025-09-01", autor: "Carlos" }], status: StatusContexto.Publicado },
    { id: "ind-3", title: "Profissionais Ativos", value: "2.345", unidade: "Pessoas", subtitle: "Em toda Secretaria", change: "+4,2% em relação ao PMQA", changeType: "positive", borderColor: "border-l-red-500", iconType: "servidores", insertedDate: "2025-10-10T12:00:00.000Z", versoes: [{ id: 1, nome: "v1 - Profissionais Ativos", data: "2025-07-20", autor: "Mariana" }, { id: 2, nome: "v2 - Profissionais Ativos", data: "2025-08-20", autor: "Mariana" }, { id: 3, nome: "v3 - Profissionais Ativos", data: "2025-09-20", autor: "Carlos" }], status: StatusContexto.Publicado },
];

const dadosDashboardPEC = {
    colunas: ['Status de Implantação', 'Quantidade de Unidades'],
    linhas: [['PEC Implantado', 150], ['Em Implantação', 25], ['Não Iniciado', 25]],
    cores: ['#3B82F6', '#F97316', '#EF4444'] 
};

const sampleFiles: DetalhesContexto[] = [
    { id: "1", title: "Pagamento ESF e ESB - 2025", type: "pdf", insertedDate: "2024-07-15", url: "/docs/teste.pdf", description: "Documento detalhado sobre os pagamentos das equipes de Saúde da Família (ESF) e Saúde Bucal (ESB) para o ano de 2025.", solicitante: "Ana Lima", autor: "Diretoria Financeira", versoes: [{ id: 1, nome: "Pagamento ESF e ESB - 2025 (v1).pdf", data: "2024-06-23", autor: "Carlos" }, { id: 2, nome: "Pagamento ESF e ESB - 2025 (v2).pdf", data: "2024-07-10", autor: "Carlos" }, { id: 3, nome: "Pagamento ESF e ESB - 2025 (v3).pdf", data: "2024-07-15", autor: "Ana" }], status: StatusContexto.Publicado },
    { id: "3", title: "Unidades com o PEC implementado", type: "dashboard", insertedDate: "2025-08-22", payload: dadosDashboardPEC, description: "Dashboard interativo que monitora o status de implementação do Prontuário Eletrônico do Cidadão (PEC) nas unidades de saúde.", solicitante: "Carlos Andrade", autor: "Gerência de TI", chartType: "chart", versoes: [{ id: 1, nome: "PEC Status - (v1)", data: "2025-08-22", autor: "Carlos Andrade" }], status: StatusContexto.Publicado },
    { id: "4", title: "Servidores Ativos", type: "excel", insertedDate: "2024-06-23", url: "#", description: "Planilha com a relação de todos os servidores ativos, incluindo comissionados, efetivos e contratos temporários.", solicitante: "Mariana Costa", autor: "Recursos Humanos", versoes: [{ id: 1, nome: "Servidores Ativos (v1).xlsx", data: "2024-06-23", autor: "Mariana Costa" }], status: StatusContexto.Publicado },
    { id: "6", title: "Link para Dashboard Externo", type: "link", insertedDate: "2025-10-13T12:00:00.000Z", url: "https://www.google.com", description: "Link de acesso ao painel de monitoramento de dados epidemiológicos mantido pelo Ministério da Saúde.", solicitante: "João Silva", autor: "Vigilância Epidemiológica", versoes: [{ id: 1, nome: "Link MS Saúde (v1)", data: "2024-06-23", autor: "João Silva" }], status: StatusContexto.Publicado },
    { id: "5", title: "Resolução 20/07/2025", type: "resolucao", insertedDate: "2024-07-20", url: "#", description: "Publicação oficial da resolução do Conselho Municipal de Saúde sobre as novas diretrizes de atendimento.", solicitante: "Conselho Municipal", autor: "Conselho Municipal", versoes: [{ id: 1, nome: "Resolução 20/07/2025 (v1)", data: "2024-07-20", autor: "CMS" }], status: StatusContexto.Publicado },
    { id: "2", title: "Relatório de Atividades da Atenção Básica", type: "doc", insertedDate: "2024-05-15", url: "/docs/pas.docx", description: "Documento Word contendo o compilado das atividades realizadas pela Atenção Básica no último trimestre.", solicitante: "Fernanda Lima", autor: "Diretoria de Atenção Básica", versoes: [{ id: 1, nome: "Relatório Atividades AB (v1).docx", data: "2024-05-15", autor: "Fernanda Lima" }], status: StatusContexto.Publicado },
    // Adicionando um item pendente para teste
    { id: "7", title: "Relatório Parcial de Atividades (Novembro)", type: "doc", insertedDate: "2025-11-01T10:00:00.000Z", url: "#", description: "Versão preliminar para análise do gerente.", solicitante: "Membro da Gerência", autor: "Membro", versoes: [{ id: 1, nome: "Relatório Parcial Nov (v1).docx", data: "2025-11-01", autor: "Membro" }], status: StatusContexto.AguardandoGerente },
];

export default function GerenciaPage() {
    // --- ROTEAMENTO E DADOS DINÂMICOS ---
    const params = useParams();
    const id = (params?.id as string) || "";

    const resolved = useMemo(() => {
        if (!id) return null;
        for (const key of Object.keys(diretoriasConfig)) {
            const dir = diretoriasConfig[key];
            const ger = dir.gerencias.find(g => g.id === id);
            if (ger) return { diretoria: dir, gerencia: ger };
        }
        return null;
    }, [id]);

    // --- ESTADOS DE UI E FILTROS ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [abaInicial, setAbaInicial] = useState<AbaAtiva>('contexto');
    const [modo, setModo] = useState<'visualizacao' | 'edicao'>('visualizacao');
    const [dadosParaEditar, setDadosParaEditar] = useState<Partial<DetalhesContexto> | null>(null);
    const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
    const [ficheiroSelecionado, setFicheiroSelecionado] = useState<DetalhesContexto | null>(null);
    const [perfil] = useState<'diretor' | 'gerente' | 'membro'>('membro');
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState<'recente' | 'todas'>("todas");
    const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    // --- ATUALIZADO: DADOS AGORA SÃO ESTADO ---
    // (Usando os mocks que agora incluem 'status')
    const [arquivos, setArquivos] = useState<DetalhesContexto[]>(sampleFiles);
    const [indicadores, setIndicadores] = useState<IndicatorData[]>(indicators);

    // --- ATUALIZAÇÃO / STALENESS (agora usa 'arquivos' e 'indicadores' do estado) ---
    const { variant: stalenessVariant, label: stalenessLabel, lastUpdatedAt } = useStaleness({
        extractors: [
            () => {
                const arr: Array<string> = [];
                for (const f of arquivos) { // <-- Usa estado 'arquivos'
                    if (f.insertedDate) arr.push(f.insertedDate);
                    if (Array.isArray(f.versoes)) for (const v of f.versoes) if (v.data) arr.push(v.data);
                }
                return arr;
            },
            () => {
                const arr: Array<string> = [];
                for (const ind of indicadores) { // <-- Usa estado 'indicadores'
                    if (ind.insertedDate) arr.push(ind.insertedDate);
                    if (Array.isArray(ind.versoes)) for (const v of ind.versoes) if (v.data) arr.push(v.data);
                }
                return arr;
            }
        ],
        thresholds: { recentDays: 7, staleDays: 30 },
        locale: 'pt-BR'
    });

    // --- LÓGICA DE FILTRAGEM ---
    const handleSelectedTypesChange = (type: FileType) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const filteredFiles = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return arquivos.filter(file => { // <-- Usa estado 'arquivos'
            const matchesSearch = file.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesTab = activeTab === 'todas' || new Date(file.insertedDate) >= sevenDaysAgo;
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
            
            // Lógica para membro ver seus próprios envios pendentes
            const isVisibleParaMembro = perfil === 'membro' || file.status === StatusContexto.Publicado;

            return isVisibleParaMembro && matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes, arquivos, perfil]); // <-- Adicionado 'arquivos' e 'perfil'

    // --- HANDLERS DE EVENTOS ---
    const abrirModal = (aba: AbaAtiva) => {
        setAbaInicial(aba);
        setIsModalOpen(true);
    };
    
    const lidarComCriarNovaVersao = (dadosDoContextoAntigo: DetalhesContexto) => {
        setDadosParaEditar(dadosDoContextoAntigo);
        setModalVisualizacaoAberto(false);
        const tabParaAbrir: AbaAtiva =
            dadosDoContextoAntigo.type === 'dashboard' ? 'dashboard' :
            dadosDoContextoAntigo.type === 'indicador' ? 'indicador' :
            'contexto';
        setTimeout(() => abrirModal(tabParaAbrir), 50);
    };

    const lidarComVisualizarIndicador = (indicator: IndicatorData) => {
        const iconMap: Record<IndicatorData['iconType'], NomeIcone> = { cuidados: "Heart", unidades: "Building", servidores: "ClipboardList", atividade: "TrendingUp", cruz: "Landmark", populacao: "Users", medicos: "UserCheck", ambulancia: "DollarSign" };
        const borderColorMap: { [key: string]: string } = { "border-l-blue-500": "#3B82F6", "border-l-green-500": "#22C55E", "border-l-red-500": "#EF4444" };

        const indicadorAtual = indicadores.find(i => i.id === indicator.id) || indicator;

        const dadosFormatados: DetalhesContexto = {
            id: indicadorAtual.id, title: indicadorAtual.title, type: 'indicador', insertedDate: indicadorAtual.versoes.length > 0 ? indicadorAtual.versoes[indicadorAtual.versoes.length - 1].data : new Date().toISOString(),
            description: indicadorAtual.subtitle, solicitante: indicadorAtual.versoes.length > 0 ? indicadorAtual.versoes[0].autor : "N/A",
            versoes: indicadorAtual.versoes, 
            valorAtual: indicadorAtual.value, unidade: indicadorAtual.unidade,
            textoComparativo: indicadorAtual.change || "", cor: borderColorMap[indicadorAtual.borderColor], icone: iconMap[indicadorAtual.iconType],
            status: indicadorAtual.status, // <-- Passa o status
            payload: {
                description: indicadorAtual.subtitle, valorAtual: indicadorAtual.value, unidade: indicadorAtual.unidade,
                textoComparativo: indicadorAtual.change || "", cor: borderColorMap[indicadorAtual.borderColor], icone: iconMap[indicadorAtual.iconType],
            },
        };
        setFicheiroSelecionado(dadosFormatados);
        setModalVisualizacaoAberto(true);
    };

    const aoSubmeterConteudo = (dados: SubmitData) => {
        console.log("Novo conteúdo recebido:", dados);
        // Lógica para adicionar/atualizar dados no estado 'arquivos' ou 'indicadores'
    };

    const aoClicarArquivo = (ficheiro: DetalhesContexto) => {
        const arquivoAtual = arquivos.find(f => f.id === ficheiro.id) || ficheiro;
        setFicheiroSelecionado(arquivoAtual); 
        setModalVisualizacaoAberto(true);
    };
    
    // ATUALIZADO: Lógica para 'ocultar versão' (já estava correta, mas agora depende dos estados)
    const lidarComAlternarVisibilidadeVersao = (contextoId: string, versaoId: number) => {
        setArquivos(prevArquivos => 
            prevArquivos.map(arquivo => {
                if (arquivo.id === contextoId && arquivo.versoes) {
                    return {
                        ...arquivo,
                        versoes: arquivo.versoes.map(versao => 
                            versao.id === versaoId 
                                ? { ...versao, estaOculta: !versao.estaOculta } 
                                : versao
                        )
                    };
                }
                return arquivo;
            })
        );
        setIndicadores(prevIndicadores =>
            prevIndicadores.map(indicador => {
                if (indicador.id === contextoId && indicador.versoes) {
                     return {
                        ...indicador,
                        versoes: indicador.versoes.map(versao => 
                            versao.id === versaoId 
                                ? { ...versao, estaOculta: !versao.estaOculta } 
                                : versao
                        )
                    };
                }
                return indicador;
            })
        );
        
        if (ficheiroSelecionado && ficheiroSelecionado.id === contextoId && ficheiroSelecionado.versoes) {
            setFicheiroSelecionado({
                ...ficheiroSelecionado,
                versoes: ficheiroSelecionado.versoes.map(versao => 
                    versao.id === versaoId 
                        ? { ...versao, estaOculta: !versao.estaOculta } 
                        : versao
                )
            });
        }
    };


    // --- RENDERIZAÇÃO ---
    if (!id) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
    if (!resolved) return <div className="p-8 text-center text-red-500">Gerência com ID &ldquo;{id}&rdquo; não encontrada.</div>;

    const { diretoria, gerencia } = resolved;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <ModalAdicionarConteudo estaAberto={isModalOpen} aoFechar={() => { setIsModalOpen(false); setDadosParaEditar(null); }} aoSubmeter={aoSubmeterConteudo} abaInicial={abaInicial} dadosIniciais={dadosParaEditar} />
            <VisualizarContextoModal 
                estaAberto={modalVisualizacaoAberto} 
                aoFechar={() => setModalVisualizacaoAberto(false)} 
                dadosDoContexto={ficheiroSelecionado} 
                aoCriarNovaVersao={lidarComCriarNovaVersao} 
                perfil={perfil} 
                isEditing={modo === 'edicao'}
                aoAlternarVisibilidadeVersao={lidarComAlternarVisibilidadeVersao} // <-- Passa a função
            />

            {/* Header Dinâmico (Removido pl-25) */}
            <div className="relative p-8 mb-6 text-white shadow-lg" style={{ background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})` }}>
                <h2 className="text-3xl font-regular mt-1">{diretoria.nome}</h2>
            </div>

            
            <div className="container mx-auto p-6">

                {/* Optional banner when stale or inactive */}
                {(stalenessVariant === 'stale' || stalenessVariant === 'error') && (
                    <div className="mb-6">
                        <StatusBanner
                            variant={stalenessVariant === 'stale' ? 'warning' : 'danger'}
                            title={stalenessVariant === 'stale' ? 'Esta gerência está sem atualizações recentes.' : 'Esta gerência parece inativa.'}
                        >
                            <p className="pl-9 text-sm">
                                Última atualização em {lastUpdatedAt?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}. 
                                Considere solicitar novos dados ou publicar um contexto para manter o acompanhamento em dia.
                            </p>
                        </StatusBanner>
                    </div>
                )}

                {/* Título Dinâmico da Gerência */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-6xl font-bold text-blue-700">{gerencia.sigla}</h1>
                        <h2 className="text-4xl ml-2.5 text-blue-600 uppercase">{gerencia.nome}</h2>
                    </div>
                    <button onClick={() => setModo(modo === 'visualizacao' ? 'edicao' : 'visualizacao')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-md">
                        {modo === 'visualizacao' ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        {modo === 'visualizacao' ? 'Modo de Edição' : 'Modo de Visualização'}
                    </button>
                </div>


                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>

                <div className="mb-10">
                    <GerenciaDashboardPreview graphs={mockGraphs} gerencia={id} />
                </div>

                <div className="flex justify-center items-center gap-4 mb-16 flex-wrap">
                    {modo === 'edicao' && <AddIndicatorButton onClick={() => abrirModal('indicador')} />}
                    {indicadores.map((indicator) => ( // <-- Usa estado 'indicadores'
                        <IndicatorCard key={indicator.id} {...indicator} onClick={() => lidarComVisualizarIndicador(indicator)} />
                    ))}
                </div>

                {/* Staleness indicator */}
                <div className="mb-3">
                    <StatusBadge variant={stalenessVariant} label={stalenessLabel} />
                </div>

                <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} activeTab={activeTab} onTabChange={setActiveTab} selectedTypes={selectedTypes} onSelectedTypesChange={handleSelectedTypesChange} clearTypeFilter={() => setSelectedTypes([])} />
                <div className="border-2 border-none border-gray-300 rounded-4xl bg-[#FDFDFD] min-h-[300px] flex items-center justify-center">
                    {filteredFiles.length > 0 ? (
                        <FileGrid files={filteredFiles} onFileClick={aoClicarArquivo} isEditing={modo === 'edicao'} onAddContextClick={() => abrirModal('contexto')} />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <SearchX className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Nenhum Contexto Encontrado</h3>
                            <p className="text-gray-500 mt-2 max-w-md">Tente ajustar sua pesquisa ou limpar os filtros para ver mais resultados.</p>
                        </div>
                    )}
                </div>
                
                {/* Seção Sobre Dinâmica */}
                <div className="mt-32 mb-16">
                    <div className="flex flex-row items-start gap-8">
                        <div className="flex-1">
                            <div className="flex gap-4 items-center mb-4">
                                <h1 className="text-6xl font-extrabold text-blue-700">{gerencia.sigla}</h1>
                                <h3 className="text-4xl font-regular text-blue-600">{gerencia.nome}</h3>
                            </div>
                            <span className="text-2xl font-medium ml-2 text-blue-600">SOBRE</span>
                            <div className="mb-8 mt-3 max-w-[90%]">
                                <p className="text-md ml-2 text-blue-600">{gerencia.descricao ?? "Sem descrição disponível para esta gerência."}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 relative w-[300px] h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                            {gerencia.image ? <Image src={gerencia.image} alt={gerencia.nome} fill className="object-cover" /> : <span className="text-gray-400 text-lg">Sem imagem</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}