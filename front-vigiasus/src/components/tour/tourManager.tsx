// src/components/tour/TourManager.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTour } from "@/contexts/tourContext";
import { APP_TOURS } from "@/constants/tourData";

export default function TourManager() {
  const pathname = usePathname();
  const { startTour, isTourOpen } = useTour();

  useEffect(() => {
    // Pequeno delay para garantir que a página carregou e os elementos (IDs) existem
    const timer = setTimeout(() => {
      // Se já tem um tour rodando, não faz nada
      if (isTourOpen) return;

      // Procura na configuração se a rota atual tem um tour
      const tourConfig = APP_TOURS.find((t) => t.routeMatch(pathname));

      if (tourConfig) {
        // Verifica se o usuário já viu este tour específico
        const hasSeen = localStorage.getItem(`vigiasus:tour-completed:${tourConfig.key}`);

        if (!hasSeen) {
          startTour(tourConfig.steps, () => {
            // Callback: Quando o tour terminar, marca como visto
            localStorage.setItem(`vigiasus:tour-completed:${tourConfig.key}`, "true");
          });
        }
      }
    }, 1000); // Espera 1 segundo após a mudança de rota

    return () => clearTimeout(timer);
  }, [pathname, startTour, isTourOpen]);

  return null; // Componente invisível, apenas lógica
}