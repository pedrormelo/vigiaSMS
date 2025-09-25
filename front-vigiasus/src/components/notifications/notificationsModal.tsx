"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/constants/notificationsData";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NotificationList from "@/components/notifications/notificationList";
import NotificationDetailView from "@/components/notifications/NotificationDetailView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Bell, Inbox, ArrowLeft } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: Props) {
  const { notifications, isLoading, isError } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (notifications.length > 0 && !activeNotification) {
      setActiveNotification(notifications[0]);
    }
  }, [notifications, activeNotification]);

  const handleSelectNotification = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      setActiveNotification(notification);
    }
  };

  const handleMarkAsRead = (id: number) => {

    setReadNotifications(prevReadIds => new Set(prevReadIds).add(id));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-500 p-8">
      <Inbox className="h-16 w-16 mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold">Tudo em dia!</h3>
      <p className="text-sm">Você não tem nenhuma notificação nova.</p>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      );
    }
    if (isError) {
      return (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-red-500">Ocorreu um erro ao carregar as notificações.</p>
        </div>
      );
    }
    if (notifications.length === 0) {
      return <EmptyState />;
    }

    const isCurrentNotificationRead = activeNotification
      ? readNotifications.has(activeNotification.id)
      : false;

    return (
      <div className="flex">
        <div className="flex-col items-center border-r border-gray-200 w-[400px] pt-2">
          <NotificationList
            notifications={notifications}
            activeNotificationId={activeNotification?.id || null}
            onSelectNotification={handleSelectNotification}
          />
        </div>
        
        <NotificationDetailView
          notification={activeNotification}
          isRead={isCurrentNotificationRead}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 border-none bg-transparent shadow-none">
        <div className="rounded-3xl shadow-2xl bg-white overflow-hidden">
          <DialogHeader className="p-6 flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <DialogTitle className="text-2xl font-semibold mt-2 text-blue-600">Notificações</DialogTitle>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <ArrowLeft className="h-20 w-20 text-blue-600 hover:text-color-700" />
            </Button>
          </DialogHeader>
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}