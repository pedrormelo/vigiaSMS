// src/components/notifications/notificationsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
// NÃO VAI USAR o 'useNotifications' aqui
import { Notification } from "@/constants/types";

import NotificationList, { type ActiveFilter } from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
import { Button } from "@/components/ui/button";
import { Bell, Inbox, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// As props agora vêm do navbar.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenContextoDetails: (notification: Notification) => void;
  
  // Props que são passadas pelo navbar
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  readNotifications: Set<number>;
  onMarkAsRead: (id: number) => void; // A função de marcar como lido
}

export default function NotificationsModal({ 
  isOpen, 
  onClose, 
  onOpenContextoDetails,
  //  Receber as props
  notifications,
  isLoading,
  isError,
  readNotifications,
  onMarkAsRead
}: Props) {
  
  //  Estados locais (apenas para a UI do modal)
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  // Lógica de filtro (usa as props 'notifications' e 'readNotifications')
  const totalUnreadCount = useMemo(() => {
    return notifications.filter(n => !readNotifications.has(n.id)).length;
  }, [notifications, readNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter(n => !readNotifications.has(n.id));
    }
    if (activeFilter === "system") {
      return notifications.filter(n => n.type === "sistema");
    }
    return notifications; // Filtro "all"
  }, [notifications, activeFilter, readNotifications]);


  // 6. Handler de seleção (USA A PROP 'onMarkAsRead')
  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
      // Regra de negócio: SÓ marca como lido ao CLICAR
      if (!readNotifications.has(id)) {
        onMarkAsRead(id); // <--- CHAMA A FUNÇÃO DO NAVBAR
      }
    }
  };

  // useEffect (para selecionar o primeiro item da lista filtrada)
  useEffect(() => {
    if (!isOpen) {
      setActiveNotification(null);
      return;
    }

    const activeIsFilteredOut = activeNotification && !filteredNotifications.some(n => n.id === activeNotification.id);

    if ((!activeNotification || activeIsFilteredOut) && filteredNotifications.length > 0) {
      const firstItem = filteredNotifications[0];
      setActiveNotification(firstItem); 
    } else if (filteredNotifications.length === 0) {
      setActiveNotification(null);
    }
  }, [isOpen, filteredNotifications, activeNotification]);


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
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-3 text-sm font-medium text-gray-700">
        Carregando notificações...
      </p>
    </div>
  );
  const ErrorState = () => (
     <div className="flex items-center justify-center h-full">
        <p className="text-red-500">
            Ocorreu um erro ao carregar as notificações.
        </p>
     </div>
  );

  // --- Renderização do Conteúdo Principal ---
  const renderContent = () => {
    // Usa 'isLoading' e 'isError' vindos das props
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    
    // Usa 'notifications' vindo das props
    if (notifications.length === 0) return <EmptyState />;

     const isCurrentNotificationRead = activeNotification
      ? readNotifications.has(activeNotification.id) // Usa 'readNotifications' das props
      : false;

    return (
        <div className="flex flex-1 min-h-0 h-full">
            {/* Lista da Esquerda */}
            <div className="w-[400px] flex-shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
                <NotificationList
                    notifications={filteredNotifications} // Lista filtrada
                    activeNotificationId={activeNotification?.id || null}
                    onSelectNotification={handleSelectNotification} // Handler atualizado
                    readNotifications={readNotifications} // 'readNotifications' das props
                    totalUnreadCount={totalUnreadCount} // Contagem local baseada nas props
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </div>
            {/* Detalhe da Direita */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <NotificationDetailView
                    notification={activeNotification}
                    isRead={isCurrentNotificationRead}
                    onOpenContexto={onOpenContextoDetails}
                    // A prop 'onMarkAsRead' foi removida daqui,
                    // pois só o clique na lista (handleSelectNotification) é que marca como lido.
                />
            </div>
        </div>
    );
  };

  if (!isOpen) return null;

  // --- Estrutura do Modal ---
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      data-state={isOpen ? "open" : "closed"}
    >
        <div className={cn(
            "bg-white rounded-[40px] w-full max-w-6xl h-[90vh]",
            "flex flex-col shadow-2xl overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
         )}>
            
            {/* Cabeçalho */}
             <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                        Central de Notificações
                    </h2>
                </div>
                <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={onClose} 
                    className="w-9 h-9 bg-white/15 text-white hover:bg-white/30 hover:text-white/50 rounded-2xl flex-shrink-0"
                > 
                    <ArrowLeft className="w-6 h-6" /> 
                </Button>
            </div>
            
            {/* Conteúdo */}
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
        </div>
        
        {/* Estilos */}
        <style>{`
            .scrollbar-custom::-webkit-scrollbar { width: 8px; }
            .scrollbar-custom::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #60a5fa, #2563eb); border-radius: 8px; }
            .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
        `}</style>
    </div>
  );
}