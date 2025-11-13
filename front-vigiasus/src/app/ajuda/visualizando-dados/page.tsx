// src/app/ajuda/visualizando-dados/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen, // Ícone da área (mantendo padrão do modelo)
  ChevronRight,
  Navigation,
  Users,
  HelpCircle,
  Menu,
  Bell,
  Home,
  BookCheck,
  MessageSquareMore,
  FolderClock,
  UserCog,
  UserCheck as UserCheckIcon,
  User as UserIcon,
  History,
  FilePlus,
  FileSymlink,
  UploadCloud,
  FileText as FileTextIcon,
  Link as LinkIcon,
  Eye, // Ícone principal da página
  Trash2,
  Database,
  Upload,
  PieChart,
  BarChart3,
  AreaChart,
  Gauge,
  CopyPlus,
  GalleryVerticalEnd, // Ícone de Tópico
  Layers, // Ícone de Tópico
  LayoutDashboard, // Ícone de Tópico
  Pen, // Ícone para "Editar"
  Funnel, // <-- 1. CORREÇÃO: Ícone Funnel adicionado
} from "lucide-react";
import { HiOutlineLogout } from "react-icons/hi";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar-faq"; 

// --- 1. NOVOS COMPONENTES DE CONTEÚDO (COM MELHORIAS) ---

// Conteúdo para "O que são Dados Gerais?"
const DadosGeraisContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <GalleryVerticalEnd className="w-9 h-9 text-blue-600"/> O que são &ldquo;Dados Gerais&rdquo;?
        </h1>
        <p className="text-xl text-gray-600">
          A visão macro de toda a estrutura da Secretaria de Saúde.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          A página <strong>&ldquo;Dados Gerais&rdquo;</strong> é o ponto de partida para explorar toda a informação pública da plataforma. Ela funciona como um mapa, dividida em duas seções principais:
        </p>
      </div>
      
      {/* Placeholder de Imagem */}
      <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center text-gray-500">
        <p className="italic text-sm">[IMAGEM: Tela &ldquo;Dados Gerais&rdquo; mostrando os cards das Diretorias no topo e o carrossel de Gerências abaixo]</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Seções da Página:</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">1. Grade de Diretorias</h3>
            <p className="text-sm text-gray-600 mt-1">
              Exibe os <strong>&ldquo;cards&rdquo; coloridos</strong> para cada grande diretoria (Ex: Atenção à Saúde, Regulação do SUS, Gestão do SUS). Clicar em um desses cards leva você à página de &ldquo;Minhas Gerências&rdquo; (para Diretores)/page.tsx] ou diretamente para a página da diretoria.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">2. Painel de Gerências</h3>
            <p className="text-sm text-gray-600 mt-1">
              Abaixo das diretorias, você encontra um carrossel com <strong>todas</strong> as gerências da secretaria. Esta seção possui filtros:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
              <li><strong>Barra de Pesquisa:</strong> Permite buscar uma gerência específica pelo nome.</li>
              <li><strong>Botão de Filtro (<span className="inline-block"><Funnel size={14}/></span>):</strong> Abre um pop-up para filtrar as gerências por diretoria(s).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
);

// Conteúdo para "A Página da Gerência"
const PaginaGerenciaContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Layers className="w-9 h-9 text-blue-600"/> A Página da Gerência
        </h1>
        <p className="text-xl text-gray-600">O &ldquo;hub&rdquo; central para todos os dados de uma gerência específica/page.tsx].</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          Ao clicar em uma gerência (seja pelo carrossel ou pela página &ldquo;Minhas Gerências&rdquo;), você acessa a página dedicada a ela. Esta página consolida todos os contextos submetidos por aquele setor.
        </p>
      </div>

      {/* Placeholder de Imagem */}
      <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center text-gray-500">
        <p className="italic text-sm">[IMAGEM: Visão geral da página de uma Gerência, destacando o Dashboard, Indicadores e a Grade de Contextos]</p>
      </div>

       <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Componentes Principais:</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Modo de Edição (Botão <Pen size={16} className="inline"/>)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Se você for um membro daquela gerência (ou um Diretor/Secretário), verá um botão <strong>&ldquo;Modo de Edição&rdquo;</strong>. Ativá-lo permite adicionar novos contextos (Arquivos, Gráficos, Indicadores) à página/page.tsx].
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Dashboard da Gerência</h3>
            <p className="text-sm text-gray-600 mt-1">
              Uma prévia dos gráficos de dashboard criados e publicados por esta gerência. Os gráficos são paginados se houver muitos.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Indicadores (KPIs)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Uma fileira de <strong>&ldquo;cards&rdquo;</strong> que mostram as métricas chave (KPIs) desta gerência, como &ldquo;População Atendida&rdquo; ou &ldquo;Profissionais Ativos&rdquo;.
            </p>
          </div>
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Painel de Contextos (Filtros e Grade)</h3>
            <p className="text-sm text-gray-600 mt-1">
              A seção principal. Contém uma barra de filtros (para buscar por nome, aba de <strong>&ldquo;Recentes&rdquo;</strong> e filtro por tipo de arquivo) e a grade (`FileGrid`) que exibe todos os cards de contexto (PDFs, DOCs, Links, etc.).
            </p>
          </div>
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Sobre (Rodapé)</h3>
            <p className="text-sm text-gray-600 mt-1">
              No final da página, há uma seção <strong>&ldquo;Sobre&rdquo;</strong> com a descrição oficial da gerência e, se disponível, uma imagem de capa/page.tsx].
            </p>
          </div>
        </div>
      </div>
    </div>
);

