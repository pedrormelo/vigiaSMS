// src/components/notifications/notificationList.tsx
import { Notification } from "@/constants/types";
import NotificationItem from "@/components/notifications/notificationItem";
// IMPORTAR ÍCONES E UTILITÁRIOS
import { cn } from "@/lib/utils";
import { Inbox, CheckCircle, Settings, MessageCircleMore } from "lucide-react";

// EXPORTAR O TIPO DE FILTRO
export type ActiveFilter = "all" | "unread" | "system";

// ATUALIZAR AS PROPS
interface NotificationListProps {
  notifications: Notification[]; // Esta lista agora vem PRÉ-FILTRADA
  activeNotificationId: number | null;
  onSelectNotification: (id: number) => void;
  readNotifications: Set<number>;
  totalUnreadCount: number; // Contagem total (não filtrada)
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

// DEFINIR OS BOTÕES DE FILTRO
const filters: { id: ActiveFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "Não Lidas" },
  { id: "system", label: "Sistema" },
];

// CRIAR UM COMPONENTE PARA ESTADO VAZIO (quando o filtro não retorna nada)
const EmptyFilterState = ({ filter }: { filter: ActiveFilter }) => {
  const config = {
    all: {
      icon: <Inbox className="h-12 w-12 mb-4 text-gray-300" />,
      text: "Nenhuma notificação encontrada." // (Não deve acontecer se a lista principal já foi checada)
    },
    unread: {
      icon: <CheckCircle className="h-12 w-12 mb-4 text-green-300" />,
      text: "Nenhuma notificação não lida."
    },
    system: {
      icon: <Settings className="h-12 w-12 mb-4 text-blue-300" />,
      text: "Nenhuma notificação do sistema."
    }
  };
  const { icon, text } = config[filter];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
      {icon}
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};


export default function NotificationList({
  notifications, // Lista pré-filtrada
  activeNotificationId,
  onSelectNotification,
  readNotifications,
  totalUnreadCount, // 6. USAR A CONTAGEM TOTAL
  activeFilter,
  onFilterChange,
}: NotificationListProps) {

  return (
    <div className="flex flex-col h-full w-full bg-white shadow-sm">

      {/* Cabeçalho Fixo da Lista */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="inline-flex items-center gap-2 mb-1 text-blue-800">
          <h3 className="text-lg font-semibold text-blue-800">
            Caixa de Entrada
          </h3>
          <MessageCircleMore className="h-5 w-5"/>
        </div>
        {/* USA O totalUnreadCount (vinda do modal) */}
        <p className="text-sm text-gray-600">
          {totalUnreadCount > 0
            ? `${totalUnreadCount} ${totalUnreadCount === 1 ? 'não lida' : 'não lidas'} no total`
            : 'Nenhuma notificação nova'}
        </p>

        {/*  BARRA DE FILTROS ADICIONADA */}
        <div className="flex justify-center items-center bg-gray-100 rounded-xl gap-2 p-1 mt-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "px-4 py-1.5 rounded-xl shadow-2xs text-sm font-semibold transition-colors",
                activeFilter === filter.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white/80 text-gray-70 hover:bg-gray-300"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA COM SCROLL E LÓGICA DE ESTADO VAZIO */}
      <div className="flex-1 w-full h-full overflow-y-auto scrollbar-custom">
        {notifications.length > 0 ? (
          // Se houver itens no filtro, renderiza a lista
          <div className="flex flex-col gap-2 p-3">
            {notifications.map((notification) => {
              const isRead = readNotifications.has(notification.id);
              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isActive={notification.id === activeNotificationId}
                  onClick={() => onSelectNotification(notification.id)}
                  isRead={isRead}
                />
              );
            })}
          </div>
        ) : (
          // Se a lista filtrada estiver vazia, mostra o estado vazio
          <EmptyFilterState filter={activeFilter} />
        )}
      </div>
    </div>
  );
}