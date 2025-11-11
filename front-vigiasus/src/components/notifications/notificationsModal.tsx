// src/components/notifications/notificationsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Notification } from "@/constants/types";
import NotificationList, { type ActiveFilter } from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
// --- 1. IMPORTAR O NOVO PAINEL DE CONFIGURAÇÕES ---
import NotificationSettingsView from "./notificationSettingsView"; 
import { Button } from "@/components/ui/button";
import { Bell, Inbox, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Props (inalteradas)
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenContextoDetails: (notification: Notification) => void;
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  readNotifications: Set<number>;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationsModal({ 
  isOpen, onClose, onOpenContextoDetails,
  notifications, isLoading, isError,
  readNotifications, onMarkAsRead
}: Props) {
  
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  
  // --- 2. ADICIONAR ESTADO PARA O PAINEL DE CONFIGURAÇÕES ---
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Tenta ler o filtro salvo no localStorage ao iniciar
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(() => {
    try {
      const savedFilter = localStorage.getItem('notifications.activeFilter');
      if (savedFilter === 'unread' || savedFilter === 'system') {
        return savedFilter;
      }
      return 'all';
    } catch (e) {
      return 'all';
    }
  });

  // Lógica de filtro (inalterada)
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
    return notifications;
  }, [notifications, activeFilter, readNotifications]);


  // --- 3. ATUALIZAR HANDLER DE SELEÇÃO ---
  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
      setShowSettingsPanel(false); // <--- Esconde as configs ao selecionar notif
      if (!readNotifications.has(id)) {
        onMarkAsRead(id);
      }
    }
  };

  // --- 4. ADICIONAR HANDLER PARA O BOTÃO DE CONFIGS ---
  const handleToggleSettings = () => {
    setShowSettingsPanel(prev => {
      const isOpening = !prev;
      // Se estiver abrindo as configs, des-seleciona a notificação
      if (isOpening) {
        setActiveNotification(null);
      }
      return isOpening;
    });
  };

  // --- 5. ATUALIZAR FILTRO (passado para o SettingsView) ---
  const handleFilterChange = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    try {
      localStorage.setItem('notifications.activeFilter', filter);
    } catch(e) {}
  };


  // useEffect (inalterado, mas agora 'activeNotification' pode ser null
  // se as configs estiverem abertas)
  useEffect(() => {
    if (!isOpen) {
      setActiveNotification(null);
      setShowSettingsPanel(false); // <--- Reseta ao fechar o modal
      return;
    }

    // Se as configs estiverem abertas, não faz nada
    if (showSettingsPanel) return; 

    const activeIsFilteredOut = activeNotification && !filteredNotifications.some(n => n.id === activeNotification.id);

    if ((!activeNotification || activeIsFilteredOut) && filteredNotifications.length > 0) {
      const firstItem = filteredNotifications[0];
      setActiveNotification(firstItem); 
    } else if (filteredNotifications.length === 0) {
      setActiveNotification(null);
    }
  }, [isOpen, filteredNotifications, activeNotification, showSettingsPanel]); // <--- Adiciona showSettingsPanel


  // --- Componentes de Estado (EmptyState, LoadingState, ErrorState) (inalterados) ---
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


  // --- 6. ATUALIZAR RENDERCONTENT ---
  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (notifications.length === 0) return <EmptyState />;

     const isCurrentNotificationRead = activeNotification
      ? readNotifications.has(activeNotification.id)
      : false;

    return (
        <div className="flex flex-1 min-h-0 h-full">
            {/* Lista da Esquerda */}
            <div className="w-[400px] flex-shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
                <NotificationList
                    notifications={filteredNotifications}
                    // Se as configs estiverem ativas, NENHUMA notificação é "active"
                    activeNotificationId={showSettingsPanel ? null : activeNotification?.id || null}
                    onSelectNotification={handleSelectNotification}
                    readNotifications={readNotifications}
                    totalUnreadCount={totalUnreadCount}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange} // <--- Passa o handler de filtro
                    
                    // --- Passa as novas props ---
                    onToggleSettings={handleToggleSettings}
                    isSettingsActive={showSettingsPanel}
                />
            </div>
            
            {/* *** INÍCIO DA MODIFICAÇÃO PRINCIPAL ***
              O painel da direita agora renderiza OU as Configurações OU os Detalhes
            */}
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
            {/* *** FIM DA MODIFICAÇÃO PRINCIPAL *** */}
        </div>
    );
  };

  if (!isOpen) return null;

  // --- Estrutura do Modal (inalterada) ---
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
            
            {/* Cabeçalho (inalterado) */}
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
        
        {/* Estilos (inalterados) */}
        <style>{`
            .scrollbar-custom::-webkit-scrollbar { width: 8px; }
            .scrollbar-custom::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #60a5fa, #2563eb); border-radius: 8px; }
            .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
        `}</style>
    </div>
  );
}