// src/components/validar/typesDados.ts

import { FileType } from "@/components/contextosCard/contextoCard";
import { ReactNode } from "react";
// Importar tipos de payload do modal de add (dependência agora é unidirecional)
import type { ConjuntoDeDadosGrafico, IndicadorDetailsPayload, TipoGrafico } from "@/components/popups/addContextoModal/types";

// --- ENUMS E TIPOS BÁSICOS (Já estavam aqui) ---
export interface HistoricoEvento {
  data: string; 
  autor: string;
  acao: string;
}

// 'DocType' agora é usado apenas internamente se necessário, 'FileType' é o padrão
export type DocType = "excel" | "pdf" | "doc" | "dashboard" | "resolucao" | "indicador" | "apresentacao";

export enum StatusContexto {
  AguardandoGerente = "Aguardando análise do Gerente",
  AguardandoDiretor = "Aguardando análise do Diretor",
  AguardandoCorrecao = "Aguardando Correção",
  Deferido = "Deferido",
  Indeferido = "Indeferido",
  Publicado = "Publicado",
}

// --- TIPO Versao (Movido de types.ts) ---
export interface Versao {
  id: number;
  nome: string;
  data: string;
  autor: string;
  estaOculta?: boolean;
  status?: StatusContexto;
  historico?: HistoricoEvento[];
}

// --- INTERFACE UNIFICADA 'Contexto' ---
// (Substitui o 'Contexto' antigo e o 'DetalhesContexto')
export interface Contexto {
  id: string;
  title: string;          // 'nome' agora é 'title'
  type: FileType;         // 'docType' foi unificado em 'type'
  insertedDate: string;   // 'data' agora é 'insertedDate'
  status: StatusContexto; // 'situacao' agora é 'status'
  
  // Campos opcionais
  url?: string;
  // Payload pode ser de um gráfico ou de um indicador
  payload?: ConjuntoDeDadosGrafico | IndicadorDetailsPayload | any; 
  description?: string; // 'detalhes' agora é 'description'
  solicitante?: string;
  gerencia?: string;
  email?: string; // Mantido para tabela de validação
  
  // Campos de Versão
  versoes?: Versao[]; 
  historico?: HistoricoEvento[]; // Histórico geral (da última versão)
  estaOculto?: boolean;
  
  // Campos específicos de visualização (para dashboards)
  chartType?: TipoGrafico;
}

/** Tipo Column genérico para a tabela (Atualizado para usar 'Contexto') */
export type Column<T extends Contexto> = {
  key: keyof T | "acoes";
  header: string;
  render?: (row: T, onUpdate?: (id: string, novo: StatusContexto) => void) => ReactNode;
};