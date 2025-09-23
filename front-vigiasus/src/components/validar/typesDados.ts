// src/components/validar/typesDados.ts

import { ReactNode } from "react";

export interface HistoricoEvento {
  data: string; 
  autor: string;
  acao: string;
}

//Tipos para os diferentes formatos de documento
export type DocType = "excel" | "pdf" | "doc" | "dashboard" | "money";

/** Estados possíveis do contexto */
export enum StatusContexto {
  AguardandoGerente = "Aguardando análise do Gerente",
  AguardandoDiretor = "Aguardando análise do Diretor",
  AguardandoCorrecao = "Aguardando Correção",
  Deferido = "Deferido",
  Indeferido = "Indeferido",
  Publicado = "Publicado",
}

/** Tipo principal para os dados da tabela */
export interface Contexto {
  id: string;
  solicitante: string;
  email: string;
  gerencia: string;
  nome: string;
  situacao: StatusContexto;
//  icone: string;
  docType: DocType; 
  detalhes: string;
  data: string;
  historico?: HistoricoEvento[];
}

/** Tipo Column genérico para a tabela */
export type Column<T> = {
  key: keyof T | "acoes";
  header: string;
  render?: (row: T, onUpdate?: (id: string, novo: StatusContexto) => void) => ReactNode;
};