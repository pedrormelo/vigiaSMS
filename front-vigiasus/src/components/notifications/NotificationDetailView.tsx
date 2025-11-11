// src/components/notifications/NotificationDetailView.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Notification, Comment } from "@/constants/types";
import SystemUpdateView from "@/components/systemUpdate/systemUpdateNotification";
import CommentItem from "@/components/notifications/commentItem";
import { Loader2, Info, Eye, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FileType } from "@/components/contextosCard/contextoCard";
import { showSuccessToast } from "@/components/ui/Toasts";

// Props (Sem onMarkAsRead, como na última versão)
interface Props {
  notification: Notification | null;
  isRead: boolean;
  onOpenContexto: (notification: Notification) => void;
}

// --- COMPONENTE INTERNO (REESTILIZADO) ---
const ContextNotificationDetails: React.FC<Props> = ({
  notification, isRead, onOpenContexto
}) => {
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [useChatBg, setUseChatBg] = useState<boolean>(() => {
    try {
      return localStorage.getItem('notifications.useChatBg') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'notifications.useChatBg') {
        setUseChatBg(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    setLocalComments(notification?.comments || []);
  }, [notification]);

  // --- INÍCIO DA MODIFICAÇÃO (Lógica de "Pode Responder") ---

  // (Request 2 - da iteração anterior)
  //  Verifica se a outra parte já iniciou a conversa.
  const hasOthersComments = localComments.some(comment => !comment.isMyComment);

  // (Request 3 - Novo)
  //  Verifica se o ÚLTIMO comentário foi do usuário.
  const lastComment = localComments.length > 0 ? localComments[localComments.length - 1] : null;
  const userSpokeLast = lastComment ? lastComment.isMyComment : false;

  //  O usuário SÓ PODE RESPONDER se:
  //    a) A outra parte já falou (hasOthersComments)
  //    E
  //    b) O usuário NÃO foi o último a falar (!userSpokeLast)
  const canUserReply = hasOthersComments && !userSpokeLast;

  // --- FIM DA MODIFICAÇÃO ---


  if (!notification) return null;

  const { title, description, type, relatedFileType, contextoId } = notification;

  // Função de Resposta Rápida
  const handleQuickReply = (replyText: string) => {
    // (Request 3) Confiança no estado do botão (disabled), 
    // mas uma verificação extra não faz mal.
    if (!canUserReply) return;

    // Simula o envio do comentário
    const now = new Date();
    const comment: Comment = {
      id: Math.random(),
      author: "Você",
      text: replyText,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('pt-BR'),
      isMyComment: true, role: "user",
    };
    // Ao adicionar este comentário, o useEffect não será acionado, 
    // mas o re-render fará com que 'userSpokeLast' seja 'true',
    // desabilitando os botões.
    setLocalComments(prev => [...prev, comment]);
    showSuccessToast(`Resposta "${replyText}" enviada.`);
  };

  const quickReplies = ["Ciente.", "Obrigado(a).", "Recebido.", "Entendido."];

  const handleSendMessage = () => {
    if (!canUserReply) return;
    const text = newMessage.trim();
    if (!text) return;
    const now = new Date();
    const comment: Comment = {
      id: Math.random(),
      author: "Você",
      text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('pt-BR'),
      isMyComment: true, role: "user",
    };
    setLocalComments(prev => [...prev, comment]);
    setNewMessage("");
    setShowQuickReplies(false);
    showSuccessToast("Mensagem enviada.");
  };


  const docTypeForIcon = (relatedFileType || type) as FileType;
  const canViewContexto = !!contextoId;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Cabeçalho (Sem alteração) */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-inner flex-shrink-0 p-3">
            <IconeDocumento type={docTypeForIcon} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-blue-700 line-clamp-2" title={title}>
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={description}>
              {description}
            </p>
          </div>
          {canViewContexto && (
            <Button
              onClick={() => onOpenContexto(notification)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 flex items-center gap-1.5 flex-shrink-0 ml-auto shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Abrir
            </Button>
          )}
        </div>
      </div>

      {/* Área de Comentários (Scroll) (Sem alteração) */}
      <div
        className={cn(
          "flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-custom",
          useChatBg ? "bg-cover bg-center bg-no-repeat" : "bg-gradient-to-b from-white to-blue-50"
        )}
        style={useChatBg ? { backgroundImage: "url('/chat/bg-chat-3.png')" } : undefined}
      >
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500">
            <p>Não há comentários para esta notificação.</p>
          </div>
        )}
      </div>

      {/* --- INÍCIO DA MODIFICAÇÃO (Rodapé com Tooltip e Lógica 'disabled' atualizados) --- */}
      <div
        className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
        // (Request 3) O tooltip agora reflete as duas condições
        title={
          !hasOthersComments
            ? "Respostas rápidas são habilitadas após o primeiro comentário da outra parte."
            : userSpokeLast
              ? "Você já respondeu a esta interação. Aguarde uma nova mensagem."
              : "Enviar uma resposta rápida"
        }
      >
        <div className="flex items-center gap-3">

          {/* Input + send area */}
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                // Enviar com Enter (Shift+Enter preservado caso se mude para textarea no futuro)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={canUserReply ? "Escreva sua resposta..." : "Aguarde a outra parte iniciar a conversa"}
              disabled={!canUserReply}
              className="flex-1 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ring-offset disabled:opacity-60"
            />

            {/* Chat icon button (side of send) */}
            <div className="relative">

              <button
                onClick={() => setShowQuickReplies(prev => !prev)}
                aria-label="Mostrar respostas rápidas"
                className={cn(
                  "p-2 rounded-full bg-gray-50 border border-gray-200",
                  !canUserReply && "opacity-50 cursor-not-allowed"
                )}
                disabled={!canUserReply}
              >
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </button>

              {showQuickReplies && (
                <div className="absolute left-0 bottom-full mb-2 bg-white/50 backdrop-blur-md border-gray-200 shadow-xl rounded-2xl z-20">
                  <div className="flex flex-col p-2">
                    {quickReplies.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => { handleQuickReply(qr); setShowQuickReplies(false); }}
                        className={cn(
                          "text-left px-3 py-2 text-sm rounded-xl hover:bg-white/60 transition-colors",
                          !canUserReply && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!canUserReply}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSendMessage}
              size="sm"
              className={cn(
                "rounded-full text-white bg-blue-500 px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-blue-600",
                !canUserReply && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canUserReply || newMessage.trim() === ""}
            >
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </div>

        </div>
      </div>
      {/* --- FIM DA MODIFICAÇÃO --- */}

    </div>
  );
};

// --- COMPONENTE PRINCIPAL (Wrapper - Sem alterações) ---
export default function NotificationDetailView({
  notification, isRead, onOpenContexto
}: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification && !loading) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center h-full text-center bg-gray-50/70">
        <Info className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">
          Selecione uma notificação para ver os detalhes.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-gray-50/70">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (notification?.type === "sistema") {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <SystemUpdateView notification={notification} />
      </div>
    );
  }
  else if (notification) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ContextNotificationDetails
          notification={notification}
          isRead={isRead}
          onOpenContexto={onOpenContexto}
        />
      </div>
    );
  }

  return null;
}