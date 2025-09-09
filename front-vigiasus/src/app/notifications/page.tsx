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
    <div className="p-8 bg-gradient-to-r from-[#fdfdfd] to-[#f6f8ff] min-h-screen">
      <div className="max-w-7xl mx-auto rounded-3xl shadow-xl flex border border-gray-200 bg-white">
        <div className="flex-col items-center border-r border-gray-200 max-h-[80vh]">
          <h2 className="text-2xl text-left ml-6 pt-4 font-semibold text-blue-600 mb-3">Notificações</h2>
          <NotificationList
            notifications={notifications}
            activeNotificationId={activeNotification?.id || null}
            onSelectNotification={handleSelectNotification}
          />
        </div>
        <NotificationDetailView notification={activeNotification} />
      </div>
    </div>
  );
}