// src/mocks/contextos.ts

import { Contexto, StatusContexto } from "@/components/validar/typesDados";

export const mockData: Contexto[] = [
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        nome: "Monitoramento Financeiro COAPES",
        situacao: StatusContexto.AguardandoGerente,
        docType: "excel",
        gerencia: "Gerência de Gestão Ensino e Serviço",
        data: "2025-08-02T10:00:00Z",
        detalhes: "Relatório detalhado contendo o monitoramento dos repasses financeiros para o Contrato Organizativo de Ação Pública Ensino-Saúde (COAPES) referente ao primeiro semestre de 2025.",
        historico: [
            { data: "2025-08-02T10:00:00Z", autor: "Pedro Augusto Lorenzo", acao: "Submetido para análise." },
        ]
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        nome: "Emendas Parlamentares - 2025",
        situacao: StatusContexto.AguardandoCorrecao,
        docType: "excel",
        gerencia: "Gerência de Planejamento em Saúde",
        data: "2025-08-03T11:30:00Z",
        detalhes: "Planilha com a relação de todas as emendas parlamentares destinadas à saúde para o ano de 2025, incluindo valores, autores e status de execução.",
        historico: [
            { data: "2025-08-03T11:30:00Z", autor: "Luiza Vitória de Alincatra", acao: "Submetido para análise." },
            { data: "2025-08-04T09:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Devolvido para correção. Justificativa: Falta a coluna 'Fonte do Recurso'." },
        ]
    },
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        nome: "Monitoramento Ouvidoria",
        situacao: StatusContexto.AguardandoDiretor,
        docType: "doc",
        gerencia: "Coordenação de Ouvidoria do SUS",
        data: "2025-08-05T15:00:00Z",
        detalhes: "Documento com a compilação e análise das principais demandas registradas na Ouvidoria do SUS no último trimestre, com foco em reclamações e sugestões sobre o atendimento nas unidades de saúde.",
        historico: [
            { data: "2025-08-05T15:00:00Z", autor: "Murilo Alencar Gomes", acao: "Submetido para análise." },
            { data: "2025-08-06T10:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        ]
    },
    {
        id: "4",
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        nome: "Pagamento PV/JET - Julho de 2025",
        situacao: StatusContexto.Publicado,
        docType: "pdf",
        gerencia: "Gerência de Gestão do Trabalho",
        data: "2025-07-28T14:00:00Z",
        detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Julho de 2025.",
        historico: [
            { data: "2025-07-28T14:00:00Z", autor: "Julia Maria da Cunha Leite", acao: "Submetido para análise." },
            { data: "2025-07-29T11:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
            { data: "2025-07-30T16:45:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
            { data: "2025-07-30T16:46:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
        ]
    },
    {
        id: "5",
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        nome: "Relatório Epidemiológico",
        situacao: StatusContexto.AguardandoCorrecao,
        docType: "dashboard",
        gerencia: "Gerência de Vigilância em Saúde",
        data: "2025-08-01T09:00:00Z",
        detalhes: "Apresentação do relatório epidemiológico semanal.",
        historico: [
            { data: "2025-08-01T09:00:00Z", autor: "Carlos Eduardo", acao: "Submetido para análise." },
            { data: "2025-08-02T11:00:00Z", autor: "Carlos Eduardo", acao: "Cancelou a solicitação." },
            { data: "2025-08-02T11:01:00Z", autor: "Sistema", acao: "Finalizado como Indeferido." },
        ]
    },
];