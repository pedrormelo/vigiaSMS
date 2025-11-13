// src/constants/contextos.ts

import { Contexto, StatusContexto, Versao, HistoricoEvento } from "@/components/validar/typesDados";
import { FileType } from "@/components/contextosCard/contextoCard";

// Helper para criar históricos mock
const histAguardandoGerente: HistoricoEvento[] = [
    { data: "2025-08-02T10:00:00Z", autor: "Pedro Augusto Lorenzo", acao: "Submetido para análise." },
];
const histAguardandoCorrecao: HistoricoEvento[] = [
    { data: "2025-08-03T11:30:00Z", autor: "Luiza Vitória de Alincatra", acao: "Submetido para análise." },
    { data: "2025-08-04T09:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Devolvido para correção. Justificativa: Falta a coluna 'Fonte do Recurso'." },
];
const histAguardandoDiretor: HistoricoEvento[] = [
    { data: "2025-08-05T15:00:00Z", autor: "Murilo Alencar Gomes", acao: "Submetido para análise." },
    { data: "2025-08-06T10:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
];
const histAguardandoGerente2: HistoricoEvento[] = [
    { data: "2025-08-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", acao: "Submetido para análise." },
];
const histAguardandoGerente3: HistoricoEvento[] = [
    { data: "2025-08-29T09:00:00Z", autor: "Carlos Eduardo", acao: "Submetido para análise." },
];
const histAguardandoGerente4: HistoricoEvento[] = [
    { data: "2025-09-05T10:30:00Z", autor: "Equipe Planejamento", acao: "Submetido para análise." },
];
const histAguardandoDiretor2: HistoricoEvento[] = [
    { data: "2025-10-15T09:00:00Z", autor: "Diretoria de Gestão", acao: "Submetido para análise." },
    { data: "2025-10-16T14:20:00Z", autor: "Gerente", acao: "Deferido e encaminhado ao Diretor." },
];

export const mockData: Contexto[] = [
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        title: "Monitoramento Financeiro COAPES", // nome -> title
        status: StatusContexto.AguardandoGerente, // situacao -> status
        type: "planilha", // docType -> type
        gerencia: "Gerência de Gestão Ensino e Serviço",
        insertedDate: "2025-08-02T10:00:00Z", // data -> insertedDate
        description: "Relatório detalhado contendo o monitoramento dos repasses financeiros...", // detalhes -> description
        historico: histAguardandoGerente,
        url: "/docs/mock_coapes_financeiro.xlsx",
        versoes: [{ id: 1, nome: "v1", data: "2025-08-02T10:00:00Z", autor: "Pedro Augusto Lorenzo", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente }]
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        title: "Emendas Parlamentares - 2025",
        status: StatusContexto.AguardandoCorrecao,
        type: "planilha",
        gerencia: "Gerência de Planejamento em Saúde",
        insertedDate: "2025-08-03T11:30:00Z",
        description: "Planilha com a relação de todas as emendas parlamentares...",
        historico: histAguardandoCorrecao,
        url: "/docs/mock_emendas_2025.xlsx",
        versoes: [{ id: 1, nome: "v1", data: "2025-08-03T11:30:00Z", autor: "Luiza Vitória de Alincatra", status: StatusContexto.AguardandoCorrecao, historico: histAguardandoCorrecao }]
    },
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        title: "Monitoramento Ouvidoria",
        status: StatusContexto.AguardandoDiretor,
        type: "doc",
        gerencia: "Coordenação de Ouvidoria do SUS",
        insertedDate: "2025-08-05T15:00:00Z",
        description: "Documento com a compilação e análise das principais demandas...",
        historico: histAguardandoDiretor,
        url: "/docs/mock_ouvidoria_relatorio.docx",
        versoes: [{ id: 1, nome: "v1", data: "2025-08-05T15:00:00Z", autor: "Murilo Alencar Gomes", status: StatusContexto.AguardandoDiretor, historico: histAguardandoDiretor }]
    },
    {
        id: "4",
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        title: "Pagamento PV/JET - Agosto de 2025",
        status: StatusContexto.AguardandoGerente,
        type: "pdf",
        gerencia: "Gerência de Gestão do Trabalho",
        insertedDate: "2025-08-28T14:00:00Z",
        description: "Comprovativo de pagamento referente ao Programa de Valorização...",
        historico: histAguardandoGerente2,
        url: "/docs/mock_pvjet_agosto.pdf",
        versoes: [{ id: 1, nome: "v1", data: "2025-08-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente2 }]
    },
    {
        id: "5",
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        title: "Relatório Epidemiológico Semanal",
        status: StatusContexto.AguardandoGerente,
        type: "dashboard",
        gerencia: "Gerência de Vigilância em Saúde",
        insertedDate: "2025-08-29T09:00:00Z",
        description: "Dashboard com a apresentação do relatório epidemiológico...",
        historico: histAguardandoGerente3,
        url: "/dashboards/epidemiologico/semana35",
        versoes: [{ id: 1, nome: "v1", data: "2025-08-29T09:00:00Z", autor: "Carlos Eduardo", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente3 }]
    },
    {
        id: "6",
        solicitante: "Equipe Planejamento",
        email: "planejamento@sms.gov",
        title: "Apresentação de Resultados 2025",
        status: StatusContexto.AguardandoGerente,
        type: "apresentacao",
        gerencia: "Gerência de Planejamento em Saúde",
        insertedDate: "2025-09-05T10:30:00Z",
        description: "Slides com os principais resultados do quadrimestre...",
        historico: histAguardandoGerente4,
        url: "/docs/mock_resultados_2025.pptx",
        versoes: [{ id: 1, nome: "v1", data: "2025-09-05T10:30:00Z", autor: "Equipe Planejamento", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente4 }]
    },
    {
        id: "7",
        solicitante: "Diretoria de Gestão",
        email: "gestao@sms.gov",
        title: "Plano de Ação Trimestral",
        status: StatusContexto.AguardandoDiretor,
        type: "apresentacao",
        gerencia: "Gerência de Gestão do Trabalho",
        insertedDate: "2025-10-15T09:00:00Z",
        description: "Apresentação do plano de ação do próximo trimestre...",
        historico: histAguardandoDiretor2,
        url: "/docs/mock_plano_acao_trimestral.pptx",
        versoes: [{ id: 1, nome: "v1", data: "2025-10-15T09:00:00Z", autor: "Diretoria de Gestão", status: StatusContexto.AguardandoDiretor, historico: histAguardandoDiretor2 }]
    },
];