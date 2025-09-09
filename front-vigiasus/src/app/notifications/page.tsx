"use client";

import { useState, useEffect } from "react";
import { notificationsData, Notification } from "@/constants/notificationsData";
import NotificationList from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NotificationsPage() {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(
    null
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      try {
        setNotifications(notificationsData);
        setIsLoading(false);
        if (notificationsData.length > 0) {
          setActiveNotification(notificationsData[0]);
        }
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
        console.error("Erro ao carregar notificações: ", error);
      }
    }, 1500);
  }, []);

  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-red-500">Ocorreu um erro ao carregar as notificações.</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* DOCUMENTAÇÃO DA MUDANÇA:
        - A classe 'min-h-[80vh]' foi REMOVIDA.
        - Ao remover esta classe, o container não força mais uma altura mínima.
        - Agora, a altura do container se ajustará automaticamente ao tamanho do conteúdo
          (a lista de notificações e os detalhes da notificação).
        - A largura máxima ('max-w-7xl') foi mantida, conforme o seu pedido.
      */}
      <div className="max-w-7xl mx-auto rounded-2xl shadow-xl flex border border-gray-200 bg-white">
        <NotificationList
          notifications={notifications}
          activeNotificationId={activeNotification?.id || null}
          onSelectNotification={handleSelectNotification}
        />
        <NotificationDetailView notification={activeNotification} />
      </div>
    </div>
  );
}