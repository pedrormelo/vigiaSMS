// src/constants/mockDatabase.ts
// ESTA É A FONTE ÚNICA E COMPLETA DE DADOS MOCK
// *** CORRIGIDO: Todas as constantes de histórico (hist...) estão definidas ANTES de serem usadas ***

import { Contexto, StatusContexto, Versao, HistoricoEvento } from "@/components/validar/typesDados";
import { FileType } from "@/components/contextosCard/contextoCard";
import { NomeIcone, ConjuntoDeDadosGrafico } from "@/components/popups/addContextoModal/types";

// --- Históricos Mock (Helpers Reutilizáveis) ---

// (Origem: contextos.ts - DEFINIDOS PRIMEIRO)
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
const histAguardandoGerente2: HistoricoEvento[] = [ // <-- Definição agora no topo
    { data: "2025-08-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", acao: "Submetido para análise." },
];
const histAguardandoGerente3: HistoricoEvento[] = [ // <-- Definição agora no topo
    { data: "2025-08-29T09:00:00Z", autor: "Carlos Eduardo", acao: "Submetido para análise." },
];
const histAguardandoGerente4: HistoricoEvento[] = [ // <-- Definição agora no topo
    { data: "2025-09-05T10:30:00Z", autor: "Equipe Planejamento", acao: "Submetido para análise." },
];
const histAguardandoDiretor2: HistoricoEvento[] = [ // <-- Definição agora no topo
    { data: "2025-10-15T09:00:00Z", autor: "Diretoria de Gestão", acao: "Submetido para análise." },
    { data: "2025-10-16T14:20:00Z", autor: "Gerente", acao: "Deferido e encaminhado ao Diretor." },
];
const histAguardandoGerenteMultiVersao: HistoricoEvento[] = [ // (Origem: gerencia/page.tsx)
  { acao: "Submetido (v1)", autor: "Membro da Equipe", data: "2025-09-01T10:00:00Z" },
  { acao: "Análise Gerente: Devolvido para correção. Justificativa: Faltou a página 3.", autor: "Gerente Ana", data: "2025-09-02T11:00:00Z" },
  { acao: "Submetido (v2)", autor: "Membro da Equipe", data: "2025-09-03T12:00:00Z" }
];


