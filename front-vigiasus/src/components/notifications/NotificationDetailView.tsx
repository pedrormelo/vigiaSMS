"use client";

import { Notification } from "@/constants/notificationsData";
import SystemUpdateView from "@/components/systemUpdate/systemUpdateNotification";
import CommentSection from "@/components/notifications/commentSection";
import DocumentView from "@/components/notifications/DocumentView";

interface Props {
  notification: Notification | null;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationDetailView({ notification, isRead, onMarkAsRead }: Props) {
  if (!notification) {
    return (
      <div className="flex-1 bg-white p-6 flex items-center justify-center rounded-r-3xl shadow-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          Selecione uma notificação para ver os detalhes.
        </p>
      </div>
    );
  }

  let viewComponent;
  if (notification.status === 'indeferido') {

    viewComponent = <CommentSection notification={notification} isRead={isRead} onMarkAsRead={onMarkAsRead} />;
  } else if (notification.type === 'sistema') {
    viewComponent = <SystemUpdateView notification={notification} />;
  } else {
    viewComponent = <DocumentView notification={notification} />;
  }

  return (
    <div className="flex-1 flex flex-col shadow-lg border border-gray-200 rounded-r-3xl bg-white">
      {viewComponent}
    </div>
  );
}