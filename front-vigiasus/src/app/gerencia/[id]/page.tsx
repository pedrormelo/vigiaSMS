// src/app/gerencia/[id]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Edit, Eye, SearchX, UploadCloud } from 'lucide-react';
import { cn } from "@/lib/utils"; 

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

// Componentes do Carrossel
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Tipos e Dados
import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, NomeIcone, Versao, SubmitData } from "@/components/popups/addContextoModal/types";
import { diretoriasConfig } from "@/constants/diretorias"; 
import { mockGraphs } from "@/constants/graphData"; 
// Tipos de Dados Locais
import { StatusContexto, HistoricoEvento } from "@/components/validar/typesDados";

type IndicatorData = Omit<React.ComponentProps<typeof IndicatorCard>, "onClick"> & {
    id: string;
    unidade: string;
    versoes: Versao[];
    insertedDate: string;
    status: StatusContexto; 
    estaOculto?: boolean;
    // Propriedades de validação adicionadas
    solicitante?: string;
    gerencia?: string;
    autor?: string;
    historico?: HistoricoEvento[];
};

// --- 1. Históricos de Exemplo (A CHAVE DA CORREÇÃO) ---

const historicoPublicado: HistoricoEvento[] = [
  { acao: "Submetido (v1)", autor: "Membro da Equipe", data: "2025-09-01T10:00:00Z" },
  { acao: "Análise Gerente: Deferido", autor: "Gerente Ana", data: "2025-09-02T11:00:00Z" },
  { acao: "Análise Diretor: Deferido", autor: "Diretor Carlos", data: "2025-09-03T12:00:00Z" },
  { acao: "Finalizado como Publicado", autor: "Sistema", data: "2025-09-03T12:01:00Z" }
];

const historicoAguardandoDiretor: HistoricoEvento[] = [
  { acao: "Submetido (v1)", autor: "Membro da Equipe", data: "2025-10-15T09:00:00Z" },
  { acao: "Análise Gerente: Deferido", autor: "Gerente Ana", data: "2025-10-16T10:30:00Z" }
];

const historicoAguardandoGerente: HistoricoEvento[] = [
  { acao: "Submetido (v1)", autor: "Membro da Equipe", data: "2025-11-01T10:00:00Z" }
];

// --- 2. INDICADORES ATUALIZADOS (COM 'historico' e 'status' nas versões) ---

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
        insertedDate: "2025-10-13T12:00:00.000Z", 
        solicitante: "Ana Lima", 
        gerencia: "Gerência de Atenção Básica", 
        autor: "Ana Lima",
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "v1 - População Atendida", data: "2025-08-10", autor: "Carlos", status: StatusContexto.Publicado, historico: [] }, 
            { id: 2, nome: "v2 - População Atendida", data: "2025-09-15", autor: "Ana", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
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
        solicitante: "Carlos Andrade", 
        gerencia: "Gerência de Infraestrutura", 
        autor: "Carlos Andrade",
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "v1 - Unidades de Saúde", data: "2025-09-01", autor: "Carlos", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
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
        insertedDate: "2025-10-10T12:00:00.000Z", 
        solicitante: "Mariana Costa", 
        gerencia: "Gerência de Recursos Humanos", 
        autor: "Mariana Costa",
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "v1 - Profissionais Ativos", data: "2025-07-20", autor: "Mariana", status: StatusContexto.Publicado, historico: [] }, 
            { id: 2, nome: "v2 - Profissionais Ativos", data: "2025-08-20", autor: "Mariana", status: StatusContexto.Publicado, historico: [] }, 
            { id: 3, nome: "v3 - Profissionais Ativos", data: "2025-09-20", autor: "Carlos", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "ind-4", 
        title: "Média de Atendimentos (Dia)", 
        value: "4.120", 
        unidade: "Atendimentos", 
        subtitle: "Consultas e procedimentos", 
        change: "-2.5% vs mês anterior", 
        changeType: "negative", 
        borderColor: "border-l-orange-500", 
        iconType: "atividade", 
        insertedDate: "2025-11-01T12:00:00.000Z", 
        solicitante: "Ana Lima", 
        gerencia: "Gerência de Atenção Básica", 
        autor: "Ana Lima",
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "v1 - Média Atendimentos", data: "2025-11-01", autor: "Ana", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "ind-5", 
        title: "Investimento em Saúde", 
        value: "R$ 1.2 Bi", 
        unidade: "Bilhões", 
        subtitle: "Orçamento executado 2025", 
        change: "+8% em relação a 2024", 
        changeType: "positive", 
        borderColor: "border-l-purple-500", 
        iconType: "ambulancia", 
        insertedDate: "2025-10-28T12:00:00.000Z", 
        solicitante: "Diretoria Financeira", 
        gerencia: "Gerência de Finanças", 
        autor: "Diretoria Financeira",
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "v1 - Investimento", data: "2025-10-28", autor: "Carlos", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "ind-6",
        title: "Taxa de Ocupação de Leitos",
        value: "85%", 
        unidade: "%", 
        subtitle: "Leitos clínicos", 
        change: "+5% vs semana anterior", 
        changeType: "positive", 
        borderColor: "border-l-yellow-500", 
        iconType: "unidades", 
        insertedDate: "2025-11-05T12:00:00.000Z", 
        solicitante: "Membro da Gerência", 
        gerencia: "Gerência de Leitos", 
        autor: "Membro da Gerência",
        status: StatusContexto.AguardandoGerente,
        estaOculto: false,
        historico: historicoAguardandoGerente, 
        versoes: [
            { id: 1, nome: "v1 - Taxa de Ocupação", data: "2025-11-05", autor: "Membro da Gerência", status: StatusContexto.AguardandoGerente, historico: historicoAguardandoGerente }
        ], 
    }
];

