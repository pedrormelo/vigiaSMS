// src/components/notifications/notificationsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Notification } from "@/constants/types";
import NotificationList, { type ActiveFilter } from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
import NotificationSettingsView from "./notificationSettingsView";
import { Button } from "@/components/ui/button";
import { Bell, Inbox, ArrowLeft } from "lucide-react";
import SpinnerCarregamento from "@/components/ui/spinner-carregamento";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenContextoDetails: (notification: Notification) => void;
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  // CORREÇÃO: Agora tipado corretamente como number[]
  readNotifications: number[]; 
  onMarkAsRead: (id: number | "all") => void;
}

export default function NotificationsModal({
  isOpen, onClose, onOpenContextoDetails,
  notifications, isLoading, isError,
  readNotifications, onMarkAsRead
}: Props) {

  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(() => {
    try {
      const savedFilter = localStorage.getItem('notifications.activeFilter');
      if (savedFilter === 'unread' || savedFilter === 'system') {
        return savedFilter;
      }
      return 'all';
    } catch {
      return 'all';
    }
  });

  // Cria um Set para busca rápida (O(1))
  const readNotificationsSet = useMemo(() => {
    return new Set(readNotifications || []);
  }, [readNotifications]);

  const totalUnreadCount = useMemo(() => {
    return notifications.filter(n => !readNotificationsSet.has(n.id)).length;
  }, [notifications, readNotificationsSet]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter(n => !readNotificationsSet.has(n.id));
    }
    if (activeFilter === "system") {
      return notifications.filter(n => n.type === "sistema");
    }
    return notifications;
  }, [notifications, activeFilter, readNotificationsSet]);

  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
      setShowSettingsPanel(false); 
      
      // Se ainda não foi lida, marca agora
      if (!readNotificationsSet.has(id)) {
        onMarkAsRead(id);
      }
    }
  };

  const handleToggleSettings = () => {
    setShowSettingsPanel(prev => {
      const isOpening = !prev;
      if (isOpening) setActiveNotification(null);
      return isOpening;
    });
  };

  const handleFilterChange = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    try { localStorage.setItem('notifications.activeFilter', filter); } catch { /* noop */ }
  };

  useEffect(() => {
    if (!isOpen) {
      setActiveNotification(null);
      setShowSettingsPanel(false); 
      return;
    }
    if (showSettingsPanel) return;

    const activeIsFilteredOut = activeNotification && !filteredNotifications.some(n => n.id === activeNotification.id);

    if ((!activeNotification || activeIsFilteredOut) && filteredNotifications.length > 0) {
      setActiveNotification(filteredNotifications[0]);
    } else if (filteredNotifications.length === 0) {
      setActiveNotification(null);
    }
  }, [isOpen, filteredNotifications, activeNotification, showSettingsPanel]); 

  // --- Componentes de Estado ---
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
      <Inbox className="h-16 w-16 mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold">Tudo em dia!</h3>
      <p className="text-sm">Você não tem nenhuma notificação nova.</p>
    </div>
  );
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <SpinnerCarregamento
        mensagem="Carregando notificações..."
        tamanho="grande"
      />
    </div>
  );
  const ErrorState = () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-red-500">Ocorreu um erro ao carregar as notificações.</p>
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (notifications.length === 0) return <EmptyState />;

    const isCurrentNotificationRead = activeNotification
      ? readNotificationsSet.has(activeNotification.id)
      : false;

    return (
      <div className="flex flex-1 min-h-0 h-full">
        <div className="w-[400px] flex-shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
          <NotificationList
            notifications={filteredNotifications}
            activeNotificationId={showSettingsPanel ? null : activeNotification?.id || null}
            onSelectNotification={handleSelectNotification}
            readNotifications={readNotificationsSet} // Passa o Set<number>
            totalUnreadCount={totalUnreadCount}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onToggleSettings={handleToggleSettings}
            isSettingsActive={showSettingsPanel}
          />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {showSettingsPanel ? (
            <NotificationSettingsView
              onClose={() => setShowSettingsPanel(false)}
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
          ) : (
            <NotificationDetailView
              notification={activeNotification}
              isRead={isCurrentNotificationRead}
              onOpenContexto={onOpenContextoDetails}
            />
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-state={isOpen ? "open" : "closed"}>
      <div className={cn("bg-white rounded-[40px] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-0")}>
        <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Central de Notificações</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 rounded-2xl">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
      <style>{`.scrollbar-custom::-webkit-scrollbar { width: 8px; } .scrollbar-custom::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #60a5fa, #2563eb); border-radius: 8px; } .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }`}</style>
    </div>
  );
}