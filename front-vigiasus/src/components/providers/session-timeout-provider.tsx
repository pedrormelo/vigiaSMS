// src/components/providers/session-timeout-provider.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/authService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Timer, LogOut } from "lucide-react";

// Tempo limite em milissegundos (15 minutos)
// Para testar, você pode mudar para 10 * 1000 (10 segundos)
const INACTIVITY_LIMIT = 15 * 60 * 1000; 

export default function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotas públicas onde o timeout não deve ocorrer
  const publicRoutes = ["/login", "/esqueci-senha", "/404"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const handleLogout = useCallback(() => {
    // Fecha o modal
    setIsTimeoutOpen(false);
    // Limpa dados
    authService.logout();
    // Redireciona
    router.push("/login");
  }, [router]);

  const checkInactivity = useCallback(() => {
    // Se já estiver no modal ou rota pública, não faz nada
    if (isTimeoutOpen || isPublicRoute) return;

    const now = Date.now();
    const timeLeft = lastActivityRef.current + INACTIVITY_LIMIT - now;

    if (timeLeft <= 0) {
      // Tempo esgotou!
      // 1. Removemos o token silenciosamente para impedir novas requisições
      authService.logout(); 
      // 2. Abrimos o modal
      setIsTimeoutOpen(true);
    }
  }, [isTimeoutOpen, isPublicRoute]);

  useEffect(() => {
    if (isPublicRoute) return;

    // Função que reseta o contador de atividade
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Eventos que consideramos "atividade"
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    // Adiciona listeners
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Configura o intervalo de verificação (checa a cada 10 segundos)
    // Usamos setInterval em vez de setTimeout para evitar criar/destruir timers a cada movimento de mouse
    const intervalId = setInterval(checkInactivity, 10000);

    return () => {
      // Limpeza
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [checkInactivity, isPublicRoute]);

  // Se for rota pública, renderiza apenas os filhos sem monitoramento
  if (isPublicRoute) return <>{children}</>;

  return (
    <>
      {children}

      <Dialog open={isTimeoutOpen} onOpenChange={() => {}}>
        {/* onOpenChange vazio e sem botão de fechar padrão 
            força o usuário a clicar no botão de login 
        */}
        <DialogContent className="max-w-xs sm:max-w-[400px] bg-white border-red-100 shadow-2xl [&>button]:hidden mx-auto">
          <DialogHeader className="flex flex-col items-center text-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-red-50 rounded-full flex items-center justify-center">
                <Timer className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <DialogTitle className="text-lg sm:text-xl text-gray-800">
              Sessão Expirada
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base text-gray-600">
              Por medidas de segurança, sua sessão foi encerrada devido a 15 minutos de inatividade.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center mt-3 sm:mt-4 pb-2">
            <Button 
                onClick={handleLogout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 sm:py-6 text-sm sm:text-base font-medium flex items-center gap-2 justify-center"
            >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                Fazer Login Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}