"use client";

import { Notification } from "@/constants/notificationsData";
import { toast } from "sonner";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface NotificationProps {
  notification: Notification;
}

// Componente de Toast Personalizado
const ReadToast = () => {
  return (
    <div className="flex w-full items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4 shadow-lg transition-all duration-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-200">
        <CheckCircle2 className="text-green-600" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800">Sucesso!</h3>
        <p className="mt-1 text-xs text-gray-600">Notificação marcada como lida.</p>
      </div>
    </div>
  );
};

export default function SystemUpdateView({ notification }: NotificationProps) {
  const handleUnderstood = () => {
    // Lógica para marcar como entendido
    toast.custom(ReadToast);
  };

  return (
    <div className="p-6 flex flex-col items-center text-center gap-4">
      <Image
        src="/icons/system.svg"
        alt="Atualização do Sistema"
        width={60}
        height={60}
      />
      <h3 className="text-xl font-bold text-blue-700">{notification.title}</h3>
      <p className="text-gray-600 leading-relaxed max-w-md">{notification.description}</p>
      <div className="w-full mt-4 p-4 border rounded-lg bg-gray-50 text-left">
        <p className="font-semibold mb-2">O que há de novo:</p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>Novas funcionalidades de filtro de dados.</li>
          <li>Melhorias de performance na busca de gerências.</li>
          <li>Correção de bug na exibição de documentos.</li>
        </ul>
      </div>
      <button
        onClick={handleUnderstood}
        className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Entendido
      </button>
    </div>
  );
}