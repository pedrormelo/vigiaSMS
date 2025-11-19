// src/components/notifications/notificationItem.tsx
import { Notification } from "@/constants/types";
import { cn } from "@/lib/utils";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FileType } from "@/components/contextosCard/contextoCard";
import { Settings, MessageSquare } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  isActive: boolean;
  onClick: () => void;
  isRead?: boolean;
}

export default function NotificationItem({
  notification,
  isActive,
  onClick,
  isRead,
}: NotificationItemProps) {
  const { title, description, status, type, relatedFileType } = notification;

  //  LÓGICA DE RENDERIZAÇÃO DO ÍCONE ATUALIZADA E CORRIGIDA
  const renderIcon = () => {
    // 1. Se for notificação de sistema puro (configurações), mantém o ícone de engrenagem
    if (type === 'sistema') {
      return <Settings className="w-5 h-5 text-blue-600" />;
    }

    // 2. Se tivermos um tipo de arquivo relacionado (PDF, Dashboard, etc.), USAREMOS ELE.
    // A correção principal está aqui: removemos a restrição "type === 'comentario'"
    if (relatedFileType) {
        const validFileTypes: FileType[] = ["doc", "planilha", "pdf", "dashboard", "resolucao", "link", "apresentacao", "indicador", "leis"];
        
        // Verifica se é um tipo conhecido pelo componente de ícone
        if (validFileTypes.includes(relatedFileType as FileType)) {
            return <IconeDocumento type={relatedFileType as FileType}/>;
        }
    }

    // 3. Se não tiver arquivo relacionado e for comentário, usa o balão de fala
    if (type === 'comentario') {
      return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }

    // 4. Fallback genérico (usa doc se não soubermos o que é)
    return <IconeDocumento type={'doc'} />;
  };

  // Define a cor da descrição baseada no status
  const statusColor = status === 'deferido'
    ? 'text-green-600'
    : status === 'indeferido'
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start cursor-pointer gap-3 p-3 rounded-xl text-left transition-all w-full relative",
        "border border-transparent",
        isActive
          ? "bg-blue-500 border-blue-500 text-white shadow-sm"
          : "hover:bg-gray-100",
        isRead && !isActive && "opacity-70 hover:opacity-100"
      )}
    >
      {!isRead && (
        <span
          className="absolute top-3 left-6 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"
          aria-label="Não lida"
        />
      )}

      <div className={cn(
        "w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-md mt-0.5",
        isActive ? "bg-white" : "bg-gray-100/60",
        !isRead ? "ml-4" : ""
      )}>
          {renderIcon()}  
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-sm leading-snug line-clamp-1",
            isActive ? "text-white" : "text-blue-700",
            !isRead && "font-semibold"
          )}
          title={title}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-xs leading-snug mt-1 line-clamp-1",
            isActive ? "text-white" : statusColor
          )}
          title={description}
        >
          {description}
        </p>
      </div>
    </button>
  );
}