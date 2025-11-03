// src/app/ajuda/modulos/page.tsx

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
  // Ícones específicos desta seção
  Settings, // Ícone da Área
  CalendarDays,
  FileText as FileTextIcon
} from "lucide-react";
import { HiOutlineLogout } from "react-icons/hi";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar-faq"; // Usando a mesma barra de busca de "primeiros-passos"

// --- Componentes de Conteúdo dos Tópicos ---

const GuiaCMSContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <LayoutDashboard className="w-9 h-9 text-blue-600"/> Guia: Conselho Municipal de Saúde (CMS)
        </h1>
        <p className="text-xl text-gray-600">
          Como visualizar e gerenciar a página do Conselho.
        </p>
      </div>

      {/* [IMAGEM: Captura de tela da página principal do CMS, mostrando o Hero e as seções] */}
      <Image src="/ajuda/modulos/cms-hero.png" width={1000} height={400} alt="Página principal do Conselho Municipal de Saúde" className="rounded-lg shadow-md mb-4" />

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          A seção do <strong>Conselho Municipal de Saúde (CMS)</strong> é uma área dedicada à transparência das ações do conselho. Ela permite a publicação e visualização de eventos, resoluções e outras informações importantes.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades Principais:</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-purple-600"/> Gerenciamento de Eventos</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Permite adicionar e visualizar as datas importantes do conselho, como reuniões e fiscalizações.
              </p>
              <strong className="text-sm text-gray-800">Como Adicionar um Evento:</strong>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 mt-2">
                  <li>Na página do CMS, clique no botão "+" com o texto "Adicionar Evento".</li>
                  <li>O modal "Adicionar Evento" será aberto.</li>
                  <li>Selecione uma data no calendário.</li>
                  <li>Preencha o "Título do Evento" e o "Local do Evento".</li>
                  <li>Clique em "Salvar Evento".</li>
              </ol>
              {/* [IMAGEM: Captura de tela do modal "AddEventModal" sendo preenchido] */}
              <Image src="/ajuda/modulos/cms-add-event.png" width={800} height={300} alt="Modal de adicionar evento" className="rounded-md my-2 shadow-sm" />
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-orange-600"/> Gerenciamento de Resoluções e Leis</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Permite publicar documentos oficiais do conselho, como resoluções, leis ou portarias.
              </p>
              <strong className="text-sm text-gray-800">Como Adicionar um Documento:</strong>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 mt-2">
                  <li>Na página do CMS, utilize a "FilterBar" para navegar até a seção correta (ex: Resoluções, Leis).</li>
                  <li>Clique no card pontilhado "+ Adicionar [Tipo]". (Ex: "+ Adicionar Lei").</li>
                  <li>O modal "Adicionar nova lei" (ou resolução) será aberto.</li>
                  <li>Digite o título do documento.</li>
                  <li>Clique em "Salvar". (Nota: A funcionalidade de upload do arquivo PDF/DOC será implementada futuramente; por enquanto, apenas o título é salvo).</li>
              </ol>
              {/* [IMAGEM: Captura de tela do grid de "Leis" ou "Resoluções", destacando o card de adicionar e o modal "AdicionarLeiModal"] */}
              <Image src="/ajuda/modulos/cms-add-lei.png" width={800} height={250} alt="Modal de adicionar lei/resolução" className="rounded-md my-2 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
);

// --- Adicionar mais componentes de conteúdo para outros módulos aqui (ex: GuiaAlertasContent) ---

// --- Fim dos Componentes de Conteúdo ---

// Mapeamento de Hrefs para Componentes
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/modulos/cms": GuiaCMSContent,
  // Adicionar outros mapeamentos aqui
};

// Mapeamento de Hrefs para Ícones
const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/modulos/cms": LayoutDashboard, // Ícone para o tópico "Guia: CMS"
  // Adicionar outros ícones aqui
};

// Tópicos desta seção
const topicos = [
  { titulo: "Guia: Conselho Municipal de Saúde (CMS)", href: "/ajuda/modulos/cms" },
  // Adicionar outros tópicos aqui
];

// --- Componente Principal da Página ---

export default function ModulosPage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || GuiaCMSContent; // Fallback para o primeiro
  const [searchValue, setSearchValue] = useState("");

  const handleTopicSelect = (href: string) => {
      setActiveTopicHref(href);
      setSearchValue(""); // Limpa busca ao selecionar
       window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                <span className="font-medium text-blue-900">Módulos Específicos</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="w-7 h-7 text-blue-700" /> {/* Ícone da Seção */}
                <h1 className="text-2xl font-bold text-blue-900">Módulos Específicos</h1>
              </div>
            </div>
            {/* Barra de Busca (Estilo "primeiros-passos") */}
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
      {/* Layout de espaçamento corrigido (baseado no seu snippet) */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        {/* Barra Lateral (Sidebar) */}
        <aside className="w-full md:w-64 flex-shrink-0 order-last md:order-first mr-3">
          <div className="sticky top-52">
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
                    onClick={() => { handleTopicSelect(topico.href); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
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

        {/* Conteúdo Principal (Direita) */}
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