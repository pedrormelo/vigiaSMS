// src/constants/diretorias.ts

interface Gerencia {
  id: string;
  nome: string;
}

interface Diretoria {
  id: string;
  nome: string;
  cor: string; // Classe de cor do Tailwind
  gerencias: Gerencia[]; // A lista de gerências de cada diretoria
}

// Exporta a configuração completa
export const diretoriasConfig: { [key: string]: Diretoria } = {
  "atencao-saude": {
    id: "atencao-saude",
    nome: "Diretoria de Atenção à Saúde",
    cor: "bg-blue-600",
    gerencias: [
      { id: "g1", nome: "Gerência de Fluxos Assistenciais" },
      { id: "g2", nome: "Gerência de Atenção Básica" },
    ],
  },
  "regulacao-sus": {
    id: "regulacao-sus",
    nome: "Diretoria de Regulação do SUS",
    cor: "bg-cyan-500",
    gerencias: [
      { id: "g3", nome: "Gerência de Leitos" },
      { id: "g4", nome: "Gerência de Regulação Ambulatorial" },
      { id: "g5", nome: "Gerência de Controle e Avaliação" },
    ],
  },
  "gestao-sus": {
    id: "gestao-sus",
    nome: "Diretoria de Gestão do SUS",
    cor: "bg-green-600",
    gerencias: [
        { id: "g6", nome: "Gerência de Orçamento e Finanças" },
    ],
  },
};