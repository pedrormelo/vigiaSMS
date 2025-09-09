"use client";

import { Notification } from "@/constants/notificationsData";
import SystemUpdateView from "@/components/systemUpdate/systemUpdateNotification";
import CommentSection from "@/components/notifications/commentSection";
import DocumentView from "@/components/notifications/DocumentView";

export default function NotificationDetailView({ notification }: { notification: Notification | null; }) {
  if (!notification) {
    return (
      <div className="flex-1 bg-white p-6 flex items-center justify-center rounded-xl shadow-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          Selecione uma notificação para ver os detalhes.
        </p>
      </div>
    );
  }

  let viewComponent;
  if (notification.status === 'indeferido') {
    viewComponent = <CommentSection notification={notification} />;
  } else if (notification.type === 'sistema') {
    viewComponent = <SystemUpdateView notification={notification} />;
  } else {
    viewComponent = <DocumentView notification={notification} />;
  }

  return (
    <div className="flex-1 flex flex-col rounded-xl shadow-lg border border-gray-200 bg-white">
      {viewComponent}
    </div>
  );
}