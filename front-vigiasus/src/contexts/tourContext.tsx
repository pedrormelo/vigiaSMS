// src/contexts/TourContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  onEnter?: () => void;
}

interface TourContextType {
  // [ATUALIZADO] Aceita um callback onFinish opcional
  startTour: (steps: TourStep[], onFinish?: () => void) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStep: number;
  isTourOpen: boolean;
  activeStepData: TourStep | null;
  totalSteps: number;
}

const TourContext = createContext<TourContextType>({} as TourContextType);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // [NOVO] Estado para guardar o callback
  const [onFinishCallback, setOnFinishCallback] = useState<(() => void) | null>(null);

  const startTour = useCallback((tourSteps: TourStep[], onFinish?: () => void) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    if (onFinish) setOnFinishCallback(() => onFinish);
    setIsOpen(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsOpen(false);
    setSteps([]);
    setCurrentStep(0);
    // [NOVO] Executa o callback ao finalizar
    if (onFinishCallback) {
        onFinishCallback();
        setOnFinishCallback(null);
    }
  }, [onFinishCallback]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      stopTour(); 
    }
  }, [currentStep, steps.length, stopTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return (
    <TourContext.Provider
      value={{
        startTour,
        stopTour,
        nextStep,
        prevStep,
        currentStep,
        isTourOpen: isOpen,
        activeStepData: steps[currentStep] || null,
        totalSteps: steps.length,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);