// src/components/notifications/notificationItem.tsx
import { Notification } from "@/constants/types";
import { cn } from "@/lib/utils";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FileType } from "@/components/contextosCard/contextoCard";
//  IMPORTAR ÍCONES PARA TIPOS QUE NÃO SÃO ARQUIVOS
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

  //  LÓGICA DE RENDERIZAÇÃO DO ÍCONE ATUALIZADA
  const renderIcon = () => {
    // Se for 'sistema', usa o ícone de Configurações
    if (type === 'sistema') {
      return <Settings className="w-5 h-5 text-blue-600" />;
    }

    // Tenta obter o tipo de arquivo (se for comentário, usa o arquivo relacionado)
    const iconTypeForFile = (type === 'comentario' && relatedFileType ? relatedFileType : type) as FileType;

    // Lista de tipos de arquivo que o IconeDocumento conhece
    const validFileTypes: FileType[] = ["doc", "planilha", "pdf", "dashboard", "resolucao", "link", "apresentacao", "indicador", "leis"];

    // Se for um tipo de arquivo válido, usa o IconeDocumento
    if (validFileTypes.includes(iconTypeForFile)) {
      return <IconeDocumento type={iconTypeForFile}/>;
    }

    // Fallback para 'comentario' sem arquivo relacionado
    if (type === 'comentario') {
      return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }

    // Fallback genérico (caso algum tipo novo apareça)
    return <IconeDocumento type={'doc'} />;
  };

  // Define a cor da descrição baseada no status (sem alteração)
  const statusColor = status === 'deferido'
    ? 'text-green-600'
    : status === 'indeferido'
      ? 'text-red-600'
      : 'text-gray-600'; // Cor padrão

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
      {/* Indicador não lido (bolinha azul) */}
      {!isRead && (
        <span
          className="absolute top-3 left-6 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"
          aria-label="Não lida"
        />
      )}

      {/* Container do Ícone */}
      <div className={cn(
        "w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-md mt-0.5",
        isActive ? "bg-white" : "bg-gray-100/60", // Fundo do ícone
        !isRead ? "ml-4" : "" // Adiciona margem se a bolinha "não lido" estiver presente
      )}>
        {/* CHAMA A NOVA FUNÇÃO DE RENDERIZAÇÃO */}
          {renderIcon()}  
      </div>

      {/* Textos */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-sm leading-snug line-clamp-1",
            // Texto branco quando ativo, caso contrário usa cinza escuro
            isActive ? "text-white" : "text-blue-700",
            !isRead && "font-semibold" // Título mais grosso se não lido
          )}
          title={title}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-xs leading-snug mt-1 line-clamp-1", // Descrição menor
            // Se ativo, descrição também fica branca; caso contrário, mostrar cor por status
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