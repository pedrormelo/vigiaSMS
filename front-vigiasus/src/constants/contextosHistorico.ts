// src/mocks/contextosHistorico.ts

import { Contexto, StatusContexto } from "@/components/validar/typesDados";

export const mockDataHistorico: Contexto[] = [
 {
    id: "6",
    solicitante: "Julia Maria Leite",
    email: "julia.leite@example.com",
    nome: "Pagamento PV/JET - Julho",
    situacao: StatusContexto.Publicado,
    docType: "pdf",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "2025-07-28T14:00:00Z",
    detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS.",
    historico: [
        { data: "2025-07-28T14:00:00Z", autor: "Julia Maria Leite", acao: "Submetido para análise." },
        { data: "2025-07-29T11:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-07-30T16:45:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-07-30T16:46:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "7",
    solicitante: "Mariana Costa",
    email: "mari.costa@example.com",
    nome: "Publicação de Nova Portaria",
    situacao: StatusContexto.Publicado,
    docType: "doc",
    gerencia: "Coordenação de Ouvidoria do SUS",
    data: "2025-07-10T18:00:00Z",
    detalhes: "Portaria publicada no Diário Oficial sobre novas diretrizes de atendimento.",
    historico: [
        { data: "2025-07-08T12:00:00Z", autor: "Mariana Costa", acao: "Submetido para análise." },
        { data: "2025-07-09T09:30:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-07-10T17:50:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-07-10T17:51:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "8",
    solicitante: "Rafael Souza",
    email: "rafa.souza@example.com",
    nome: "Plano de Metas Anual - 2026",
    situacao: StatusContexto.Publicado,
    docType: "pdf",
    gerencia: "Gerência de Planejamento em Saúde",
    data: "2025-06-20T10:00:00Z",
    detalhes: "Documento oficial com o plano de metas para o ano fiscal de 2026.",
    historico: [
        { data: "2025-06-20T10:00:00Z", autor: "Rafael Souza", acao: "Submetido para análise." },
        { data: "2025-06-21T15:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-06-22T11:00:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-06-22T11:01:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "9",
    solicitante: "Fernanda Lima",
    email: "fe.lima@example.com",
    nome: "Orçamento de TI (Semestre 2)",
    situacao: StatusContexto.Publicado,
    docType: "excel",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "2025-06-15T14:30:00Z",
    detalhes: "Proposta de orçamento para aquisição de novos equipamentos de TI.",
    historico: [
        { data: "2025-06-15T14:30:00Z", autor: "Fernanda Lima", acao: "Submetido para análise." },
        { data: "2025-06-16T10:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-06-17T11:00:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-06-17T11:01:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "10",
    solicitante: "Bruno Martins",
    email: "bruno.martins@example.com",
    nome: "Análise de Contratos de Fornecedores",
    situacao: StatusContexto.Publicado,
    docType: "doc",
    gerencia: "Gerência de Gestão Ensino e Serviço",
    data: "2025-05-30T09:00:00Z",
    detalhes: "Revisão e parecer sobre os contratos de fornecedores de serviços médicos.",
    historico: [
        { data: "2025-05-30T09:00:00Z", autor: "Bruno Martins", acao: "Submetido para análise." },
        { data: "2025-05-31T13:00:00Z", autor: "Sandra Paiva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-06-01T10:20:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-06-01T10:21:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "11",
    solicitante: "Aline Oliveira",
    email: "aline.oliveira@example.com",
    nome: "Relatório de Satisfação do Paciente",
    situacao: StatusContexto.Publicado,
    docType: "dashboard",
    gerencia: "Coordenação de Ouvidoria do SUS",
    data: "2025-05-25T16:00:00Z",
    detalhes: "Dashboard interativo com os resultados da pesquisa de satisfação do paciente.",
    historico: [
        { data: "2025-05-25T16:00:00Z", autor: "Aline Oliveira", acao: "Submetido para análise." },
        { data: "2025-05-26T11:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-05-27T14:00:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-05-27T14:01:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "12",
    solicitante: "Lucas Pereira",
    email: "lucas.pereira@example.com",
    nome: "Proposta de Treinamento de Equipes",
    situacao: StatusContexto.Publicado,
    docType: "pdf",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "2025-04-10T13:45:00Z",
    detalhes: "Documento detalhando a proposta de um novo programa de treinamento para as equipas de enfermagem.",
    historico: [
        { data: "2025-04-10T13:45:00Z", autor: "Lucas Pereira", acao: "Submetido para análise." },
        { data: "2025-04-11T09:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-04-12T10:30:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-04-12T10:31:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "13",
    solicitante: "Vanessa Rodrigues",
    email: "van.rodrigues@example.com",
    nome: "Inventário de Equipamentos Médicos",
    situacao: StatusContexto.Publicado,
    docType: "excel",
    gerencia: "Gerência de Vigilância em Saúde",
    data: "2025-04-01T17:00:00Z",
    detalhes: "Planilha atualizada com o inventário completo de todos os equipamentos médicos.",
    historico: [
        { data: "2025-04-01T17:00:00Z", autor: "Vanessa Rodrigues", acao: "Submetido para análise." },
        { data: "2025-04-02T12:00:00Z", autor: "Sandra Paiva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-04-03T15:00:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-04-03T15:01:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "14",
    solicitante: "Guilherme Rocha",
    email: "gui.rocha@example.com",
    nome: "Campanha de Vacinação - Logística",
    situacao: StatusContexto.Publicado,
    docType: "pdf",
    gerencia: "Gerência de Planejamento em Saúde",
    data: "2025-03-20T08:00:00Z",
    detalhes: "Planeamento logístico para a campanha de vacinação contra a gripe.",
    historico: [
        { data: "2025-03-20T08:00:00Z", autor: "Guilherme Rocha", acao: "Submetido para análise." },
        { data: "2025-03-21T10:00:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-03-22T14:30:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-03-22T14:31:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "15",
    solicitante: "Isabela Ribeiro",
    email: "isa.ribeiro@example.com",
    nome: "Resultados de Pesquisa Clínica",
    situacao: StatusContexto.Publicado,
    docType: "doc",
    gerencia: "Gerência de Gestão Ensino e Serviço",
    data: "2025-03-15T11:20:00Z",
    detalhes: "Documento com os resultados preliminares da pesquisa clínica sobre o novo medicamento.",
    historico: [
        { data: "2025-03-15T11:20:00Z", autor: "Isabela Ribeiro", acao: "Submetido para análise." },
        { data: "2025-03-16T16:00:00Z", autor: "Sandra Paiva (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-03-17T18:00:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-03-17T18:01:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  },
  {
    id: "16",
    solicitante: "Thiago Almeida",
    email: "thiago.almeida@example.com",
    nome: "Manual de Novos Procedimentos",
    situacao: StatusContexto.Publicado,
    docType: "pdf",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "2025-02-28T10:00:00Z",
    detalhes: "Manual atualizado com os novos procedimentos de segurança para os laboratórios.",
    historico: [
        { data: "2025-02-28T10:00:00Z", autor: "Thiago Almeida", acao: "Submetido para análise." },
        { data: "2025-03-01T14:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
        { data: "2025-03-02T09:45:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
        { data: "2025-03-02T09:46:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
    ]
  }
];