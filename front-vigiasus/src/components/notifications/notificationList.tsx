// src/components/notifications/notificationList.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Notification } from "@/constants/types";
import NotificationItem from "@/components/notifications/notificationItem";
import { cn } from "@/lib/utils";
import { Inbox, CheckCircle, Settings, Settings2 } from "lucide-react";

export type ActiveFilter = "all" | "unread" | "system";

interface NotificationListProps {
  notifications: Notification[];
  activeNotificationId: number | null;
  onSelectNotification: (id: number) => void;
  readNotifications: Set<number>;
  totalUnreadCount: number;
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
  
  // --- NOVAS PROPS ---
  onToggleSettings: () => void; // Função para chamar o modal pai
  isSettingsActive: boolean; // O modal pai informa se as configs estão ativas
  // --- FIM NOVAS PROPS ---
}

// ... (Componente EmptyFilterState inalterado) ...
const EmptyFilterState = ({ filter }: { filter: ActiveFilter }) => {
  const config = {
    all: { icon: <Inbox className="h-12 w-12 mb-4 text-gray-300" />, text: "Nenhuma notificação encontrada." },
    unread: { icon: <CheckCircle className="h-12 w-12 mb-4 text-green-300" />, text: "Nenhuma notificação não lida." },
    system: { icon: <Settings className="h-12 w-12 mb-4 text-blue-300" />, text: "Nenhuma notificação do sistema." }
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
  notifications,
  activeNotificationId,
  onSelectNotification,
  readNotifications,
  totalUnreadCount,
  activeFilter,
  onFilterChange,
  // --- RECEBE AS NOVAS PROPS ---
  onToggleSettings,
  isSettingsActive,
}: NotificationListProps) {

  // --- REMOVIDO ---
  // const [showSettings, setShowSettings] = useState(...);
  // const [chatBgEnabled, setChatBgEnabled] = useState(...);
  // useEffect para 'onStorage' (movido para o modal)
  // const toggleChatBg = (...)
  // const toggleSettings = (...)
  // --- FIM REMOVIDO ---

  // Ouve apenas a mudança de filtro vinda do localStorage (do painel de settings)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'notifications.activeFilter') {
        const v = e.newValue as ActiveFilter | null;
        if (v && v !== activeFilter) onFilterChange(v);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [activeFilter, onFilterChange]);


  return (
    <div className="flex flex-col h-full w-full bg-white shadow-sm">
      {/* Cabeçalho Fixo da Lista */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="inline-flex items-center gap-2 mb-1 text-blue-800">
          <h3 className="text-lg font-semibold text-blue-800">Caixa de Entrada</h3>
          <button
            onClick={onToggleSettings}
            aria-expanded={isSettingsActive}
            className={cn(
              "rounded-full p-1 border border-gray-200 hover:bg-gray-100 transition-colors",
              isSettingsActive ? "bg-gray-100" : ""
            )}
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {totalUnreadCount > 0
            ? `${totalUnreadCount} ${totalUnreadCount === 1 ? 'não lida' : 'não lidas'} no total`
            : 'Nenhuma notificação nova'}
        </p>
      </div>
      {/* Área de Scroll */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-custom">
        {notifications.length > 0 ? (
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
          <EmptyFilterState filter={activeFilter} />
        )}
      </div>
    </div>
  );
}