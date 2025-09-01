// src/components/validar/filtroTabs.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Define os tipos para as abas, para um controle mais estrito
type FilterOption = "recentes" | "analise" | "deferidos" | "indeferidos";

export default function FilterTabs() {
  const [activeTab, setActiveTab] = useState<FilterOption>("analise");

  const tabs: { id: FilterOption; label: string }[] = [
    { id: "recentes", label: "Mais Recentes" },
    { id: "analise", label: "Em Análise" },
    { id: "deferidos", label: "Deferidos" },
    { id: "indeferidos", label: "Indeferidos" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          // A variante do botão muda dinamicamente com base na aba ativa
          variant={activeTab === tab.id ? "default" : "outline"}
          className="rounded-full bg-white transition-all"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}