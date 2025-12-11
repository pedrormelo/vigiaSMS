// src/components/tour/AppTour.tsx
"use client";

import { useEffect, useState } from "react";
import { useTour } from "@/contexts/tourContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";

// ====== CONSTANTES ======
const MAX_ELEMENT_SEARCH_ATTEMPTS = 12;
const ELEMENT_SEARCH_RETRY_DELAY_MS = 150;
const INITIAL_POSITION_UPDATE_DELAY_MS = 120;
const POPOVER_PADDING_PX = 10;
const ESTIMATED_POPOVER_HEIGHT_PX = 240;
const VIEWPORT_EDGE_MARGIN_PX = 20;
const TABLET_BREAKPOINT = 640;
const DESKTOP_BREAKPOINT = 1024;
const MAX_TABLET_POPOVER_WIDTH = 420;
const MAX_DESKTOP_POPOVER_WIDTH = 420;
const SCROLL_REVEAL_MARGIN_PX = 40;

export default function AppTour() {
  const { isTourOpen, activeStepData, nextStep, stopTour, currentStep, totalSteps } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

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
      try {
        const element = document.getElementById(activeStepData.targetId);
        if (!element) {
          setTargetRect(null);
          if (attempts >= MAX_ELEMENT_SEARCH_ATTEMPTS) {
            console.warn(`Tour: Elemento não encontrado após ${MAX_ELEMENT_SEARCH_ATTEMPTS} tentativas:`, activeStepData.targetId);
            nextStep();
            return;
          }
          attempts += 1;
          retryTimeoutId = window.setTimeout(() => {
            rafId = window.requestAnimationFrame(updatePosition);
          }, ELEMENT_SEARCH_RETRY_DELAY_MS);
          return;
        }

        const isMobile = window.innerWidth < 640;
        const scrollBehavior: ScrollBehavior = isMobile ? "auto" : "smooth";

        const rect = element.getBoundingClientRect();
        const hasSize = rect.width > 1 && rect.height > 1;
        const isOffscreen = rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight;

        if (!hasSize) {
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

        // Em mobile, usa margens menores para melhor visualização na tela pequena
        const topMargin = isMobile ? 40 : 80;
        const bottomMargin = isMobile ? 120 : ESTIMATED_POPOVER_HEIGHT_PX + 100;
        const fullyVisible = rect.top >= topMargin && rect.bottom <= window.innerHeight - bottomMargin;

        // Se estiver fora da viewport ou parcialmente oculto, força scroll para centralizar o alvo
        if (isOffscreen || !fullyVisible) {
          if (attempts >= MAX_ELEMENT_SEARCH_ATTEMPTS) {
            nextStep();
            return;
          }
          attempts += 1;
          const elementCenter = rect.top + window.scrollY + rect.height / 2;
          const headerOffset = isMobile ? 20 : 72; // compensa navbar fixa
          const mobileScrollMargin = isMobile ? 30 : SCROLL_REVEAL_MARGIN_PX;
          const desiredScrollY = Math.max(
            elementCenter - (window.innerHeight / 2) - headerOffset - mobileScrollMargin,
            0
          );

          window.scrollTo({ top: desiredScrollY, behavior: scrollBehavior });

          const scrollDelay = isMobile ? 120 : 450;
          retryTimeoutId = window.setTimeout(() => {
            rafId = window.requestAnimationFrame(() => {
              const newRect = element.getBoundingClientRect();
              setTargetRect(newRect);
            });
          }, scrollDelay);
        } else {
          setTargetRect(rect);
        }
      } catch (error) {
        console.error("Erro ao atualizar posição do tour:", error);
        nextStep();
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
   * Prioriza posicionamento que maximize visibilidade
   */
  try {
    const popoverStyle: React.CSSProperties = {};
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < TABLET_BREAKPOINT;
    const isTablet = viewportWidth >= TABLET_BREAKPOINT && viewportWidth < DESKTOP_BREAKPOINT;
    const popoverWidth = isMobile
      ? Math.min(viewportWidth * 0.92, 360)
      : isTablet
        ? Math.min(viewportWidth * 0.55, MAX_TABLET_POPOVER_WIDTH)
        : Math.min(viewportWidth * 0.4, MAX_DESKTOP_POPOVER_WIDTH);

    const clampHorizontal = (left: number) => {
      const minLeft = isMobile ? 8 : VIEWPORT_EDGE_MARGIN_PX;
      const maxLeft = viewportWidth - (isMobile ? 8 : VIEWPORT_EDGE_MARGIN_PX) - popoverWidth;
      if (left < minLeft) return minLeft;
      if (left > maxLeft) return maxLeft;
      return left;
    };

    // Centraliza horizontalmente com base no alvo, usando clamp para não colar nas bordas
    const centerOnTarget = () => clampHorizontal(targetRect.left + (targetRect.width / 2) - (popoverWidth / 2));

    // Centraliza quando não há alvo (fallback) ou em mobile
    const centerViewport = () => (viewportWidth - popoverWidth) / 2;

    // Estratégia de posicionamento com prioridade em visibilidade
    if (activeStepData.position === "right") {
      const desiredTop = Math.max(targetRect.top + (targetRect.height / 2) - (ESTIMATED_POPOVER_HEIGHT_PX / 2), VIEWPORT_EDGE_MARGIN_PX);
      popoverStyle.top = Math.min(desiredTop, viewportHeight - ESTIMATED_POPOVER_HEIGHT_PX - VIEWPORT_EDGE_MARGIN_PX);
      popoverStyle.left = clampHorizontal(targetRect.right + POPOVER_PADDING_PX + 10);
    } else if (activeStepData.position === "top") {
      const desiredTop = targetRect.top - (ESTIMATED_POPOVER_HEIGHT_PX + POPOVER_PADDING_PX + 10);
      if (desiredTop <= VIEWPORT_EDGE_MARGIN_PX) {
        // Sem espaço acima, coloca embaixo com margin
        const fallbackTop = Math.min(targetRect.bottom + POPOVER_PADDING_PX + 20, viewportHeight - ESTIMATED_POPOVER_HEIGHT_PX - VIEWPORT_EDGE_MARGIN_PX);
        popoverStyle.top = Math.max(fallbackTop, VIEWPORT_EDGE_MARGIN_PX);
      } else {
        popoverStyle.top = desiredTop;
      }
      popoverStyle.left = isMobile ? centerViewport() : centerOnTarget();
    } else {
      // Padrão ou "bottom" - estratégia principal
      let desiredTop = isMobile 
        ? targetRect.bottom + POPOVER_PADDING_PX + 16  // Menos margin em mobile para economizar espaço
        : targetRect.bottom + POPOVER_PADDING_PX + 20;
      
      // Se não houver espaço embaixo, tenta acima (mais agressivo em mobile)
      if (desiredTop + ESTIMATED_POPOVER_HEIGHT_PX > viewportHeight - (isMobile ? 10 : VIEWPORT_EDGE_MARGIN_PX)) {
        const fallbackTop = targetRect.top - (ESTIMATED_POPOVER_HEIGHT_PX + POPOVER_PADDING_PX + 16);
        desiredTop = Math.max(fallbackTop, VIEWPORT_EDGE_MARGIN_PX);
      }
      
      popoverStyle.top = Math.max(desiredTop, VIEWPORT_EDGE_MARGIN_PX);
      popoverStyle.left = isMobile ? centerViewport() : centerOnTarget();
    }

    // Largura fixa por cálculo para tablets/desktop com clamp horizontal
    popoverStyle.width = popoverWidth;

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

      {/* O Balão de Texto (Tooltip) - Responsivo */}
      <div
        className="absolute pointer-events-auto bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl md:shadow-[0_20px_40px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-300 w-auto max-w-[92vw] sm:max-w-[85vw] md:max-w-[70vw] border border-gray-100"
        style={popoverStyle}
        role="dialog"
        aria-label="Dica do tour"
      >
        <div className="flex justify-between items-start mb-3 sm:mb-4">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                Dica {currentStep + 1} de {totalSteps}
            </span>
            <button
              onClick={stopTour}
              className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 p-1 hover:bg-gray-50 rounded-lg"
              aria-label="Fechar tour"
            >
                <X size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
        </div>

        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">{activeStepData.title}</h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-4 sm:mb-5">{activeStepData.description}</p>

        <div className="flex justify-end">
            <Button 
                onClick={nextStep} 
                size="sm" 
                className="rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm md:text-base font-semibold px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5"
                aria-label={currentStep === totalSteps - 1 ? "Concluir tour" : "Próxima dica"}
            >
                {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"} 
                <ChevronRight size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2" />
            </Button>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar tour:", error);
    return null;
  }
}