// src/app/ajuda/page.tsx

"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { BookOpen, FilePlus, Eye, CheckCheck, Settings, LifeBuoy } from 'lucide-react';
import { ajudaSearchIndex } from '@/constants/ajudaSearchIndex';
import { buildHelpSearchTokens, normalizeHelpSearchText } from '@/lib/ajudaSearch';

interface AjudaArea {
  id: string;
  nome: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

// Definir as áreas com ícones
const areas: AjudaArea[] = [
  { id: "primeiros-passos", nome: "Primeiros Passos", href: "/ajuda/primeiros-passos", icon: BookOpen, description: "Introdução e navegação básica." },
  { id: "gerenciando-conteudo", nome: "Adicionando Conteúdo", href: "/ajuda/gerenciando-conteudo", icon: FilePlus, description: "Como criar arquivos, gráficos e indicadores." },
  { id: "visualizando-dados", nome: "Visualizando Dados", href: "/ajuda/visualizando-dados", icon: Eye, description: "Explore dados gerais, gerências e dashboards." },
  { id: "validacao", nome: "Validação e Colaboração", href: "/ajuda/validacao", icon: CheckCheck, description: "Entenda o fluxo de aprovação e notificações." },
  { id: "modulos", nome: "Módulos Específicos", href: "/ajuda/modulos", icon: Settings, description: "Guias para seções como o CMS." },
  { id: "suporte", nome: "Suporte", href: "/ajuda/suporte", icon: LifeBuoy, description: "Como entrar em contato." },
];

const areasById: Record<string, AjudaArea> = areas.reduce((acc, area) => {
  acc[area.id] = area;
  return acc;
}, {} as Record<string, AjudaArea>);

type SearchResult = {
  areaId: string;
  areaName: string;
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
};

export default function PaginaAjudaPrincipal() {
  const [searchValue, setSearchValue] = useState(""); // Estado para a busca

  const searchTokens = useMemo(() => buildHelpSearchTokens(searchValue), [searchValue]);

  const searchResults = useMemo(() => {
    if (searchTokens.length === 0) return [] as SearchResult[];

    return ajudaSearchIndex
      .map<SearchResult | null>(entry => {
        const area = areasById[entry.areaId];
        const haystack = normalizeHelpSearchText(
          `${entry.title} ${entry.summary} ${(entry.keywords ?? []).join(' ')} ${area?.nome ?? ''} ${area?.description ?? ''}`
        );
        const matches = searchTokens.every(token => haystack.includes(token));
        if (!matches) return null;
        const segments = entry.href.split('/').filter(Boolean);
        let destination = entry.href;
        if (segments.length >= 3 && segments[0] === 'ajuda') {
          const areaPath = segments.slice(0, 2).join('/');
          const topicPath = segments.slice(2).join('/');
          destination = `/${areaPath}?topic=${topicPath}`;
        }
        return {
          areaId: entry.areaId,
          areaName: area?.nome ?? 'Ajuda',
          title: entry.title,
          summary: entry.summary,
          href: destination,
          icon: area?.icon ?? BookOpen,
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .slice(0, 12);
  }, [searchTokens]);

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

          {searchTokens.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Resultados da busca</h2>
              {searchResults.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {searchResults.map(result => {
                    const Icon = result.icon;
                    return (
                      <Link
                        key={`${result.areaName}-${result.title}`}
                        href={result.href}
                        className="block rounded-2xl border border-gray-200 bg-white/90 p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold uppercase text-blue-600">{result.areaName}</div>
                            <div className="mt-1 text-base font-semibold text-gray-900">{result.title}</div>
                            <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Nenhum tópico encontrado. Tente palavras-chave diferentes.</p>
              )}
            </div>
          )}
        </div>

        {/* Grid de Áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <Link href={area.href} key={area.id} legacyBehavior>
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