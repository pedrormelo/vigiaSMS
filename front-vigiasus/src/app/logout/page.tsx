// src/app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authService.logout();
    router.replace("/login");
  }, [router]);

  return (
    // [CORREÇÃO]: min-h-[80vh] força o container a ocupar 80% da altura da tela,
    // garantindo que o footer fique lá em baixo, centralizando o loader verticalmente.
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-white">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-blue-50 rounded-full">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold text-gray-800">Saindo...</h2>
                <p className="text-sm text-gray-500">A encerrar a sua sessão com segurança.</p>
            </div>
        </div>
    </div>
  );
}