"use client";

import { Notification } from "@/constants/notificationsData";
import CommentItem from "@/components/notifications/commentItem";
import ChatHeader from "@/components/notifications/chatHeader";
import { showSuccessToast } from "@/components/ui/Toasts";

interface NotificationProps {
  notification: Notification;
}

export default function CommentSection({ notification }: NotificationProps) {
  const handleMarkAsRead = () => {
    showSuccessToast("Comnetário marcado como lido.");
  };

  return (
    <>
      <ChatHeader title={`${notification.title} > Comentários`} />
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {notification.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleMarkAsRead}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition flex items-center gap-2"
        >
          <img src="/icons/lido.svg" alt="Lido" width={18} height={18} />
          Lido
        </button>
      </div>
    </>
  );
}