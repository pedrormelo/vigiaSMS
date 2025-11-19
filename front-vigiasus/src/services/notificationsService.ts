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
    statusValidacao?: string;
    contexto?: { 
        tituloConceitual: string; 
        tipo: string;
        // AQUI: Atualizado para incluir os IDs
        gerencia?: { id: string; nome: string; diretoriaId: string };
    };
    versaoarquivo?: { docType: string } | null;
    versaodashboard?: { id: string } | null;
    versaoindicador?: { id: string } | null;
  } | null;
}

interface BackendCommentRow {
  id: string;
  texto: string;
  timestamp: string;
  autorId: string;
  user?: { 
      nome?: string; 
      id?: string; 
      role?: string; 
      diretoria?: { nome: string };
      gerencia?: { nome: string };
  };
  isPrivate?: boolean;
  destinatarioId?: string;
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

function mapRoleToStyle(backendRole?: string): string {
    const r = (backendRole || "").toUpperCase();
    if (r === 'SECRETARIA') return 'secretaria';
    if (r === 'DIRETOR') return 'diretoria';
    if (r === 'GERENTE') return 'gerencia';
    return 'user'; 
}

function detectCommentRole(text: string, originalRole?: string): string {
    const systemIcons = ["📤", "✅", "🚀", "⚠️", "❌"];
    const isSystem = systemIcons.some(icon => text.includes(icon));
    if (isSystem) return 'system';
    return mapRoleToStyle(originalRole);
}

function getAuthorLabel(user: BackendCommentRow['user']): string {
    if (!user || !user.role) return '';
    const r = user.role.toUpperCase();
    if (r === 'SECRETARIA') return 'Secretaria de Saúde';
    if (r === 'DIRETOR') return `Diretor${user.diretoria?.nome ? ` - ${user.diretoria.nome}` : ''}`;
    if (r === 'GERENTE') return `Gerente${user.gerencia?.nome ? ` - ${user.gerencia.nome}` : ''}`;
    if (r === 'MEMBRO') return `Membro${user.gerencia?.nome ? ` - ${user.gerencia.nome}` : ''}`;
    return '';
}

function resolveFileType(ctxData: any, fileData: any, dashData: any, indicData: any): string {
    if (ctxData?.tipo === 'DASHBOARD' || dashData) return 'dashboard';
    if (ctxData?.tipo === 'INDICADOR' || indicData) return 'indicador';
    if (fileData?.docType) {
        const map: Record<string, string> = { 'PDF': 'pdf', 'EXCEL': 'planilha', 'DOC': 'doc', 'LINK': 'link' };
        return map[fileData.docType] || 'doc';
    }
    return 'doc';
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
      
      const cv = r.contextoversao;
      const contextoData = cv?.contexto;
      
      let displayTitle = "";
      let displayDescription = "";

      if (contextoData) {
        displayTitle = contextoData.tituloConceitual || "Documento sem título";
        displayDescription = r.titulo || "Nova interação";
      } else {
        displayTitle = r.titulo || "Notificação do Sistema";
        displayDescription = "Aviso geral";
      }

      const realType = resolveFileType(
          contextoData, 
          cv?.versaoarquivo, 
          cv?.versaodashboard,
          cv?.versaoindicador
      );

      return {
        id: numericId,
        originalId: r.id,
        type: (r.tipo as any) || "sistema",
        title: displayTitle, 
        description: displayDescription, 
        status: r.isLida ? "visto" : undefined,
        comments: [],
        contextoId: r.contextoId || cv?.contextoId,
        contextStatus: cv?.statusValidacao,
        
        // AQUI: Passamos os dados necessários para validar
        contextGerencia: contextoData?.gerencia?.nome,
        contextGerenciaId: contextoData?.gerencia?.id,
        contextDiretoriaId: contextoData?.gerencia?.diretoriaId,

        createdAt: r.createdAt,
        hasVersionLinked: !!r.versaoId,
        relatedFileType: realType,
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
      const finalRole = detectCommentRole(r.texto, r.user?.role);

      return {
        id: hashIdToNumber(r.id),
        author: r.user?.nome || "Usuário",
        authorId: r.autorId,
        text: r.texto,
        time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString("pt-BR"),
        isMyComment: currentUser ? String(currentUser.id) === String(r.autorId) : false,
        isPrivate: r.isPrivate, 
        toAuthor: r.destinatarioNome,
        role: finalRole,
        authorLabel: getAuthorLabel(r.user) 
      } as unknown as Comment;
    });
  } catch (error) {
    return [];
  }
}

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
        privado: isPrivate,         
        destinatarioId: recipientId 
      })
    }));

    if (!res.ok) throw new Error('Falha ao enviar');

    const r: BackendCommentRow = await res.json();
    const date = new Date(r.timestamp);
    const finalRole = detectCommentRole(r.texto, r.user?.role);
    
    return {
      id: hashIdToNumber(r.id),
      author: r.user?.nome || "Eu",
      authorId: r.autorId,
      text: r.texto,
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("pt-BR"),
      isMyComment: true,
      isPrivate: isPrivate,
      toAuthor: r.destinatarioNome,
      role: finalRole,
      authorLabel: getAuthorLabel(r.user)
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