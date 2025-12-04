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
    const timer = window.setTimeout(() => {
      if (isTourOpen) return;

      const tourConfig = APP_TOURS.find((t) => t.routeMatch(pathname));
      if (!tourConfig) return;

      const hasSeen = localStorage.getItem(`vigiasus:tour-completed:${tourConfig.key}`);
      if (hasSeen) return;

      tourConfig.onStart?.();

      if (!tourConfig.steps.length) return;

      startTour(tourConfig.steps, () => {
        localStorage.setItem(`vigiasus:tour-completed:${tourConfig.key}`, "true");
        tourConfig.onFinish?.();
      });
    }, 1000); // Espera 1 segundo após a mudança de rota

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, startTour, isTourOpen]);

  return null; // Componente invisível, apenas lógica
}