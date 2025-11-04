// src/components/validar/typesDados.ts

import { FileType } from "@/components/contextosCard/contextoCard"; // <-- 1. IMPORTAR
import { ReactNode } from "react";

export interface HistoricoEvento {
  data: string; 
  autor: string;
  acao: string;
}

//Tipos para os diferentes formatos de documento
export type DocType = "excel" | "pdf" | "doc" | "dashboard" | "resolucao" | "indicador" | "apresentacao";

/** Estados possíveis do contexto */
export enum StatusContexto {
  AguardandoGerente = "Aguardando análise do Gerente",
  AguardandoDiretor = "Aguardando análise do Diretor",
  AguardandoCorrecao = "Aguardando Correção",
  Deferido = "Deferido", // Pode ser removido se o fluxo for direto para Publicado
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
  docType: DocType; 
  type: FileType; // <-- 2. ADICIONADO PARA CONSISTÊNCIA
  detalhes: string;
  data: string;
  historico?: HistoricoEvento[];
  url?: string; 
  payload?: any; 
}

/** Tipo Column genérico para a tabela */
export type Column<T> = {
  key: keyof T | "acoes";
  header: string;
  render?: (row: T, onUpdate?: (id: string, novo: StatusContexto) => void) => ReactNode;
};