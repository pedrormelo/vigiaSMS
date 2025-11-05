// src/components/gerencia/painel-filterBar.tsx
"use client";
import { Funnel, Check, FileQuestion } from 'lucide-react';
import Image from 'next/image';
import { SearchBar } from "../ui/search-bar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { fileTypeConfig, FileType } from '@/components/contextosCard/contextoCard';
import { cn } from '@/lib/utils';

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

// Mapeamento de ícones (Baseado em NotificationItem)
const filterIconMap: Record<FileType, string | React.ElementType | null> = {
  doc: "/icons/CONTEXTOS/DOC.svg",
  excel: "/icons/CONTEXTOS/PLA.svg",
  pdf: "/icons/CONTEXTOS/PDF.svg",
  //comentario: "/icons/comentario-icon.svg",
  //sistema: "/icons/system.svg",
  dashboard: "/icons/CONTEXTOS/GRA.svg",
  link: "/icons/CONTEXTOS/LINK.svg",
  resolucao: "/icons/CONTEXTOS/RES.svg",
  //indicador: "/icons/CONTEXTOS/INDIC.svg",
  apresentacao: "/icons/CONTEXTOS/PPTX.svg",
 // leis: fileTypeConfig.leis.icon,
};

export default function GerenciasFilterBar({
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedTypes,
  onSelectedTypesChange,
  clearTypeFilter,
}: GerenciasFilterBarProps) {

   const filterableTypes = Object.keys(filterIconMap).filter(
        type => filterIconMap[type as FileType] !== null
    ) as FileType[];

  return (
    <div className="mb-6">
      {/* LINHA 1 */}
      <div className="flex items-center mb-4">
        <h2 className="text-3xl font-extralight text-[#1745FF]">Painel de Contextos</h2>
        <div className="flex-1 relative ml-6 max-w-[75%]">
          <SearchBar value={searchValue} onChange={onSearchChange} placeholder="Pesquise pelo nome do Contexto..." />
        </div>
      </div>

      {/* LINHA 2 */}
      <div className="flex items-center gap-3">
        {/* Popover */}
        <Popover>
          <PopoverTrigger asChild>
        {/* Botão de filtro */}
        <Button
          className="h-10 p-2 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white hover:text-blue-50 rounded-2xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200"
          aria-label="Abrir filtros"
        >
          <Funnel className="!h-5 !w-5" />
        </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-white/80 backdrop-blur-md border-gray-200 shadow-xl rounded-2xl" align="start">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 leading-none">Filtrar por Tipo</h4>
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearTypeFilter} className="h-auto px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 font-semibold">Limpar</Button>
                )}
              </div>
              <div className="space-y-1">
                {filterableTypes.map((type) => {
                  // --- CORREÇÃO AQUI ---
                  // Obter config PRIMEIRO e verificar se existe
                  const config = fileTypeConfig[type];
                  if (!config) {
                      console.error(`Configuração não encontrada para o tipo: ${type}`);
                      return null; // Pula a renderização deste item se a config não existir
                  }
                  // --- FIM DA CORREÇÃO ---

                  const iconSource = filterIconMap[type];
                  const isSelected = selectedTypes.includes(type);

                  let IconComponent: React.ReactNode = null;
                  if (typeof iconSource === 'string') {
                      // Usa config.label (agora sabemos que config existe)
                      IconComponent = <Image src={iconSource} alt={config.label} width={16} height={16} className="w-4 h-4 flex-shrink-0" />;
                  } else if (iconSource) {
                      const LucideIcon = iconSource as React.ElementType;
                      IconComponent = <LucideIcon className="w-4 h-4 flex-shrink-0 text-gray-600" />;
                  } else {
                      IconComponent = <FileQuestion className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  }

                  return (
                    <button
                      key={type}
                      onClick={() => onSelectedTypesChange(type)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                        isSelected ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {IconComponent}
                        {/* Usa config.label */}
                        <span>{config.label}</span>
                      </div>
                      <div className={cn("w-4 h-4 flex items-center justify-center rounded-full border-2", isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300')}>
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
        <button onClick={() => onTabChange("recente")} className={cn( "px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm", activeTab === "recente" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50" )}>Recentes</button>
        <button onClick={() => onTabChange("todas")} className={cn( "px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm", activeTab === "todas" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50" )}>Todas</button>
      </div>
    </div>
  );
}