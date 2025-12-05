"use client";

import SpinnerCarregamento from "@/components/ui/spinner-carregamento";

export default function Loading() {
  return (
    <SpinnerCarregamento
      mensagem="Preparando tudo para você..."
      tamanho="grande"
      centralizarTela={true}
    />
  );
}
