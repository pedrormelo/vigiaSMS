// src/constants/types.ts

// 1. CORRIGIDO: Removido "excel", "planilha" e "link" estão presentes.
// 2. CORRIGIDO: "resoucao" -> "resolucao"
export type NotificationType = "doc" | "pdf" | "dashboard" | "resolucao" | "comentario" | "sistema" | "planilha" | "link";

// Status visuais que podem ser aplicados (ex: cor no item da lista)
export type NotificationStatus = "deferido" | "indeferido" | "visto";

// Tipos de roles para estilização dos comentários
export type CommentRole = "info" | "secretaria" | "diretoria" | "gerencia" | "user" | "zelma";

// Interface para um comentário dentro de uma notificação
export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string; // Ex: "10:30"
  date: string; // Ex: "04/08/2025"
  isMyComment: boolean;
  role?: CommentRole; // Role opcional para estilização
  isPrivate?: boolean; // Mensagem enviada em privado (apenas local/visual)
  toAuthor?: string; // Destinatário específico quando mensagem é privada
}

// Interface principal para uma Notificação
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  status?: NotificationStatus; // Status é opcional
  comments: Comment[]; // Array de comentários
  
  // 3. CORRIGIDO: Removido "excel", "planilha" e outros tipos estão presentes
  relatedFileType?: "doc" | "planilha" | "pdf" | "link" | "dashboard" | "resolucao";
  
  contextoId?: string; // ID do contexto relacionado (se aplicável)
  url?: string; // URL do documento/link (se aplicável)
}