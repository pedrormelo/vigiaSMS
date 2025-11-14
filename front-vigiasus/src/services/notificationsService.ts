// src/services/notificationsService.ts
"use client";

// Serviço responsável por buscar notificações e comentários e convertê-los
// para os tipos usados pelos componentes (tipos centralizados em constants/types).
// Ele adapta IDs (UUID/string) vindos do backend para números estáveis exigidos
// pelos componentes (ex: Set<number> para readNotifications).

import { authService } from "./authService";
import { Notification, Comment } from "@/constants/types";

// Tipo cru recebido do backend (mantemos local para conversão)
interface BackendNotificationRow {
  id: string; // UUID ou outro identificador textual
  tipo?: string;
  titulo?: string;
  isLida?: boolean;
  versaoId?: string | null;
  createdAt?: string;
  contextoId?: string; // se existir no backend
}

interface BackendCommentRow {
  timestamp: string; // ISO datetime
  texto: string;
  autorId?: string | number;
  user?: { nome?: string; id?: string | number };
}

// Gera um número estável a partir de um UUID/string.
// Estratégia: percorre chars e calcula hash 32-bit assinado; converte para positivo.
function hashIdToNumber(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // força 32-bit
  }
  return Math.abs(hash);
}

// Mapa em memória para preservar o ID original do backend
const numericToOriginalId = new Map<number, string>();

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function withAuth(init: RequestInit = {}): RequestInit {
  const token = authService.getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

export async function getNotifications(): Promise<Notification[]> {
  const base = apiBase();
  if (!base) return [];
  const res = await fetch(`${base}/notificacoes`, withAuth());
  if (!res.ok) return [];
  const body = await res.json();
  const rows: BackendNotificationRow[] = body.data || [];
  return rows.map(r => {
    const numericId = hashIdToNumber(r.id);
    numericToOriginalId.set(numericId, r.id);
    return {
      id: numericId,
      originalId: r.id,
      type: (r.tipo as Notification["type"]) || "sistema",
      title: r.titulo || "(sem título)",
      description: "", // backend não fornece descrição detalhada ainda
      status: r.isLida ? "visto" : undefined,
      comments: [],
      contextoId: r.contextoId,
      url: undefined,
      relatedFileType: undefined,
      createdAt: r.createdAt,
    } as Notification;
  });
}

async function getCommentsByVersao(versaoId: string): Promise<Comment[]> {
  const base = apiBase();
  if (!base) return [];
  const res = await fetch(`${base}/comentarios/${versaoId}`, withAuth());
  if (!res.ok) return [];
  const rows: BackendCommentRow[] = await res.json();
  const currentUser = authService.getUser();
  return rows.map(r => {
    const timestamp = new Date(r.timestamp);
    return {
      id: timestamp.getTime(),
      author: r.user?.nome || "Usuário",
      text: r.texto,
      time: timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      date: timestamp.toLocaleDateString("pt-BR"),
      isMyComment: currentUser ? String(currentUser.id) === String(r.autorId) : false,
      role: undefined,
      isPrivate: false,
    } as Comment;
  });
}

export async function getNotificationsWithComments(): Promise<Notification[]> {
  const notifs = await getNotifications();
  // Neste estágio não temos versaoId no tipo Notification (centralizado).
  // Caso seja necessário futuramente, podemos guardar um mapa id->versaoId.
  // Por enquanto apenas retornamos as notificações como vieram.
  return notifs;
}

export async function markNotificationRead(id: number): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const originalId = numericToOriginalId.get(id);
  if (!originalId) return false;
  const res = await fetch(`${base}/notificacoes/${originalId}/ler`, withAuth({ method: 'POST' }));
  return res.ok;
}
