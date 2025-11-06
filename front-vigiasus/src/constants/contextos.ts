// src/constants/contextos.ts

import { Contexto, StatusContexto, DocType } from "@/components/validar/typesDados"; // Importar DocType

export const mockData: Contexto[] = [
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        nome: "Monitoramento Financeiro COAPES",
        situacao: StatusContexto.AguardandoGerente,
        docType: "excel" as DocType, // Adicionar 'as DocType' para clareza
        gerencia: "Gerência de Gestão Ensino e Serviço",
        data: "2025-08-02T10:00:00Z",
        detalhes: "Relatório detalhado contendo o monitoramento dos repasses financeiros para o Contrato Organizativo de Ação Pública Ensino-Saúde (COAPES) referente ao primeiro semestre de 2025.",
        historico: [
            { data: "2025-08-02T10:00:00Z", autor: "Pedro Augusto Lorenzo", acao: "Submetido para análise." },
        ],
        url: "/docs/mock_coapes_financeiro.xlsx", // <-- URL Adicionada
        type: "excel" as DocType, // <-- Tipo Adicionado
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        nome: "Emendas Parlamentares - 2025",
        situacao: StatusContexto.AguardandoCorrecao,
        docType: "excel" as DocType,
        gerencia: "Gerência de Planejamento em Saúde",
        data: "2025-08-03T11:30:00Z",
        detalhes: "Planilha com a relação de todas as emendas parlamentares destinadas à saúde para o ano de 2025, incluindo valores, autores e status de execução.",
        historico: [
            { data: "2025-08-03T11:30:00Z", autor: "Luiza Vitória de Alincatra", acao: "Submetido para análise." },
            { data: "2025-08-04T09:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Devolvido para correção. Justificativa: Falta a coluna 'Fonte do Recurso'." },
        ],
        url: "/docs/mock_emendas_2025.xlsx", // <-- URL Adicionada
        type: "excel" as DocType,
    },
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        nome: "Monitoramento Ouvidoria",
        situacao: StatusContexto.AguardandoDiretor,
        docType: "doc" as DocType,
        gerencia: "Coordenação de Ouvidoria do SUS",
        data: "2025-08-05T15:00:00Z",
        detalhes: "Documento com a compilação e análise das principais demandas registradas na Ouvidoria do SUS no último trimestre, com foco em reclamações e sugestões sobre o atendimento nas unidades de saúde.",
        historico: [
            { data: "2025-08-05T15:00:00Z", autor: "Murilo Alencar Gomes", acao: "Submetido para análise." },
            { data: "2025-08-06T10:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        ],
        url: "/docs/mock_ouvidoria_relatorio.docx", // <-- URL Adicionada
        type: "doc" as DocType,
    },
    {
        id: "4", // Este estava publicado, vamos mudar para AguardandoGerente para teste
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        nome: "Pagamento PV/JET - Agosto de 2025", // Mudar mês para diferenciar
        situacao: StatusContexto.AguardandoGerente, // MUDADO DE PUBLICADO
        docType: "pdf" as DocType,
        gerencia: "Gerência de Gestão do Trabalho",
        data: "2025-08-28T14:00:00Z", // Mudar data
        detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Agosto de 2025.",
        historico: [
            { data: "2025-08-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", acao: "Submetido para análise." },
            // Removido histórico de aprovação
        ],
        url: "/docs/mock_pvjet_agosto.pdf", // <-- URL Adicionada
        type: "pdf" as DocType,
    },
    {
        id: "5", // Este estava como cancelado/indeferido, vamos mudar para AguardandoGerente
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        nome: "Relatório Epidemiológico Semanal", // Nome mais claro
        situacao: StatusContexto.AguardandoGerente, // MUDADO DE AguardandoCorrecao/Indeferido
        docType: "dashboard" as DocType,
        gerencia: "Gerência de Vigilância em Saúde",
        data: "2025-08-29T09:00:00Z", // Mudar data
        detalhes: "Dashboard com a apresentação do relatório epidemiológico da última semana.",
        historico: [
            { data: "2025-08-29T09:00:00Z", autor: "Carlos Eduardo", acao: "Submetido para análise." },
            // Removido histórico de cancelamento
        ],
        // Dashboards podem não ter URL direta, mas mantemos a estrutura
        url: "/dashboards/epidemiologico/semana35", // Exemplo de link interno
        type: "dashboard" as DocType,
    },
    {
        id: "6",
        solicitante: "Equipe Planejamento",
        email: "planejamento@sms.gov",
        nome: "Apresentação de Resultados 2025",
        situacao: StatusContexto.AguardandoGerente,
        docType: "apresentacao" as DocType,
        gerencia: "Gerência de Planejamento em Saúde",
        data: "2025-09-05T10:30:00Z",
        detalhes: "Slides com os principais resultados do quadrimestre para validação.",
        historico: [
            { data: "2025-09-05T10:30:00Z", autor: "Equipe Planejamento", acao: "Submetido para análise." },
        ],
        url: "/docs/mock_resultados_2025.pptx",
        type: "apresentacao" as DocType,
    },
    {
        id: "7",
        solicitante: "Diretoria de Gestão",
        email: "gestao@sms.gov",
        nome: "Plano de Ação Trimestral",
        situacao: StatusContexto.AguardandoDiretor,
        docType: "apresentacao" as DocType,
        gerencia: "Gerência de Gestão do Trabalho",
        data: "2025-10-15T09:00:00Z",
        detalhes: "Apresentação do plano de ação do próximo trimestre para aprovação.",
        historico: [
            { data: "2025-10-15T09:00:00Z", autor: "Diretoria de Gestão", acao: "Submetido para análise." },
            { data: "2025-10-16T14:20:00Z", autor: "Gerente", acao: "Deferido e encaminhado ao Diretor." },
        ],
        url: "/docs/mock_plano_acao_trimestral.pptx",
        type: "apresentacao" as DocType,
    },
];