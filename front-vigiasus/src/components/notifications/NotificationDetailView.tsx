// CLEAN REWRITE BELOW (previous duplicate/corrupted content removed)
"use client";
import React, { useEffect, useState } from "react";
import { Loader2, Info, Eye, MessageSquare, Send, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import IconeDocumento from '@/components/validar/iconeDocumento';
import SystemUpdateView from "@/components/systemUpdate/systemUpdateNotification";
import CommentItem from "./commentItem";
import { Notification, Comment } from "@/constants/types";
import { FileType } from "@/components/contextosCard/contextoCard";
import { showSuccessToast } from "@/components/ui/Toasts";

interface Props { notification: Notification | null; isRead: boolean; onOpenContexto: (n: Notification) => void; }

const ChatNotificationDetails: React.FC<Props> = ({ notification, onOpenContexto }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [chatBg, setChatBg] = useState<string>(() => {
    try {
      const existing = localStorage.getItem('notifications.chatBg');
      if (existing) return existing;
      return 'gradient';
    } catch { return 'gradient'; }
  });
  useEffect(() => { setComments(notification?.comments || []); }, [notification]);
  useEffect(() => {
    const listener = (e: StorageEvent) => { if (e.key === 'notifications.chatBg' && e.newValue) setChatBg(e.newValue); };
    window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener);
  }, []);
  if (!notification) return null;
  const { title, description, type, relatedFileType, contextoId } = notification;
  const iconType = (relatedFileType || type) as FileType;
  const canView = !!contextoId;
  const quickReplies = ["Ciente.", "Obrigado(a).", "Recebido.", "Entendido."];
  // Lista de participantes (simplificada). Em cenário real viria da notificação.
  const participants = Array.from(new Set([
    ...(notification?.comments || []).map(c => c.author).filter(a => a !== 'Você')
  ]));
  const send = (value: string) => {
    const v = value.trim(); if (!v) return;
    const now = new Date();
    setComments(prev => [...prev, {
      id: Math.random(), author: 'Você', text: v,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('pt-BR'), isMyComment: true, role: 'user', isPrivate: privateMode || undefined, toAuthor: privateMode ? recipient || undefined : undefined
    }]);
    if (privateMode && recipient) {
      showSuccessToast(`Mensagem privada enviada para ${recipient}.`);
    } else if (privateMode) {
      showSuccessToast('Mensagem privada enviada.');
    } else {
      showSuccessToast('Mensagem enviada.');
    }
    setText(''); setShowQuick(false);
  };
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-inner p-3">
            <IconeDocumento type={iconType} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-blue-700 line-clamp-2" title={title}>{title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={description}>{description}</p>
          </div>
          {canView && (
            <Button size="sm" onClick={() => onOpenContexto(notification)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 flex items-center gap-1.5 ml-auto shadow-sm">
              <Eye className="w-4 h-4" /> Abrir
            </Button>
          )}
        </div>
      </div>
      <div className={cn(
        "flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-custom",
        chatBg === 'gradient' ? 'bg-gradient-to-b from-white to-blue-50' : (chatBg === 'none' ? 'bg-white' : 'bg-cover bg-center bg-no-repeat')
      )} style={chatBg !== 'gradient' && chatBg !== 'none' ? { backgroundImage: `url('${chatBg}')` } : undefined}>
        {comments.length ? comments.map(c => <CommentItem key={c.id} comment={c} />) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Nenhum comentário.</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }}
              placeholder="Escreva sua resposta..." className="flex-1 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="relative">
              <button onClick={() => setShowQuick(p => !p)} aria-label="Respostas rápidas" className="p-2 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </button>
              {showQuick && (
                <div className="absolute left-0 bottom-full mb-2 bg-white/60 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl z-20">
                  <div className="flex flex-col p-2">
                    {quickReplies.map(r => (
                      <button key={r} onClick={() => send(r)} className="text-left px-3 py-2 text-sm rounded-xl hover:bg-white/70 transition-colors">{r}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Toggle modo privado */}
            <button type="button" onClick={() => { setPrivateMode(p => !p); if (!privateMode) { /* entrando no modo */ } else { setRecipient(null); } }}
              className={cn("p-2 rounded-full border text-gray-600 hover:bg-gray-100 transition-colors",
                privateMode ? "bg-gray-800 text-white border-gray-700" : "bg-gray-50 border-gray-200")}
              title={privateMode ? "Resposta privada (clique para tornar pública)" : "Tornar esta resposta privada"}>
              <Lock className="w-4 h-4" />
            </button>
            {/* Se privado: selecionar destinatário */}
            {privateMode && (
              <div className="relative">
                <select
                  value={recipient || ''}
                  onChange={e => setRecipient(e.target.value || null)}
                  className="text-xs px-2 py-2 rounded-full border border-gray-300 bg-white focus:outline-none"
                  title="Selecionar destinatário"
                >
                  <option value="">Todos (padrão)</option>
                  {participants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            <Button disabled={!text.trim()} onClick={() => send(text)} size="sm" className="rounded-full text-white bg-blue-500 px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-blue-600">
              <Send className="w-4 h-4" /> Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotificationDetailView({ notification, isRead, onOpenContexto }: Props) {
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!notification) return; setLoading(true); const t = setTimeout(() => setLoading(false), 150); return () => clearTimeout(t); }, [notification]);
  if (!notification && !loading) return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center h-full text-center bg-gray-50/70">
      <Info className="h-12 w-12 mb-4 text-gray-300" />
      <p className="text-gray-500 font-medium">Selecione uma notificação para ver os detalhes.</p>
    </div>
  );
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-gray-50/70">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
  if (notification?.type === 'sistema') return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <SystemUpdateView notification={notification} />
    </div>
  );
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatNotificationDetails notification={notification} isRead={isRead} onOpenContexto={onOpenContexto} />
    </div>
  );
}