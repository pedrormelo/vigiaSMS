"use client";

import { Notification, Comment } from "@/constants/notificationsData";
import { useState } from "react";
import CommentItem from "@/components/notifications/commentItem";
import ChatHeader from "@/components/notifications/chatHeader";
import { showSuccessToast } from "@/components/ui/Toasts";
import Image from 'next/image';

interface NotificationProps {
  notification: Notification;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
}

export default function CommentSection({ notification, isRead, onMarkAsRead }: NotificationProps) {
  const [comments, setComments] = useState<Comment[]>(notification.comments);

  const handleConfirmAndMarkAsRead = () => {
    if (isRead) {
      return;
    }

    onMarkAsRead(notification.id);

    showSuccessToast("Comentário marcado como lido.");

    const now = new Date();
    const newComment: Comment = {
      id: comments.length > 0 ? Math.max(...comments.map((c: Comment) => c.id)) + 1 : 1,
      author: "Você",
      text: "Entendido.",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString(),
      isMyComment: true,
      role: "user",
    };
    setComments([...comments, newComment]);
  };

  return (
    <>
      <ChatHeader title={`${notification.title} > Comentários`} />
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto scrollbar-custom max-h-[60vh]">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleConfirmAndMarkAsRead}
          disabled={isRead}
          className="px-6 py-3 cursor-pointer bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Image src="/icons/lido.svg" alt="Lido" width={18} height={18} />
          {isRead ? "Lido" : "Marcar como lido"}
        </button>
      </div>
    </>
  );
}