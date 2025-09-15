// src/components/validar/colunasTable/statusConfig.ts

import { StatusContexto } from "@/components/validar/typesDados";

// Esta configuração mapeia cada status a um texto e a uma classe de estilo.
// Agora está num local central para ser reutilizada.
export const statusConfig: { [key in StatusContexto]?: { text: string; className: string } } = {
    [StatusContexto.Deferido]: { text: "Deferido", className: "bg-green-100 text-green-800" },
    [StatusContexto.Indeferido]: { text: "Indeferido", className: "bg-red-100 text-red-800" },
    [StatusContexto.Publicado]: { text: "Publicado", className: "bg-blue-100 text-blue-800" },
    [StatusContexto.AguardandoGerente]: { text: "Aguardando Gerente", className: "bg-yellow-100 text-yellow-800" },
    [StatusContexto.AguardandoDiretor]: { text: "Aguardando Diretor", className: "bg-yellow-100 text-yellow-800" },
    [StatusContexto.AguardandoAnalise]: { text: "Aguardando Análise", className: "bg-yellow-100 text-yellow-800" },
};