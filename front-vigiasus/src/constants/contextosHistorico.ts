// src/constants/contextosHistorico.ts

import { Contexto, StatusContexto, HistoricoEvento } from "@/components/validar/typesDados";
import { FileType } from "@/components/contextosCard/contextoCard";

// Helper para Histórico Publicado
const histPublicado1: HistoricoEvento[] = [
    { data: "2025-07-28T14:00:00Z", autor: "Julia Maria Leite", acao: "Submetido para análise." },
    { data: "2025-07-29T11:00:00Z", autor: "Ricardo Matos (Gerente)", acao: "Análise Gerente: Deferido." },
    { data: "2025-07-30T16:45:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
    { data: "2025-07-30T16:46:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
];
const histPublicado2: HistoricoEvento[] = [
    { data: "2025-07-08T12:00:00Z", autor: "Mariana Costa", acao: "Submetido para análise." },
    { data: "2025-07-09T09:30:00Z", autor: "João Silva (Gerente)", acao: "Análise Gerente: Deferido." },
    { data: "2025-07-10T17:50:00Z", autor: "Lúcia Almeida (Diretora)", acao: "Análise Diretor: Deferido." },
    { data: "2025-07-10T17:51:00Z", autor: "Sistema", acao: "Finalizado como Publicado." },
];
// ... (Adicione mais históricos mockados conforme necessário para os outros itens)

export const mockDataHistorico: Contexto[] = [
 {
    id: "6",
    solicitante: "Julia Maria Leite",
    email: "julia.leite@example.com",
    title: "Pagamento PV/JET - Julho", // nome -> title
    status: StatusContexto.Publicado, // situacao -> status
    type: "pdf", // docType -> type
    gerencia: "Gerência de Gestão do Trabalho",
    insertedDate: "2025-07-28T14:00:00Z", // data -> insertedDate
    description: "Comprovativo de pagamento referente ao Programa de Valorização...", // detalhes -> description
    historico: histPublicado1,
    versoes: [{ id: 1, nome: "v1", data: "2025-07-28T14:00:00Z", autor: "Julia Maria Leite", status: StatusContexto.Publicado, historico: histPublicado1 }]
  },
  {
    id: "7",
    solicitante: "Mariana Costa",
    email: "mari.costa@example.com",
    title: "Publicação de Nova Portaria",
    status: StatusContexto.Publicado,
    type: "doc",
    gerencia: "Coordenação de Ouvidoria do SUS",
    insertedDate: "2025-07-10T18:00:00Z",
    description: "Portaria publicada no Diário Oficial sobre novas diretrizes...",
    historico: histPublicado2,
    versoes: [{ id: 1, nome: "v1", data: "2025-07-10T18:00:00Z", autor: "Mariana Costa", status: StatusContexto.Publicado, historico: histPublicado2 }]
  },
  // ... (Continue a conversão para os outros itens do mockDataHistorico)
  // Exemplo de mais um:
  {
    id: "8",
    solicitante: "Rafael Souza",
    email: "rafa.souza@example.com",
    title: "Plano de Metas Anual - 2026",
    status: StatusContexto.Publicado,
    type: "pdf",
    gerencia: "Gerência de Planejamento em Saúde",
    insertedDate: "2025-06-20T10:00:00Z",
    description: "Documento oficial com o plano de metas para o ano fiscal de 2026.",
    historico: [ /* ... (histórico mockado correspondente) ... */ ],
    versoes: [
        { id: 1, nome: "v1", data: "2025-06-20T10:00:00Z", autor: "Rafael Souza", status: StatusContexto.Publicado, historico: [ /* ... */ ] }
    ]
  },
  // (Certifique-se de converter todos os 11 itens)
];