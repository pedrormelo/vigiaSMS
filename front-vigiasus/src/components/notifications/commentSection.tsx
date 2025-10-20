// src/components/notifications/commentSection.tsx
"use client";

import { Notification, Comment } from "@/constants/notificationsData";
import { useState } from "react";
import CommentItem from "@/components/notifications/commentItem";
// REMOVIDO: import ChatHeader from "@/components/notifications/chatHeader"; // <--- REMOVIDO
import { showSuccessToast } from "@/components/ui/Toasts";
import Image from 'next/image';
import { Button } from "@/components/ui/button"; // Importar Button
import { cn } from "@/lib/utils"; // Importar cn

interface NotificationProps {
  notification: Notification;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
}

export default function CommentSection({ notification, isRead, onMarkAsRead }: NotificationProps) {
  const [comments, setComments] = useState<Comment[]>(notification.comments);

  const handleConfirmAndMarkAsRead = () => {
    if (isRead) return;
    onMarkAsRead(notification.id);
    showSuccessToast("Notificação marcada como lida."); // Mensagem ajustada

    // Simula a adição de um comentário "Entendido" do usuário (opcional)
    // Se não quiser este comportamento, pode remover a lógica abaixo
    const now = new Date();
    const newComment: Comment = {
      id: comments.length > 0 ? Math.max(...comments.map((c: Comment) => c.id)) + 1 : 1,
      author: "Você",
      text: "Entendido.",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('pt-BR'), // pt-BR para formato local
      isMyComment: true,
      role: "user", // Define o 'role' para aplicar o estilo correto
    };
    setComments([...comments, newComment]);
  };

  return (
    // Container principal que ocupa toda a altura e gerencia o layout
    <div className="flex flex-col h-full bg-white"> {/* Fundo branco padrão */}

        {/* Título Simples (Substitui ChatHeader) */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1" title={notification.title}> {/* Tamanho e cor ajustados */}
                Comentários: <span className="text-blue-600 font-medium">{notification.title}</span>
            </h3>
        </div>

        {/* Área de scroll para os comentários */}
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-custom"> {/* Padding ajustado */}
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))
            ) : (
                <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                    <p>Não há comentários para esta notificação.</p>
                </div>
            )}
        </div>

        {/* Rodapé com botão */}
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50 flex-shrink-0"> {/* Fundo suave */}
            <Button // Usando o componente Button
                onClick={handleConfirmAndMarkAsRead}
                disabled={isRead}
                // Estilo do botão ligeiramente ajustado usando variantes e cn
                className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5", // Espaçamento e tamanho
                    isRead
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" // Estilo desabilitado
                        : "bg-green-500 text-white hover:bg-green-600 transition" // Estilo habilitado
                )}
            >
                <Image src="/icons/lido.svg" alt="" width={16} height={16} /> {/* Ícone menor, alt vazio */}
                {isRead ? "Lido" : "Marcar como lido"}
            </Button>
        </div>
    </div>
  );
}