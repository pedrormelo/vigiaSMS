// src/constants/diretorias.ts

interface Gerencia {
  id: string;
  nome: string;
}

interface Diretoria {
  id: string;
  nome: string;
  // objeto com as cores do gradiente
  cores: {
    from: string; // Cor inicial em hexadecimal
    to: string;   // Cor final em hexadecimal
  };
  // caminho (a partir de /public) para um banner de imagem opcional
  // Quando presente, use esta imagem em vez do gradiente
  bannerImage?: string;
  gerencias: Gerencia[];
}

// Exporta a configuração completa com as cores
export const diretoriasConfig: { [key: string]: Diretoria } = {
  "atencao-saude": {
    id: "atencao-saude",
    nome: "Diretoria de Atenção à Saúde",
    cores: { from: "#1745FF", to: "#002BDB" },
    gerencias: [
      { id: "g1", nome: "Gerência de Fluxos Assistenciais" },
      { id: "g2", nome: "Gerência de Atenção Básica" },
    ],
  },
  "regulacao-sus": {
    id: "regulacao-sus",
    nome: "Diretoria de Regulação do SUS",
    cores: { from: "#00BDFF", to: "#07ABE4" },
    gerencias: [
      { id: "g3", nome: "Gerência de Leitos" },
      { id: "g4", nome: "Gerência de Regulação Ambulatorial" },
      { id: "g5", nome: "Gerência de Controle e Avaliação" },
    ],
  },
  "gestao-sus": {
    id: "gestao-sus",
    nome: "Diretoria de Gestão do SUS",
    cores: { from: "#109326", to: "#008C32" }, 
    gerencias: [
        { id: "g6", nome: "Gerência de Planejamento" },
        { id: "g7", nome: "Gerência de Tecnologia da Informação" },
    ],
  },

    "vigilancia-saude": {
    id: "vigilancia-saude",
    nome: "Diretoria de Vigilância em Saúde",
    cores: { from: "#FF8500", to: "#FD8400" }, 
    gerencias: [
        { id: "g8", nome: "Gerência de Insperção Sanitária" },
    ],
  },

    "administrativo-financeira": {
    id: "administrativo-financeira",
    nome: "Diretoria Administrativa Financeiro",
    cores: { from: "#FB4242", to: "#EF2828" }, 
    gerencias: [
        { id: "g9", nome: "Gerência Administrativa Financeiro" },
    ],
  },

    "secretaria": {
    id: "secretaria",
    nome: "Página da Secretária",
    // Mantemos as cores por compatibilidade, mas prefira usar bannerImage quando disponível
    cores: { from: "#ffcb3e", to: "#f7721c" },
    // Imagem localizada em /public/secretaria/images/banner1.png
    bannerImage: "/secretaria/images/banner1.png",
    gerencias: [
        { id: "g10", nome: "Secretaria" },
    ],
  },
};