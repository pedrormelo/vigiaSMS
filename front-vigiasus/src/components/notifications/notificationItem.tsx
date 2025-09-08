import Image from "next/image";
import { Notification } from "@/constants/notificationsData";

interface NotificationItemProps {
  notification: Notification;
  isActive: boolean;
  onClick: () => void;
}

export default function NotificationItem({
  notification,
  isActive,
  onClick,
}: NotificationItemProps) {
  const { title, description, status, type } = notification;

  const getStatusColor = () => {
    switch (status) {
      case "deferido":
        return "text-green-600";
      case "indeferido":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "doc":
        return "/icons/doc-icon.svg";
      case "planilha":
      case "planilha":
        return "/icons/planilha-icon.svg";
      case "comentario":
        return "/icons/system.svg";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 p-4 rounded-lg text-left transition ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "bg-white text-gray-800 hover:bg-gray-100"
      }`}
    >
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          isActive ? "bg-white" : "bg-blue-100"
        }`}
      >
        <Image
          src={getIcon()}
          alt="Ícone da notificação"
          width={20}
          height={20}
        />
      </div>
      <div className="flex-1">
        <h3
          className={`font-semibold text-lg leading-tight ${
            isActive ? "text-white" : "text-blue-700"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-tight mt-1 ${
            isActive ? "text-white" : getStatusColor()
          }`}
        >
          {description}
        </p>
      </div>
    </button>
  );
}