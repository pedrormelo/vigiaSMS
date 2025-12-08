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
  const [userClosedDetail, setUserClosedDetail] = useState(false);

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
      setUserClosedDetail(false);
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
      setUserClosedDetail(false);
      return;
    }
    if (showSettingsPanel) return;
    if (userClosedDetail) return;

    const activeIsFilteredOut = activeNotification && !filteredNotifications.some(n => n.id === activeNotification.id);

    if (activeIsFilteredOut) {
      setActiveNotification(null);
    }
  }, [isOpen, filteredNotifications, activeNotification, showSettingsPanel, userClosedDetail]); 

  // --- Componentes de Estado ---
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4 md:p-8">
      <Inbox className="h-12 md:h-16 w-12 md:w-16 mb-3 md:mb-4 text-gray-300" />
      <h3 className="text-base md:text-lg font-semibold">Tudo em dia!</h3>
      <p className="text-xs md:text-sm mt-1">Você não tem nenhuma notificação nova.</p>
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
    <div className="flex items-center justify-center h-full px-4">
      <p className="text-red-500 text-sm md:text-base">Ocorreu um erro ao carregar as notificações.</p>
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
      <div className="flex flex-col md:flex-row flex-1 min-h-0 h-full relative">
        <div className="w-full md:w-[400px] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden flex flex-col max-h-none md:max-h-none">
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
        <div className="hidden md:flex flex-1 overflow-hidden flex-col">
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
        {/* Mobile: Mostra detalhes como overlay fullscreen */}
        {activeNotification && (
          <div className="absolute inset-0 md:hidden bg-white flex flex-col rounded-[30px] animate-in slide-in-from-bottom-80 duration-300 z-40 overflow-hidden pointer-events-auto">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0 z-50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUserClosedDetail(true);
                  setActiveNotification(null);
                }}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0 active:scale-95"
                type="button"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
              <span className="font-semibold text-base md:text-lg text-blue-700">Detalhes</span>
            </div>
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
        )}
        {/* Mobile: Mostra configurações como overlay fullscreen */}
        {showSettingsPanel && (
          <div className="absolute inset-0 md:hidden bg-white flex flex-col rounded-[30px] animate-in slide-in-from-bottom-80 duration-300 z-40 overflow-hidden pointer-events-auto">
            <NotificationSettingsView
              onClose={() => setShowSettingsPanel(false)}
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4" data-state={isOpen ? "open" : "closed"}>
      <div className={cn("bg-white rounded-[30px] md:rounded-[40px] w-full max-w-full md:max-w-6xl h-[95vh] md:h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in-0")}>
        <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-3 md:px-8 py-2 md:py-4 flex items-center justify-between rounded-t-[30px] md:rounded-t-[40px] flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 md:w-6 h-4 md:h-6 text-white" />
            </div>
            <h2 className="text-base md:text-2xl font-semibold text-white truncate">Central de Notificações</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="w-7 md:w-9 h-7 md:h-9 bg-white/15 text-white hover:bg-white/30 rounded-2xl flex-shrink-0">
            <ArrowLeft className="w-4 md:w-6 h-4 md:h-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
      <style>{`.scrollbar-custom::-webkit-scrollbar { width: 8px; } .scrollbar-custom::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #60a5fa, #2563eb); border-radius: 8px; } .scrollbar-custom::-webkit-scrollbar-track { background: transparent; } @keyframes slideInFromBottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .slide-in-from-bottom-80 { animation: slideInFromBottom 0.3s ease-out; }`}</style>
    </div>
  );
}