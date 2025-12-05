// src/app/validar/historico/loading.tsx
"use client";

import SpinnerCarregamento from "@/components/ui/spinner-carregamento";

export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[500px]">
      <SpinnerCarregamento
        mensagem="A carregar o histórico..."
        tamanho="medio"
      />
    </div>
  );
}