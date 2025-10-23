// src/app/ajuda/primeiros-passos/page.tsx

import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, Navigation, Users, HelpCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button'; //
import { cn } from '@/lib/utils'; //

// Mapear ícones para os tópicos
const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/primeiros-passos/o-que-e": HelpCircle,
  "/ajuda/primeiros-passos/navbar": Navigation,
  "/ajuda/primeiros-passos/sidebar": LayoutDashboard,
  "/ajuda/primeiros-passos/perfis": Users,
};

const topicos = [
  // ... (definição dos tópicos)
  {
    titulo: "O que é o VigiaSUS?",
    href: "/ajuda/primeiros-passos/o-que-e",
    descricao: "Entenda o propósito e os objetivos da plataforma VigiaSUS."
  },
  {
    titulo: "Entendendo a Barra de Navegação Superior (Navbar)",
    href: "/ajuda/primeiros-passos/navbar",
    descricao: "Conheça os elementos da barra no topo da página: menu, logos, notificações e mais."
  },
  {
    titulo: "Navegando pelo Menu Lateral (Sidebar)",
    href: "/ajuda/primeiros-passos/sidebar",
    descricao: "Saiba como usar o menu lateral para acessar as diferentes seções do sistema."
  },
  {
    titulo: "Quais são os Perfis de Usuário?",
    href: "/ajuda/primeiros-passos/perfis",
    descricao: "Descubra as permissões e funcionalidades de cada tipo de usuário: Membro, Gerente, Diretor e Secretário."
  }
];

export default function PrimeirosPassosPage() {
  return (
    // Fundo geral da página, ocupa toda a altura e adiciona padding geral
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">

      {/* Container Centralizado com Largura Máxima Aumentada */}
      <div className="max-w-6xl mx-auto">

        {/* Bloco Branco Unificado para Cabeçalho e Conteúdo */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

          {/* Cabeçalho */}
          <div className="p-4 px-6 md:p-6 md:px-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Breadcrumb e Título da Área */}
              <div className='flex flex-col'>
                  <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                    <Link href="/ajuda" className="hover:text-blue-600 hover:underline">
                      Ajuda
                    </Link>
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    <span className="font-medium text-gray-700" aria-current="page">
                      Primeiros Passos
                    </span>
                  </nav>
                   <div className="flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      <h1 className="text-xl md:text-2xl font-semibold text-blue-700">
                        Primeiros Passos e Navegação
                      </h1>
                   </div>
              </div>
              {/* Botão Voltar */}
              <Link href="/ajuda">
                <Button variant="outline" size="sm" className="rounded-full bg-white shadow-sm flex-shrink-0 border-gray-300 hover:bg-gray-50"> {/* Estilo sutil */}
                   <ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar
                </Button>
              </Link>
            </div>
          </div>

          {/* Container Principal do Conteúdo */}
          <div className="p-6 md:p-8">

            {/* Descrição da Área */}
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-blue-800 text-sm">
               <p>
                 Bem-vindo(a) ao VigiaSUS! Comece por aqui para entender como o sistema funciona e como navegar por ele. Selecione um tópico abaixo:
               </p>
            </div>

            {/* Lista de Tópicos */}
            <div className="space-y-3">
              {topicos.map((topico, index) => {
                 const Icon = iconMap[topico.href] || ChevronRight;
                 const backgroundClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
                 return (
                    // *** MUDANÇAS AQUI ***
                    <Link
                      href={topico.href}
                      key={topico.titulo}
                      // REMOVIDO: legacyBehavior
                      // MOVIDAS classes da tag <a> para aqui
                      className={cn(
                        "block group transition-all duration-150 rounded-lg hover:shadow-sm hover:border-blue-200 border border-transparent",
                        backgroundClass
                      )}
                    >
                      {/* REMOVIDA a tag <a> */}
                      {/* O conteúdo agora é filho direto do Link */}
                      <div className="flex items-center p-3 sm:p-4">
                          <div className="mr-4 ml-1 flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                             <Icon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium text-gray-800 group-hover:text-blue-700 truncate" title={topico.titulo}>
                              {topico.titulo}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                              {topico.descricao}
                            </p>
                          </div>
                          <ChevronRight className="ml-4 w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                      {/* REMOVIDA a tag <a> */}
                    </Link>
                    // *** FIM DAS MUDANÇAS ***
                 )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}