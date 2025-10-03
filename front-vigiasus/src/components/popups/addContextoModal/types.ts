// --- TIPOS E INTERFACES ---

// Importa os ícones que serão usados em outros componentes
import { PieChart, BarChart3, LineChart } from "lucide-react";

// Tipos principais para controlar as abas
export type ActiveTab = "contexto" | "dashboard";
export type DataSourceTab = "manual" | "upload";
export type GraphType = "pie" | "chart" | "line";

// Interface para a estrutura de dados do gráfico
export interface ChartDataset {
  columns: string[];
  rows: (string | number)[][];
}

// Props para o componente principal do Modal
export interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: ActiveTab; payload: any }) => void;
  initialTab?: ActiveTab;
}

// Props para os componentes menores, extraídos do original
export interface GraphTypeSelectorProps {
  selectedType: GraphType;
  onTypeChange: (type: GraphType) => void;
}

export interface ManualDataSectionProps {
  dataset: ChartDataset;
  onUpdateCell: (row: number, col: number, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  // Adicionamos as props que faltavam para manter a funcionalidade
  onAddColumn: () => void;
  onRemoveColumn: (colIndex: number) => void;
  onUpdateColumnName: (index: number, newName: string) => void;
}

export interface FileUploadSectionProps {
  dataFile: File | null;
  setDataFile: (file: File | null) => void;
  onDownloadTemplate: () => void;
}

// Constantes para mapear tipos de gráficos a seus ícones e rótulos
export const GRAPH_TYPES = {
  pie: { Icon: PieChart, label: "Pizza" },
  chart: { Icon: BarChart3, label: "Barras" },
  line: { Icon: LineChart, label: "Linha" },
};