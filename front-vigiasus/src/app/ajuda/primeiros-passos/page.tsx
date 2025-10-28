// src/app/ajuda/primeiros-passos/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Navigation,
  Users,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Bell,
  Home,
  BookCheck,
  GalleryVerticalEnd,
  Layers,
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
  Eye,
  Trash2,
  Database,
  Upload,
  PieChart,
  BarChart3,
  AreaChart,
  Gauge,
  CopyPlus
} from "lucide-react";
import { HiOutlineLogout } from "react-icons/hi";
import Image from 'next/image';
import { Button } from "@/components/ui/button"; //
import { cn } from "@/lib/utils"; //
import { SearchBar } from "@/components/ui/search-bar-faq"; 


const OQueEContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <HelpCircle className="w-9 h-9 text-blue-600"/> O que é o VigiaSUS?
        </h1>
        <p className="text-xl text-gray-600">
          Plataforma digital oficial da Secretaria Municipal de Saúde de Jaboatão dos Guararapes.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          O <strong>VigiaSUS</strong> centraliza e organiza informações cruciais para a gestão da saúde pública no município, transformando dados em conhecimento estratégico para apoiar a tomada de decisões. Ele reúne diversos tipos de <strong>&ldquo;Contextos&rdquo;</strong> – como relatórios, links, dashboards e indicadores – em um único local.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 text-lg">Objetivo Principal</h3>
        <p className="text-blue-700">
          Otimizar o fluxo de informações dentro da Secretaria de Saúde, tornando os dados mais acessíveis, confiáveis e úteis para melhorar a gestão e a saúde da população.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Principais Recursos:</h2>
        <div className="space-y-3 text-gray-700">
          <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
            <p><strong>Coleta e Centralização de Dados:</strong> Reúne informações das gerências e diretorias (Contextos).</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
            <p><strong>Análise e Visualização:</strong> Oferece relatórios, gráficos interativos (Dashboards) e indicadores (KPIs).</p>
          </div>
           <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
            <p><strong>Fluxo de Validação:</strong> Garante a qualidade da informação com um processo de submissão, revisão e publicação.</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
            <p><strong>Apoio à Decisão:</strong> Transforma dados em insights para embasar decisões e políticas públicas.</p>
          </div>
           <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 flex-shrink-0" />
            <p><strong>Notificações e Colaboração:</strong> Mantém os usuários informados através da Central de Notificações e comentários.</p>
          </div>
        </div>
      </div>
    </div>
);

const NavbarContent = () => (
    <div className="space-y-10">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <Navigation className="w-9 h-9 text-blue-600"/> Barra de Navegação (Navbar)
            </h1>
            <p className="text-xl text-gray-600">Menu superior fixo para acesso rápido às funcionalidades.</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>
                A barra de navegação (Navbar) fica sempre visível no topo da tela, com altura padrão de 64px (`min-h-[64px]`), permitindo acesso rápido aos principais recursos e informações do sistema.
            </p>
        </div>

        {/* Adicionar imagem aqui se disponível */}
        {/* <Image src="/docs/images/navbar_example.png" ... /> */}

        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Componentes Principais:</h2>
            <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <Menu className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"/>
                    <div>
                        <h3 className="font-semibold text-gray-800">Botão Menu (☰)</h3>
                        <p className="text-sm text-gray-600">Abre o Menu Lateral (Sidebar) com links específicos para seu perfil.</p>
                    </div>
                </div>
                 <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                     <span className="font-bold text-blue-700 text-lg mt-0.5 flex-shrink-0">VigiaSUS</span>
                    <div>
                        <h3 className="font-semibold text-gray-800">Logo VigiaSUS</h3>
                        <p className="text-sm text-gray-600">Leva você de volta para a Página Inicial da plataforma.</p>
                    </div>
                </div>
                 <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <Image src="/logos/logo-jaboatao.png" alt="Logo Jaboatão" width={100} height={24} className="h-6 w-auto mt-1 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold text-gray-800">Logo da Prefeitura</h3>
                        <p className="text-sm text-gray-600">Logotipo oficial da Prefeitura de Jaboatão dos Guararapes.</p>
                    </div>
                </div>
                 <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <Image src="/icons/online.svg" alt="Status" width={24} height={24} className="h-6 w-6 mt-1 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold text-gray-800">Ícone de Status do Sistema</h3>
                        <p className="text-sm text-gray-600">Indica atualizações ou informações importantes sobre o sistema (clicável para ver detalhes, como em `SystemUpdateView`).</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                     <div className="relative mt-1 flex-shrink-0">
                         <Bell className="w-6 h-6 text-blue-600"/>
                         <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold">5</div>
                     </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Ícone de Notificações (🔔)</h3>
                        <p className="text-sm text-gray-600">Abre a Central de Notificações, mostrando atualizações sobre status de contextos, comentários e avisos do sistema. O número indica notificações não lidas.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const SidebarContent = () => (
  <div className="space-y-10">
    <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <LayoutDashboard className="w-9 h-9 text-blue-600"/> Menu Lateral (Sidebar)
        </h1>
        <p className="text-xl text-gray-600">Navegação principal organizada por perfil de usuário.</p>
    </div>

    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
      <p>
        O menu lateral (Sidebar), acessado pelo botão (☰) na Navbar, agrupa os links para todas as seções do VigiaSUS. Ele é dinâmico e mostra apenas as opções relevantes para o seu perfil de acesso.
      </p>
    </div>

    {/* Adicionar imagem aqui se disponível */}
    {/* <Image src="/docs/images/sidebar_example.png" ... /> */}

    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura Comum:</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-600"/> Informações do Usuário</h3>
           <p className="text-sm text-gray-600">Mostra seu nome e perfil (Membro, Gerente, etc.).</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2">Links de Navegação</h3>
           <p className="text-sm text-gray-600 mb-3">A lista exata depende do seu perfil, mas geralmente inclui:</p>
            <div className="space-y-2">
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Página Inicial (<Home className="inline h-4 w-4"/>):</strong> Retorna à tela principal.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Dashboard (<LayoutDashboard className="inline h-4 w-4"/>):</strong> Painel de gráficos (varia por perfil)/page.tsx].</p>
                </div>
                 <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Dados Gerais (<GalleryVerticalEnd className="inline h-4 w-4"/>):</strong> Visão de todas as Diretorias e Gerências.</p>
                </div>
                 <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Validar Contextos / Contextos Enviados (<BookCheck className="inline h-4 w-4"/> / <FolderClock className="inline h-4 w-4"/>):</strong> Acompanhamento e/ou aprovação de contextos (varia por perfil).</p>
                </div>
                 <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Minhas Gerências (<Layers className="inline h-4 w-4"/>):</strong> (Visível para Diretor) Acesso rápido às gerências da sua diretoria/page.tsx].</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Meus Comentários (<MessageSquareMore className="inline h-4 w-4"/>):</strong> Lista dos seus comentários no sistema.</p>
                </div>
                 <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>Sair do Sistema (<HiOutlineLogout className="inline h-4 w-4"/>):</strong> Desconecta sua sessão.</p>
                </div>
            </div>
             <p className="text-xs text-gray-500 mt-3 italic"></p>
        </div>
      </div>
    </div>
  </div>
);


