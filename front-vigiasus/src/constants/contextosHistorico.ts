// src/mocks/contextosHistorico.ts

import { Contexto, StatusContexto } from "@/components/validar/typesDados";

export const mockDataHistorico: Contexto[] = [
  {
    id: "4",
    solicitante: "Julia Maria da Cunha Leite",
    email: "cunhajuliamaria02@gmail.com",
    nome: "Pagamento PV/JET - Julho de 2025",
    situacao: StatusContexto.Deferido, // Status finalizado
    docType: "pdf",
    gerencia: "Gerência de Gestão do Trabalho",
    data: "15-07-2025",
    detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Julho de 2025."
  },
  {
    id: "5",
    solicitante: "Carlos Eduardo",
    email: "cadu@exemplo.com",
    nome: "Relatório Epidemiológico",
    situacao: StatusContexto.Indeferido, // Status finalizado
    docType: "dashboard",
    gerencia: "Gerência de Vigilância em Saúde",
    data: "12-07-2025",
    detalhes: "Apresentação do relatório epidemiológico semanal."
  },
  {
    id: "6",
    solicitante: "Mariana Costa",
    email: "mari.costa@example.com",
    nome: "Publicação de Portaria",
    situacao: StatusContexto.Publicado, // Status finalizado
    docType: "doc",
    gerencia: "Coordenação de Ouvidoria do SUS",
    data: "10-07-2025",
    detalhes: "Portaria publicada no Diário Oficial sobre novas diretrizes."
  },
];