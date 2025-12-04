// src/components/tour/AppTour.tsx
"use client";

import { useEffect, useState } from "react";
import { useTour } from "@/contexts/tourContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppTour() {
  const { isTourOpen, activeStepData, nextStep, stopTour, currentStep, totalSteps } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isTourOpen || !activeStepData) return;
    activeStepData.onEnter?.();
  }, [isTourOpen, activeStepData]);
  
  // Atualiza a posição do destaque quando o passo muda ou a tela redimensiona
  useEffect(() => {
    if (!isTourOpen || !activeStepData) {
      setTargetRect(null);
      return;
    }

    let rafId: number | null = null;
    let retryTimeoutId: number | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 12;

    const updatePosition = () => {
      const element = document.getElementById(activeStepData.targetId);
      if (!element) {
        setTargetRect(null);
        if (attempts >= MAX_ATTEMPTS) {
          nextStep();
          return;
        }
        attempts += 1;
        retryTimeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(updatePosition);
        }, 150);
        return;
      }

      element.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 1 && rect.height > 1;
      const isOffscreen = rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight;

      if (!hasSize || isOffscreen) {
        if (attempts >= MAX_ATTEMPTS) {
          nextStep();
          return;
        }
        attempts += 1;
        retryTimeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(updatePosition);
        }, 160);
        return;
      }
      const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!fullyVisible) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        rafId = window.requestAnimationFrame(() => {
          setTargetRect(element.getBoundingClientRect());
        });
      } else {
        setTargetRect(rect);
      }
    };

    const scheduleUpdate = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updatePosition);
    };

    const resizeListener = () => scheduleUpdate();
    const scrollListener = () => scheduleUpdate();

    const timeoutId = window.setTimeout(updatePosition, 120);

    window.addEventListener("resize", resizeListener);
    window.addEventListener("scroll", scrollListener, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      if (retryTimeoutId) window.clearTimeout(retryTimeoutId);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeListener);
      window.removeEventListener("scroll", scrollListener);
    };
  }, [isTourOpen, activeStepData, nextStep]);

  if (!isTourOpen || !targetRect || !activeStepData) return null;

  // Cálculos para posicionar o balão (Popover)
  const popoverStyle: React.CSSProperties = {};
  const padding = 10; // Espaço entre o elemento e o destaque
  const estimatedHeight = 220; // Aproximação para evitar overflow
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const clampHorizontal = (left: number) => {
    const minLeft = 16;
    const maxLeft = viewportWidth - 16 - 320; // 320 = largura máxima aproximada
    if (left < minLeft) return minLeft;
    if (left > maxLeft) return maxLeft;
    return left;
  };

  if (activeStepData.position === "right") {
    const desiredTop = Math.max(targetRect.top, 16);
    popoverStyle.top = Math.min(desiredTop, viewportHeight - estimatedHeight - 16);
    popoverStyle.left = clampHorizontal(targetRect.right + padding + 10);
  } else if (activeStepData.position === "top") {
    const desiredTop = targetRect.top - (estimatedHeight + padding + 10);
    if (desiredTop <= 16) {
      // Sem espaço acima, coloca embaixo
      const fallbackTop = Math.min(targetRect.bottom + padding + 10, viewportHeight - estimatedHeight - 16);
      popoverStyle.top = Math.max(fallbackTop, 16);
    } else {
      popoverStyle.top = desiredTop;
    }
    popoverStyle.left = clampHorizontal(targetRect.left);
  } else {
    // Padrão ou "bottom"
    let desiredTop = targetRect.bottom + padding + 10;
    if (desiredTop + estimatedHeight > viewportHeight - 16) {
      const fallbackTop = targetRect.top - (estimatedHeight + padding + 10);
      desiredTop = Math.max(fallbackTop, 16);
    }
    popoverStyle.top = Math.max(desiredTop, 16);
    popoverStyle.left = clampHorizontal(targetRect.left);
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* O Spotlight (Destaque) */}
      <div
        className="absolute transition-all duration-500 ease-in-out rounded-lg border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* O Balão de Texto (Tooltip) */}
      <div
        className="absolute pointer-events-auto bg-white p-5 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-xs md:max-w-sm"
        style={popoverStyle}
      >
        {/* Seta do balão (decorativa) */}
        {/* <div className="absolute -top-2 left-6 w-4 h-4 bg-white rotate-45" /> */}

        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Dica {currentStep + 1} de {totalSteps}
            </span>
            <button onClick={stopTour} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
            </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{activeStepData.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{activeStepData.description}</p>

        <div className="flex justify-end">
            <Button 
                onClick={nextStep} 
                size="sm" 
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
                {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"} 
                <ChevronRight size={16} className="ml-1" />
            </Button>
        </div>
      </div>
    </div>
  );
}