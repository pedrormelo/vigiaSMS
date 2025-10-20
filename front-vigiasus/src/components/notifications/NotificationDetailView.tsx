// src/components/notifications/NotificationDetailView.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"; // Para ícones e botão "Lido"
import { Notification, Comment } from "@/constants/types"; // Ajustado
import SystemUpdateView from "@/components/systemUpdate/systemUpdateNotification";
import CommentItem from "@/components/notifications/commentItem";
import { Loader2, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import IconeDocumento from '@/components/validar/iconeDocumento'; // Para usar os ícones corretos
import { showSuccessToast } from "@/components/ui/Toasts";

interface Props {
  notification: Notification | null;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
  onOpenContexto: (notification: Notification) => void;
}

// --- NOVO COMPONENTE INTERNO ---
// Responsável por renderizar detalhes de notificações NÃO-sistema
const ContextNotificationDetails: React.FC<Props> = ({
  notification, isRead, onMarkAsRead, onOpenContexto
}) => {
  const [localComments, setLocalComments] = useState<Comment[]>(notification?.comments || []);

   // Atualiza os comentários locais se a notificação mudar
  useEffect(() => {
    setLocalComments(notification?.comments || []);
  }, [notification]);


  if (!notification) return null; // Segurança

  const { title, description, type, relatedFileType, contextoId, comments } = notification;

  // Lógica para marcar como lido e adicionar comentário "Entendido"
  const handleConfirmAndMarkAsRead = () => {
    if (isRead) return;
    onMarkAsRead(notification.id);
    showSuccessToast("Notificação marcada como lida.");

    const now = new Date();
    const newComment: Comment = {
      id: localComments.length > 0 ? Math.max(...localComments.map((c) => c.id)) + 1 : 1,
      author: "Você", text: "Entendido.",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('pt-BR'),
      isMyComment: true, role: "user",
    };
    setLocalComments([...localComments, newComment]);
  };

  // Determina o tipo de ícone a ser exibido
  const docTypeForIcon = relatedFileType || type;

  const canViewContexto = !!(onOpenContexto && contextoId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Cabeçalho da Notificação (semelhante ao estilo do item da lista) */}
      <div className="p-4 border-b border-gray-200 flex items-start gap-4 flex-shrink-0 bg-gray-50/50">
         <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
             {/* Usa IconeDocumento para consistência */}
             <IconeDocumento type={docTypeForIcon as any} />
         </div>
         <div className="flex-1 min-w-0">
             <h3 className="font-semibold text-base text-blue-800 line-clamp-2" title={title}>
                {title}
             </h3>
             <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={description}>
                {description}
             </p>
         </div>
          {/* Botão Abrir Contexto */}
         {canViewContexto && (
            <Button
                onClick={() => onOpenContexto(notification)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-1.5 flex-shrink-0 ml-auto"
            >
                <Eye className="w-4 h-4" />
                Abrir
            </Button>
         )}
      </div>

      {/* Área de Comentários (se houver) */}
      {localComments.length > 0 ? (
        <>
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-custom">
                {localComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
            {/* Rodapé com botão Marcar como Lido */}
            <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50 flex-shrink-0">
                <Button
                    onClick={handleConfirmAndMarkAsRead}
                    disabled={isRead}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5",
                        isRead
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600 transition"
                    )}
                >
                    <Image src="/icons/lido.svg" alt="" width={16} height={16} />
                    {isRead ? "Lido" : "Marcar como lido"}
                </Button>
            </div>
        </>
      ) : (
          // Mensagem se não houver comentários
          <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-6">
              <p>Não há comentários ou ações adicionais para esta notificação.</p>
          </div>
      )}
    </div>
  );
};
// --- FIM DO NOVO COMPONENTE ---


// --- COMPONENTE PRINCIPAL (NotificationDetailView) ---
export default function NotificationDetailView({
  notification, isRead, onMarkAsRead, onOpenContexto
}: Props) {
  const [loading, setLoading] = useState(false);

  // Efeito de loading simples
  useEffect(() => {
    if (!notification) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 200); // Shorter delay
    return () => clearTimeout(timer);
  }, [notification]);

  // Placeholder inicial
  if (!notification && !loading) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center h-full text-center bg-gray-50">
        <Info className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">
          Selecione uma notificação na lista para ver os detalhes.
        </p>
      </div>
    );
  }

  // Estado de Loading
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-3 text-sm text-gray-500">Carregando detalhes...</p>
      </div>
    );
  }

  // --- LÓGICA DE RENDERIZAÇÃO ATUALIZADA ---
  // Se for notificação de sistema, usa a view específica
  if (notification?.type === "sistema") {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <SystemUpdateView notification={notification} />
        </div>
    );
  }
  // Para todos os outros tipos (doc, pdf, comentario, etc.), usa a nova view de detalhes
  else if (notification) {
     return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ContextNotificationDetails
                notification={notification}
                isRead={isRead}
                onMarkAsRead={onMarkAsRead}
                onOpenContexto={onOpenContexto}
            />
        </div>
     );
  }
  // Fallback (pouco provável de acontecer)
  else {
     return (
        <div className="flex-1 p-8 flex flex-col items-center justify-center h-full text-center bg-gray-50">
            <Info className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Nenhuma notificação selecionada.</p>
        </div>
     );
  }
}