<<<<<<< HEAD
// --- TIPOS E INTERFACES ---

import { PieChart, BarChart3, LineChart } from "lucide-react";
=======
// src/components/popups/addContextoModal/types.ts

import { PieChart, BarChart3, AreaChart } from "lucide-react"; 
>>>>>>> consertando-gerencia
import type { FileType } from '@/components/contextosCard/contextoCard';

export type AbaAtiva = "contexto" | "dashboard" | "indicador";
export type AbaFonteDeDados = "manual" | "upload";
export type TipoGrafico = "pie" | "chart" | "line";
export type NomeIcone = "Heart" | "Landmark" | "ClipboardList" | "Users" | "TrendingUp" | "DollarSign" | "Building" | "UserCheck";

<<<<<<< HEAD
export interface ConjuntoDeDadosGrafico {
  colunas: string[];
  linhas: (string | number)[][];
}

export interface ModalAdicionarConteudoProps {
  estaAberto: boolean;
  aoFechar: () => void;
  aoSubmeter: (dados: { tipo: AbaAtiva; payload: any }) => void;
  abaInicial?: AbaAtiva;
=======
export enum TipoVersao {
  CORRECAO = "Correção de Informação Incorreta",
  ATUALIZACAO_MENSAL = "Atualização Mensal",
}

export interface VersionInfo {
  type: TipoVersao;
  description: string;
}

export interface Versao {
  id: number;
  nome: string;
  data: string;
  autor: string;
}


export interface ConjuntoDeDadosGrafico {
  colunas: string[];
  linhas: (string | number)[][];
  cores?: string[];
}

// Tipos específicos para cada payload de submissão
export interface ContextoPayload {
  title: string;
  details: string;
  file: File | null;
  url: string;
  versionInfo: VersionInfo | null;
}

export interface DashboardPayload {
  title: string;
  details: string;
  type: TipoGrafico;
  dataFile: File | null;
  dataset: ConjuntoDeDadosGrafico;
  versionInfo: VersionInfo | null;
}

export interface IndicadorPayload {
  titulo: string;
  descricao: string;
  valorAtual: string;
  valorAlvo: string;
  unidade: string;
  textoComparativo: string;
  cor: string;
  icone: NomeIcone;
  versionInfo: VersionInfo | null;
}

// União discriminada para os dados de submissão
export type SubmitData =
  | { type: 'contexto'; payload: Partial<ContextoPayload> }
  | { type: 'dashboard'; payload: Partial<DashboardPayload> }
  | { type: 'indicador'; payload: Partial<IndicadorPayload> };

export interface ModalAdicionarConteudoProps {
  estaAberto: boolean;
  aoFechar: () => void;
  aoSubmeter: (dados: SubmitData) => void;
  abaInicial?: AbaAtiva;
  dadosIniciais?: Partial<DetalhesContexto> | null;
}

// Tipo para o payload de visualização de um indicador
interface IndicadorDetailsPayload {
    description: string;
    valorAtual: string;
    unidade: string;
    textoComparativo: string;
    cor: string;
    icone: NomeIcone;
>>>>>>> consertando-gerencia
}

export interface DetalhesContexto {
    id: string;
    title: string;
    type: FileType;
    insertedDate: string;
    url?: string;
<<<<<<< HEAD
    payload?: ConjuntoDeDadosGrafico; // Tipo corrigido de 'any' para 'ConjuntoDeDadosGrafico'
=======
    payload?: ConjuntoDeDadosGrafico | IndicadorDetailsPayload;
    description?: string;
    solicitante?: string;
    autor?: string;
    chartType?: TipoGrafico;
    versoes?: Versao[]; 
    valorAtual?: string;
    valorAlvo?: string;
    unidade?: string;
    textoComparativo?: string;
    cor?: string;
    icone?: NomeIcone;
    cores?: string[];
>>>>>>> consertando-gerencia
}


export interface SeletorTipoGraficoProps {
  tipoSelecionado: TipoGrafico;
  aoMudarTipo: (tipo: TipoGrafico) => void;
}

export interface SecaoDadosManuaisProps {
  conjuntoDeDados: ConjuntoDeDadosGrafico;
  aoAtualizarCelula: (linha: number, coluna: number, valor: string) => void;
  aoAdicionarLinha: () => void;
  aoRemoverLinha: (index: number) => void;
  aoAdicionarColuna: () => void;
  aoRemoverColuna: (indiceColuna: number) => void;
  aoAtualizarNomeColuna: (index: number, novoNome: string) => void;
}

export interface SecaoUploadArquivoProps {
  arquivoDeDados: File | null;
  setArquivoDeDados: (arquivo: File | null) => void;
  aoBaixarModelo: () => void;
}

export interface AbaIndicadorProps {
  tituloIndicador: string;
  setTituloIndicador: (valor: string) => void;
  descricaoIndicador: string;
  setDescricaoIndicador: (valor: string) => void;
  valorAtualIndicador: string;
  setValorAtualIndicador: (valor: string) => void;
  valorAlvoIndicador: string;
  setValorAlvoIndicador: (valor: string) => void;
  unidadeIndicador: string;
  setUnidadeIndicador: (valor: string) => void;
  textoComparativoIndicador: string;
  setTextoComparativoIndicador: (valor: string) => void;
  corIndicador: string;
  setCorIndicador: (valor: string) => void;
  iconeIndicador: NomeIcone;
  setIconeIndicador: (valor: NomeIcone) => void;
}

export const TIPOS_GRAFICOS = {
  pie: { Icon: PieChart, rotulo: "Pizza" },
  chart: { Icon: BarChart3, rotulo: "Barras" },
<<<<<<< HEAD
  line: { Icon: LineChart, rotulo: "Linha" },
=======
  line: { Icon: AreaChart, rotulo: "Área" },
>>>>>>> consertando-gerencia
};