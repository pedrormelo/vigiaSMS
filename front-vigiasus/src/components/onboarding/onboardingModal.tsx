// src/components/onboarding/OnboardingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTour } from "@/contexts/tourContext";
import {
  ChevronRight,
  Check,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    icon: LayoutDashboard,
    title: "Bem-vindo ao SIGE",
    description:
      "Sua central de monitoramento e gestão da saúde pública. Acompanhe indicadores, documentos e o desempenho das diretorias em tempo real.",
    color: "text-blue-600",
    bg: "from-blue-100/80 to-blue-50",
    glow: "shadow-blue-500/30",
  },
  {
    id: 2,
    icon: FileText,
    title: "Gestão de Contextos",
    description:
      "Organize documentos e planilhas como 'Contextos'. Todo arquivo possui histórico de versões e segurança aprimorada.",
    color: "text-red-600",
    bg: "from-red-100/80 to-indigo-50",
    glow: "shadow-red-500/30",
  },
  {
    id: 3,
    icon: ShieldCheck,
    title: "Fluxo de Validação",
    description:
      "Nada é publicado sem aprovação. Membro cria, Gerente analisa e Diretor valida. Segurança e rastreabilidade total.",
    color: "text-emerald-600",
    bg: "from-emerald-100/80 to-emerald-50",
    glow: "shadow-emerald-500/30",
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Dashboards Dinâmicos",
    description:
      "Configure KPIs e gráficos customizados. Acompanhe metas, desempenho e insights valiosos para a gestão.",
    color: "text-amber-600",
    bg: "from-amber-100/80 to-amber-50",
    glow: "shadow-amber-500/30",
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasCompleted = localStorage.getItem("vigiasus:onboarding-completed");
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 800);
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

  const { startTour } = useTour();
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vigiasus:onboarding-completed", "true");
    }
    setIsOpen(false);

    // [NOVO]: Inicia o Tour imediatamente após fechar o modal
    // Pequeno delay para o modal fechar visualmente
    setTimeout(() => {
        startTour([
            {
                targetId: "tour-sidebar-btn",
                title: "Menu Principal",
                description: "Acesse todas as funcionalidades do sistema, como validação, dashboards e configurações, através deste menu lateral.",
                position: "right"
            },
            {
                targetId: "tour-notifications",
                title: "Central de Notificações",
                description: "Fique sabendo imediatamente quando um contexto for enviado para sua aprovação ou devolvido.",
                position: "bottom"
            },
            {
                targetId: "tour-metrics",
                title: "Visão Geral",
                description: "Acompanhe aqui os números consolidados de todo o sistema em tempo real.",
                position: "top"
            }
        ]);
    }, 500);
  };

  const StepIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleFinish}>
      {/* Aumentei a largura máxima para acomodar o layout horizontal */}
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white rounded-[32px] border-none shadow-2xl flex flex-col md:flex-row h-auto md:h-[450px]">
        
        {/* ESQUERDA: Área Visual (40%) */}
        <motion.div
          key={`visual-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={cn(
            "relative w-full md:w-[40%] h-48 md:h-full flex items-center justify-center bg-gradient-to-br overflow-hidden",
            steps[currentStep].bg
          )}
        >
          {/* Círculos decorativos de fundo */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/30 rounded-full blur-3xl" />

          {/* Ícone Principal */}
          <motion.div
            key={`icon-${currentStep}`}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.1 
            }}
            className={cn(
              "relative z-10 p-8 bg-white rounded-[2rem] shadow-xl transform rotate-3",
              steps[currentStep].glow
            )}
          >
            <StepIcon size={64} strokeWidth={1.5} className={steps[currentStep].color} />
          </motion.div>
        </motion.div>

        {/* DIREITA: Conteúdo (60%) */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-10 bg-white relative">
          
          {/* Botão Fechar/Pular no canto superior direito */}
          <div className="absolute top-6 right-6 z-20">
             <button 
                onClick={handleFinish}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Pular tutorial"
             >
                <X size={20} />
             </button>
          </div>

          {/* Indicador de Passo (ex: Passo 1 de 4) */}
          <div className="mb-6">
             <span className={cn(
                 "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-opacity-10",
                 steps[currentStep].color.replace('text-', 'bg-').replace('600', '100'),
                 steps[currentStep].color
             )}>
                Passo {currentStep + 1} de {steps.length}
             </span>
          </div>

          {/* Texto Animado */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer com Botões de Navegação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            
            {/* Indicadores (Dots) */}
            <div className="flex gap-2">
               {steps.map((_, idx) => (
                   <div 
                     key={idx}
                     className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        idx === currentStep 
                            ? cn("w-8", steps[currentStep].color.replace('text-', 'bg-')) 
                            : "w-2 bg-slate-200"
                     )}
                   />
               ))}
            </div>

            <div className="flex gap-3">
               {currentStep > 0 && (
                   <Button 
                     variant="ghost" 
                     onClick={handlePrev}
                     className="text-slate-500 hover:text-slate-800"
                   >
                     Voltar
                   </Button>
               )}
               
               <Button 
                 onClick={handleNext}
                 className={cn(
                    "rounded-xl px-6 shadow-lg hover:scale-105 transition-all duration-200",
                    steps[currentStep].color.replace('text-', 'bg-'), // Usa a cor do passo para o botão
                    "hover:opacity-90 text-white"
                 )}
               >
                 {currentStep === steps.length - 1 ? (
                    <span className="flex items-center gap-2">Começar <Check size={18} /></span>
                 ) : (
                    <span className="flex items-center gap-2">Próximo <ArrowRight size={18} /></span>
                 )}
               </Button>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}