// src/components/notifications/NotificationSettingsView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ActiveFilter } from "./notificationList";

// Props que o painel de configurações precisa
interface NotificationSettingsProps {
  onClose: () => void;
  onFilterChange: (filter: ActiveFilter) => void;
  activeFilter: ActiveFilter;
}

export default function NotificationSettingsView({
  onClose,
  onFilterChange,
  activeFilter,
}: NotificationSettingsProps) {
  
  // O estado do "fundo do chat" ainda pode ser local
  // e controlado por localStorage, pois afeta apenas o DetailView.
  const [useChatBg, setUseChatBg] = useState<boolean>(() => {
    try {
      return localStorage.getItem("notifications.useChatBg") === "true";
    } catch (e) {
      return false;
    }
  });

  const handleToggleChatBg = (next: boolean) => {
    setUseChatBg(next);
    try {
      localStorage.setItem("notifications.useChatBg", next ? "true" : "false");
    } catch (err) {}
  };

  const handleFilterClick = (filter: ActiveFilter) => {
    onFilterChange(filter);
    // (Opcional) Salvar no localStorage para persistir a seleção
    try { localStorage.setItem('notifications.activeFilter', filter); } catch (e) {}
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-semibold text-lg text-blue-700">Configurações</h3>
          <p className="text-sm text-gray-500">
            Ajuste filtros e o visual do chat
          </p>
        </div>
        <div>
          <button
            onClick={onClose}
            className="text-sm text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Fechar
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto scrollbar-custom space-y-6">
        {/* Seção de Filtros */}
        <div>
          <p className="text-sm font-medium text-gray-700">Filtro Padrão</p>
          <p className="text-xs text-gray-500 mb-2">
            Selecione qual filtro aplicar ao abrir.
          </p>
          <div className="flex gap-2 mt-2">
            {(["all", "unread", "system"] as ActiveFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterClick(f)}
                className={cn(
                  "px-3 py-1 rounded-xl text-sm font-medium transition-colors",
                  activeFilter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {f === "all"
                  ? "Todas"
                  : f === "unread"
                  ? "Não Lidas"
                  : "Sistema"}
              </button>
            ))}
          </div>
        </div>

        {/* Seção de Aparência */}
        <div>
          <p className="text-sm font-medium text-gray-700">Aparência do Chat</p>
          <p className="text-xs text-gray-500 mb-2">
            Ativar o fundo personalizado para a área de comentários.
          </p>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useChatBg}
                onChange={(e) => handleToggleChatBg(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Usar fundo personalizado
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}