const PerfisContent = () => (
    <div className="space-y-10">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <Users className="w-9 h-9 text-blue-600"/> Perfis de Usuário
            </h1>
            <p className="text-xl text-gray-600">Níveis de acesso e permissões no VigiaSUS.</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>
                O VigiaSUS utiliza diferentes perfis para garantir que cada usuário tenha acesso às informações e funcionalidades adequadas à sua função. As permissões são geralmente cumulativas.
            </p>
        </div>

        <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-600"/> Membro</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    <strong>Função Principal:</strong> Adicionar e gerenciar os &ldquo;Contextos&rdquo; de sua gerência.
                </p>
                <strong className="text-sm text-gray-800">Principais Permissões:</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> Visualizar Dados Gerais e página da Gerência.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> Adicionar novos contextos (arquivos, links, gráficos, indicadores).</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> Criar novas versões de contextos submetidos.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> Acompanhar status em &ldquo;Contextos Enviados&rdquo;.</div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserCog className="w-5 h-5 text-green-600"/> Gerente</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    <strong>Função Principal:</strong> Validar contextos enviados pelos membros de sua gerência.
                </p>
                 <strong className="text-sm text-gray-800">Principais Permissões (além das de Membro):</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" /> Acessar &ldquo;Validar Contextos&rdquo; para revisar envios.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" /> <strong>Deferir:</strong> Aprovar e enviar para o Diretor.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" /> <strong>Indeferir / Pedir Correção:</strong> Reprovar ou devolver ao Membro com justificativa.</div>
                </div>
            </div>

             <div className="border border-gray-200 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserCheckIcon className="w-5 h-5 text-purple-600"/> Diretor(a)</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    <strong>Função Principal:</strong> Validar contextos aprovados pelos Gerentes e gerenciar dashboard da diretoria.
                </p>
                 <strong className="text-sm text-gray-800">Principais Permissões (além das de Gerente):</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Validar contextos aprovados pelo Gerente.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Visualizar dados de todas as gerências da diretoria/page.tsx].</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" /> Acessar e Editar Layout do Dashboard da Diretoria/editar-layout/page.tsx].</div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5 text-yellow-600"/> Secretário(a)</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    <strong>Função Principal:</strong> Visão geral e consolidada das informações estratégicas.
                </p>
                 <strong className="text-sm text-gray-800">Principais Permissões:</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" /> Visualizar Dados Gerais.</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" /> Acessar Dashboard da Secretaria (gráficos destacados).</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" /> Visualizar Métricas Globais.</div>
                     <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" /> Foco na visualização estratégica, geralmente não valida contextos.</div>
                </div>
            </div>
        </div>
    </div>
);
// --- Fim dos Componentes de Conteúdo ---

const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/primeiros-passos/o-que-e": OQueEContent,
  "/ajuda/primeiros-passos/navbar": NavbarContent,
  "/ajuda/primeiros-passos/sidebar": SidebarContent,
  "/ajuda/primeiros-passos/perfis": PerfisContent,
};

const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/primeiros-passos/o-que-e": HelpCircle,
  "/ajuda/primeiros-passos/navbar": Navigation,
  "/ajuda/primeiros-passos/sidebar": LayoutDashboard,
  "/ajuda/primeiros-passos/perfis": Users,
};

const topicos = [
  { titulo: "O que é o VigiaSUS?", href: "/ajuda/primeiros-passos/o-que-e" },
  { titulo: "Barra de Navegação", href: "/ajuda/primeiros-passos/navbar" },
  { titulo: "Menu Lateral", href: "/ajuda/primeiros-passos/sidebar" },
  { titulo: "Perfis de Usuário", href: "/ajuda/primeiros-passos/perfis" },
];

export default function PrimeirosPassosPage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || OQueEContent;
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
                <span className="font-medium text-blue-900">Primeiros Passos</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-blue-700" />
                <h1 className="text-2xl font-bold text-blue-900">Primeiros Passos</h1>
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
                    <span className="truncate">{topico.titulo.replace(/"/g, '&quot;')}</span>
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