// Conteúdo para "O Dashboard (Diretor/Secretaria)"
const DashboardContent = () => (
  <div className="space-y-10">
    <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <LayoutDashboard className="w-9 h-9 text-blue-600"/> O Dashboard (Diretor/Secretaria)
        </h1>
        <p className="text-xl text-gray-600">A visão consolidada dos gráficos mais importantes/page.tsx].</p>
    </div>

    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
      <p>
        A página <strong>&ldquo;Dashboard&rdquo;</strong>, acessível pelo menu lateral, oferece uma visão de alto nível dos dados gráficos, mas seu conteúdo muda dependendo do seu perfil.
      </p>
    </div>

    {/* Placeholder de Imagem */}
    <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center text-gray-500">
      <p className="italic text-sm">[IMAGEM: Comparativo do Dashboard do Secretário (carrossel) vs. Dashboard do Diretor (layout fixo)]</p>
    </div>

    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Visão do Secretário(a)</h3>
        <p className="text-gray-600 mb-4 text-sm">
          O Secretário(a) vê o dashboard principal (`/dashboard/secretaria`). Este painel é especial:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Exibe <strong>apenas</strong> os gráficos que foram marcados como <strong>&ldquo;Destaque&rdquo;</strong> pelos Diretores.</li>
          <li>É um carrossel que agrupa os gráficos por Diretoria (Atenção à Saúde, Regulação, etc.).</li>
          <li>Também exibe métricas globais e métricas de todas as diretorias.</li>
        </ul>
      </div>
    
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Visão do Diretor(a)</h3>
        <p className="text-gray-600 mb-4 text-sm">
          O Diretor(a) vê o dashboard da sua própria diretoria (ex: `/dashboard/gestao-sus`). Este painel é um layout fixo de gráficos.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Exibe os gráficos em um layout específico (Assimétrico, Grade, etc.).</li>
          <li>Possui um botão de <strong>&ldquo;Editar Layout&rdquo;</strong> (ícone <Pen size={16} className="inline"/>)/page.tsx, lines 112-115].</li>
          <li>A página &ldquo;Editar Layout&rdquo; permite ao Diretor(a) escolher um layout (Assimétrico, Grade, Lado a Lado), adicionar gráficos disponíveis e marcar até 3 gráficos como <strong>&ldquo;Destaque&rdquo;</strong> (que aparecerão para o Secretário)/editar-layout/page.tsx].</li>
        </ul>
      </div>
    </div>
  </div>
);

