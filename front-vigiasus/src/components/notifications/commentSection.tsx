"use client";

import { Notification } from "@/constants/notificationsData";
import CommentItem from "@/components/notifications/commentItem";
import ChatHeader from "@/components/notifications/chatHeader";
import Image from "next/image";

interface CommentSectionProps {
  notification: Notification | null;
}

export default function CommentSection({ notification }: CommentSectionProps) {
  if (!notification) {
    return (
      <div className="flex-1 bg-white p-6 flex items-center justify-center rounded-xl shadow-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          Selecione uma notificação para ver os detalhes.
        </p>
      </div>
    );
  }

  const { title, comments } = notification;

  return (
    <div className="flex-1 flex flex-col rounded-xl shadow-lg border border-gray-200 bg-white">
      {/* Header */}
      <ChatHeader title={`${title} > Comentários`} />

      {/* Lista de Comentários */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Rodapé e Botão */}
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition flex items-center gap-2">
          <Image src="/icons/lido.svg" alt="Lido" width={18} height={18} />
          Lido
        </button>
      </div>
    </div>
  );
}