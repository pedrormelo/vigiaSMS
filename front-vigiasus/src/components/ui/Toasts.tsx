"use client";

import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, Send } from "lucide-react"; // 1. Importar o ícone 'Send'

type ToastType = "success" | "error" | "warning" | "info" | "dispatch"; // 2. Adicionar o novo tipo 'dispatch'

interface ToastComponentProps {
  type: ToastType;
  title: string;
  message: string;
}

// Componente de Toast Genérico e Reutilizável
const ToastComponent = ({ type, title, message }: ToastComponentProps) => {
  let icon = <Info size={24} />;
  let iconBgColor = "bg-blue-100";
  let iconColor = "text-blue-600";
  let bgColor = "bg-blue-50";
  let borderColor = "border-blue-200";

  switch (type) {
    case "success":
      icon = <CheckCircle2 size={24} />;
      iconBgColor = "bg-green-200";
      iconColor = "text-green-600";
      bgColor = "bg-green-50";
      borderColor = "border-green-200";
      break;
    case "error":
      icon = <XCircle size={24} />;
      iconBgColor = "bg-red-200";
      iconColor = "text-red-600";
      bgColor = "bg-red-50";
      borderColor = "border-red-200";
      break;
    case "warning":
      icon = <AlertCircle size={24} />;
      iconBgColor = "bg-yellow-200";
      iconColor = "text-yellow-600";
      bgColor = "bg-yellow-50";
      borderColor = "border-yellow-200";
      break;
    case "info":
      icon = <Info size={24} />;
      iconBgColor = "bg-blue-200";
      iconColor = "text-blue-600";
      bgColor = "bg-blue-50";
      borderColor = "border-blue-200";
      break;
    // 3. Adicionar o estilo para o 'dispatch'
    case "dispatch":
      icon = <Send size={24} />;
      iconBgColor = "bg-cyan-200";
      iconColor = "text-cyan-600";
      bgColor = "bg-cyan-50";
      borderColor = "border-cyan-200";
      break;
  }

  return (
    <div className={`flex w-full items-center gap-4 rounded-xl border ${borderColor} ${bgColor} p-4 shadow-lg transition-all duration-300`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="mt-1 text-xs text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Funções para exibir os diferentes tipos de toast
export const showSuccessToast = (message: string, title = "Sucesso!") => {
  toast.custom(() => <ToastComponent type="success" title={title} message={message} />);
};

export const showErrorToast = (message: string, title = "Erro") => {
  toast.custom(() => <ToastComponent type="error" title={title} message={message} />);
};

export const showWarningToast = (message: string, title = "Atenção") => {
  toast.custom(() => <ToastComponent type="warning" title={title} message={message} />);
};

export const showInfoToast = (message: string, title = "Informação") => {
  toast.custom(() => <ToastComponent type="info" title={title} message={message} />);
};

// 4. Nova função para chamar o toast de 'dispatch'
export const showDispatchToast = (message: string, title = "Enviado para Análise!") => {
  toast.custom(() => <ToastComponent type="dispatch" title={title} message={message} />);
};