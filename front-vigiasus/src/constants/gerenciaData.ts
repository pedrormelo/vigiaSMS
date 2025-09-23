// src/mocks/gerenciaData.ts

export interface Gerencia {
  id: string;
  name: string;
}

export interface Diretoria {
  id: string;
  name: string;
  color: string;
  gerencias: Gerencia[];
}

export const gerenciasHierarquia: Diretoria[] = [
  {
    id: "1",
    name: "Diretoria de Atenção Básica",
    color: "#1745FF", 
    gerencias: [
      { id: "1a", name: "Gerência de Gestão Ensino e Serviço" },
      { id: "1b", name: "Gerência de Gestão do Trabalho" },
      { id: "1c", name: "Gerência de Planejamento em Saúde" }, 
      { id: "2a", name: "Coordenação de Ouvidoria do SUS" },
    ],
  },
  {
    id: "2",
    name: "Diretoria de Média e Alta Complexidade",
    color: "#00C897",
    gerencias: [
      { id: "2a", name: "Gerência de Especialidades Médicas" },
      { id: "2b", name: "Gerência de Gestão Ensino e Serviço" }, 
    ],
  },
  {
    id: "3",
    name: "Diretoria de Vigilância em Saúde",
    color: "#E27D60", 
    gerencias: [
      { id: "3a", name: "Gerência de Vigilância em Saúde" },
    ],
  },
];