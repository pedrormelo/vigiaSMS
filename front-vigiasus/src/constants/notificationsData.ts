// src/constants/notificationsData.ts
import { Notification, NotificationType, NotificationStatus, Comment, CommentRole } from "./types"; // Importe os tipos corrigidos
import { mockData as contextosAbertos } from "./contextos";
import { Contexto, StatusContexto, DocType } from "@/components/validar/typesDados";

// Função mapContextoStatusToNotifStatus (sem alterações)
function mapContextoStatusToNotifStatus(status: StatusContexto): NotificationStatus | undefined {
    switch (status) {
        case StatusContexto.Deferido:
        case StatusContexto.Publicado:
            return "deferido";
        case StatusContexto.Indeferido:
        case StatusContexto.AguardandoCorrecao:
            return "indeferido";
        case StatusContexto.AguardandoGerente:
        case StatusContexto.AguardandoDiretor:
            return undefined;
        default:
            return undefined;
    }
}

// Função generateNotificationDescription (sem alterações)
function generateNotificationDescription(contexto: Contexto): string {
     switch (contexto.situacao) {
        case StatusContexto.AguardandoGerente:
            return `Novo contexto "${contexto.nome}" submetido por ${contexto.solicitante}. Aguardando sua análise.`;
        case StatusContexto.AguardandoDiretor:
            return `Contexto "${contexto.nome}" aprovado pelo gerente. Aguardando sua análise.`;
        case StatusContexto.AguardandoCorrecao:
             const ultimoHistorico = contexto.historico?.[contexto.historico.length - 1];
             const motivo = ultimoHistorico?.acao.includes("Justificativa:")
                 ? ultimoHistorico.acao.split("Justificativa:")[1]?.trim()
                 : "Verificar comentários.";
            return `Contexto "${contexto.nome}" devolvido para correção. Motivo: ${motivo}`;
        case StatusContexto.Publicado:
             return `O contexto "${contexto.nome}" foi publicado com sucesso.`;
        case StatusContexto.Deferido:
             return `O contexto "${contexto.nome}" foi deferido.`;
        case StatusContexto.Indeferido:
             return `O contexto "${contexto.nome}" foi indeferido.`;
        default:
            return `Status do contexto "${contexto.nome}": ${contexto.situacao}`;
    }
}

// --- COMENTÁRIOS MOCKADOS ORIGINAIS ---
const mockCommentsContexto1: Comment[] = [
    { id: 101, author: "Gerência Financeira", text: "O documento foi rejeitado devido a divergências no valor.", time: "10:30", date: "04/08/2025", isMyComment: false, role: "gerencia" },
    { id: 102, author: "Pedro Augusto Lorenzo", text: "Ok, irei verificar e reenviar.", time: "10:35", date: "04/08/2025", isMyComment: false, role: "user" },
];
const mockCommentsContexto2: Comment[] = [
     { id: 201, author: "João Silva (Gerente)", text: "Falta a coluna 'Fonte do Recurso'. Por favor, adicione e reenvie.", time: "09:00", date: "04/08/2025", isMyComment: false, role: "gerencia" },
];
// --- FIM DOS COMENTÁRIOS MOCKADOS ---

// Função getCommentsForContexto (sem alterações na lógica interna, apenas na tipagem do argumento)
function getCommentsForContexto(contexto: Contexto): Comment[] {
    let comments: Comment[] = [];
    if (contexto.id === "1") comments = [...mockCommentsContexto1];
    if (contexto.id === "2") comments = [...mockCommentsContexto2];

    if (contexto.situacao === StatusContexto.AguardandoCorrecao && contexto.historico) {
        const rejectionEvent = contexto.historico.find(
            h => h.acao.toLowerCase().includes("devolvido para correção") || h.acao.toLowerCase().includes("análise gerente: indeferido") || h.acao.toLowerCase().includes("análise diretor: indeferido")
        );
        if (rejectionEvent) {
             let text = "Contexto devolvido para correção.";
            if (rejectionEvent.acao.includes("Justificativa:")) {
                text = rejectionEvent.acao.split("Justificativa:")[1]?.trim() || text;
            } else if (rejectionEvent.acao.includes("Motivo:")) {
                 text = rejectionEvent.acao.split("Motivo:")[1]?.trim() || text;
            }
            const eventDate = new Date(rejectionEvent.data);
            const extractedCommentId = Date.now() + Math.random();
            const alreadyExists = comments.some(c => c.author === rejectionEvent.autor && c.text.includes(text.substring(0, 30)));

            if (!alreadyExists) {
                comments.push({
                    id: extractedCommentId, author: rejectionEvent.autor, text: text,
                    time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    date: eventDate.toLocaleDateString('pt-BR'), isMyComment: false,
                    role: rejectionEvent.autor.toLowerCase().includes("gerente") ? "gerencia" :
                          rejectionEvent.autor.toLowerCase().includes("diretor") ? "diretoria" : "info",
                });
            }
        }
    }
    try {
        comments.sort((a, b) => {
            const dateTimeStringA = `${a.date.split('/').reverse().join('-')}T${a.time}:00`;
            const dateTimeStringB = `${b.date.split('/').reverse().join('-')}T${b.time}:00`;
            const dateA = new Date(dateTimeStringA);
            const dateB = new Date(dateTimeStringB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA.getTime() - dateB.getTime();
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
const dynamicNotifications: Notification[] = contextosAbertos
    .map(contexto => {

        // --- CORREÇÃO NA ATRIBUIÇÃO DE TIPOS ---
        // Garante que o tipo do contexto seja um tipo válido para relatedFileType
        const validRelatedFileTypes: Array<Notification['relatedFileType']> = ["doc", "planilha", "excel", "pdf", "dashboard", "resolucao", "link"];
        let fileTypeForRelated: Notification['relatedFileType'] = undefined;
        if (validRelatedFileTypes.includes(contexto.docType as any)) {
             fileTypeForRelated = contexto.docType as Notification['relatedFileType'];
        }

        // Determina o tipo principal da notificação
        let notificationType: NotificationType;
        if (contexto.situacao === StatusContexto.AguardandoCorrecao) {
             notificationType = 'comentario';
        // Mapeia 'excel' para 'planilha' no tipo principal da notificação
        } else if (contexto.docType === 'excel') {
            notificationType = 'planilha';
        } else {
            // Garante que apenas tipos válidos de NotificationType sejam usados
             const validNotificationTypes: NotificationType[] = ["doc", "excel", "pdf", "comentario", "sistema", "dashboard", "resolucao", "link"];
             if (validNotificationTypes.includes(contexto.docType as any)) {
                  notificationType = contexto.docType as NotificationType;
             } else {
                 notificationType = 'doc'; // Usa 'doc' como fallback se o docType não for reconhecido
             }
        }
        // --- FIM DA CORREÇÃO ---

        const notification: Notification = {
            id: notificationIdCounter++,
            type: notificationType, // Usa o tipo principal ajustado
            title: contexto.nome,
            description: generateNotificationDescription(contexto),
            status: mapContextoStatusToNotifStatus(contexto.situacao),
            contextoId: contexto.id,
            url: contexto.url,
            comments: getCommentsForContexto(contexto),
            relatedFileType: fileTypeForRelated, // Usa o tipo validado para relatedFileType
        };
        return notification;
    });

// --- NOTIFICAÇÕES ESTÁTICAS (Ex: Sistema) ---
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

// --- COMBINA E EXPORTA ---
export const notificationsData: Notification[] = [
    ...dynamicNotifications,
    ...staticNotifications,
];

// Reexporta os tipos
export type { Notification, NotificationType, NotificationStatus, Comment };