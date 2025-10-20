// src/components/systemUpdate/systemUpdateNotification.tsx
"use client";

import { Notification } from "@/constants/notificationsData";
import { toast } from "sonner";
import Image from "next/image";
import { CheckCircle2, Info } from "lucide-react"; // Usar Info para o ícone principal
import { Button } from "@/components/ui/button"; // Usar Button
import { showSuccessToast } from "@/components/ui/Toasts"; // Usar o Toast padrão

interface NotificationProps {
  notification: Notification;
}

export default function SystemUpdateView({ notification }: NotificationProps) {
  const handleUnderstood = () => {
    // Lógica para marcar como entendido (pode ser enviada para o backend no futuro)
    showSuccessToast("Atualização marcada como entendida.");
    // Aqui você pode querer chamar uma função passada por props para atualizar o estado global
  };

  return (
    // Adicionado padding, flex layout, e scroll se necessário
    <div className="flex flex-col h-full p-6 gap-4 overflow-y-auto scrollbar-custom bg-white">
        {/* Conteúdo centralizado */}
        <div className="flex flex-col items-center text-center gap-4 flex-1 justify-center">
            {/* Ícone maior */}
            <div className="p-3 bg-blue-100 rounded-full mb-2">
                <Info className="w-10 h-10 text-blue-600" />
            </div>
            {/* Título e Descrição */}
            <h3 className="text-xl font-bold text-blue-700">{notification.title}</h3>
            <p className="text-gray-600 leading-relaxed max-w-md">{notification.description}</p>

            {/* Caixa de Novidades */}
            <div className="w-full mt-4 p-4 border border-blue-200 rounded-xl bg-blue-50/50 text-left">
                <p className="font-semibold mb-2 text-blue-800">O que há de novo:</p>
                {/* Exemplo de lista, pode vir do backend */}
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Novas funcionalidades de filtro de dados.</li>
                <li>Melhorias de performance na busca de gerências.</li>
                <li>Correção de bug na exibição de documentos PDF.</li>
                <li>Interface da Central de Notificações atualizada.</li>
                </ul>
            </div>
        </div>

        {/* Rodapé com botão */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
                onClick={handleUnderstood}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
                Entendido
            </Button>
        </div>
    </div>
  );
}