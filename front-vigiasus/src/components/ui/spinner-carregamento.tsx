// src/components/ui/spinner-carregamento.tsx
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerCarregamentoProps {
  mensagem?: string;
  subMensagem?: string;
  tamanho?: "pequeno" | "medio" | "grande";
  centralizarTela?: boolean;
  className?: string;
}

const tamanhos = {
  pequeno: "w-5 h-5 sm:w-6 sm:h-6",
  medio: "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
  grande: "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16",
};

/**
 * Componente de spinner de carregamento padronizado
 * Responsivo para mobile, tablet e desktop
 * Baseado no design do logout para manter consistência visual
 */
export default function SpinnerCarregamento({
  mensagem = "Carregando...",
  subMensagem,
  tamanho = "medio",
  centralizarTela = false,
  className,
}: SpinnerCarregamentoProps) {
  const containerClasses = centralizarTela
    ? "flex flex-col items-center justify-center min-h-screen w-full bg-white px-4 sm:px-6"
    : "flex flex-col items-center justify-center w-full px-4 sm:px-6";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5">
        <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-full">
          <Loader2 className={cn(tamanhos[tamanho], "text-blue-600 animate-spin")} />
        </div>
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">{mensagem}</h2>
          {subMensagem && (
            <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-xs sm:max-w-sm md:max-w-md">{subMensagem}</p>
          )}
        </div>
      </div>
    </div>
  );
}
