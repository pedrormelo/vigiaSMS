// src/constants/types.ts

// Tipos possíveis para uma notificação (baseado nos ícones usados)
export type NotificationType = "doc" | "excel" | "pdf" | "dashboard" | "resoucao" | "comentario" | "sistema";

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
}

// Interface principal para uma Notificação
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  status?: NotificationStatus; // Status é opcional
  comments: Comment[]; // Array de comentários
  relatedFileType?: "doc" | "planilha" | "pdf"; // Tipo de arquivo associado, se houver
  contextoId?: string; // ID do contexto relacionado (se aplicável)
  url?: string; // URL do documento/link (se aplicável)
}