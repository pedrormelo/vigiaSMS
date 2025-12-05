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
  pequeno: "w-6 h-6",
  medio: "w-10 h-10",
  grande: "w-12 h-12",
};

/**
 * Componente de spinner de carregamento padronizado
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
    ? "flex flex-col items-center justify-center min-h-screen w-full bg-white"
    : "flex flex-col items-center justify-center w-full";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <Loader2 className={cn(tamanhos[tamanho], "text-blue-600 animate-spin")} />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">{mensagem}</h2>
          {subMensagem && (
            <p className="text-sm text-gray-500 max-w-md">{subMensagem}</p>
          )}
        </div>
      </div>
    </div>
  );
}
