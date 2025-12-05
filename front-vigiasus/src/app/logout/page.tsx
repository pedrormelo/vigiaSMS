// src/app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import SpinnerCarregamento from "@/components/ui/spinner-carregamento";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authService.logout();
    router.replace("/login");
  }, [router]);

  return (
    <SpinnerCarregamento
      mensagem="Saindo..."
      subMensagem="A encerrar a sua sessão com segurança."
      tamanho="medio"
      centralizarTela={true}
    />
  );
}