// src/constants/notificationsData.ts

import { Notification, NotificationType, NotificationStatus, Comment, CommentRole } from "./types";
// 1. IMPORTAR A FONTE ÚNICA DE DADOS MOCK
import { allContextosMock } from "./mockDatabase";
// 2. IMPORTAR OS TIPOS UNIFICADOS
import { Contexto, StatusContexto, DocType, HistoricoEvento } from "@/components/validar/typesDados"; // DocType e HistoricoEvento podem ser necessários localmente

/**
 * Mapeia o StatusContexto (do backend) para um NotificationStatus (para a UI de notificações).
 * @param status O StatusContexto vindo dos dados.
 * @returns O status da notificação ou undefined se não houver status.
 */
function mapContextoStatusToNotifStatus(status: StatusContexto): NotificationStatus | undefined {
    switch (status) {
        case StatusContexto.Deferido:
        case StatusContexto.Publicado:
            return "deferido";
        case StatusContexto.Indeferido:
        case StatusContexto.AguardandoCorrecao:
            return "indeferido";
        // Status em progresso não precisam de "status" na notificação
        case StatusContexto.AguardandoGerente:
        case StatusContexto.AguardandoDiretor:
            return undefined;
        default:
            return undefined;
    }
}

/**
 * Gera uma descrição amigável para a notificação com base no status do contexto.
 * @param contexto O objeto Contexto.
 * @returns Uma string de descrição.
 */
function generateNotificationDescription(contexto: Contexto): string {
     switch (contexto.status) {
        case StatusContexto.AguardandoGerente:
            return `Novo contexto "${contexto.title}" submetido por ${contexto.solicitante}. Aguardando sua análise.`;
        case StatusContexto.AguardandoDiretor:
            return `Contexto "${contexto.title}" aprovado pelo gerente. Aguardando sua análise.`;
        case StatusContexto.AguardandoCorrecao:
             // Tenta extrair a justificativa do último evento do histórico
             const ultimoHistorico = contexto.historico?.[contexto.historico.length - 1];
             const motivo = ultimoHistorico?.acao.includes("Justificativa:")
                 ? ultimoHistorico.acao.split("Justificativa:")[1]?.trim()
                 : "Verificar comentários.";
            return `Contexto "${contexto.title}" devolvido para correção. Motivo: ${motivo}`;
        case StatusContexto.Publicado:
             return `O contexto "${contexto.title}" foi publicado com sucesso.`;
        case StatusContexto.Deferido:
             return `O contexto "${contexto.title}" foi deferido.`;
        case StatusContexto.Indeferido:
             return `O contexto "${contexto.title}" foi indeferido.`;
        default:
            return `Status do contexto "${contexto.title}": ${contexto.status}`;
    }
}

// --- Comentários Mockados (Exemplos) ---
const mockCommentsContexto1: Comment[] = [
    { id: 101, author: "Gerência Financeira", text: "O documento foi rejeitado devido a divergências no valor.", time: "10:30", date: "04/08/2025", isMyComment: false, role: "gerencia" },
    { id: 102, author: "Pedro Augusto Lorenzo", text: "Ok, irei verificar e reenviar.", time: "10:35", date: "04/08/2025", isMyComment: false, role: "user" },
];
const mockCommentsContexto2: Comment[] = [
     { id: 201, author: "João Silva (Gerente)", text: "Falta a coluna 'Fonte do Recurso'. Por favor, adicione e reenvie.", time: "09:00", date: "04/08/2025", isMyComment: false, role: "gerencia" },
];
const mockCommentsContextoVoce: Comment[] = [
    { id: 301, author: "João Silva (Gerente)", text: "Aprovado. Encaminhando para diretoria.", time: "10:00", date: "06/08/2025", isMyComment: false, role: "gerencia" },
    { id: 302, author: "Você", text: "Obrigado, João! Fico no aguardo da aprovação final.", time: "10:05", date: "06/08/2025", isMyComment: true, role: "user" },
];

/**
 * Coleta comentários e eventos de histórico para um determinado contexto.
 * @param contexto O objeto Contexto.
 * @returns Um array de Comentários.
 */