// Conteúdo para "Visualizando Detalhes (Modal)"
const ModalVisualizacaoContent = () => (
    <div className="space-y-10">
      <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <Eye className="w-9 h-9 text-blue-600"/> Visualizando Detalhes (Modal)
          </h1>
          <p className="text-xl text-gray-600">Analisando um contexto específico e seu histórico.</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          Ao clicar em qualquer card (seja um arquivo, um gráfico ou um indicador) em uma página de gerência ou na tela de validação, um modal de visualização de detalhes é aberto.
        </p>
      </div>

      {/* Placeholder de Imagem */}
      <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center text-gray-500">
        <p className="italic text-sm">[IMAGEM: Modal de visualização de detalhes aberto, mostrando a aba &ldquo;Detalhes&rdquo; com o visualizador de PDF/Gráfico à direita]</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recursos do Modal:</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Aba &ldquo;Detalhes&rdquo;</h3>
            <p className="text-sm text-gray-600 mt-1">
              A aba principal. A coluna da direita mostra o <strong>visualizador de conteúdo</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
              <li><strong>Arquivos (PDF/DOCX):</strong> Exibe uma prévia rolável do documento.</li>
              <li><strong>Links:</strong> Mostra um card com o link para abrir em nova aba.</li>
              <li><strong>Dashboards (Gráficos):</strong> Renderiza o gráfico (Pizza, Barras, etc.).</li>
              <li><strong>Indicadores:</strong> Exibe o card de KPI formatado.</li>
              <li>A coluna da esquerda mostra a descrição, solicitante, e o botão de <strong>&ldquo;Baixar&rdquo;</strong>.</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Aba &ldquo;Histórico&rdquo;</h3>
            <p className="text-sm text-gray-600 mt-1">
              Mostra a linha do tempo do <strong>fluxo de validação</strong> desse contexto. Você pode ver quem submeteu, quem (Gerente/Diretor) aprovou ou indeferiu, e quando.
            </p>
          </div>
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Rodapé de Ações (Perfis Gerente/Diretor)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Se você for um Gerente ou Diretor e o contexto estiver aguardando sua análise, o rodapé do modal exibirá os botões <strong>&ldquo;Deferir&rdquo;</strong> e <strong>&ldquo;Indeferir&rdquo;</strong> para você tomar a ação.
            </p>
          </div>
        </div>
      </div>
    </div>
);


// --- 2. MAPAS E LISTAS ATUALIZADOS ---

// Mapeamento dos hrefs para os componentes de conteúdo
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/visualizando-dados/dados-gerais": DadosGeraisContent,
  "/ajuda/visualizando-dados/pagina-gerencia": PaginaGerenciaContent,
  "/ajuda/visualizando-dados/dashboard": DashboardContent,
  "/ajuda/visualizando-dados/modal-visualizacao": ModalVisualizacaoContent,
};

// Mapeamento de ícones para os tópicos da sidebar
const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/visualizando-dados/dados-gerais": GalleryVerticalEnd,
  "/ajuda/visualizando-dados/pagina-gerencia": Layers,
  "/ajuda/visualizando-dados/dashboard": LayoutDashboard,
  "/ajuda/visualizando-dados/modal-visualizacao": Eye,
};

// Lista de tópicos para a sidebar "Nesta Seção"
const topicos = [
  { titulo: "O que são \"Dados Gerais\"?", href: "/ajuda/visualizando-dados/dados-gerais" },
  { titulo: "A Página da Gerência", href: "/ajuda/visualizando-dados/pagina-gerencia" },
  { titulo: "O Dashboard (Diretor/Secretaria)", href: "/ajuda/visualizando-dados/dashboard" },
  { titulo: "Visualizando Detalhes (Modal)", href: "/ajuda/visualizando-dados/modal-visualizacao" },
];

// --- 3. COMPONENTE PRINCIPAL DA PÁGINA ---

export default function VisualizandoDadosPage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || DadosGeraisContent;
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho Fixo da Área */}
      <div className="border-b border-gray-200 bg-blue-50 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-700/80 mb-2">
                <Link href="/ajuda" className="hover:text-blue-900 transition-colors">
                  Ajuda
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-blue-900">Visualizando Dados</span>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-7 h-7 text-blue-700" />
                <h1 className="text-2xl font-bold text-blue-900">Visualizando Dados</h1>
              </div>
            </div>
            <div className="w-full md:w-full lg:max-w-3xl rounded-3xl">
               <SearchBar
                 placeholder="Buscar nesta seção..."
                 value={searchValue}
                 onChange={setSearchValue}
                 className="shadow-sm"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Sidebar */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-42 relative">
        <aside className="w-full md:w-64 flex-shrink-0 order-last md:order-first">
          <div className="sticky top-45">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Nesta Seção
            </h2>
            <nav className="space-y-1">
              {topicos.map((topico) => {
                const isActive = activeTopicHref === topico.href;
                const Icon = iconMap[topico.href] || ChevronRight;
                return (
                  <button
                    key={topico.href}
                    onClick={() => {
                      setActiveTopicHref(topico.href);
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                    {/* 2. CORREÇÃO: Usando replace para exibir aspas corretamente na UI */}
                    <span className="truncate">{topico.titulo.replace(/"/g, '')}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main id="main-content-area" className="flex-1 min-w-0">
          <ActiveContentComponent />
          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link href="/ajuda">
              <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900 gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Central de Ajuda
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}