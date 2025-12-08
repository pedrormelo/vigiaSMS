// src/components/notifications/NotificationSettingsView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, ArrowLeft } from "lucide-react";
import type { ActiveFilter } from "./notificationList";

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
  
  // AQUI: Adicionei a propriedade 'solid' para controlar o contraste de cada fundo
  const chatBackgrounds: { id: string; label: string; src?: string; type: 'gradient' | 'image' | 'none'; solid: boolean }[] = [
    { id: 'none', label: 'Sem fundo', type: 'none', solid: false },
    { id: 'gradient', label: 'Gradiente', type: 'gradient', solid: false },
    { id: 'bg-chat', label: 'Fundo 1', src: '/chat/bg-chat.png', type: 'image', solid: false },
    { id: 'bg-chat-2', label: 'Fundo 2', src: '/chat/bg-chat-2.png', type: 'image', solid: false },
    { id: 'bg-chat-3', label: 'Fundo 3', src: '/chat/bg-chat-3.png', type: 'image', solid: false },
    { id: 'bg-chat-4', label: 'Fundo 4', src: '/chat/bg-chat-4.png', type: 'image', solid: false },
    { id: 'bg-chat-5', label: 'Fundo 5', src: '/chat/bg-chat-5.png', type: 'image', solid: false },
    { id: 'bg-chat-6', label: 'Fundo 6', src: '/chat/bg-chat-6.png', type: 'image', solid: false },
    // Exemplo: Fundo 7 marcado como sólido (true)
    { id: 'bg-chat-7', label: 'Fundo 7', src: '/chat/bg-chat-7.png', type: 'image', solid: true },
  ];

  const [selectedBg, setSelectedBg] = useState<string>(() => {
    try {
      const existing = localStorage.getItem('notifications.chatBg');
      if (existing) return existing;
      const legacy = localStorage.getItem('notifications.useChatBg');
      const migrated = legacy === 'true' ? '/chat/bg-chat-3.png' : 'gradient';
      localStorage.setItem('notifications.chatBg', migrated);
      return migrated;
    } catch {
      return 'gradient';
    }
  });

  const handleSelectBackground = (bgId: string) => {
    setSelectedBg(bgId);
    try { localStorage.setItem('notifications.chatBg', bgId); } catch { /* noop */ }
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'notifications.chatBg' && e.newValue) {
        setSelectedBg(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleFilterClick = (filter: ActiveFilter) => {
    onFilterChange(filter);
    try { localStorage.setItem('notifications.activeFilter', filter); } catch { /* noop */ }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-0 flex-1">
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-base md:text-lg text-blue-700">Configurações</h3>
            <p className="text-xs md:text-sm text-gray-500">
              Ajuste filtros e o visual do chat
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 p-2 mr-2 rounded-full hover:bg-gray-100/50 hover:text-gray-300 transition-colors"
          >
            <X className="h-4 md:h-5 w-4 md:w-5" />
          </button>
        </div>
      </div>

      <div className="p-3 md:p-4 flex-1 overflow-auto scrollbar-custom space-y-4 md:space-y-6">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-700">Filtro Padrão</p>
          <p className="text-[11px] md:text-xs text-gray-500 mb-2">
            Selecione qual filtro aplicar ao abrir.
          </p>
          <div className="flex gap-2 mt-2">
            {(["all", "unread", "system"] as ActiveFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterClick(f)}
                className={cn(
                  "px-2 md:px-3 py-1 rounded-xl text-xs md:text-sm font-medium transition-colors",
                  activeFilter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {f === "all" ? "Todas" : f === "unread" ? "Não Lidas" : "Sistema"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Aparência do Chat</p>
          <p className="text-[11px] md:text-xs text-gray-500 mb-3">Escolha um fundo para a área de comentários.</p>
          <div role="radiogroup" className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {chatBackgrounds.map(bg => {
              const bgValue = bg.type === 'image' ? (bg.src as string) : bg.type;
              const isSelected = selectedBg === bgValue;
              
              return (
                <button
                  key={bg.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectBackground(bgValue)}
                  className={cn(
                    'group relative rounded-lg md:rounded-xl border text-[10px] md:text-xs font-medium overflow-hidden h-16 md:h-20 flex items-end justify-center p-1 transition-all',
                    isSelected ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-200 hover:border-gray-300'
                  )}
                  title={bg.label}
                >
                  {bg.type === 'image' ? (
                    <>
                      <div
                        className='absolute inset-0 bg-cover bg-center'
                        style={{ backgroundImage: `url(${bg.src})` }}
                        aria-hidden='true'
                      />
                      <div className='relative z-10 bg-black/30 backdrop-blur-[1px] w-full text-white text-[9px] md:text-[11px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-md mb-0.5 md:mb-1 group-hover:bg-black/40'>
                        {bg.label}
                      </div>
                    </>
                  ) : bg.type === 'gradient' ? (
                    <>
                      <div className='absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100' aria-hidden='true' />
                      <span className='relative z-10 text-gray-700 text-[9px] md:text-[11px] px-1.5 md:px-2 py-0.5 md:py-1 bg-white/70 backdrop-blur-sm rounded-md mb-0.5 md:mb-1'>Gradiente</span>
                    </>
                  ) : (
                    <>
                      <div className='absolute inset-0 bg-white' aria-hidden='true' />
                      <span className='relative z-10 text-gray-700 text-[9px] md:text-[11px] px-1.5 md:px-2 py-0.5 md:py-1 bg-white/90 backdrop-blur-sm rounded-md mb-0.5 md:mb-1'>Sem fundo</span>
                    </>
                  )}
                  {isSelected && (
                    <span className='absolute top-0.5 md:top-1 right-0.5 md:right-1 w-2.5 md:w-3 h-2.5 md:h-3 bg-blue-600 rounded-full shadow ring-2 ring-white' aria-label='Selecionado' />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}