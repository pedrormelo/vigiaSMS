// src/components/notifications/notificationsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/constants/types"; // Ajustado para usar types.ts

import NotificationList from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
import { Button } from "@/components/ui/button";
import { Bell, Inbox, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenContextoDetails: (notification: Notification) => void;
}

export default function NotificationsModal({ isOpen, onClose, onOpenContextoDetails }: Props) {
  const { notifications, isLoading, isError } = useNotifications();
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    // Mantém a lógica de selecionar a primeira não lida ou a primeira da lista ao abrir
    if (isOpen && notifications.length > 0 && !activeNotification) {
        const firstUnread = notifications.find(n => !readNotifications.has(n.id));
        setActiveNotification(firstUnread || notifications[0]);
    } else if (!isOpen) {
        // Limpa a notificação ativa ao fechar o modal
        setActiveNotification(null);
    }
  }, [isOpen, notifications, readNotifications]); // Reage à abertura/fechamento e mudanças

  // --- AJUSTE AQUI ---
  // Esta função agora APENAS define a notificação ativa para visualização interna
  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification); // Apenas atualiza o estado interno
      // Não chama mais onOpenContextoDetails aqui
    }
  };
  // --- FIM DO AJUSTE ---

  const handleMarkAsRead = (id: number) => {
    setReadNotifications((prevReadIds) => new Set(prevReadIds).add(id));
  };

  // --- Componentes de Estado (EmptyState, LoadingState, ErrorState) - permanecem iguais ---
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
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (notifications.length === 0) return <EmptyState />;

    // Não precisamos mais de 'notificationToShow', usamos diretamente 'activeNotification'
     const isCurrentNotificationRead = activeNotification
      ? readNotifications.has(activeNotification.id)
      : false;

    return (
        <div className="flex flex-1 min-h-0 h-full">
            <div className="w-[400px] flex-shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
                <NotificationList
                    notifications={notifications}
                    activeNotificationId={activeNotification?.id || null}
                    onSelectNotification={handleSelectNotification} // Continua passando esta
                    readNotifications={readNotifications}
                />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Passa a função onOpenContextoDetails do Navbar para o DetailView */}
                <NotificationDetailView
                    notification={activeNotification} // Passa a notificação ativa atual
                    isRead={isCurrentNotificationRead}
                    onMarkAsRead={handleMarkAsRead}
                    onOpenContexto={onOpenContextoDetails} // <-- Passando a função recebida do Navbar
                />
            </div>
        </div>
    );
  };

  if (!isOpen) return null;

  // --- Estrutura do Modal (mantida) ---
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className={cn(
            "bg-white rounded-[40px] w-full max-w-6xl h-[90vh]",
            "flex flex-col shadow-2xl overflow-hidden"
         )}>
            {/* Cabeçalho */}
             <div className="bg-gradient-to-r from-[#0037C1] to-[#00BDFF] px-8 py-4 flex items-center justify-between rounded-t-[40px] flex-shrink-0">
                {/* ... (código do cabeçalho) ... */}
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-regular text-white">
                        Central de Notificações
                    </h2>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 text-white hover:text-white/50 hover:bg-gray-100/50 rounded-full flex-shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>
            {/* Conteúdo */}
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
        </div>
        <style>{`
            /* ... (outros estilos) ... */
            @keyframes fadeIn {
                /* REMOVIDO: transform: scale(0.95); */
                from { opacity: 0; }
                /* REMOVIDO: transform: scale(1); */
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            .scrollbar-custom::-webkit-scrollbar { width: 8px; }
            .scrollbar-custom::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #60a5fa, #2563eb); border-radius: 8px; }
            .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-custom { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
        `}</style>
    </div>
  );
}