// src/components/onboarding/OnboardingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Check,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    icon: LayoutDashboard,
    title: "Bem-vindo ao VigiaSUS",
    description:
      "Sua central de monitoramento e gestão da saúde pública. Acompanhe indicadores, documentos e o desempenho das diretorias em tempo real.",
    color: "text-blue-600",
    bg: "from-blue-100/60 to-blue-50",
    glow: "shadow-blue-500/40",
  },
  {
    id: 2,
    icon: FileText,
    title: "Gestão de Contextos",
    description:
      "Organize documentos e planilhas como 'Contextos'. Todo arquivo possui histórico de versões e segurança aprimorada.",
    color: "text-indigo-600",
    bg: "from-indigo-100/60 to-indigo-50",
    glow: "shadow-indigo-500/40",
  },
  {
    id: 3,
    icon: ShieldCheck,
    title: "Fluxo de Validação",
    description:
      "Nada é publicado sem aprovação. Membro cria, Gerente analisa e Diretor valida. Segurança e rastreabilidade total.",
    color: "text-emerald-600",
    bg: "from-emerald-100/60 to-emerald-50",
    glow: "shadow-emerald-500/40",
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Dashboards Dinâmicos",
    description:
      "Configure KPIs e gráficos customizados. Acompanhe metas, desempenho e insights valiosos para a gestão.",
    color: "text-amber-600",
    bg: "from-amber-100/60 to-amber-50",
    glow: "shadow-amber-500/40",
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasCompleted = localStorage.getItem("vigiasus:onboarding-completed");
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vigiasus:onboarding-completed", "true");
    }
    setIsOpen(false);
  };

  const StepIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleFinish}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
        {/* TOPO ANIMADO */}
        <motion.div
          key={`header-${currentStep}`}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative h-56 flex items-center justify-center bg-gradient-to-br",
            steps[currentStep].bg
          )}
        >
          {/* Glow animado */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,white,transparent)] opacity-50"
          />

          {/* Ícone com leve rotação 3D */}
          <motion.div
            key={`icon-${currentStep}`}
            initial={{ opacity: 0, scale: 0.4, rotateY: 45 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.6, type: "spring" }}
            className={cn(
              "relative z-10 p-6 bg-white rounded-full shadow-2xl",
              steps[currentStep].glow
            )}
          >
            <StepIcon size={56} className={steps[currentStep].color} />
          </motion.div>

          {/* Pular */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wide px-3 py-1 bg-white/60 hover:bg-white rounded-full transition"
          >
            Pular
          </button>
        </motion.div>

        {/* CONTEÚDO TRANSICIONADO */}
        <div className="px-8 pt-6 pb-8 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-slate-800 mb-3"
            >
              {steps[currentStep].title}
            </motion.h2>

            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="text-slate-600 text-base leading-relaxed min-h-[90px]"
            >
              {steps[currentStep].description}
            </motion.p>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-blue-600"
            />
          </div>

          {/* Indicadores circulares */}
          <div className="flex justify-center gap-3 my-6">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                  opacity: index === currentStep ? 1 : 0.4,
                }}
                className={cn(
                  "w-3 h-3 rounded-full",
                  index === currentStep ? "bg-blue-600" : "bg-slate-300"
                )}
              />
            ))}
          </div>

          {/* BOTÃO */}
          <Button
            onClick={handleNext}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-[1.03]"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-2">
                Começar <Check size={18} />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Próximo <ChevronRight size={18} />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
