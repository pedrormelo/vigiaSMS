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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-light text-blue-700">Gráficos disponíveis</h2>
          <p className="text-xs md:text-sm text-slate-500">Selecione dashboards publicados para preencher os slots do layout.</p>
        </div>
        <div className="w-full md:max-w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
            placeholder="Pesquisar por título ou gerência"
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-3">
        <button
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-sm transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Abrir filtros"
        >
          <Funnel className="h-5 w-5" />
        </button>
        <Button
          variant={tab === "recent" ? "default" : "ghost"}
          onClick={() => { setTab("recent"); setActiveTab("recente"); }}
          className={`px-6 py-2 rounded-full font-medium transition shadow-sm ${activeTab === "recente"
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Recentes
        </Button>
        <Button
          variant={tab === "all" ? "default" : "ghost"}
          onClick={() => { setTab("all"); setActiveTab("todas"); }}
          className={`px-6 py-2 rounded-full font-medium transition shadow-sm ${activeTab === "todas"
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
        >
          Todas
        </Button>
      </div> */}

      <div className="grid max-h-[60vh] gap-3 md:gap-5 overflow-y-auto pr-1 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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