"use client";

import SpinnerCarregamento from "./spinner-carregamento";

interface GlobalLoadingProps {
  message?: string;
  subMessage?: string;
}

/**
 * Componente de loading global para tela cheia
 * Responsivo para mobile, tablet e desktop
 * Agora usa o SpinnerCarregamento padronizado
 */
export default function GlobalLoading({
  message = "Carregando...",
  subMessage,
}: GlobalLoadingProps) {
  return (
    <div className="w-full bg-white pb-[80px] md:pb-0">
      <SpinnerCarregamento
        mensagem={message}
        subMensagem={subMessage}
        tamanho="grande"
        // Em mobile não ocupamos a tela inteira: usamos o espaço entre os navbars.
        centralizarTela={false}
        className="min-h-[calc(100vh-120px)] md:min-h-screen flex"
      />
    </div>
  );
}
