"use client";

import { useState } from "react";
import { notificationsData, Notification } from "@/constants/notificationsData";
import NotificationList from "@/components/notifications/notificationList";
import CommentSection from "@/components/notifications//commentSection";

export default function NotificationsPage() {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(
    notificationsData[0] || null // Seta a segunda notificação como a inicial para mostrar os comentários
  );

  const handleSelectNotification = (id: number) => {
    const notification = notificationsData.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl flex border border-gray-200">
        {/* Lista de Notificações */}
        <NotificationList
          notifications={notificationsData}
          activeNotificationId={activeNotification?.id || null}
          onSelectNotification={handleSelectNotification}
        />

        {/* Seção de Comentários */}
        <CommentSection notification={activeNotification} />
      </div>
    </div>
  );
}