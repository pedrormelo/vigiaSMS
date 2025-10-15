// src/components/gerencia/painel-filterBar.tsx
"use client";

import { Funnel, Check } from 'lucide-react';
import { SearchBar } from "../ui/search-bar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { fileTypeConfig, FileType } from '@/components/contextosCard/contextoCard';
import { Badge } from '@/components/ui/badge';

type Tab = "recente" | "todas";

interface GerenciasFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  selectedTypes: FileType[];
  onSelectedTypesChange: (type: FileType) => void;
  clearTypeFilter: () => void;
}

export default function GerenciasFilterBar({
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedTypes,
  onSelectedTypesChange,
  clearTypeFilter,
}: GerenciasFilterBarProps) {

  const filterableTypes = Object.keys(fileTypeConfig).filter(
    type => type !== 'indicador' && type !== 'leis'
  ) as FileType[];

  return (
    <div className="mb-6">
      {/* LINHA 1: Título e Barra de Pesquisa */}
      <div className="flex items-center mb-4">
        <h2 className="text-3xl font-extralight text-[#1745FF]">Painel de Contextos</h2>
        <div className="flex-1 relative ml-6 max-w-[75%]">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Pesquise pelo nome do Contexto..."
          />
        </div>
      </div>

      {/* LINHA 2: Filtros */}
      <div className="flex items-center gap-3">
        {/* Popover para o filtro de tipo de arquivo com o ícone original */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-sm relative transition-all"
            >
              <Funnel className="h-5 w-5" />
              {selectedTypes.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-yellow-400 text-blue-900 font-bold">
                  {selectedTypes.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 bg-white/80 backdrop-blur-md border-gray-200 shadow-xl rounded-2xl" 
            align="start"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 leading-none">Filtrar por Tipo</h4>
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearTypeFilter} className="h-auto px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 font-semibold">
                    Limpar
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {filterableTypes.map((type) => {
                  const config = fileTypeConfig[type];
                  const Icon = config.icon;
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => onSelectedTypesChange(type)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-100 text-blue-800 font-semibold"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </div>
                      <div className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Botões de abas */}
        <button
          onClick={() => onTabChange("recente")}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "recente" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          Recentes
        </button>
        <button
          onClick={() => onTabChange("todas")}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "todas" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          Todas
        </button>
      </div>
    </div>
  );
}