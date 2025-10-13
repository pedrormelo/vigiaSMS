// src/app/gerencia/page.tsx
"use client";

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, NomeIcone, Versao, SubmitData } from "@/components/popups/addContextoModal/types";

import { FileGrid } from "@/components/contextosCard/contextosGrid";
import { Button } from "@/components/button";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import { Edit, Eye, SearchX } from 'lucide-react';
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal/index";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import { useDebounce } from "@/hooks/useDebounce";

type IndicatorData = Omit<React.ComponentProps<typeof IndicatorCard>, "onClick"> & {
    id: string;
    unidade: string;
    versoes: Versao[];
    insertedDate: string;
};

const indicators: IndicatorData[] = [
    {
        id: "ind-1",
        title: "População Atendida",
        value: "68 milhões",
        unidade: "Milhões",
        subtitle: "Atendimento da Rede Municipal",
        change: "+32% em relação ao PMQA",
        changeType: "positive",
        borderColor: "border-l-blue-500",
        iconType: "cuidados",
        insertedDate: new Date().toISOString(),
        versoes: [
            { id: 1, nome: "v1 - População Atendida", data: "2025-08-10", autor: "Carlos" },
            { id: 2, nome: "v2 - População Atendida", data: "2025-09-15", autor: "Ana" },
        ]
    },
    {
        id: "ind-2",
        title: "Unidades de Saúde",
        value: "200",
        unidade: "Unidades",
        subtitle: "Unidades ativas",
        change: "— Sem alteração",
        changeType: "neutral",
        borderColor: "border-l-green-500",
        iconType: "unidades",
        insertedDate: "2025-09-01",
        versoes: [
            { id: 1, nome: "v1 - Unidades de Saúde", data: "2025-09-01", autor: "Carlos" },
        ]
    },
    {
        id: "ind-3",
        title: "Profissionais Ativos",
        value: "2.345",
        unidade: "Pessoas",
        subtitle: "Em toda Secretaria",
        change: "+4,2% em relação ao PMQA",
        changeType: "positive",
        borderColor: "border-l-red-500",
        iconType: "servidores",
        insertedDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        versoes: [
            { id: 1, nome: "v1 - Profissionais Ativos", data: "2025-07-20", autor: "Mariana" },
            { id: 2, nome: "v2 - Profissionais Ativos", data: "2025-08-20", autor: "Mariana" },
            { id: 3, nome: "v3 - Profissionais Ativos", data: "2025-09-20", autor: "Carlos" },
        ]
    },
];

const dadosDashboardPEC = {
    colunas: ['Status de Implantação', 'Quantidade de Unidades'],
    linhas: [
        ['PEC Implantado', 150],
        ['Em Implantação', 25],
        ['Não Iniciado', 25],
    ],
};

const sampleFiles: DetalhesContexto[] = [
    {
        id: "1",
        title: "Pagamento ESF e ESB - 2025",
        type: "pdf",
        insertedDate: "2024-07-15",
        url: "/docs/teste.pdf",
        description: "Documento detalhado sobre os pagamentos das equipes de Saúde da Família (ESF) e Saúde Bucal (ESB) para o ano de 2025.",
        solicitante: "Ana Lima",
        autor: "Diretoria Financeira",
        versoes: [
            { id: 1, nome: "Pagamento ESF e ESB - 2025 (v1).pdf", data: "2024-06-23", autor: "Carlos" },
            { id: 2, nome: "Pagamento ESF e ESB - 2025 (v2).pdf", data: "2024-07-10", autor: "Carlos" },
            { id: 3, nome: "Pagamento ESF e ESB - 2025 (v3).pdf", data: "2024-07-15", autor: "Ana" },
        ]
    },
    {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "dashboard",
        insertedDate: "2025-08-22",
        payload: dadosDashboardPEC,
        description: "Dashboard interativo que monitora o status de implementação do Prontuário Eletrônico do Cidadão (PEC) nas unidades de saúde.",
        solicitante: "Carlos Andrade",
        autor: "Gerência de TI",
        chartType: "chart",
        versoes: [
            { id: 1, nome: "PEC Status - (v1)", data: "2025-08-22", autor: "Carlos Andrade" }
        ]
    },
    {
        id: "4",
        title: "Servidores Ativos",
        type: "excel",
        insertedDate: "2024-06-23",
        url: "#",
        description: "Planilha com a relação de todos os servidores ativos, incluindo comissionados, efetivos e contratos temporários.",
        solicitante: "Mariana Costa",
        autor: "Recursos Humanos",
        versoes: [
            { id: 1, nome: "Servidores Ativos (v1).xlsx", data: "2024-06-23", autor: "Mariana Costa" }
        ]
    },
    {
        id: "6",
        title: "Link para Dashboard Externo",
        type: "link",
        insertedDate: new Date().toISOString(),
        url: "https://www.google.com",
        description: "Link de acesso ao painel de monitoramento de dados epidemiológicos mantido pelo Ministério da Saúde.",
        solicitante: "João Silva",
        autor: "Vigilância Epidemiológica",
        versoes: [
            { id: 1, nome: "Link MS Saúde (v1)", data: "2024-06-23", autor: "João Silva" }
        ]
    },
    {
        id: "5",
        title: "Resolução 20/07/2025",
        type: "resolucao",
        insertedDate: "2024-07-20",
        url: "#",
        description: "Publicação oficial da resolução do Conselho Municipal de Saúde sobre as novas diretrizes de atendimento.",
        solicitante: "Conselho Municipal",
        autor: "Conselho Municipal",
        versoes: [
             { id: 1, nome: "Resolução 20/07/2025 (v1)", data: "2024-07-20", autor: "CMS" }
        ]
    },
    {
        id: "2",
        title: "Relatório de Atividades da Atenção Básica",
        type: "doc",
        insertedDate: "2024-05-15",
        url: "/docs/pas.docx",
        description: "Documento Word contendo o compilado das atividades realizadas pela Atenção Básica no último trimestre.",
        solicitante: "Fernanda Lima",
        autor: "Diretoria de Atenção Básica",
        versoes: [
            { id: 1, nome: "Relatório Atividades AB (v1).docx", data: "2024-05-15", autor: "Fernanda Lima" }
        ]
    },
];


