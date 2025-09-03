// src/components/dados-gerais/GerenciasFilterBar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Funnel } from 'lucide-react';
import { SearchBar } from "../ui/search-bar";

type Tab = "diretoria" | "todas";

export default function GerenciasFilterBar() {
  const [activeTab, setActiveTab] = useState<Tab>("todas");
  
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string) => {
    console.log("Searching for:", value)
    // Add your search logic here
  }

  return (
    <div className="mb-4">
      {/* LINHA 1: Título e Barra de Pesquisa */}
      <div className="flex justify-between items-center mb-4">
        {/* Título */}
        <h2 className="text-3xl font-extralight text-[#1745FF]">Painel de Contextos</h2>

        <div className="flex-1 relative ml-6">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="Pesquise pelo nome do Contexto..."
          />
        </div>

        {/* Input de busca */}
        {/* <div className="flex-1 relative max-w-full ml-8">
          <input
            type="text"
            placeholder="Pesquise pelo nome da Gerência..."
            className="w-full ml-1.5 pl-10 pr-4 py-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
          />
          <Image
            src="/icons/lupa.svg"
            alt="Buscar"
            width={24}
            height={24}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div> */}
      </div>

      {/* LINHA 2: Filtros */}
      <div className="flex items-center gap-3">
        {/* Botão de filtro */}
        <button
          className="p-2 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white hover:text-blue-50 rounded-2xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Abrir filtros"
        >
          <Funnel className="h-5 w-5" />
        </button>

        {/* Botões de abas */}
        <button
          onClick={() => setActiveTab("diretoria")}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "diretoria"
            ? "bg-blue-600 hover:bg-blue-500 text-white" // Estilo ativo (exemplo)
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Recentes
        </button>
        <button
          onClick={() => setActiveTab("todas")}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "todas"
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Todas
        </button>
      </div>
    </div>
  );
}