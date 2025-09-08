export type NotificationType = "doc" | "planilha" | "comentario";

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
}

export const notificationsData: Notification[] = [
  {
    id: 1,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [], // Sem comentários para este exemplo
  },
  {
    id: 2,
    type: "comentario",
    title: "Nova atualização do Sistema",
    description: "Veja as novidades desta nova versão!",
    status: "visto",
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
        text: "Rapaz, ajude aí. Precisamos rever esse documento, Zelma encontrou alguns erros no documento",
        time: "21:00",
        date: "04/08/2025",
        isMyComment: true,
      },
    ],
  },
  {
    id: 3,
    type: "planilha",
    title: "Servidores Ativos (efetivos, co...)",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [],
  },
  {
    id: 4,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi deferido",
    status: "deferido",
    comments: [],
  },
  {
    id: 5,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [],
  },
  {
    id: 6,
    type: "doc",
    title: "Pagamento ESF / ESB",
    description: "O documento foi indeferido",
    status: "indeferido",
    comments: [],
  },
];