// src/components/notifications/NotificationSettingsView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
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
  
  // Opções de fundos disponíveis (gradient + imagens em public/chat)
  const chatBackgrounds: { id: string; label: string; src?: string; type: 'gradient' | 'image' | 'none' }[] = [
    { id: 'none', label: 'Sem fundo', type: 'none' },
    { id: 'gradient', label: 'Gradiente', type: 'gradient' },
    { id: 'bg-chat', label: 'Fundo 1', src: '/chat/bg-chat.png', type: 'image' },
    { id: 'bg-chat-2', label: 'Fundo 2', src: '/chat/bg-chat-2.png', type: 'image' },
    { id: 'bg-chat-3', label: 'Fundo 3', src: '/chat/bg-chat-3.png', type: 'image' },
  ];

  const [selectedBg, setSelectedBg] = useState<string>(() => {
    try {
      const existing = localStorage.getItem('notifications.chatBg');
      if (existing) return existing;
      // Migração de chave antiga
      const legacy = localStorage.getItem('notifications.useChatBg');
      const migrated = legacy === 'true' ? '/chat/bg-chat-3.png' : 'gradient';
      localStorage.setItem('notifications.chatBg', migrated);
      return migrated;
    } catch (e) {
      return 'gradient';
    }
  });

  const handleSelectBackground = (bgId: string) => {
    setSelectedBg(bgId);
    try { localStorage.setItem('notifications.chatBg', bgId); } catch (e) {}
  };

  // Sincroniza entre abas
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
            className="text-sm text-gray-400 p-2 mr-2 rounded-full hover:bg-gray-100/50 hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
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
          <p className="text-sm font-medium text-gray-700 mb-1">Aparência do Chat</p>
          <p className="text-xs text-gray-500 mb-3">Escolha um fundo para a área de comentários ou use o gradiente padrão.</p>
          <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {chatBackgrounds.map(bg => {
              const isSelected =
                (bg.type === 'image' && selectedBg === bg.src) ||
                (bg.type === 'gradient' && selectedBg === 'gradient') ||
                (bg.type === 'none' && selectedBg === 'none');
              return (
                <button
                  key={bg.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectBackground(
                    bg.type === 'image' ? (bg.src as string) : bg.type
                  )}
                  className={cn(
                    'group relative rounded-xl border text-xs font-medium overflow-hidden h-20 flex items-end justify-center p-1 transition-all',
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
                      <div className='relative z-10 bg-black/30 backdrop-blur-[1px] w-full text-white text-[11px] px-2 py-1 rounded-md mb-1 group-hover:bg-black/40'>
                        {bg.label}
                      </div>
                    </>
                  ) : bg.type === 'gradient' ? (
                    <>
                      <div className='absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100' aria-hidden='true' />
                      <span className='relative z-10 text-gray-700 text-[11px] px-2 py-1 bg-white/70 backdrop-blur-sm rounded-md mb-1'>Gradiente</span>
                    </>
                  ) : (
                    <>
                      <div className='absolute inset-0 bg-white' aria-hidden='true' />
                      <span className='relative z-10 text-gray-700 text-[11px] px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md mb-1'>Sem fundo</span>
                    </>
                  )}
                  {isSelected && (
                    <span className='absolute top-1 right-1 w-3 h-3 bg-blue-600 rounded-full shadow ring-2 ring-white' aria-label='Selecionado' />
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