// src/components/tour/AppTour.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useTour } from "@/contexts/tourContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppTour() {
  const { isTourOpen, activeStepData, nextStep, stopTour, currentStep, totalSteps } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  // Atualiza a posição do destaque quando o passo muda ou a tela redimensiona
  useEffect(() => {
    if (!isTourOpen || !activeStepData) return;

    const updatePosition = () => {
      const element = document.getElementById(activeStepData.targetId);
      if (element) {
        // Scroll suave até o elemento se ele estiver fora da tela
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTargetRect(element.getBoundingClientRect());
      }
    };

    // Pequeno delay para garantir que o DOM renderizou
    setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isTourOpen, activeStepData]);

  if (!isTourOpen || !targetRect || !activeStepData) return null;

  // Cálculos para posicionar o balão (Popover)
  const popoverStyle: React.CSSProperties = {};
  const padding = 10; // Espaço entre o elemento e o destaque
  
  // Posição do balão baseada na preferência (simplificada)
  if (activeStepData.position === "bottom" || !activeStepData.position) {
     popoverStyle.top = targetRect.bottom + padding + 10;
     popoverStyle.left = targetRect.left;
  } else if (activeStepData.position === "top") {
     popoverStyle.bottom = window.innerHeight - targetRect.top + padding + 10;
     popoverStyle.left = targetRect.left;
  } else if (activeStepData.position === "right") {
     popoverStyle.top = targetRect.top;
     popoverStyle.left = targetRect.right + padding + 10;
  }

  // Limita para não sair da tela na direita
  const maxWidth = 320;
  const isOffScreenRight = (targetRect.left + maxWidth) > window.innerWidth;
  if (isOffScreenRight) {
      popoverStyle.left = "auto";
      popoverStyle.right = 20;
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