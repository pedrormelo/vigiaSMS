// src/components/notifications/notificationItem.tsx
import Image from "next/image";
// Certifique-se que o tipo Notification inclui 'relatedFileType'
import { Notification } from "@/constants/types"; // Importar do novo types.ts
import { cn } from "@/lib/utils";

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
  // Desestruturar type e relatedFileType da notificação
  const { title, description, status, type, relatedFileType } = notification;

  const getStatusColor = () => {
    switch (status) {
      case "deferido": return "text-green-600";
      case "indeferido": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  // --- FUNÇÃO getIcon ATUALIZADA ---
  const getIcon = () => {
    // Determina qual tipo usar para o ícone. Se for 'comentario', usa o relatedFileType se existir.
    const iconType = type === 'comentario' && relatedFileType ? relatedFileType : type;

    switch (iconType) {
      // Mapeamento para os ícones de /icons/CONTEXTOS/
      case "doc":
        return "/icons/CONTEXTOS/DOC.svg";
      case "planilha": // Mapeia 'planilha' para o ícone de Excel
      case "excel":
        return "/icons/CONTEXTOS/PLA.svg";
      case "pdf":
        return "/icons/CONTEXTOS/PDF.svg";
      case "dashboard": // Adiciona o tipo dashboard
        return "/icons/CONTEXTOS/GRA.svg";
      case "resolucao": // Adiciona o tipo resolucao
        return "/icons/CONTEXTOS/RES.svg";

      // Mantém ícones específicos para notificação
      case "comentario": // Fallback se não houver relatedFileType
        return "/icons/comentario-icon.svg"; // Ou pode usar um ícone genérico de contexto
      case "sistema":
        return "/icons/system.svg";

      // Fallback genérico
      default:
        return "/icons/default-icon.svg"; // Ou /icons/CONTEXTOS/DOC.svg como padrão?
    }
  };
  // --- FIM DA ATUALIZAÇÃO ---

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start cursor-pointer gap-4 p-4 rounded-2xl text-left transition w-full",
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white text-gray-800 hover:bg-gray-100",
        isRead && !isActive && "opacity-70 hover:opacity-100"
      )}
    >
      {/* Container do Ícone */}
      <div className="relative flex-shrink-0">
         <div className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full",
             isActive ? "bg-white" : "bg-blue-50"
         )}>
            <Image
              src={getIcon()} // Chama a função atualizada
              alt="Ícone da notificação" // Alt pode ser mais descritivo se necessário
              width={24} // Ajustado para talvez acomodar melhor os ícones de contexto
              height={24}
              className="object-contain" // Garante que o ícone caiba sem distorcer
            />
         </div>
         {/* Indicador não lido */}
         {!isRead && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
         )}
      </div>

      {/* Textos */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-base leading-tight truncate",
            isActive ? "text-white" : "text-blue-700"
          )}
          title={title}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-sm leading-tight mt-1 truncate",
            isActive ? "text-blue-100" : getStatusColor()
          )}
           title={description}
        >
          {description}
        </p>
      </div>
    </button>
  );
}