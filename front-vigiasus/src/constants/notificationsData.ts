export type NotificationType = "doc" | "planilha" | "comentario" | "sistema" | "pdf";

export type NotificationStatus = "deferido" | "indeferido" | "visto";

export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
  date: string;
  isMyComment: boolean;
  role: "info" | "secretaria" | "diretoria" | "gerencia" | "user" | "zelma";
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
        role: "gerencia",
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
        role: "gerencia",
      },
      {
        id: 2,
        author: "Diretoria RH",
        text: "Precisamos de mais informações para analisar a planilha.",
        time: "15:00",
        date: "04/08/2025",
        isMyComment: false,
        role: "secretaria",
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
    type: "doc",
    title: "TESTE",
    description: "TESTE 1",
    status: "indeferido",
    relatedFileType: "doc",
    comments: [
      {
        id: 1,
        author: "Zelma Pessoa",
        text: "Não gostei, contexto muito desorganizado, melhorem por favor.",
        time: "20:00",
        date: "04/08/2025",
        isMyComment: false,
        role: "zelma",
      },
      {
        id: 2,
        author: "Nilton Carvalho",
        text: "Rapaz, ajude aí. Precisamos rever esse documento, Zelma encontrou alguns erros no documento.",
        time: "21:00",
        date: "04/08/2025",
        isMyComment: false,
        role: "diretoria",
      },
      {
        id: 3,
        author: "Gerência de Tecnologia da Informação",
        text: "Precisamos de mais informações para analisar o documento.",
        time: "22:00",
        date: "04/08/2025",
        isMyComment: false,
        role: "gerencia",
      },
      {
        id: 4,
        author: "Secretário 1",
        text: "xaropagem.",
        time: "22:10",
        date: "04/08/2025",
        isMyComment: false,
        role: "secretaria",
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
        role: "gerencia",
      },
    ],
  },
  {
    id: 7,
    type: "pdf",
    title: "teste 2",
    description: "O documento foi deferido",
    status: "deferido",
    comments: [],
  },
  {
    id: 8,
    type: "planilha",
    title: "teste 2",
    description: "O documento foi deferido",
    status: "deferido",
    comments: [],
  },
    {
    id: 9,
    type: "sistema",
    title: "teste 2",
    description: "O documento foi deferido",
    status: "deferido",
    comments: [],
  },
];