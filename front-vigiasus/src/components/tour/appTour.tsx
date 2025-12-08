// src/components/tour/AppTour.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useTour } from "@/contexts/tourContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ====== CONSTANTES ======
const SCROLL_LOCK_CLASS = "tour-scroll-locked";
const MAX_ELEMENT_SEARCH_ATTEMPTS = 12;
const ELEMENT_SEARCH_RETRY_DELAY_MS = 150;
const INITIAL_POSITION_UPDATE_DELAY_MS = 120;
const POPOVER_PADDING_PX = 10;
const ESTIMATED_POPOVER_HEIGHT_PX = 220;
const VIEWPORT_EDGE_MARGIN_PX = 16;

// ====== HELPERS ======
/**
 * Previne o comportamento padrão de scroll
 */
const preventScroll = (e: Event) => {
  e.preventDefault();
};

/**
 * Aplica bloqueio de scroll ao documento
 */
const lockScroll = () => {
  if (typeof document === "undefined") return;
  document.body.classList.add(SCROLL_LOCK_CLASS);
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  
  // Bloqueia scroll via wheel e touchmove
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
};

/**
 * Remove bloqueio de scroll ao documento
 */
const unlockScroll = () => {
  if (typeof document === "undefined") return;
  document.body.classList.remove(SCROLL_LOCK_CLASS);
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  
  // Remove listeners de prevenção de scroll
  document.removeEventListener("wheel", preventScroll);
  document.removeEventListener("touchmove", preventScroll);
};

export default function AppTour() {
  const { isTourOpen, activeStepData, nextStep, stopTour, currentStep, totalSteps } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const scrollLockRef = useRef(false);

  // ====== GERENCIAMENTO DE LOCK DE SCROLL ======
  /**
   * Efeito para controlar bloqueio/desbloqueio de scroll
   */
  useEffect(() => {
    if (isTourOpen) {
      if (!scrollLockRef.current) {
        lockScroll();
        scrollLockRef.current = true;
      }
    } else {
      if (scrollLockRef.current) {
        unlockScroll();
        scrollLockRef.current = false;
      }
    }

    // Cleanup: garante que o scroll é liberado se o componente desmontar
    return () => {
      if (scrollLockRef.current) {
        unlockScroll();
        scrollLockRef.current = false;
      }
    };
  }, [isTourOpen]);

  // ====== ATUALIZAÇÃO DE POSIÇÃO DO ELEMENTO DESTAQUE ======
  /**
   * Efeito para atualizar a posição do elemento em destaque durante o tour
   */
  useEffect(() => {
    if (!isTourOpen || !activeStepData) {
      setTargetRect(null);
      return;
    }

    let rafId: number | null = null;
    let retryTimeoutId: number | null = null;
    let attempts = 0;

    const updatePosition = () => {
      const element = document.getElementById(activeStepData.targetId);
      if (!element) {
        setTargetRect(null);
        if (attempts >= MAX_ELEMENT_SEARCH_ATTEMPTS) {
          nextStep();
          return;
        }
        attempts += 1;
        retryTimeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(updatePosition);
        }, ELEMENT_SEARCH_RETRY_DELAY_MS);
        return;
      }

      element.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 1 && rect.height > 1;
      const isOffscreen = rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight;

      if (!hasSize || isOffscreen) {
        if (attempts >= MAX_ELEMENT_SEARCH_ATTEMPTS) {
          nextStep();
          return;
        }
        attempts += 1;
        retryTimeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(updatePosition);
        }, ELEMENT_SEARCH_RETRY_DELAY_MS);
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

    const timeoutId = window.setTimeout(updatePosition, INITIAL_POSITION_UPDATE_DELAY_MS);

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

  // ====== CÁLCULO DE POSICIONAMENTO DO POPOVER ======
  /**
   * Calcula a melhor posição para o popover baseado no espaço disponível
   */
  const popoverStyle: React.CSSProperties = {};
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const clampHorizontal = (left: number) => {
    const minLeft = VIEWPORT_EDGE_MARGIN_PX;
    const maxLeft = viewportWidth - VIEWPORT_EDGE_MARGIN_PX - 320; // 320 = largura máxima aproximada
    if (left < minLeft) return minLeft;
    if (left > maxLeft) return maxLeft;
    return left;
  };

  if (activeStepData.position === "right") {
    const desiredTop = Math.max(targetRect.top, VIEWPORT_EDGE_MARGIN_PX);
    popoverStyle.top = Math.min(desiredTop, viewportHeight - ESTIMATED_POPOVER_HEIGHT_PX - VIEWPORT_EDGE_MARGIN_PX);
    popoverStyle.left = clampHorizontal(targetRect.right + POPOVER_PADDING_PX + 10);
  } else if (activeStepData.position === "top") {
    const desiredTop = targetRect.top - (ESTIMATED_POPOVER_HEIGHT_PX + POPOVER_PADDING_PX + 10);
    if (desiredTop <= VIEWPORT_EDGE_MARGIN_PX) {
      // Sem espaço acima, coloca embaixo
      const fallbackTop = Math.min(targetRect.bottom + POPOVER_PADDING_PX + 10, viewportHeight - ESTIMATED_POPOVER_HEIGHT_PX - VIEWPORT_EDGE_MARGIN_PX);
      popoverStyle.top = Math.max(fallbackTop, VIEWPORT_EDGE_MARGIN_PX);
    } else {
      popoverStyle.top = desiredTop;
    }
    popoverStyle.left = clampHorizontal(targetRect.left);
  } else {
    // Padrão ou "bottom"
    let desiredTop = targetRect.bottom + POPOVER_PADDING_PX + 10;
    if (desiredTop + ESTIMATED_POPOVER_HEIGHT_PX > viewportHeight - VIEWPORT_EDGE_MARGIN_PX) {
      const fallbackTop = targetRect.top - (ESTIMATED_POPOVER_HEIGHT_PX + POPOVER_PADDING_PX + 10);
      desiredTop = Math.max(fallbackTop, VIEWPORT_EDGE_MARGIN_PX);
    }
    popoverStyle.top = Math.max(desiredTop, VIEWPORT_EDGE_MARGIN_PX);
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
        aria-hidden="true"
      />

      {/* O Balão de Texto (Tooltip) */}
      <div
        className="absolute pointer-events-auto bg-white p-5 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-xs md:max-w-sm"
        style={popoverStyle}
        role="dialog"
        aria-label="Dica do tour"
      >
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Dica {currentStep + 1} de {totalSteps}
            </span>
            <button
              onClick={stopTour}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar tour"
            >
                <X size={16} />
            </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{activeStepData.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{activeStepData.description}</p>

        <div className="flex justify-end">
            <Button 
                onClick={nextStep} 
                size="sm" 
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
                aria-label={currentStep === totalSteps - 1 ? "Concluir tour" : "Próxima dica"}
            >
                {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"} 
                <ChevronRight size={16} className="ml-1" />
            </Button>
        </div>
      </div>
    </div>
  );
}