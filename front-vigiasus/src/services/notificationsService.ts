// src/services/notificationsService.ts
"use client";

import { authService } from "./authService";
import { Notification, Comment } from "@/constants/types";

// Tipos internos atualizados para refletir a nova estrutura do Back
interface BackendNotificationRow {
  id: string;
  tipo?: string;
  titulo?: string;
  isLida?: boolean;
  versaoId?: string | null;
  createdAt?: string;
  contextoId?: string;
  // Estrutura aninhada que adicionamos no controller
  contextoversao?: { 
    contextoId: string;
    contexto?: {
        tituloConceitual: string;
        tipo: string;
    }
  } | null;
}

interface BackendCommentRow {
  id: string;
  texto: string;
  timestamp: string;
  autorId: string;
  user?: { nome?: string; id?: string };
}

// --- Helpers de ID ---
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

// --- 1. Busca de Notificações (ATUALIZADA) ---
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
      
      if (r.versaoId) {
        numericToVersaoId.set(numericId, r.versaoId);
      }

      // Extraindo dados do contexto aninhado
      const contextoData = r.contextoversao?.contexto;

      return {
        id: numericId,
        originalId: r.id,
        type: (r.tipo as any) || "sistema",
        title: r.titulo || "(sem título)",
        description: "", // Pode usar contextoData?.tituloConceitual se quiser exibir
        status: r.isLida ? "visto" : undefined,
        comments: [],
        contextoId: r.contextoId || r.contextoversao?.contextoId,
        createdAt: r.createdAt,
        hasVersionLinked: !!r.versaoId,
        
        // AQUI ESTÁ O PULO DO GATO PARA O CARD:
        relatedFileType: contextoData?.tipo, // Preenche "Tipo: DASHBOARD/INDICADOR"
        contextTitle: contextoData?.tituloConceitual // Preenche o título se estiver faltando
      } as unknown as Notification;
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

// ... (Mantenha as funções getCommentsForNotification, sendComment, markNotificationRead abaixo iguais ao que já fizemos)
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
        text: r.texto,
        time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString("pt-BR"),
        isMyComment: currentUser ? String(currentUser.id) === String(r.autorId) : false,
      } as Comment;
    });
  } catch (error) {
    return [];
  }
}

export async function sendComment(notificationId: number, text: string): Promise<Comment | null> {
  const versaoId = numericToVersaoId.get(notificationId);
  if (!versaoId) return null;

  const base = apiBase();
  try {
    const res = await fetch(`${base}/comentarios/${versaoId}`, withAuth({
      method: 'POST',
      body: JSON.stringify({ texto: text })
    }));

    if (!res.ok) throw new Error('Falha ao enviar');

    const r: BackendCommentRow = await res.json();
    const date = new Date(r.timestamp);
    
    return {
      id: hashIdToNumber(r.id),
      author: r.user?.nome || "Eu",
      text: r.texto,
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("pt-BR"),
      isMyComment: true,
    } as Comment;

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