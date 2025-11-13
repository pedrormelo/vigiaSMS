// src/services/notificationsService.ts
"use client";

import { authService } from "./authService";

export interface Comment {
  id: string | number;
  author: string;
  text: string;
  time: string; // HH:mm
  date: string; // DD/MM/YYYY
  isMyComment: boolean;
  role?: string;
}

export interface Notification {
  id: string; // backend UUID
  type: string; // backend 'tipo' or derived
  title: string;
  description?: string;
  status?: string; // 'visto' if lida
  contextoId?: string; // derived later if we enrich
  versaoId?: string | null;
  isRead?: boolean;
  createdAt?: string;
  comments?: Comment[];
  relatedFileType?: string;
}

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
  const rows: any[] = body.data || [];
  return rows.map(r => ({
    id: r.id,
    type: r.tipo || 'sistema',
    title: r.titulo,
    description: undefined,
    status: r.isLida ? 'visto' : undefined,
    versaoId: r.versaoId || null,
    isRead: !!r.isLida,
    createdAt: r.createdAt,
  }));
}

async function getCommentsByVersao(versaoId: string): Promise<Comment[]> {
  const base = apiBase();
  if (!base) return [];
  const res = await fetch(`${base}/comentarios/${versaoId}`, withAuth());
  if (!res.ok) return [];
  const rows: any[] = await res.json();
  const currentUser = authService.getUser();
  return rows.map(r => {
    const timestamp = new Date(r.timestamp);
    const numericId = timestamp.getTime(); // garante compatibilidade com componentes que esperam number
    return {
      id: numericId,
      author: r.user?.nome || 'Usuário',
      text: r.texto,
      time: timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: timestamp.toLocaleDateString('pt-BR'),
      isMyComment: currentUser ? currentUser.id === r.autorId : false,
      role: undefined,
    } as Comment;
  });
}

export async function getNotificationsWithComments(): Promise<Notification[]> {
  const notifs = await getNotifications();
  const enriched: Notification[] = [];
  for (const n of notifs) {
    if (n.versaoId) {
      try {
        const comments = await getCommentsByVersao(n.versaoId);
        enriched.push({ ...n, comments });
      } catch {
        enriched.push(n);
      }
    } else {
      enriched.push(n);
    }
  }
  return enriched;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const res = await fetch(`${base}/notificacoes/${id}/ler`, withAuth({ method: 'POST' }));
  return res.ok;
}
