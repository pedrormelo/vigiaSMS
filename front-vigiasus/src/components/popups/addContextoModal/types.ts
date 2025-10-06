// --- TIPOS E INTERFACES ---

import { PieChart, BarChart3, LineChart } from "lucide-react";

export type AbaAtiva = "contexto" | "dashboard" | "indicador";
export type AbaFonteDeDados = "manual" | "upload";
export type TipoGrafico = "pie" | "chart" | "line";

export type NomeIcone = 
    | "Heart" 
    | "Landmark" 
    | "ClipboardList" 
    | "Users"
    | "TrendingUp"
    | "DollarSign"
    | "Building"
    | "UserCheck";

export interface ConjuntoDeDadosGrafico {
  colunas: string[];
  linhas: (string | number)[][];
}

export interface ModalAdicionarConteudoProps {
  estaAberto: boolean;
  aoFechar: () => void;
  aoSubmeter: (dados: { tipo: AbaAtiva; payload: unknown }) => void;
  abaInicial?: AbaAtiva;
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
  line: { Icon: LineChart, rotulo: "Linha" },
};