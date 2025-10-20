// src/components/dados-gerais/GerenciasFilterBar.tsx
"use client";

import React from "react";
import { Funnel, Check } from 'lucide-react';
import { SearchBar } from "../ui/search-bar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { diretoriasConfig } from "@/constants/diretorias"; // Importar a configuração
import { cn } from '@/lib/utils';

interface GerenciasFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedDiretorias: string[]; // IDs das diretorias selecionadas
  onSelectDiretoria: (diretoriaId: string) => void; // Função para (des)selecionar diretoria
  clearDiretoriaFilter: () => void; // Função para limpar o filtro
}

export default function GerenciasFilterBar({
  searchValue,
  onSearchChange,
  selectedDiretorias,
  onSelectDiretoria,
  clearDiretoriaFilter,
}: GerenciasFilterBarProps) {

  // Obter lista de diretorias (exceto 'secretaria') para o filtro
  const diretoriasParaFiltro = Object.values(diretoriasConfig).filter(
    (d) => d.id !== "secretaria"
  );

  return (
    <div className="mb-10 mt-10"> {/* Adicionado margem superior */}
      {/* Container Principal da Barra de Filtros */}
      <div className="flex items-center gap-4">

        {/* Barra de Pesquisa (Ocupa a maior parte do espaço) */}
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Pesquise pelo nome da Gerência..."
          />
        </div>

        {/* Popover para Filtro de Diretoria */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              // variant="outline" // REMOVER esta linha
              className={cn(
                // Estilos base copiados da página de gerência:
                "p-2 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white hover:text-blue-50 rounded-2xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                // Adicionar lógica para indicador de filtro ativo (mantida do código anterior):
                "relative" // Necessário para posicionar o indicador
              )}
              aria-label="Filtrar por Diretoria"
            >
              <Funnel className="h-5 w-5" />
              {/* Indicador de filtro ativo (mantido) */}
              {selectedDiretorias.length > 0 && (
                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" /> // Mudado para vermelho para mais destaque, como na navbar
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-white/90 backdrop-blur-md border-gray-200 shadow-xl rounded-2xl p-4" align="end">
            <div className="space-y-3">
              {/* Cabeçalho do Popover */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 leading-none">Filtrar por Diretoria</h4>
                {selectedDiretorias.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDiretoriaFilter}
                    className="h-auto px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    Limpar Filtro
                  </Button>
                )}
              </div>
              {/* Lista de Diretorias para Seleção */}
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {diretoriasParaFiltro.map((diretoria) => {
                  const isSelected = selectedDiretorias.includes(diretoria.id);
                  return (
                    <button
                      key={diretoria.id}
                      onClick={() => onSelectDiretoria(diretoria.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors text-left",
                        isSelected ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-gray-100 text-gray-700"
                      )}
                      style={{ borderLeft: `4px solid ${diretoria.cores.from}` }} // Adiciona a cor da diretoria
                    >
                      <span className="truncate pr-2">{diretoria.nome}</span>
                      {/* Ícone de Check */}
                      <div className={cn(
                        "w-4 h-4 flex items-center justify-center rounded-full border-2 flex-shrink-0",
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}