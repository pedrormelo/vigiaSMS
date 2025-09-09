"use client";

import { Notification } from "@/constants/notificationsData";

interface NotificationProps {
  notification: Notification;
}

export default function DocumentView({ notification }: NotificationProps) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-blue-700">Visualizar Documento</h3>
      <p className="text-gray-600">
        Clique no botão para abrir o documento: {notification.title}
      </p>
      <button className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Abrir Documento
      </button>
    </div>
  );
}