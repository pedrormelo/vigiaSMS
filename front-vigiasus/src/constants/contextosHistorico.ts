// src/mocks/contextosHistorico.ts

import { Contexto, StatusContexto } from "@/components/validar/typesDados";

export const mockDataHistorico: Contexto[] = [
  {
    id: "4",
    solicitante: "Julia Maria da Cunha Leite",
    email: "cunhajuliamaria02@gmail.com",
    nome: "Pagamento PV/JET - Julho de 2025",
    situacao: StatusContexto.Deferido,
    docType: "pdf",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "2025-07-28T14:00:00Z", 
    detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Julho de 2025.",
    historico: [
        { data: "2025-07-28T14:00:00Z", autor: "Julia Maria", acao: "Contexto solicitado." },
        { data: "2025-07-29T11:00:00Z", autor: "Ricardo Gerente", acao: "Aprovado pela gerência." },
        { data: "2025-07-30T16:45:00Z", autor: "Lúcia Diretora", acao: "Contexto deferido." },
    ]
  },
  {
    id: "5",
    solicitante: "Carlos Eduardo",
    email: "cadu@exemplo.com",
    nome: "Relatório Epidemiológico",
    situacao: StatusContexto.Indeferido,
    docType: "dashboard",
    gerencia: "Gerência de Vigilância em Saúde",
    data: "2025-08-01T09:00:00Z", 
    detalhes: "Apresentação do relatório epidemiológico semanal.",
    historico: [
        { data: "2025-08-01T09:00:00Z", autor: "Carlos Eduardo", acao: "Contexto solicitado." },
        { data: "2025-08-01T17:30:00Z", autor: "Sandra Gerente", acao: "Contexto indeferido. Justificativa: Dados incompletos." },
    ]
  },
  {
    id: "6",
    solicitante: "Mariana Costa",
    email: "mari.costa@example.com",
    nome: "Publicação de Portaria",
    situacao: StatusContexto.Publicado,
    docType: "doc",
    gerencia: "Coordenação de Ouvidoria do SUS",
    data: "2025-07-10T18:00:00Z", 
    detalhes: "Portaria publicada no Diário Oficial sobre novas diretrizes.",
    historico: [
        { data: "2025-07-08T12:00:00Z", autor: "Mariana Costa", acao: "Contexto solicitado." },
        { data: "2025-07-09T09:30:00Z", autor: "João Gerente", acao: "Aprovado pela gerência." },
        { data: "2025-07-10T17:50:00Z", autor: "Lúcia Diretora", acao: "Deferido e marcado para publicação." },
    ]
  },
];