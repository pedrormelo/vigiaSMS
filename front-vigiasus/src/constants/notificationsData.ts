export type NotificationType = "doc" | "planilha" | "comentario" | "sistema" | "pdf";

export type NotificationStatus = "deferido" | "indeferido" | "visto";

export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
  date: string;
  isMyComment: boolean;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  status?: NotificationStatus;
  comments: Comment[];
  relatedFileType?: "doc" | "planilha" | "pdf";
}

export const notificationsData: Notification[] = [
  {
    id: 1,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [
      {
        id: 1,
        author: "Gerência Financeira",
        text: "O documento foi rejeitado devido a divergências no valor.",
        time: "10:30",
        date: "04/08/2025",
        isMyComment: false,
      },
    ],
  },
  {
    id: 2,
    type: "sistema",
    title: "Nova atualização do Sistema",
    description: "Veja as novidades desta nova versão!",
    status: "visto",
    comments: [],
  },
  {
    id: 3,
    type: "planilha",
    title: "Servidores Ativos (efetivos, co...)",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [
      {
        id: 1,
        author: "Departamento de RH",
        text: "Planilha indeferida por falta de dados de alguns colaboradores.",
        time: "14:00",
        date: "04/08/2025",
        isMyComment: false,
      },
    ],
  },
  {
    id: 4,
    type: "pdf",
    title: "Pagamento ESF / ESB",
    description: "O documento foi deferido",
    status: "deferido",
    comments: [],
  },
  {
    id: 5,
    type: "comentario",
    title: "Pagamento ESF / ESB",
    description: "Um novo comentário foi feito no documento",
    status: "visto",
    relatedFileType: "doc",
    comments: [
      {
        id: 1,
        author: "Zelma Pessoa",
        text: "Não gostei, contexto muito desorganizado, melhorem por favor.",
        time: "20:00",
        date: "04/08/2025",
        isMyComment: false,
      },
      {
        id: 2,
        author: "Nilton Carvalho",
        text: "Rapaz, ajude aí. Precisamos rever esse documento, Zelma encontrou alguns erros no documento.",
        time: "21:00",
        date: "04/08/2025",
        isMyComment: true,
      },
    ],
  },
  {
    id: 6,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [
      {
        id: 1,
        author: "Gerência de Planejamento",
        text: "Este documento não corresponde ao padrão esperado. Favor, revisar.",
        time: "16:45",
        date: "04/08/2025",
        isMyComment: false,
      },
    ],
  },
];