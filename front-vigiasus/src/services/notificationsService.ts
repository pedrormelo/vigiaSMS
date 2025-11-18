// src/services/notificationsService.ts
"use client";

import { authService } from "./authService";
import { Notification, Comment } from "@/constants/types";

interface BackendNotificationRow {
  id: string;
  tipo?: string;
  titulo?: string;
  isLida?: boolean;
  versaoId?: string | null;
  createdAt?: string;
  contextoId?: string;
  contextoversao?: { 
    contextoId: string;
    contexto?: { tituloConceitual: string; tipo: string; }
  } | null;
}

interface BackendCommentRow {
  id: string;
  texto: string;
  timestamp: string;
  autorId: string;
  user?: { nome?: string; id?: string };
  isPrivate?: boolean;// Novo campo presumido
  destinatarioId?: string; // Novo campo presumido
  destinatarioNome?: string;
}

function hashIdToNumber(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const numericToOriginalId = new Map<number, string>();
const numericToVersaoId = new Map<number, string>();

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function withAuth(init: RequestInit = {}): RequestInit {
  const token = authService.getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return { ...init, headers };
}

export async function getNotifications(): Promise<Notification[]> {
  const base = apiBase();
  if (!base) return [];
  
  try {
    const res = await fetch(`${base}/notificacoes`, withAuth());
    if (!res.ok) return [];
    const body = await res.json();
    const rows: BackendNotificationRow[] = body.data || [];

    return rows.map(r => {
      const numericId = hashIdToNumber(r.id);
      numericToOriginalId.set(numericId, r.id);
      if (r.versaoId) numericToVersaoId.set(numericId, r.versaoId);
      const contextoData = r.contextoversao?.contexto;

      return {
        id: numericId,
        originalId: r.id,
        type: (r.tipo as any) || "sistema",
        title: r.titulo || "(sem título)",
        description: "",
        status: r.isLida ? "visto" : undefined,
        comments: [],
        contextoId: r.contextoId || r.contextoversao?.contextoId,
        createdAt: r.createdAt,
        hasVersionLinked: !!r.versaoId,
        relatedFileType: contextoData?.tipo,
        contextTitle: contextoData?.tituloConceitual
      } as unknown as Notification;
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

export async function getCommentsForNotification(notificationId: number): Promise<Comment[]> {
  const versaoId = numericToVersaoId.get(notificationId);
  if (!versaoId) return []; 

  const base = apiBase();
  try {
    const res = await fetch(`${base}/comentarios/${versaoId}`, withAuth());
    if (!res.ok) return [];
    
    const rows: BackendCommentRow[] = await res.json();
    const currentUser = authService.getUser();

    return rows.map(r => {
      const date = new Date(r.timestamp);
      return {
        id: hashIdToNumber(r.id),
        author: r.user?.nome || "Usuário",
        authorId: r.autorId, // IMPORTANTÍSSIMO: Guardamos o ID real do autor
        text: r.texto,
        time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString("pt-BR"),
        isMyComment: currentUser ? String(currentUser.id) === String(r.autorId) : false,
        isPrivate: r.isPrivate, // Mapeia se é privado
        toAuthor: r.destinatarioNome
      } as unknown as Comment;
    });
  } catch (error) {
    return [];
  }
}

// AQUI: Atualizado para aceitar isPrivate e recipientId
export async function sendComment(
  notificationId: number, 
  text: string, 
  isPrivate: boolean = false, 
  recipientId?: string
): Promise<Comment | null> {
  const versaoId = numericToVersaoId.get(notificationId);
  if (!versaoId) return null;

  const base = apiBase();
  try {
    const res = await fetch(`${base}/comentarios/${versaoId}`, withAuth({
      method: 'POST',
      body: JSON.stringify({ 
        texto: text,
        privado: isPrivate,         // Envia flag privada
        destinatarioId: recipientId // Envia ID do destinatário
      })
    }));

    if (!res.ok) throw new Error('Falha ao enviar');

    const r: BackendCommentRow = await res.json();
    const date = new Date(r.timestamp);
    
    return {
      id: hashIdToNumber(r.id),
      author: r.user?.nome || "Eu",
      authorId: r.autorId,
      text: r.texto,
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("pt-BR"),
      isMyComment: true,
      isPrivate: isPrivate,
      toAuthor: r.destinatarioNome
    } as unknown as Comment;

  } catch (error) {
    return null;
  }
}

export async function markNotificationRead(id: number): Promise<boolean> {
  const base = apiBase();
  const originalId = numericToOriginalId.get(id);
  if (!originalId || !base) return false;
  try {
    await fetch(`${base}/notificacoes/${originalId}/ler`, withAuth({ method: 'POST' }));
    return true;
  } catch { return false; }
}

export async function getNotificationsWithComments() {
  return getNotifications();
}

export interface Participante {
  id: string;
  nome: string;
  role: string;
}

export async function getParticipantes(notificationId: number): Promise<Participante[]> {
  const versaoId = numericToVersaoId.get(notificationId);
  if (!versaoId) return [];

  const base = apiBase();
  try {
    const res = await fetch(`${base}/contextos/${versaoId}/participantes`, withAuth());
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar participantes:", error);
    return [];
  }
}