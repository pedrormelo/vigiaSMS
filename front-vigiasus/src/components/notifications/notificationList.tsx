// src/components/notifications/notificationList.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Notification } from "@/constants/types";
import NotificationItem from "@/components/notifications/notificationItem";
// IMPORTAR ÍCONES E UTILITÁRIOS
import { cn } from "@/lib/utils";
import { Inbox, CheckCircle, Settings, MessageCircleMore, Settings2 } from "lucide-react";

// EXPORTAR O TIPO DE FILTRO
export type ActiveFilter = "all" | "unread" | "system";

// ATUALIZAR AS PROPS
interface NotificationListProps {
  notifications: Notification[]; // Esta lista agora vem PRÉ-FILTRADA
  activeNotificationId: number | null;
  onSelectNotification: (id: number) => void;
  readNotifications: Set<number>;
  totalUnreadCount: number; // Contagem total (não filtrada)
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

// DEFINIR OS BOTÕES DE FILTRO
const filters: { id: ActiveFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "Não Lidas" },
  { id: "system", label: "Sistema" },
];

// CRIAR UM COMPONENTE PARA ESTADO VAZIO (quando o filtro não retorna nada)
const EmptyFilterState = ({ filter }: { filter: ActiveFilter }) => {
  const config = {
    all: {
      icon: <Inbox className="h-12 w-12 mb-4 text-gray-300" />,
      text: "Nenhuma notificação encontrada." // (Não deve acontecer se a lista principal já foi checada)
    },
    unread: {
      icon: <CheckCircle className="h-12 w-12 mb-4 text-green-300" />,
      text: "Nenhuma notificação não lida."
    },
    system: {
      icon: <Settings className="h-12 w-12 mb-4 text-blue-300" />,
      text: "Nenhuma notificação do sistema."
    }
  };
  const { icon, text } = config[filter];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
      {icon}
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};


export default function NotificationList({
  notifications, // Lista pré-filtrada
  activeNotificationId,
  onSelectNotification,
  readNotifications,
  totalUnreadCount, // 6. USAR A CONTAGEM TOTAL
  activeFilter,
  onFilterChange,
}: NotificationListProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [chatBgEnabled, setChatBgEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('notifications.useChatBg') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'notifications.useChatBg') {
        setChatBgEnabled(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleChatBg = (value?: boolean) => {
    const next = typeof value === 'boolean' ? value : !chatBgEnabled;
    setChatBgEnabled(next);
    try { localStorage.setItem('notifications.useChatBg', next ? 'true' : 'false'); } catch (e) { }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white shadow-sm">

      {/* Cabeçalho Fixo da Lista */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="inline-flex items-center gap-2 mb-1 text-blue-800">
          <h3 className="text-lg font-semibold text-blue-800">
            Caixa de Entrada
          </h3>
          {/* <MessageCircleMore className="h-5 w-5"/> */}

          {/* botão para configurações das notificações */}
          <button
            onClick={() => setShowSettings(prev => !prev)}
            aria-expanded={showSettings}
            className={cn(
              "rounded-full p-1 border border-gray-200 hover:bg-gray-100 transition-colors",
              showSettings ? "bg-gray-100" : ""
            )}
          >
            <Settings2 className="h-5 w-5"/>
          </button>
        </div>
        {/* usa o totalUnreadCount (vinda do modal) */}
        <p className="text-sm text-gray-600">
          {totalUnreadCount > 0
            ? `${totalUnreadCount} ${totalUnreadCount === 1 ? 'não lida' : 'não lidas'} no total`
            : 'Nenhuma notificação nova'}
        </p>

        {/*  NOTE: filters moved into settings panel. */}
        {showSettings && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Configurações</h4>
              <button onClick={() => setShowSettings(false)} className="text-sm text-gray-500">Fechar</button>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Filtros</p>
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-sm font-medium transition-colors",
                      activeFilter === filter.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Plano de Fundo do Chat</p>
                <p className="text-xs text-gray-500">Ativa o fundo personalizado para a área de comentários</p>
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={chatBgEnabled}
                    onChange={(e) => toggleChatBg(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LISTA COM SCROLL E LÓGICA DE ESTADO VAZIO */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-custom">
        {notifications.length > 0 ? (
          // Se houver itens no filtro, renderiza a lista
          <div className="flex flex-col gap-2 p-3">
            {notifications.map((notification) => {
              const isRead = readNotifications.has(notification.id);
              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isActive={notification.id === activeNotificationId}
                  onClick={() => onSelectNotification(notification.id)}
                  isRead={isRead}
                />
              );
            })}
          </div>
        ) : (
          // Se a lista filtrada estiver vazia, mostra o estado vazio
          <EmptyFilterState filter={activeFilter} />
        )}
      </div>
    </div>
  );
}