const dadosDashboardPEC = {
    colunas: ['Status de Implantação', 'Quantidade de Unidades'],
    linhas: [['PEC Implantado', 150], ['Em Implantação', 25], ['Não Iniciado', 25]],
    cores: ['#3B82F6', '#F97316', '#EF4444'] 
};

// --- 3. ARQUIVOS (SAMPLEFILES) ATUALIZADOS (COM 'historico' e 'status' nas versões) ---

const sampleFiles: DetalhesContexto[] = [
    { 
        id: "1", 
        title: "Pagamento ESF e ESB - 2025", 
        type: "pdf", 
        insertedDate: "2024-07-15", 
        url: "/docs/teste.pdf", 
        description: "Documento detalhado sobre os pagamentos...", 
        solicitante: "Ana Lima", 
        gerencia: "Gerência de Finanças", 
        autor: "Diretoria Financeira", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Pagamento ESF e ESB - 2025 (v1).pdf", data: "2024-06-23", autor: "Carlos", status: StatusContexto.Publicado, historico: [] }, 
            { id: 2, nome: "Pagamento ESF e ESB - 2025 (v2).pdf", data: "2024-07-10", autor: "Carlos", status: StatusContexto.Publicado, historico: [] }, 
            { id: 3, nome: "Pagamento ESF e ESB - 2025 (v3).pdf", data: "2024-07-15", autor: "Ana", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "3", 
        title: "Unidades com o PEC implementado", 
        type: "dashboard", 
        insertedDate: "2025-08-22", 
        payload: dadosDashboardPEC, 
        description: "Dashboard interativo...", 
        solicitante: "Carlos Andrade", 
        gerencia: "Gerência de TI", 
        autor: "Gerência de TI", 
        chartType: "chart", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "PEC Status - (v1)", data: "2025-08-22", autor: "Carlos Andrade", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "4", 
        title: "Servidores Ativos", 
        type: "excel", 
        insertedDate: "2024-06-23", 
        url: "#", 
        description: "Planilha com a relação de todos os servidores...", 
        solicitante: "Mariana Costa", 
        gerencia: "Gerência de Recursos Humanos", 
        autor: "Recursos Humanos", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Servidores Ativos (v1).xlsx", data: "2024-06-23", autor: "Mariana Costa", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "6", 
        title: "Link para Dashboard Externo", 
        type: "link", 
        insertedDate: "2025-10-13T12:00:00.000Z", 
        url: "https://www.google.com", 
        description: "Link de acesso ao painel...", 
        solicitante: "João Silva", 
        gerencia: "Vigilância Epidemiológica", 
        autor: "Vigilância Epidemiológica", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Link MS Saúde (v1)", data: "2024-06-23", autor: "João Silva", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "5", 
        title: "Resolução 20/07/2025", 
        type: "resolucao", 
        insertedDate: "2024-07-20", 
        url: "#", 
        description: "Publicação oficial da resolução...", 
        solicitante: "Conselho Municipal", 
        gerencia: "Conselho Municipal de Saúde", 
        autor: "Conselho Municipal", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Resolução 20/07/2025 (v1)", data: "2024-07-20", autor: "CMS", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "2", 
        title: "Relatório de Atividades da Atenção Básica", 
        type: "doc", 
        insertedDate: "2024-05-15", 
        url: "/docs/pas.docx", 
        description: "Documento Word contendo o compilado...", 
        solicitante: "Fernanda Lima", 
        gerencia: "Gerência de Atenção Básica", 
        autor: "Diretoria de Atenção Básica", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Relatório Atividades AB (v1).docx", data: "2024-05-15", autor: "Fernanda Lima", status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "9", 
        title: "Apresentação de Resultados 2025", 
        type: "apresentacao", 
        insertedDate: "2025-09-05", 
        url: "/docs/mock_resultados_2025.pptx", 
        description: "Slides com os principais resultados...", 
        solicitante: "Equipe Planejamento", 
        gerencia: "Gerência de Planejamento", 
        autor: "GPU", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: historicoPublicado,
        versoes: [
            { id: 1, nome: "Resultados 2025 (v1).pptx", data: "2025-09-05", autor: "GPU", estaOculta: false, status: StatusContexto.Publicado, historico: historicoPublicado }
        ], 
    },
    { 
        id: "8", 
        title: "Plano de Ação Trimestral", 
        type: "apresentacao", 
        insertedDate: "2025-10-15", 
        url: "/docs/mock_plano_acao_trimestral.pptx", 
        description: "Apresentação do plano de ação...", 
        solicitante: "Diretoria de Gestão", 
        gerencia: "Diretoria de Gestão", 
        autor: "DGE", 
        status: StatusContexto.AguardandoDiretor, 
        estaOculto: false,
        historico: historicoAguardandoDiretor,
        versoes: [
            { id: 1, nome: "Plano Ação (v1).pptx", data: "2025-10-15", autor: "DGE", estaOculta: false, status: StatusContexto.AguardandoDiretor, historico: historicoAguardandoDiretor }
        ], 
    },
    { 
        id: "7", 
        title: "Relatório Parcial de Atividades (Novembro)", 
        type: "doc", 
        insertedDate: "2025-11-01T10:00:00.000Z", 
        url: "#", 
        description: "Versão preliminar para análise...", 
        solicitante: "Membro da Gerência", 
        gerencia: "Gerência de Atenção Básica", 
        autor: "Membro", 
        status: StatusContexto.AguardandoGerente, 
        estaOculto: false,
        historico: historicoAguardandoGerente,
        versoes: [
            { id: 1, nome: "Relatório Parcial Nov (v1).docx", data: "2025-11-01", autor: "Membro", status: StatusContexto.AguardandoGerente, historico: historicoAguardandoGerente }
        ], 
    },
];

// O restante do seu componente de página...
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

    const [isDragging, setIsDragging] = useState(false); 
    const [arquivoAnexadoPorDrop, setArquivoAnexadoPorDrop] = useState<File | null>(null);

    // --- DADOS EM ESTADO ---
    const [arquivos, setArquivos] = useState<DetalhesContexto[]>(sampleFiles);
    const [indicadores, setIndicadores] = useState<IndicatorData[]>(indicators); 

    // Plugin do Carrossel
    const autoplayPlugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    // --- ATUALIZAÇÃO / STALENESS ---
    const { variant: stalenessVariant, label: stalenessLabel, lastUpdatedAt } = useStaleness({
        extractors: [
            () => {
                const arr: Array<string> = [];
                for (const f of arquivos) { 
                    if (f.status === StatusContexto.Publicado) { 
                        if (f.insertedDate) arr.push(f.insertedDate);
                        if (Array.isArray(f.versoes)) {
                            for (const v of f.versoes) {
                                if (v.data && !v.estaOculta) {
                                    arr.push(v.data);
                                }
                            }
                        }
                    }
                }
                return arr;
            },
            () => {
                const arr: Array<string> = [];
                for (const ind of indicadores) { 
                    if (ind.status === StatusContexto.Publicado) {
                        if (ind.insertedDate) arr.push(ind.insertedDate);
                        if (Array.isArray(ind.versoes)) {
                            for (const v of ind.versoes) {
                                if (v.data && !v.estaOculta) {
                                    arr.push(v.data);
                                }
                            }
                        }
                    }
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

        return arquivos.filter(file => {
            const matchesSearch = file.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesTab = activeTab === 'todas' || new Date(file.insertedDate) >= sevenDaysAgo;
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
            
            const matchesStatus = modo === 'edicao' || file.status === StatusContexto.Publicado;
            const matchesVisibility = modo === 'edicao' || !file.estaOculto;

            return matchesStatus && matchesVisibility && matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes, arquivos, modo]);

    const filteredIndicators = useMemo(() => {
        return indicadores.filter(indicator => {
            if (modo === 'edicao') return true;
            return indicator.status === StatusContexto.Publicado && !indicator.estaOculto;
        });
    }, [indicadores, modo]); 


    // --- HANDLERS DE EVENTOS ---
    const abrirModal = (aba: AbaAtiva) => {
        setAbaInicial(aba);
        setIsModalOpen(true);
    };

    const fecharModalAdicionar = () => {
        setIsModalOpen(false);
        setDadosParaEditar(null);
        setArquivoAnexadoPorDrop(null); 
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
        const borderColorMap: { [key: string]: string } = { "border-l-blue-500": "#3B82F6", "border-l-green-500": "#22C55E", "border-l-red-500": "#EF4444", "border-l-yellow-500": "#F59E0B" };

        const indicadorAtual = indicadores.find(i => i.id === indicator.id) || indicator;
        const corHex = (borderColorMap as Record<string, string>)[indicadorAtual.borderColor] || indicadorAtual.borderColor;

        const dadosFormatados: DetalhesContexto = {
            id: indicadorAtual.id, 
            title: indicadorAtual.title, 
            type: 'indicador', 
            insertedDate: indicadorAtual.insertedDate, // Usar a data principal
            description: indicadorAtual.subtitle, 
            solicitante: indicadorAtual.solicitante || (indicadorAtual.versoes.length > 0 ? indicadorAtual.versoes[0].autor : "N/A"),
            gerencia: indicadorAtual.gerencia,
            versoes: indicadorAtual.versoes, 
            status: indicadorAtual.status, 
            estaOculto: indicadorAtual.estaOculto, 
            historico: indicadorAtual.historico,
            payload: {
                description: indicadorAtual.subtitle, 
                valorAtual: indicadorAtual.value, 
                unidade: indicadorAtual.unidade,
                textoComparativo: indicadorAtual.change || "", 
                cor: corHex,
                icone: iconMap[indicadorAtual.iconType],
            },
            // Adicionando os campos de nível superior para consistência
            valorAtual: indicadorAtual.value,
            unidade: indicadorAtual.unidade,
            textoComparativo: indicadorAtual.change,
            cor: corHex,
            icone: iconMap[indicadorAtual.iconType]
        };
        setFicheiroSelecionado(dadosFormatados);
        setModalVisualizacaoAberto(true);
    };

    const aoSubmeterConteudo = (dados: SubmitData) => {
        console.log("Novo conteúdo recebido:", dados);
    };

    const aoClicarArquivo = (ficheiro: DetalhesContexto) => {
        const arquivoAtual = arquivos.find(f => f.id === ficheiro.id) || ficheiro;
        setFicheiroSelecionado(arquivoAtual); 
        setModalVisualizacaoAberto(true);
    };
    
    const lidarComAlternarVisibilidadeContexto = (contextoId: string) => {
        const contexto = arquivos.find(f => f.id === contextoId);
        if (!contexto) return;

        const estaOcultando = !contexto.estaOculto;
        const confirmMessage = estaOcultando
            ? `Tem certeza que deseja ocultar o contexto "${contexto.title}"?\n\nEle não será mais exibido no modo de visualização.`
            : `Tem certeza que deseja tornar o contexto "${contexto.title}" visível?`;

        if (window.confirm(confirmMessage)) {
            setArquivos(prevArquivos =>
                prevArquivos.map(arquivo => {
                    if (arquivo.id === contextoId) {
                        return { ...arquivo, estaOculto: !arquivo.estaOculto };
                    }
                    return arquivo;
                })
            );
            
            if (ficheiroSelecionado && ficheiroSelecionado.id === contextoId) {
                setFicheiroSelecionado(prev => prev ? ({ ...prev, estaOculto: !prev.estaOculto }) : null);
            }
        }
    };

    const lidarComAlternarVisibilidadeIndicador = (indicadorId: string) => {
        const indicador = indicadores.find(i => i.id === indicadorId);
        if (!indicador) return;

        const estaOcultando = !indicador.estaOculto;
        const confirmMessage = estaOcultando
            ? `Tem certeza que deseja ocultar o indicador "${indicador.title}"?\n\nEle não será mais exibido no modo de visualização.`
            : `Tem certeza que deseja tornar o indicador "${indicador.title}" visível?`;
            
        if (window.confirm(confirmMessage)) {
            setIndicadores(prevIndicadores =>
                prevIndicadores.map(ind => {
                    if (ind.id === indicadorId) {
                         return { ...ind, estaOculto: !ind.estaOculto };
                    }
                    return ind;
                })
            );
            
            if (ficheiroSelecionado && ficheiroSelecionado.id === indicadorId) {
                setFicheiroSelecionado(prev => prev ? ({ ...prev, estaOculto: !prev.estaOculto }) : null);
            }
        }
    };

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

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (modo === 'edicao') { setIsDragging(true); }
    }, [modo]); 
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) { return; }
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        if (modo !== 'edicao') { return; }
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setArquivoAnexadoPorDrop(file); 
            setAbaInicial('contexto');        
            setIsModalOpen(true);             
            e.dataTransfer.clearData();
        }
    }, [modo]); 


    // --- RENDERIZAÇÃO ---
    if (!id) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
    if (!resolved) return <div className="p-8 text-center text-red-500">Gerência com ID &ldquo;{id}&rdquo; não encontrada.</div>;

    const { diretoria, gerencia } = resolved;

    return (
        <div 
            className="min-h-screen bg-[#FDFDFD] relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <ModalAdicionarConteudo 
                estaAberto={isModalOpen} 
                aoFechar={fecharModalAdicionar} 
                aoSubmeter={aoSubmeterConteudo} 
                abaInicial={abaInicial} 
                dadosIniciais={dadosParaEditar}
                arquivoAnexado={arquivoAnexadoPorDrop} 
            />
            <VisualizarContextoModal 
                estaAberto={modalVisualizacaoAberto} 
                aoFechar={() => setModalVisualizacaoAberto(false)} 
                dadosDoContexto={ficheiroSelecionado} 
                aoCriarNovaVersao={lidarComCriarNovaVersao} 
                perfil={perfil} 
                isEditing={modo === 'edicao'}
                aoAlternarVisibilidadeVersao={lidarComAlternarVisibilidadeVersao}
                aoAlternarVisibilidadeIndicador={lidarComAlternarVisibilidadeIndicador} 
            />

            {/* Header Dinâmico */}
            <div className="relative p-8 mb-6 text-white shadow-lg" style={{ background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})` }}>
                <h2 className="text-3xl font-regular mt-1">{diretoria.nome}</h2>
            </div>

            
            <div className="container mx-auto p-6">

                {/* Banner de Staleness */}
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

                {/* Título da Gerência e Botão de Edição */}
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

                {/* Seção Dashboard */}
                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>

                <div className="mb-10">
                    <GerenciaDashboardPreview graphs={mockGraphs} gerencia={id} />
                </div>

                {/* Seção Indicadores (Renderização condicional Carrossel/Grade) */}
                <div className="mb-16">
                    {(() => {
                        const itemsParaRenderizar = [
                            ...(modo === 'edicao' ? 
                                [<AddIndicatorButton key="add-indicator" onClick={() => abrirModal('indicador')} />] 
                                : []),
                            
                            ...filteredIndicators.map((indicator) => ( 
                                <IndicatorCard 
                                    key={indicator.id} 
                                    {...indicator} 
                                    onClick={() => lidarComVisualizarIndicador(indicator)} 
                                />
                            ))
                        ];

                        if (itemsParaRenderizar.length > 4 && modo === 'visualizacao') {
                            return (
                                <Carousel
                                    plugins={[autoplayPlugin.current]}
                                    opts={{ align: "start", loop: true }}
                                    className="w-full max-w-full mx-auto"
                                    onMouseEnter={autoplayPlugin.current.stop}
                                    onMouseLeave={autoplayPlugin.current.play}
                                >
                                    <CarouselContent className="-ml-4">
                                        {itemsParaRenderizar.map((item, index) => (
                                            <CarouselItem 
                                                key={index} 
                                                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                            >
                                                <div className="p-1 h-full">
                                                    {item}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                            );
                        }

                        return (
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                                {itemsParaRenderizar}
                            </div>
                        );
                    })()}
                </div>


                {/* Indicador de Staleness */}
                <div className="mb-3">
                    <StatusBadge variant={stalenessVariant} label={stalenessLabel} />
                </div>

                {/* Barra de Filtro de Contextos */}
                <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} activeTab={activeTab} onTabChange={setActiveTab} selectedTypes={selectedTypes} onSelectedTypesChange={handleSelectedTypesChange} clearTypeFilter={() => setSelectedTypes([])} />
                
                {/* Grade de Contextos */}
                <div className="border-2 border-none border-gray-300 rounded-4xl bg-[#FDFDFD] min-h-[300px] flex items-center justify-center">
                    
                    {filteredFiles.length > 0 ? (
                        <FileGrid 
                            files={filteredFiles} 
                            onFileClick={aoClicarArquivo} 
                            isEditing={modo === 'edicao'} 
                            onAddContextClick={() => abrirModal('contexto')} 
                            onToggleOculto={lidarComAlternarVisibilidadeContexto} 
                        />
                    
                    ) : (modo === 'edicao' && debouncedSearchValue === "" && selectedTypes.length === 0) ? (
                         <FileGrid 
                            files={[]} 
                            onFileClick={aoClicarArquivo} 
                            isEditing={modo === 'edicao'} 
                            onAddContextClick={() => abrirModal('contexto')} 
                            onToggleOculto={lidarComAlternarVisibilidadeContexto}
                        />
                    
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <SearchX className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Nenhum Contexto Encontrado</h3>
                            <p className="text-gray-500 mt-2 max-w-md">
                                {modo === 'visualizacao' 
                                    ? "Não há contextos publicados que correspondam aos filtros." 
                                    : "Tente ajustar sua pesquisa ou limpar os filtros para ver mais resultados."
                                }
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Seção Sobre */}
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

            {/* Overlay de Drag-and-Drop */}
            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 animate-fade-in">
                    <UploadCloud className="w-32 h-32 text-white/90 animate-pulse" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} />
                    <p className="mt-4 text-3xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                        Solte o arquivo para adicionar
                    </p>
                    <p className="text-lg text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                        O arquivo será anexado a um novo contexto.
                    </p>
                </div>
            )}

        </div>
    );
}