const mockGerencias = [
    {
        id: "1",
        sigla: "GTI",
        nome: "Gerência de Tecnologia da Informação",
        descricao: "A Gerência de Tecnologia da Informação é responsável por planejar, implementar e gerenciar a infraestrutura de TI da organização. Assim, busca garantir que os recursos tecnológicos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de TI esteja sempre atualizada e capacitada para lidar com as demandas do gestão. Nossa equipe está comprometida em fornecer suporte e soluções tecnológicas que impulsionem a eficiência e a inovação.",
        image: "/gerencias/images/gti.jpg"
    },
    {
        id: "2",
        sigla: "GPLAN",
        nome: "Gerência de Planejamento",
        descricao: "A Gerência de Planejamento é responsável por planejar, implementar e gerenciar as atividades de planejamento da organização. Assim, busca garantir que os colaboradores estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de planejamento esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
        image: ""
    },
    {
        id: "3",
        sigla: "GPEP",
        nome: "Gerência de Políticas Estratégicas",
        descricao: "A Gerência de Políticas Estratégicas é responsável por planejar, implementar e gerenciar as políticas estratégicas da organização. Assim, busca garantir que os recursos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de políticas esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
        image: ""
    },
];

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [abaInicial, setAbaInicial] = useState<AbaAtiva>('contexto');
    const [modo, setModo] = useState<'visualizacao' | 'edicao'>('visualizacao');
    const [dadosParaEditar, setDadosParaEditar] = useState<Partial<DetalhesContexto> | null>(null);
    const [selectedGerenciaId, setSelectedGerenciaId] = useState<string>(mockGerencias[0].id);
    const [gerenciaDetails, setGerenciaDetails] = useState<{ sigla: string; nome: string; descricao: string, image: string } | null>(mockGerencias[0]);
    const [gerenciaLoading, setGerenciaLoading] = useState(false);
    const [gerenciaError, setGerenciaError] = useState<string | null>(null);
    const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
    const [ficheiroSelecionado, setFicheiroSelecionado] = useState<DetalhesContexto | null>(null);
    const [perfil, setPerfil] = useState<'diretor' | 'gerente' | 'membro'>('membro');
    
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState<'recente' | 'todas'>("todas");
    const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    const handleSelectedTypesChange = (type: FileType) => {
        setSelectedTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredFiles = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return sampleFiles.filter(file => {
            const matchesSearch = file.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesTab = activeTab === 'todas' || new Date(file.insertedDate) >= sevenDaysAgo;
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
            
            return matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes]);

    useEffect(() => {
        setGerenciaLoading(true);
        setGerenciaError(null);
        setTimeout(() => {
            const found = mockGerencias.find(g => g.id === selectedGerenciaId);
            if (found) { setGerenciaDetails(found); } 
            else { setGerenciaDetails(null); setGerenciaError('Gerência não encontrada'); }
            setGerenciaLoading(false);
        }, 400);
    }, [selectedGerenciaId]);

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
        const iconMap: Record<IndicatorData['iconType'], NomeIcone> = {
            cuidados: "Heart", unidades: "Building", servidores: "ClipboardList",
            atividade: "TrendingUp", cruz: "Landmark", populacao: "Users", medicos: "UserCheck", ambulancia: "DollarSign"
        };
        const borderColorMap: { [key: string]: string } = {
            "border-l-blue-500": "#3B82F6", "border-l-green-500": "#22C55E", "border-l-red-500": "#EF4444",
        };

        const dadosFormatados: DetalhesContexto = {
            id: indicator.id,
            title: indicator.title,
            type: 'indicador',
            insertedDate: indicator.versoes.length > 0 ? indicator.versoes[indicator.versoes.length - 1].data : new Date().toISOString(),
            description: indicator.subtitle,
            solicitante: indicator.versoes.length > 0 ? indicator.versoes[0].autor : "N/A",
            versoes: indicator.versoes,
            valorAtual: indicator.value, 
            unidade: indicator.unidade, 
            textoComparativo: indicator.change || "",
            cor: borderColorMap[indicator.borderColor], 
            icone: iconMap[indicator.iconType],
            payload: {
                description: indicator.subtitle,
                valorAtual: indicator.value,
                unidade: indicator.unidade,
                textoComparativo: indicator.change || "",
                cor: borderColorMap[indicator.borderColor],
                icone: iconMap[indicator.iconType],
            },
        };
        setFicheiroSelecionado(dadosFormatados);
        setModalVisualizacaoAberto(true);
    };

    const aoSubmeterConteudo = (dados: SubmitData) => {
        console.log("Novo conteúdo recebido:", dados);
    };

    const aoClicarArquivo = (ficheiro: DetalhesContexto) => {
        setFicheiroSelecionado(ficheiro);
        setModalVisualizacaoAberto(true);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">
            <ModalAdicionarConteudo
                estaAberto={isModalOpen}
                aoFechar={() => { setIsModalOpen(false); setDadosParaEditar(null); }}
                aoSubmeter={aoSubmeterConteudo}
                abaInicial={abaInicial}
                dadosIniciais={dadosParaEditar}
            />
            <VisualizarContextoModal
                estaAberto={modalVisualizacaoAberto}
                aoFechar={() => setModalVisualizacaoAberto(false)}
                dadosDoContexto={ficheiroSelecionado}
                aoCriarNovaVersao={lidarComCriarNovaVersao}
                perfil={perfil}
                isEditing={modo === 'edicao'}
            />

            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-6xl font-bold text-blue-700">GTI</h1>
                        <h2 className="text-4xl ml-2.5 text-blue-600">GERÊNCIA DE TECNOLOGIA DA INFORMAÇÃO</h2>
                    </div>
                    <button
                        onClick={() => setModo(modo === 'visualizacao' ? 'edicao' : 'visualizacao')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        {modo === 'visualizacao' ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        {modo === 'visualizacao' ? 'Modo de Edição' : 'Modo de Visualização'}
                    </button>
                </div>

                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>

                <div className="flex justify-center items-center gap-4 mb-16 flex-wrap">
                    {modo === 'edicao' && <AddIndicatorButton onClick={() => abrirModal('indicador')} />}
                    {indicators.map((indicator) => (
                        <IndicatorCard
                            key={indicator.id}
                            {...indicator}
                            onClick={() => lidarComVisualizarIndicador(indicator)}
                        />
                    ))}
                </div>

                <FilterBar 
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedTypes={selectedTypes}
                    onSelectedTypesChange={handleSelectedTypesChange}
                    clearTypeFilter={() => setSelectedTypes([])}
                />
                
                <div className="border-2 border-dashed border-gray-300 rounded-4xl bg-gray-50 min-h-[300px] flex items-center justify-center">
                    {filteredFiles.length > 0 ? (
                        <FileGrid
                            files={filteredFiles}
                            onFileClick={aoClicarArquivo}
                            isEditing={modo === 'edicao'}
                            onAddContextClick={() => abrirModal('contexto')}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <SearchX className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Nenhum Contexto Encontrado</h3>
                            <p className="text-gray-500 mt-2 max-w-md">
                                Tente ajustar sua pesquisa ou limpar os filtros para ver mais resultados.
                            </p>
                        </div>
                    )}
                </div>


                <div className="flex gap-4 mt-18 mb-8">
                    {mockGerencias.map(g => (
                        <Button key={g.id} onClick={() => setSelectedGerenciaId(g.id)} className={`rounded-xl px-6 py-2 text-base font-bold ${selectedGerenciaId === g.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-700'}`}>
                            {g.sigla}
                        </Button>
                    ))}
                </div>

                {gerenciaLoading ? (<div>Carregando...</div>)
                    : gerenciaError ? (<div>{gerenciaError}</div>)
                        : gerenciaDetails && (
                            <>
                                <div className="mb-2 flex flex-row items-start gap-8">
                                    <div className="flex-1">
                                        <div className="flex gap-4 justify-start items-center mb-4">
                                            <h1 className="text-6xl font-extrabold text-blue-700">{gerenciaDetails.sigla}</h1>
                                            <h3 className="text-4xl font-regular text-blue-600">{gerenciaDetails.nome}</h3>
                                        </div>
                                        <span className="text-2xl font-medium ml-2 text-blue-600">SOBRE</span>
                                        <div className="mb-8 mt-3 max-w-[90%]">
                                            <p className="text-md ml-2 text-blue-600">{gerenciaDetails.descricao}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 relative w-[300px] h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                                        {gerenciaDetails.image ? (
                                            <Image src={gerenciaDetails.image} alt={gerenciaDetails.nome} fill className="object-cover w-full h-full" />
                                        ) : (
                                            <span className="text-gray-400 text-lg">Sem imagem</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
            </div>
        </div>
    );
}