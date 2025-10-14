"use client";

import { useState } from "react";
import { Funnel } from 'lucide-react';
import { SearchBar } from "../ui/search-bar";
import { GraphCard } from "./graficoCard";
import type { GraphData } from "./dasboard-preview";
import { Button } from "@/components/ui/button";

interface AvailableGraphsPanelProps {
  graphs: GraphData[];
  onGraphSelect: (graph: GraphData) => void;
}

type Tab = "recente" | "todas";

export function AvailableGraphsPanel({ graphs, onGraphSelect }: AvailableGraphsPanelProps) {
  const [tab, setTab] = useState<"all" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("todas");

  const filteredGraphs = graphs.filter((graph) => {
    const matchesSearch =
      graph.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      graph.gerencia.toLowerCase().includes(searchQuery.toLowerCase());

    if (tab === "recent") {
      const graphDate = new Date(graph.insertedDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && graphDate >= sevenDaysAgo;
    }
    return matchesSearch;
  });

  return (
    <div className="">
      {/* Título e Barra de Pesquisa */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-extralight text-[#1745FF]">Gráficos Disponíveis</h2>
        <div className="flex-1 relative ml-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
            placeholder="Pesquise pelo nome do Contexto ou Gerência..."
          />
        </div>
      </div>

      {/* Filtros e Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <button
          className="p-2 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white hover:text-blue-50 rounded-2xl shadow-sm cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Abrir filtros"
        >
          <Funnel className="h-5 w-5" />
        </button>
        <Button
          variant={tab === "recent" ? "default" : "ghost"}
          onClick={() => { setTab("recent"); setActiveTab("recente"); }}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "recente"
            ? "bg-blue-600 hover:bg-blue-500 text-white" // Estilo ativo (exemplo)
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Recentes
        </Button>
        <Button
          variant={tab === "all" ? "default" : "ghost"}
          onClick={() => { setTab("all"); setActiveTab("todas"); }}
          className={`px-6 py-2 cursor-pointer rounded-full font-medium transition shadow-sm ${activeTab === "todas"
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Todas
        </Button>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid p-6 grid-cols-1 md:grid-cols-4 gap-6 max-h-[410px] overflow-y-auto">
        {filteredGraphs.map((graph) => (
          <GraphCard
            key={graph.id}
            id={graph.id}
            title={graph.title}
            type={graph.type}
            gerencia={graph.gerencia}
            insertedDate={graph.insertedDate}
            onClick={() => onGraphSelect(graph)}
          />
        ))}
      </div>
    </div>
  );
}