// (Origem: contextosHistorico.ts)
const histPublicadoCompleto: HistoricoEvento[] = [
    { data: "2025-07-28T14:00:00Z", autor: "Julia Maria Leite", acao: "Submetido para análise." },
    { data: "2025-07-29T11:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
    { data: "2025-07-30T16:45:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
    { data: "2025-07-30T16:46:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
];
const histPublicadoSimples: HistoricoEvento[] = [
    { data: "2025-07-08T12:00:00Z", autor: "Mariana Costa", acao: "Submetido para análise." },
    { data: "2025-07-09T09:30:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
    { data: "2025-07-10T17:50:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
    { data: "2025-07-10T17:51:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
];

// --- Payloads Reutilizáveis (Origem: gerencia/page.tsx) ---
const payloadDashboardPEC: ConjuntoDeDadosGrafico = {
    colunas: ['Status de Implantação', 'Quantidade de Unidades'],
    linhas: [['PEC Implantado', 150], ['Em Implantação', 25], ['Não Iniciado', 25]],
    cores: ['#3B82F6', '#F97316', '#EF4444'] 
};


// --- ARRAY ÚNICO DE DADOS MOCK ---
// (Nomes das gerências padronizados para bater com diretorias.ts)

export const allContextosMock: Contexto[] = [
    
    // --- Contextos "Abertos" (Origem: contextos.ts) ---
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        title: "Monitoramento Financeiro COAPES",
        status: StatusContexto.AguardandoGerente,
        type: "planilha", // "excel" -> "planilha"
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        insertedDate: "2025-08-02T10:00:00Z",
        description: "Relatório detalhado contendo o monitoramento dos repasses financeiros...",
        historico: histAguardandoGerente,
        url: "/docs/mock_coapes_financeiro.xlsx",
        versoes: [{ id: 1, nome: "v1 - Monitoramento COAPES", data: "2025-08-02T10:00:00Z", autor: "Pedro Augusto Lorenzo", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente }]
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        title: "Emendas Parlamentares - 2025",
        status: StatusContexto.AguardandoCorrecao,
        type: "planilha", // "excel" -> "planilha"
        gerencia: "Gerência de Planejamento", // g6
        insertedDate: "2025-08-03T11:30:00Z",
        description: "Planilha com a relação de todas as emendas parlamentares...",
        historico: histAguardandoCorrecao,
        url: "/docs/mock_emendas_2025.xlsx",
        versoes: [{ id: 1, nome: "v1 - Emendas 2025", data: "2025-08-03T11:30:00Z", autor: "Luiza Vitória de Alincatra", status: StatusContexto.AguardandoCorrecao, historico: histAguardandoCorrecao }]
    },
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        title: "Monitoramento Ouvidoria",
        status: StatusContexto.AguardandoDiretor,
        type: "doc",
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Coordenação de Ouvidoria')
        insertedDate: "2025-08-05T15:00:00Z",
        description: "Documento com a compilação e análise das principais demandas...",
        historico: histAguardandoDiretor,
        url: "/docs/mock_ouvidoria_relatorio.docx",
        versoes: [{ id: 1, nome: "v1 - Monitoramento Ouvidoria", data: "2025-08-05T15:00:00Z", autor: "Murilo Alencar Gomes", status: StatusContexto.AguardandoDiretor, historico: histAguardandoDiretor }]
    },
    {
        id: "4",
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        title: "Pagamento PV/JET - Agosto de 2025",
        status: StatusContexto.AguardandoGerente,
        type: "pdf",
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        insertedDate: "2025-08-28T14:00:00Z",
        description: "Comprovativo de pagamento referente ao Programa de Valorização...",
        historico: histAguardandoGerente2, // <-- CORRIGIDO
        url: "/docs/mock_pvjet_agosto.pdf",
        versoes: [{ id: 1, nome: "v1 - Pagamento PV/JET", data: "2025-08-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente2 }]
    },
    {
        id: "5",
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        title: "Relatório Epidemiológico Semanal",
        status: StatusContexto.AguardandoGerente,
        type: "dashboard",
        gerencia: "Gerência de Insperção Sanitária", // g8
        insertedDate: "2025-08-29T09:00:00Z",
        description: "Dashboard com a apresentação do relatório epidemiológico...",
        historico: histAguardandoGerente3, // <-- CORRIGIDO
        url: "/dashboards/epidemiologico/semana35",
        versoes: [{ id: 1, nome: "v1 - Relatório Epidem.", data: "2025-08-29T09:00:00Z", autor: "Carlos Eduardo", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente3 }]
    },
    {
        id: "6",
        solicitante: "Equipe Planejamento",
        email: "planejamento@sms.gov",
        title: "Apresentação de Resultados 2025",
        status: StatusContexto.AguardandoGerente,
        type: "apresentacao",
        gerencia: "Gerência de Planejamento", // g6
        insertedDate: "2025-09-05T10:30:00Z",
        description: "Slides com os principais resultados do quadrimestre para validação.",
        historico: histAguardandoGerente4, // <-- CORRIGIDO
        url: "/docs/mock_resultados_2025.pptx",
        versoes: [{ id: 1, nome: "v1 - Apresentação Resultados", data: "2025-09-05T10:30:00Z", autor: "Equipe Planejamento", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente4 }]
    },
    {
        id: "7",
        solicitante: "Diretoria de Gestão",
        email: "gestao@sms.gov",
        title: "Plano de Ação Trimestral",
        status: StatusContexto.AguardandoDiretor,
        type: "apresentacao",
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        insertedDate: "2025-10-15T09:00:00Z",
        description: "Apresentação do plano de ação do próximo trimestre para aprovação.",
        historico: histAguardandoDiretor2, // <-- CORRIGIDO
        url: "/docs/mock_plano_acao_trimestral.pptx",
        versoes: [{ id: 1, nome: "v1 - Plano de Ação", data: "2025-10-15T09:00:00Z", autor: "Diretoria de Gestão", status: StatusContexto.AguardandoDiretor, historico: histAguardandoDiretor2 }]
    },

    // --- Contextos "Fechados" (Origem: contextosHistorico.ts) ---
     {
        id: "100", 
        solicitante: "Julia Maria Leite",
        email: "julia.leite@example.com",
        title: "Pagamento PV/JET - Julho",
        status: StatusContexto.Publicado,
        type: "pdf",
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        insertedDate: "2025-07-28T14:00:00Z",
        description: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS.",
        historico: histPublicadoCompleto,
        url: "/docs/mock_pvjet_julho.pdf",
        versoes: [{ id: 1, nome: "v1 - Pagamento Julho", data: "2025-07-28T14:00:00Z", autor: "Julia Maria Leite", status: StatusContexto.Publicado, historico: histPublicadoCompleto }]
      },
      {
        id: "101",
        solicitante: "Mariana Costa",
        email: "mari.costa@example.com",
        title: "Publicação de Nova Portaria",
        status: StatusContexto.Publicado,
        type: "doc",
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Ouvidoria')
        insertedDate: "2025-07-10T18:00:00Z",
        description: "Portaria publicada no Diário Oficial sobre novas diretrizes de atendimento.",
        historico: histPublicadoSimples,
        url: "/docs/mock_portaria_xyz.docx",
        versoes: [{ id: 1, nome: "v1 - Nova Portaria", data: "2025-07-10T18:00:00Z", autor: "Mariana Costa", status: StatusContexto.Publicado, historico: histPublicadoSimples }]
      },
      {
        id: "102",
        solicitante: "Rafael Souza",
        email: "rafa.souza@example.com",
        title: "Plano de Metas Anual - 2026",
        status: StatusContexto.Publicado,
        type: "pdf",
        gerencia: "Gerência de Planejamento", // g6
        insertedDate: "2025-06-20T10:00:00Z",
        description: "Documento oficial com o plano de metas para o ano fiscal de 2026.",
        historico: histPublicadoCompleto, 
        url: "/docs/mock_plano_metas_2026.pdf",
        versoes: [{ id: 1, nome: "v1 - Metas 2026", data: "2025-06-20T10:00:00Z", autor: "Rafael Souza", status: StatusContexto.Publicado, historico: histPublicadoCompleto }]
    },
    {
        id: "103",
        solicitante: "Fernanda Lima",
        email: "fe.lima@example.com",
        title: "Orçamento de TI (Semestre 2)",
        status: StatusContexto.Publicado,
        type: "planilha", // "excel" -> "planilha"
        gerencia: "Gerência de Tecnologia da Informação", // g7
        insertedDate: "2025-06-15T14:30:00Z",
        description: "Proposta de orçamento para aquisição de novos equipamentos de TI.",
        historico: histPublicadoSimples,
        url: "/docs/mock_orcamento_ti.xlsx",
        versoes: [{ id: 1, nome: "v1 - Orçamento TI", data: "2025-06-15T14:30:00Z", autor: "Fernanda Lima", status: StatusContexto.Publicado, historico: histPublicadoSimples }]
    },
    {
        id: "104",
        solicitante: "Bruno Martins",
        email: "bruno.martins@example.com",
        title: "Análise de Contratos de Fornecedores",
        status: StatusContexto.Publicado,
        type: "doc",
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        insertedDate: "2025-05-30T09:00:00Z",
        description: "Revisão e parecer sobre os contratos de fornecedores de serviços médicos.",
        historico: histPublicadoCompleto,
        url: "/docs/mock_contratos.docx",
        versoes: [{ id: 1, nome: "v1 - Contratos", data: "2025-05-30T09:00:00Z", autor: "Bruno Martins", status: StatusContexto.Publicado, historico: histPublicadoCompleto }]
    },
    
    // --- (MIGRADO) Contextos "Publicados" (Origem: gerencia/[id]/page.tsx sampleFiles) ---
    // (Gerências atualizadas para bater com diretorias.ts)
    
    { 
        id: "ger-file-1", 
        title: "Pagamento ESF e ESB - 2025 (Gerência)", 
        type: "pdf", 
        insertedDate: "2024-07-15", 
        url: "/docs/teste.pdf", 
        description: "Documento detalhado sobre os pagamentos das equipes de Saúde da Família e Saúde Bucal.", 
        solicitante: "Ana Lima (g6)", 
        gerencia: "Gerência de Planejamento", // g6
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "v1 - Pagamento ESF", data: "2024-06-23", autor: "Carlos", status: StatusContexto.Publicado, historico: histPublicadoCompleto, estaOculta: true }, 
            { id: 2, nome: "v2 - Pagamento ESF e ESB", data: "2024-07-15", autor: "Ana", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
    },
    { 
        id: "ger-file-2", 
        title: "Relatório de Atividades da Atenção Básica", 
        type: "doc", 
        insertedDate: "2024-05-15", 
        url: "/docs/pas.docx", 
        description: "Documento Word contendo o compilado de atividades da Atenção Básica.", 
        solicitante: "Fernanda Lima (g2)", 
        gerencia: "Gerência de Atenção Básica", // g2
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [
            { id: 1, nome: "Relatório Atividades AB (v1).docx", data: "2024-05-15", autor: "Fernanda Lima", status: StatusContexto.Publicado, historico: histPublicadoSimples }
        ], 
    },
    { 
        id: "ger-file-3", 
        title: "Unidades com o PEC implementado", 
        type: "dashboard", 
        insertedDate: "2025-08-22", 
        payload: payloadDashboardPEC, 
        description: "Dashboard interativo mostrando o status de implementação do Prontuário Eletrônico do Cidadão.", 
        solicitante: "Carlos Andrade (g7)", 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        chartType: "chart", 
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "PEC Status - (v1)", data: "2025-08-22", autor: "Carlos Andrade", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
    },
    { 
        id: "ger-file-4", 
        title: "Servidores Ativos (Relação Completa)", 
        type: "planilha", // "excel" -> "planilha"
        insertedDate: "2024-06-23", 
        url: "/docs/mock_emendas_2025.xlsx", 
        description: "Planilha com a relação de todos os servidores ativos, incluindo comissionados, efetivos e contratos.", 
        solicitante: "Mariana Costa (g6)", 
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [
            { id: 1, nome: "Servidores Ativos (v1).xlsx", data: "2024-06-23", autor: "Mariana Costa", status: StatusContexto.Publicado, historico: histPublicadoSimples }
        ], 
    },
    { 
        id: "ger-file-5", 
        title: "Resolução 20/07/2025", 
        type: "resolucao", 
        insertedDate: "2024-07-20", 
        url: "/docs/teste.pdf",
        description: "Publicação oficial da resolução do CMS sobre novos fluxos de atendimento.", 
        solicitante: "Conselho Municipal", 
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Conselho')
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "Resolução 20/07/2025 (v1)", data: "2024-07-20", autor: "CMS", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
    },
    { 
        id: "ger-file-6", 
        title: "Link para Dashboard Externo (MS)", 
        type: "link", 
        insertedDate: "2025-10-13T12:00:00.000Z", 
        url: "https://www.google.com", 
        description: "Link de acesso ao painel de monitoramento de indicadores do Ministério da Saúde.", 
        solicitante: "João Silva (g8)", 
        gerencia: "Gerência de Insperção Sanitária", // g8
        status: StatusContexto.Publicado, 
        estaOculto: true, // Item oculto para teste
        historico: histPublicadoSimples,
        versoes: [
            { id: 1, nome: "Link MS Saúde (v1)", data: "2024-06-23", autor: "João Silva", status: StatusContexto.Publicado, historico: histPublicadoSimples }
        ], 
    },
    { 
        id: "ger-file-7", 
        title: "Apresentação de Resultados (Planejamento)", 
        type: "apresentacao", 
        insertedDate: "2025-09-05", 
        url: "/docs/mock_resultados_2025.pptx", 
        description: "Slides com os principais resultados da Diretoria de Gestão do SUS.", 
        solicitante: "Equipe Planejamento (g6)", 
        gerencia: "Gerência de Planejamento", // g6
        status: StatusContexto.Publicado, 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "Resultados 2025 (v1).pptx", data: "2025-09-05", autor: "GPU", estaOculta: false, status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
    },
    { 
        id: "ger-file-8", 
        title: "Plano de Ação Trimestral (Gestão)", 
        type: "apresentacao", 
        insertedDate: "2025-10-15", 
        url: "/docs/mock_plano_acao_trimestral.pptx", 
        description: "Apresentação do plano de ação para a Diretoria de Gestão.", 
        solicitante: "Diretoria de Gestão", 
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        status: StatusContexto.AguardandoDiretor, // (Item aberto)
        estaOculto: false,
        historico: histAguardandoDiretor2,
        versoes: [
            { id: 1, nome: "Plano Ação (v1).pptx", data: "2025-10-15", autor: "DGE", estaOculta: false, status: StatusContexto.AguardandoDiretor, historico: histAguardandoDiretor2 }
        ], 
    },
    { 
        id: "ger-file-9", 
        title: "Relatório Parcial de Atividades (GAB)", 
        type: "doc", 
        insertedDate: "2025-11-01T10:00:00.000Z", 
        url: "/docs/pas.docx",
        description: "Versão preliminar para análise gerencial.", 
        solicitante: "Membro da Gerência (g2)", 
        gerencia: "Gerência de Atenção Básica", // g2
        status: StatusContexto.AguardandoGerente, // (Item aberto)
        estaOculto: false,
        historico: histAguardandoGerenteMultiVersao,
        versoes: [
            { id: 1, nome: "Relatório Parcial Nov (v1).docx", data: "2025-11-01", autor: "Membro", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente, estaOculta: true },
            { id: 2, nome: "Relatório Parcial Nov (v2 - corrigido).docx", data: "2025-11-03", autor: "Membro", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerenteMultiVersao }
        ], 
    },

   // --- (MIGRADO) Indicadores (Origem: gerencia/[id]/page.tsx indicators) ---
    
    { 
        id: "ind-1", 
        title: "População Atendida", 
        type: "indicador",
        insertedDate: "2025-10-13T12:00:00.000Z", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Ana Lima (g2)", 
        description: "Atendimento da Rede Municipal", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "v1 - População Atendida", data: "2025-08-10", autor: "Carlos", status: StatusContexto.Publicado, historico: histPublicadoSimples, estaOculta: true }, 
            { id: 2, nome: "v2 - População Atendida", data: "2025-09-15", autor: "Ana", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
        payload: {
            description: "Atendimento da Rede Municipal",
            valorAtual: "68 milhões",
            unidade: "Milhões",
            textoComparativo: "+32% em relação ao PMQA",
            cor: "#3B82F6", // blue
            icone: "Heart" as NomeIcone 
        }
    },
    { 
        id: "ind-2", 
        title: "Unidades de Saúde", 
        type: "indicador",
        insertedDate: "2025-09-01", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6
        solicitante: "Carlos Andrade (g6)", 
        description: "Unidades ativas na rede municipal", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [
            { id: 1, nome: "v1 - Unidades de Saúde", data: "2025-09-01", autor: "Carlos", status: StatusContexto.Publicado, historico: histPublicadoSimples }
        ], 
        payload: {
            description: "Unidades ativas na rede municipal",
            valorAtual: "200",
            unidade: "Unidades",
            textoComparativo: "— Sem alteração",
            cor: "#22C55E", // green
            icone: "Building" as NomeIcone 
        }
    },
    { 
        id: "ind-3", 
        title: "Profissionais Ativos", 
        type: "indicador",
        insertedDate: "2025-10-10T12:00:00.000Z", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6 (Mapeado de 'Gestão do Trabalho')
        solicitante: "Mariana Costa (g6)", 
        description: "Profissionais em toda Secretaria", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "v3 - Profissionais Ativos", data: "2025-09-20", autor: "Carlos", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
        payload: {
            description: "Profissionais em toda Secretaria",
            valorAtual: "2.345",
            unidade: "Pessoas",
            textoComparativo: "+4,2% em relação ao PMQA",
            cor: "#EF4444", // red
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-4", 
        title: "Média de Atendimentos (Dia)", 
        type: "indicador",
        insertedDate: "2025-11-01T12:00:00.000Z", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Ana Lima (g2)", 
        description: "Consultas e procedimentos diários", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [
            { id: 1, nome: "v1 - Média Atendimentos", data: "2025-11-01", autor: "Ana", status: StatusContexto.Publicado, historico: histPublicadoSimples }
        ], 
        payload: {
            description: "Consultas e procedimentos diários",
            valorAtual: "4.120",
            unidade: "Atendimentos",
            textoComparativo: "-2.5% vs mês anterior",
            cor: "#F97316", // orange
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-5", 
        title: "Investimento em Saúde", 
        type: "indicador",
        insertedDate: "2025-10-28T12:00:00.000Z", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6
        solicitante: "Diretoria Financeira (g6)", 
        description: "Orçamento executado 2025", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [
            { id: 1, nome: "v1 - Investimento", data: "2025-10-28", autor: "Carlos", status: StatusContexto.Publicado, historico: histPublicadoCompleto }
        ], 
        payload: {
            description: "Orçamento executado 2025",
            valorAtual: "R$ 1.2 Bi",
            unidade: "Bilhões",
            textoComparativo: "+8% em relação a 2024",
            cor: "#A855F7", // purple
            icone: "DollarSign" as NomeIcone
        }
    },
    { 
        id: "ind-6",
        title: "Taxa de Ocupação de Leitos (Aguardando)",
        type: "indicador",
        insertedDate: "2025-11-05T12:00:00.000Z", 
        status: StatusContexto.AguardandoGerente, // Item "Aberto"
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Membro (g3)", 
        description: "Leitos clínicos", 
        estaOculto: false,
        historico: histAguardandoGerente, 
        versoes: [
            { id: 1, nome: "v1 - Taxa de Ocupação", data: "2025-11-05", autor: "Membro da Gerência", status: StatusContexto.AguardandoGerente, historico: histAguardandoGerente }
        ],
        payload: {
            description: "Leitos clínicos",
            valorAtual: "85",
            unidade: "%",
            textoComparativo: "+5% vs semana anterior",
            cor: "#EAB308", // yellow
            icone: "Building" as NomeIcone
        }
    },

    // --- NOVOS MOCKS ADICIONADOS ---

    // Gerência de Atenção Básica (g2) - Adicionando 4 (total 6)
    { 
        id: "ind-g2-3", 
        title: "Cobertura Pré-Natal", 
        type: "indicador",
        insertedDate: "2025-10-01", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Equipe GAB (g2)", 
        description: "Gestantes com 6+ consultas", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Pré-Natal", data: "2025-10-01", autor: "GAB", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Gestantes com 6+ consultas",
            valorAtual: "78",
            unidade: "%",
            textoComparativo: "+1.2% vs mês anterior",
            cor: "#EC4899", // pink
            icone: "Heart" as NomeIcone
        }
    },
    { 
        id: "ind-g2-4", 
        title: "Hipertensos Acompanhados", 
        type: "indicador",
        insertedDate: "2025-10-02", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Equipe GAB (g2)", 
        description: "Pacientes com PA aferida no semestre", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Hipertensos", data: "2025-10-02", autor: "GAB", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Pacientes com PA aferida no semestre",
            valorAtual: "65",
            unidade: "%",
            textoComparativo: "Meta: 70%",
            cor: "#3B82F6", // blue
            icone: "Heart" as NomeIcone
        }
    },
    { 
        id: "ind-g2-5", 
        title: "Cobertura Vacinal (Pólio)", 
        type: "indicador",
        insertedDate: "2025-10-03", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Equipe GAB (g2)", 
        description: "Crianças menores de 1 ano", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Pólio", data: "2025-10-03", autor: "GAB", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Crianças menores de 1 ano",
            valorAtual: "91",
            unidade: "%",
            textoComparativo: "Meta: 95%",
            cor: "#F97316", // orange
            icone: "Users" as NomeIcone
        }
    },
    { 
        id: "ind-g2-6", 
        title: "Visitas Domiciliares (ACS)", 
        type: "indicador",
        insertedDate: "2025-10-04", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Atenção Básica", // g2
        solicitante: "Equipe GAB (g2)", 
        description: "Total de visitas no mês", 
        estaOculto: true, // Oculto para teste
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Visitas", data: "2025-10-04", autor: "GAB", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Total de visitas no mês",
            valorAtual: "12.500",
            unidade: "Visitas",
            textoComparativo: "+3% vs mês anterior",
            cor: "#22C55E", // green
            icone: "Users" as NomeIcone
        }
    },

    // Gerência de Planejamento (g6) - Adicionando 3 (total 6)
    { 
        id: "ind-g6-4", 
        title: "Execução Orçamentária", 
        type: "indicador",
        insertedDate: "2025-10-05", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6
        solicitante: "Equipe GPLAN (g6)", 
        description: "Percentual do orçamento executado", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Exec Orçam.", data: "2025-10-05", autor: "GPLAN", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Percentual do orçamento executado",
            valorAtual: "72",
            unidade: "%",
            textoComparativo: "Meta Ano: 100%",
            cor: "#A855F7", // purple
            icone: "DollarSign" as NomeIcone
        }
    },
     { 
        id: "ind-g6-5", 
        title: "Taxa de Absenteísmo", 
        type: "indicador",
        insertedDate: "2025-10-06", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6
        solicitante: "RH (g6)", 
        description: "Faltas de servidores (mês)", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Absenteísmo", data: "2025-10-06", autor: "RH", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Faltas de servidores (mês)",
            valorAtual: "4.8",
            unidade: "%",
            textoComparativo: "-0.5% vs mês anterior",
            cor: "#22C55E", // green
            icone: "ClipboardList" as NomeIcone
        }
    },
     { 
        id: "ind-g6-6", 
        title: "Novos Servidores", 
        type: "indicador",
        insertedDate: "2025-10-07", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Planejamento", // g6
        solicitante: "RH (g6)", 
        description: "Contratações no último concurso", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Servidores", data: "2025-10-07", autor: "RH", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Contratações no último concurso",
            valorAtual: "120",
            unidade: "Pessoas",
            textoComparativo: "Total de 150 vagas",
            cor: "#3B82F6", // blue
            icone: "UserCheck" as NomeIcone
        }
    },

    // Gerência de Leitos (g3) - Adicionando 5 (total 6)
    { 
        id: "ind-g3-2", 
        title: "Ocupação Leitos UTI", 
        type: "indicador",
        insertedDate: "2025-10-08", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Equipe GLeitos (g3)", 
        description: "Leitos de UTI Adulto", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - UTI", data: "2025-10-08", autor: "GLeitos", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Leitos de UTI Adulto",
            valorAtual: "92",
            unidade: "%",
            textoComparativo: "Estado de Alerta",
            cor: "#EF4444", // red
            icone: "Building" as NomeIcone
        }
    },
    { 
        id: "ind-g3-3", 
        title: "Ocupação Leitos Pediátricos", 
        type: "indicador",
        insertedDate: "2025-10-09", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Equipe GLeitos (g3)", 
        description: "Leitos de Pediatria", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Pediatria", data: "2025-10-09", autor: "GLeitos", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Leitos de Pediatria",
            valorAtual: "75",
            unidade: "%",
            textoComparativo: "+10% vs semana anterior",
            cor: "#F97316", // orange
            icone: "Building" as NomeIcone
        }
    },
    { 
        id: "ind-g3-4", 
        title: "Média de Permanência", 
        type: "indicador",
        insertedDate: "2025-10-10", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Equipe GLeitos (g3)", 
        description: "Média de dias (Leitos Clínicos)", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Permanência", data: "2025-10-10", autor: "GLeitos", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Média de dias (Leitos Clínicos)",
            valorAtual: "5.2",
            unidade: "Dias",
            textoComparativo: "Meta: < 5.0 dias",
            cor: "#EAB308", // yellow
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g3-5", 
        title: "Giro de Leitos", 
        type: "indicador",
        insertedDate: "2025-10-11", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Equipe GLeitos (g3)", 
        description: "Índice de renovação de leitos", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Giro", data: "2025-10-11", autor: "GLeitos", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Índice de renovação de leitos",
            valorAtual: "0.8",
            unidade: "Nenhum",
            textoComparativo: "+0.1 vs mês anterior",
            cor: "#22C55E", // green
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g3-6", 
        title: "Leitos Bloqueados", 
        type: "indicador",
        insertedDate: "2025-10-12", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Leitos", // g3
        solicitante: "Equipe GLeitos (g3)", 
        description: "Manutenção ou infecção", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Bloqueados", data: "2025-10-12", autor: "GLeitos", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Manutenção ou infecção",
            valorAtual: "8",
            unidade: "Leitos",
            textoComparativo: "— Sem alteração",
            cor: "#EAB308", // yellow
            icone: "Building" as NomeIcone
        }
    },

    // Gerência de Fluxos Assistenciais (g1) - Adicionando 6
    { 
        id: "ind-g1-1", 
        title: "Repasses COAPES", 
        type: "indicador",
        insertedDate: "2025-10-13", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Valor total repassado (mês)", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - COAPES", data: "2025-10-13", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Valor total repassado (mês)",
            valorAtual: "R$ 2.5 Mi",
            unidade: "Milhões",
            textoComparativo: "100% da meta",
            cor: "#22C55E", // green
            icone: "DollarSign" as NomeIcone
        }
    },
    { 
        id: "ind-g1-2", 
        title: "Contratos Ativos", 
        type: "indicador",
        insertedDate: "2025-10-14", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Fornecedores e serviços", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Contratos", data: "2025-10-14", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Fornecedores e serviços",
            valorAtual: "45",
            unidade: "Contratos",
            textoComparativo: "+2 novos este mês",
            cor: "#3B82F6", // blue
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-g1-3", 
        title: "Satisfação (Fluxo)", 
        type: "indicador",
        insertedDate: "2025-10-15", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Nota média (Ouvidoria)", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Satisfação", data: "2025-10-15", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Nota média (Ouvidoria)",
            valorAtual: "8.2",
            unidade: "/ 10",
            textoComparativo: "+0.1 vs tri anterior",
            cor: "#22C55E", // green
            icone: "UserCheck" as NomeIcone
        }
    },
    { 
        id: "ind-g1-4", 
        title: "Tempo de Autorização", 
        type: "indicador",
        insertedDate: "2025-10-16", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Média (procedimentos eletivos)", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Autorização", data: "2025-10-16", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Média (procedimentos eletivos)",
            valorAtual: "48",
            unidade: "Horas",
            textoComparativo: "Meta: < 24h",
            cor: "#F97316", // orange
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g1-5", 
        title: "Internações (Reguladas)", 
        type: "indicador",
        insertedDate: "2025-10-17", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Total no mês", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Internações", data: "2025-10-17", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Total no mês",
            valorAtual: "1.120",
            unidade: "Pessoas",
            textoComparativo: "-5% vs mês anterior",
            cor: "#3B82F6", // blue
            icone: "Building" as NomeIcone
        }
    },
    { 
        id: "ind-g1-6", 
        title: "Protocolos Clínicos", 
        type: "indicador",
        insertedDate: "2025-10-18", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Fluxos Assistenciais", // g1
        solicitante: "Equipe GFA (g1)", 
        description: "Protocolos implantados/revisados", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Protocolos", data: "2025-10-18", autor: "GFA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Protocolos implantados/revisados",
            valorAtual: "12",
            unidade: "/ 15",
            textoComparativo: "+2 este mês",
            cor: "#14B8A6", // teal
            icone: "ClipboardList" as NomeIcone
        }
    },
    
    // Gerência de Insperção Sanitária (g8) - Adicionando 6
    { 
        id: "ind-g8-1", 
        title: "Inspeções Realizadas", 
        type: "indicador",
        insertedDate: "2025-10-19", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Total de inspeções no mês", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Inspeções", data: "2025-10-19", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Total de inspeções no mês",
            valorAtual: "350",
            unidade: "Inspeções",
            textoComparativo: "Meta: 320",
            cor: "#22C55E", // green
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-g8-2", 
        title: "Autuações Emitidas", 
        type: "indicador",
        insertedDate: "2025-10-20", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Infrações sanitárias registradas", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Autuações", data: "2025-10-20", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Infrações sanitárias registradas",
            valorAtual: "42",
            unidade: "Autos",
            textoComparativo: "-10% vs mês anterior",
            cor: "#EF4444", // red
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-g8-3", 
        title: "Coletas de Amostras (Água)", 
        type: "indicador",
        insertedDate: "2025-10-21", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Análise de potabilidade", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Água", data: "2025-10-21", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Análise de potabilidade",
            valorAtual: "98",
            unidade: "%",
            textoComparativo: "de amostras conformes",
            cor: "#3B82F6", // blue
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g8-4", 
        title: "Casos de Dengue (Semana)", 
        type: "indicador",
        insertedDate: "2025-10-22", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Novos casos confirmados", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Dengue", data: "2025-10-22", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Novos casos confirmados",
            valorAtual: "15",
            unidade: "Casos",
            textoComparativo: "+5 vs semana anterior",
            cor: "#EF4444", // red
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g8-5", 
        title: "Licenças Sanitárias Emitidas", 
        type: "indicador",
        insertedDate: "2025-10-23", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Novas licenças no mês", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Licenças", data: "2025-10-23", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Novas licenças no mês",
            valorAtual: "80",
            unidade: "Licenças",
            textoComparativo: "Tempo médio: 15 dias",
            cor: "#14B8A6", // teal
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-g8-6", 
        title: "Controle de Roedores", 
        type: "indicador",
        insertedDate: "2025-10-24", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Insperção Sanitária", // g8
        solicitante: "Equipe GIS (g8)", 
        description: "Áreas tratadas", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Roedores", data: "2025-10-24", autor: "GIS", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Áreas tratadas",
            valorAtual: "25",
            unidade: "Bairros",
            textoComparativo: "100% do planejado",
            cor: "#22C55E", // green
            icone: "Landmark" as NomeIcone
        }
    },
    
    // Gerência de Tecnologia da Informação (g7) - Adicionando 6
    { 
        id: "ind-g7-1", 
        title: "Uptime do Sistema (PEC)", 
        type: "indicador",
        insertedDate: "2025-10-25", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Disponibilidade do Prontuário", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Uptime PEC", data: "2025-10-25", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Disponibilidade do Prontuário",
            valorAtual: "99.8",
            unidade: "%",
            textoComparativo: "Meta: 99.9%",
            cor: "#22C55E", // green
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g7-2", 
        title: "Chamados Atendidos (Helpdesk)", 
        type: "indicador",
        insertedDate: "2025-10-26", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Total de chamados resolvidos (mês)", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Helpdesk", data: "2025-10-26", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Total de chamados resolvidos (mês)",
            valorAtual: "450",
            unidade: "Chamados",
            textoComparativo: "Tempo médio: 2h",
            cor: "#3B82F6", // blue
            icone: "ClipboardList" as NomeIcone
        }
    },
    { 
        id: "ind-g7-3", 
        title: "Unidades com PEC", 
        type: "indicador",
        insertedDate: "2025-10-27", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Implantação do Prontuário Eletrônico", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - PEC", data: "2025-10-27", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Implantação do Prontuário Eletrônico",
            valorAtual: "85",
            unidade: "%",
            textoComparativo: "+5% vs mês anterior",
            cor: "#22C55E", // green
            icone: "Building" as NomeIcone
        }
    },
    { 
        id: "ind-g7-4", 
        title: "Segurança (Tentativas Bloqueadas)", 
        type: "indicador",
        insertedDate: "2025-10-28", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Ataques de rede bloqueados (dia)", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Segurança", data: "2025-10-28", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Ataques de rede bloqueados (dia)",
            valorAtual: "1.200",
            unidade: "Ataques",
            textoComparativo: "Nenhum incidente grave",
            cor: "#14B8A6", // teal
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g7-5", 
        title: "Armazenamento (Servidor)", 
        type: "indicador",
        insertedDate: "2025-10-29", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Espaço em disco utilizado", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Storage", data: "2025-10-29", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Espaço em disco utilizado",
            valorAtual: "60",
            unidade: "%",
            textoComparativo: "Total: 50 TB",
            cor: "#F97316", // orange
            icone: "Landmark" as NomeIcone // (Usando um ícone genérico)
        }
    },
    { 
        id: "ind-g7-6", 
        title: "Links de Rede (Ativos)", 
        type: "indicador",
        insertedDate: "2025-10-30", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Tecnologia da Informação", // g7
        solicitante: "Equipe GTI (g7)", 
        description: "Conectividade das unidades", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Rede", data: "2025-10-30", autor: "GTI", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Conectividade das unidades",
            valorAtual: "100",
            unidade: "%",
            textoComparativo: "0 unidades offline",
            cor: "#22C55E", // green
            icone: "Building" as NomeIcone
        }
    },

    // Gerência de Regulação Ambulatorial (g4) - Adicionando 6
    { 
        id: "ind-g4-1", 
        title: "Fila de Espera (Consultas)", 
        type: "indicador",
        insertedDate: "2025-10-01", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Pacientes aguardando 1ª consulta", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Fila Consulta", data: "2025-10-01", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Pacientes aguardando 1ª consulta",
            valorAtual: "2.300",
            unidade: "Pessoas",
            textoComparativo: "-150 vs mês anterior",
            cor: "#F97316", // orange
            icone: "Users" as NomeIcone
        }
    },
    { 
        id: "ind-g4-2", 
        title: "Tempo Médio de Espera (Consultas)", 
        type: "indicador",
        insertedDate: "2025-10-02", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Média de dias para consulta", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - TME Consulta", data: "2025-10-02", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Média de dias para consulta",
            valorAtual: "28",
            unidade: "Dias",
            textoComparativo: "Meta: < 30 dias",
            cor: "#22C55E", // green
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g4-3", 
        title: "Fila de Espera (Exames)", 
        type: "indicador",
        insertedDate: "2025-10-03", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Pacientes aguardando exames complexos", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Fila Exames", data: "2025-10-03", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Pacientes aguardando exames complexos",
            valorAtual: "890",
            unidade: "Pessoas",
            textoComparativo: "+50 vs mês anterior",
            cor: "#EF4444", // red
            icone: "Users" as NomeIcone
        }
    },
    { 
        id: "ind-g4-4", 
        title: "Tempo Médio de Espera (Exames)", 
        type: "indicador",
        insertedDate: "2025-10-04", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Média de dias para exames", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - TME Exames", data: "2025-10-04", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Média de dias para exames",
            valorAtual: "45",
            unidade: "Dias",
            textoComparativo: "Meta: < 30 dias",
            cor: "#EF4444", // red
            icone: "TrendingUp" as NomeIcone
        }
    },
    { 
        id: "ind-g4-5", 
        title: "Taxa de Atendimento (Regulação)", 
        type: "indicador",
        insertedDate: "2025-10-05", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Solicitações atendidas vs total", 
        estaOculto: false,
        historico: histPublicadoCompleto,
        versoes: [{ id: 1, nome: "v1 - Taxa Atend.", data: "2025-10-05", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoCompleto }], 
        payload: {
            description: "Solicitações atendidas vs total",
            valorAtual: "92",
            unidade: "%",
            textoComparativo: "+1% vs mês anterior",
            cor: "#22C55E", // green
            icone: "UserCheck" as NomeIcone
        }
    },
    { 
        id: "ind-g4-6", 
        title: "Consultas Agendadas (Mês)", 
        type: "indicador",
        insertedDate: "2025-10-06", 
        status: StatusContexto.Publicado, 
        gerencia: "Gerência de Regulação Ambulatorial", // g4
        solicitante: "Equipe GRA (g4)", 
        description: "Total de agendamentos efetuados", 
        estaOculto: false,
        historico: histPublicadoSimples,
        versoes: [{ id: 1, nome: "v1 - Agendamentos", data: "2025-10-06", autor: "GRA", status: StatusContexto.Publicado, historico: histPublicadoSimples }], 
        payload: {
            description: "Total de agendamentos efetuados",
            valorAtual: "5.100",
            unidade: "Consultas",
            textoComparativo: "— Estável",
            cor: "#3B82F6", // blue
            icone: "ClipboardList" as NomeIcone
        }
    }
];