// (DEPRECATED) Este arquivo originalmente gerava notificações mockadas.
// Agora as notificações são carregadas via backend em notificationsService.ts.
// Mantemos apenas os tipos para evitar quebrar imports existentes até refatoração completa.

export interface Comment {
  id: string | number; author: string; text: string; time: string; date: string; isMyComment: boolean; role?: string;
}
export type NotificationStatus = 'visto' | 'indeferido' | 'deferido' | undefined;
export type NotificationType = 'doc' | 'planilha' | 'pdf' | 'comentario' | 'sistema' | 'dashboard' | 'resolucao' | 'link';
export interface Notification {
  id: string | number; type: NotificationType | string; title: string; description?: string; status?: NotificationStatus; contextoId?: string; url?: string; comments?: Comment[]; relatedFileType?: string; versaoId?: string | null; createdAt?: string; isRead?: boolean;
}

// Exporta um array vazio para evitar uso dos mocks antigos.
export const notificationsData: Notification[] = [];