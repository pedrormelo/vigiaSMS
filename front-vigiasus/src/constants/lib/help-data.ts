// Estrutura de dados global (exemplo)
interface HelpTopic {
  titulo: string;
  href: string;
  descricao: string; // Usado para busca
  keywords?: string; // Palavras-chave adicionais para busca
}

interface HelpArea {
  id: string; // Identificador único da área
  nome: string;
  icon: React.ElementType;
  topicos: HelpTopic[];
}

// Exemplo de dados globais (PREENCHER COM TODAS AS ÁREAS E TÓPICOS)
const allHelpData: HelpArea[] = [
  {
    id: "primeiros-passos",
    nome: "Primeiros Passos",
    icon: BookOpen,
    topicos: [
      { titulo: "O que é o VigiaSUS?", href: "/ajuda/primeiros-passos/o-que-e", descricao: "Plataforma digital saúde Jaboatão gestão propósito objetivo" },
      { titulo: "Barra de Navegação", href: "/ajuda/primeiros-passos/navbar", descricao: "Menu superior navbar notificações sino menu lateral sidebar logo" },
      { titulo: "Menu Lateral", href: "/ajuda/primeiros-passos/sidebar", descricao: "Sidebar navegação links perfil dashboard dados gerais validar sair" },
      { titulo: "Perfis de Usuário", href: "/ajuda/primeiros-passos/perfis", descricao: "Roles membro gerente diretor secretário permissões acesso validar adicionar" },
    ],
  },
  {
    id: "gerenciando-conteudo",
    nome: "Adicionando Conteúdo",
    icon: FilePlus, // Ícone da área
    topicos: [
      { titulo: "O que é um \"Contexto\"?", href: "/ajuda/gerenciando-conteudo/o-que-e-contexto", descricao: "Unidade informação arquivo link dashboard indicador kpi" },
      { titulo: "Guia: Add Arquivos/Links", href: "/ajuda/gerenciando-conteudo/add-arquivo-link", descricao: "Upload pdf doc excel anexar url externo" },
      { titulo: "Guia: Criar Gráficos", href: "/ajuda/gerenciando-conteudo/add-grafico", descricao: "Dashboard pizza barras linha área dados manual csv upload pré-visualização" },
      { titulo: "Guia: Add Indicadores", href: "/ajuda/gerenciando-conteudo/add-indicador", descricao: "KPI meta valor unidade comparativo ícone cor" },
      { titulo: "Criar Nova Versão", href: "/ajuda/gerenciando-conteudo/nova-versao", descricao: "Atualizar corrigir histórico versionamento" },
    ]
  },
  // --- Adicionar OUTRAS ÁREAS aqui (Visualizando Dados, Validação, etc.) ---
];

// Mapeamento de ícones para TÓPICOS (mantido como antes para a sidebar)
const topicIconMap: { [key: string]: React.ElementType } = {
  "/ajuda/primeiros-passos/o-que-e": HelpCircle,
  "/ajuda/primeiros-passos/navbar": Navigation,
  "/ajuda/primeiros-passos/sidebar": LayoutDashboard,
  "/ajuda/primeiros-passos/perfis": Users,
   // Adicionar ícones das outras áreas aqui também
  "/ajuda/gerenciando-conteudo/o-que-e-contexto": HelpCircle,
  "/ajuda/gerenciando-conteudo/add-arquivo-link": FileUp,
  "/ajuda/gerenciando-conteudo/add-grafico": BarChart3,
  "/ajuda/gerenciando-conteudo/add-indicador": Gauge,
  "/ajuda/gerenciando-conteudo/nova-versao": CopyPlus,
};

// Tópicos específicos desta área (para a sidebar)
const currentAreaTopics = allHelpData.find(area => area.id === 'primeiros-passos')?.topicos || [];