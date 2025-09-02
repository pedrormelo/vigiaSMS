// src/components/validar/filtroTabs.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; 

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
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
         
            variant="outline"

            className={cn(
              "rounded-full transition-all border-gray-300",
              isActive
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-white text-gray-600 hover:bg-gray-100" 
            )}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}