// src/constants/tourData.ts
import { TourStep } from "@/contexts/tourContext";

interface TourConfig {
  key: string; // Chave única para o localStorage
  routeMatch: (pathname: string) => boolean; // Função para verificar a rota
  steps: TourStep[];
}

export const APP_TOURS: TourConfig[] = [
  // --- 1. Módulo de Validação ---
  {
    key: "tour-validar",
    routeMatch: (path) => path === "/validar",
    steps: [
      {
        targetId: "tour-validar-table",
        title: "Lista de Pendências",
        description: "Aqui você encontra todos os contextos que aguardam sua ação (Aprovação, Correção ou Publicação).",
        position: "top"
      },
      {
        targetId: "tour-validar-actions",
        title: "Ações Rápidas",
        description: "Use estes botões para visualizar detalhes, solicitar correções ou aprovar o documento.",
        position: "left"
      }
    ]
  },
  
  // --- 2. Módulo de Gerência Específica ---
  {
    key: "tour-gerencia",
    // Regex para pegar /gerencia/qualquer-coisa
    routeMatch: (path) => /^\/gerencia\/[^/]+$/.test(path),
    steps: [
      {
        targetId: "tour-gerencia-add",
        title: "Adicionar Conteúdo",
        description: "Clique aqui para enviar novos documentos, criar indicadores ou configurar dashboards para esta gerência.",
        position: "bottom"
      },
      {
        targetId: "tour-gerencia-filter",
        title: "Filtros Inteligentes",
        description: "Encontre rapidamente o que precisa filtrando por nome, tipo de arquivo ou status.",
        position: "bottom"
      },
      {
        targetId: "tour-gerencia-grid",
        title: "Seus Documentos",
        description: "Aqui ficam organizados todos os contextos. Clique em um card para ver versões e detalhes.",
        position: "top"
      }
    ]
  },

  // --- 3. Módulo de Dashboard (Editor) ---
  {
    key: "tour-dashboard-edit",
    routeMatch: (path) => path.includes("/editar-layout"),
    steps: [
      {
        targetId: "tour-layout-selector",
        title: "Layout Flexível",
        description: "Escolha como os gráficos serão organizados na tela: Assimétrico, Grade ou Lado a Lado.",
        position: "bottom"
      },
      {
        targetId: "tour-kpi-section",
        title: "Indicadores Chave",
        description: "Selecione até 5 números principais (KPIs) para ficarem em destaque no topo do painel.",
        position: "top"
      },
      {
        targetId: "tour-save-dashboard",
        title: "Salvar Alterações",
        description: "Não se esqueça de salvar suas modificações para que todos vejam o novo painel.",
        position: "left"
      }
    ]
  }
];