function getCommentsForContexto(contexto: Contexto): Comment[] {
    let comments: Comment[] = [];

    // Adiciona comentários mockados fixos (simulando um chat)
    if (contexto.id === "1") comments = [...mockCommentsContexto1];
    if (contexto.id === "2") comments = [...mockCommentsContexto2];
    if (contexto.id === "3") comments = [...mockCommentsContextoVoce];

    // Transforma eventos de histórico relevantes em "comentários"
    if (contexto.historico) {
        contexto.historico.forEach(event => {
            // Verifica se é um evento de indeferimento/correção com justificativa
            const eDevolucao = event.acao.toLowerCase().includes("devolvido para correção") ||
                               event.acao.toLowerCase().includes("análise gerente: indeferido") ||
                               event.acao.toLowerCase().includes("análise diretor: indeferido");

            if (eDevolucao) {
                let text = "Contexto devolvido para correção.";
                if (event.acao.includes("Justificativa:")) {
                    text = event.acao.split("Justificativa:")[1]?.trim() || text;
                } else if (event.acao.includes("Motivo:")) {
                    text = event.acao.split("Motivo:")[1]?.trim() || text;
                }
                
                const eventDate = new Date(event.data);
                const commentId = eventDate.getTime() + Math.random();
                
                // Evita duplicar o comentário se ele já foi adicionado manualmente (ex: mockCommentsContexto2)
                const alreadyExists = comments.some(c => c.author === event.autor && c.text.includes(text.substring(0, 30)));

                if (!alreadyExists) {
                    comments.push({
                        id: commentId,
                        author: event.autor,
                        text: text,
                        time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        date: eventDate.toLocaleDateString('pt-BR'),
                        isMyComment: false,
                        role: event.autor.toLowerCase().includes("gerente") ? "gerencia" :
                              event.autor.toLowerCase().includes("diretor") ? "diretoria" : "info",
                    });
                }
            }
        });
    }

    // Ordena os comentários por data/hora
    try {
        comments.sort((a, b) => {
            // Constrói strings de data ISO 8601 parciais para comparação
            const dateTimeStringA = `${a.date.split('/').reverse().join('-')}T${a.time}:00`;
            const dateTimeStringB = `${b.date.split('/').reverse().join('-')}T${b.time}:00`;
            const dateA = new Date(dateTimeStringA);
            const dateB = new Date(dateTimeStringB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA.getTime() - dateB.getTime(); // Ordem cronológica
            }
            console.warn("Data inválida encontrada ao ordenar comentários:", a, b);
            return 0;
        });
    } catch (e) {
        console.error("Erro ao ordenar comentários:", e, comments);
    }

    return comments;
}

// --- GERAÇÃO DAS NOTIFICAÇÕES DINÂMICAS ---
let notificationIdCounter = 1;

// 3. DEFINIR QUAIS STATUS SÃO "FECHADOS"
const STATUS_FINALIZADOS = [
  StatusContexto.Publicado,
  StatusContexto.Indeferido
];

// 4. FILTRAR A FONTE ÚNICA PARA PEGAR APENAS CONTEXTOS "ABERTOS"
const contextosAbertos = allContextosMock.filter(
  contexto => !STATUS_FINALIZADOS.includes(contexto.status)
);

// 5. MAPEAR OS CONTEXTOS ABERTOS PARA NOTIFICAÇÕES
const dynamicNotifications: Notification[] = contextosAbertos
    .map(contexto => {

        // Mapeia o 'type' do contexto para o 'relatedFileType' da notificação
        const validRelatedFileTypes: Array<Notification['relatedFileType']> = ["doc", "planilha", "excel", "pdf", "dashboard", "resolucao", "link"];
        let fileTypeForRelated: Notification['relatedFileType'] = undefined;
        if (validRelatedFileTypes.includes(contexto.type as any)) {
             fileTypeForRelated = contexto.type as Notification['relatedFileType'];
        }

        // Determina o ícone/tipo da notificação
        let notificationType: NotificationType;
        if (contexto.status === StatusContexto.AguardandoCorrecao) {
             notificationType = 'comentario'; // Notificações de correção usam ícone de comentário
        } else if (contexto.type === 'excel') {
            notificationType = 'planilha';
        } else {
             const validNotificationTypes: NotificationType[] = ["doc", "excel", "pdf", "comentario", "sistema", "dashboard", "resolucao", "link"];
             if (validNotificationTypes.includes(contexto.type as any)) {
                  notificationType = contexto.type as NotificationType;
             } else {
                 notificationType = 'doc'; // Tipo padrão
             }
        }

        const notification: Notification = {
            id: notificationIdCounter++,
            type: notificationType, 
            title: contexto.title, 
            description: generateNotificationDescription(contexto),
            status: mapContextoStatusToNotifStatus(contexto.status), 
            contextoId: contexto.id,
            url: contexto.url, // URL para visualização direta (se aplicável)
            comments: getCommentsForContexto(contexto),
            relatedFileType: fileTypeForRelated, 
        };
        return notification;
    });

// --- NOTIFICAÇÕES ESTÁTICAS (Ex: Atualizações do Sistema) ---
const staticNotifications: Notification[] = [
  {
    id: notificationIdCounter++,
    type: "sistema",
    title: "Nova atualização do Sistema VigiaSUS",
    description: "Versão 0.1.1 disponível! Inclui melhorias na visualização de PDFs e correções de bugs.",
    status: "visto",
    comments: [],
  },
];

// --- EXPORTAÇÃO FINAL ---
export const notificationsData: Notification[] = [
    ...dynamicNotifications,
    ...staticNotifications,
];

// Re-exporta os tipos para facilitar a importação em outros lugares
export type { Notification, NotificationType, NotificationStatus, Comment };