// src/app/ajuda/page.tsx

"use client"; // <--- ADICIONE ESTA LINHA

import Link from 'next/link';
import { useState } from 'react'; // <--- ADICIONE ESTA LINHA
import { SearchBar } from '@/components/ui/search-bar';
import { BookOpen, FilePlus, Eye, CheckCheck, Settings, LifeBuoy } from 'lucide-react';

// Definir as áreas com ícones
const areas = [
  { nome: "Primeiros Passos", href: "/ajuda/primeiros-passos", icon: BookOpen, description: "Introdução e navegação básica." },
  { nome: "Adicionando Conteúdo", href: "/ajuda/gerenciando-conteudo", icon: FilePlus, description: "Como criar arquivos, gráficos e indicadores." },
  { nome: "Visualizando Dados", href: "/ajuda/visualizando-dados", icon: Eye, description: "Explore dados gerais, gerências e dashboards." },
  { nome: "Validação e Colaboração", href: "/ajuda/validacao", icon: CheckCheck, description: "Entenda o fluxo de aprovação e notificações." },
  { nome: "Módulos Específicos", href: "/ajuda/modulos", icon: Settings, description: "Guias para seções como o CMS." },
  { nome: "Suporte", href: "/ajuda/suporte", icon: LifeBuoy, description: "Como entrar em contato." },
];

export default function PaginaAjudaPrincipal() {
  const [searchValue, setSearchValue] = useState(""); // Estado para a busca

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">
          Central de Ajuda VigiaSUS
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Encontre respostas e guias sobre como usar a plataforma.
        </p>

        {/* Barra de Busca */}
        <div className="mb-12 max-w-2xl mx-auto">
          <SearchBar
            placeholder="Buscar tópicos na Central de Ajuda..."
            value={searchValue}
            onChange={setSearchValue}
            // onSearch={handleSearch} // Implementar busca client-side se desejado
          />
        </div>

        {/* Grid de Áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <Link href={area.href} key={area.nome} legacyBehavior>
              <a className="block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                    <area.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-blue-700">
                    {area.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {area.description}
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}