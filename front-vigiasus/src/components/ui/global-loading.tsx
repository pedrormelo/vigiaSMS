"use client";

import SpinnerCarregamento from "./spinner-carregamento";

interface GlobalLoadingProps {
  message?: string;
  subMessage?: string;
}

/**
 * Componente de loading global para tela cheia
 * Agora usa o SpinnerCarregamento padronizado
 */
export default function GlobalLoading({
  message = "Carregando...",
  subMessage,
}: GlobalLoadingProps) {
  return (
    <div className="min-h-screen w-full">
      <SpinnerCarregamento
        mensagem={message}
        subMensagem={subMessage}
        tamanho="grande"
        centralizarTela={true}
      />
    </div>
  );
}
