// src/components/onboarding/OnboardingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTour } from "@/contexts/tourContext";
import type { TourStep } from "@/contexts/tourContext";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart3,
  ArrowLeft
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

const dispatchSidebarEvent = (action: "open" | "close") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`vigiasus:sidebar-${action}`));
};

const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vigiasus:onboarding-completed", "true");
    }
    setIsOpen(false);

    // [NOVO]: Inicia o Tour imediatamente após fechar o modal
    // Pequeno delay para o modal fechar visualmente
    setTimeout(() => {
    try {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

      const navbarTourSteps: TourStep[] = [
        {
          targetId: "tour-sidebar-btn",
          title: "Menu Principal",
          description: "Acesse todas as funcionalidades do sistema, como validação, dashboards e configurações, através deste menu lateral.",
          position: "right",
          onEnter: () => dispatchSidebarEvent("close"),
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
      ];

      // Tour mobile com verificação de existência dos elementos
      const mobileTourSteps: TourStep[] = [
        {
          targetId: "tour-mobile-nav-home",
          title: "Página Inicial",
          description: "Acesse a página inicial onde você vê todas as suas informações e métricas importantes.",
          position: "top" as const
        },
        {
          targetId: "tour-mobile-nav-dashboard",
          title: "Dashboard",
          description: "Visualize gráficos e indicadores de desempenho da sua diretoria ou gerência.",
          position: "top" as const
        },
        {
          targetId: "tour-mobile-nav-minhasGerencias",
          title: "Gerências",
          description: "Acesse todas as gerências vinculadas à sua diretoria.",
          position: "top" as const
        },
        {
          targetId: "tour-mobile-nav-contextos",
          title: "Validar",
          description: "Revise e aprove contextos pendentes de validação.",
          position: "top" as const
        },
        {
          targetId: "tour-mobile-nav-dadosGerais",
          title: "Dados",
          description: "Acesse dados consolidados e relatórios do sistema.",
          position: "top" as const
        },
        {
          targetId: "tour-mobile-nav-ajuda",
          title: "Ajuda",
          description: "Encontre documentação, tutoriais e respostas para suas dúvidas.",
          position: "top" as const
        }
      ].filter(step => {
        // Filtra passos cujos elementos não existem para evitar erros
        if (typeof document === "undefined") return true;
        return document.getElementById(step.targetId) !== null;
      });

      const sidebarTourSteps: TourStep[] = [
        {
          targetId: "tour-sidebar-panel",
          title: "Navegação Personalizada",
          description: "O menu lateral exibe atalhos configurados para o seu perfil de acesso.",
          position: "right",
          onEnter: () => dispatchSidebarEvent("open"),
        },
        {
          targetId: "tour-sidebar-links",
          title: "Atalhos Importantes",
          description: "Escolha uma área para acessar dashboards, dados ou a central de ajuda rapidamente.",
          position: "right",
          onEnter: () => dispatchSidebarEvent("open"),
        }
      ];

      // Escolhe o tour baseado no tamanho da tela e filtra passos válidos
      const selectedTourSteps = isMobile 
        ? mobileTourSteps.length > 0 ? mobileTourSteps : [] 
        : navbarTourSteps.filter(step => {
          if (typeof document === "undefined") return true;
          return document.getElementById(step.targetId) !== null;
        });
      
      const tourName = isMobile ? "mobile-tour-completed" : "navbar-tour-completed";

      // Se houver passos válidos, inicia o tour
      if (selectedTourSteps.length > 0) {
        startTour(selectedTourSteps, () => {
          if (typeof window !== "undefined") {
            localStorage.setItem(`vigiasus:${tourName}`, "true");
          }

          if (!isMobile) {
            dispatchSidebarEvent("open");
            setTimeout(() => {
              // Filtra passos da sidebar que existem
              const validSidebarSteps = sidebarTourSteps.filter(step => {
                if (typeof document === "undefined") return true;
                return document.getElementById(step.targetId) !== null;
              });

              if (validSidebarSteps.length > 0) {
                startTour(validSidebarSteps, () => {
                  dispatchSidebarEvent("close");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("vigiasus:sidebar-tour-completed", "true");
                  }
                });
              } else {
                dispatchSidebarEvent("close");
              }
            }, 250);
          }
        });
      } else {
        // Se não houver passos válidos, apenas marca como completo
        if (typeof window !== "undefined") {
          localStorage.setItem(`vigiasus:${tourName}`, "true");
        }
      }
    } catch (error) {
      // Log de erro para debugging
      console.error("Erro ao iniciar tour:", error);
      if (typeof window !== "undefined") {
        localStorage.setItem("vigiasus:mobile-tour-completed", "true");
      }
    }
    }, 500);
  };

  const StepIcon = steps[currentStep].icon;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleFinish}>
      {/* Carrossel responsivo para mobile, tablet e desktop */}
      <DialogContent className="w-11/12 max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-white rounded-2xl sm:rounded-3xl md:rounded-[32px] border-none shadow-xl sm:shadow-2xl flex flex-col md:flex-row h-auto md:h-[400px] lg:h-[450px]">
        
        {/* Títulos ocultos para acessibilidade */}
        <DialogTitle className="sr-only">Tutorial de Onboarding - {steps[currentStep].title}</DialogTitle>
        <DialogDescription className="sr-only">{steps[currentStep].description}</DialogDescription>
        
        {/* ESQUERDA: Área Visual (responsiva) */}
        <motion.div
          key={`visual-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={cn(
            "relative w-full h-32 sm:h-40 md:w-[40%] md:h-full flex items-center justify-center bg-gradient-to-br overflow-hidden",
            steps[currentStep].bg
          )}
        >
          {/* Círculos decorativos de fundo */}
          <div className="absolute -top-16 sm:-top-20 -left-16 sm:-left-20 w-48 sm:w-64 h-48 sm:h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 sm:-bottom-20 -right-16 sm:-right-20 w-48 sm:w-64 h-48 sm:h-64 bg-white/30 rounded-full blur-3xl" />

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
              "relative z-10 p-4 sm:p-6 md:p-8 bg-white rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-lg sm:shadow-xl transform rotate-3",
              steps[currentStep].glow
            )}
          >
            <StepIcon size={40} className={cn("sm:w-12 sm:h-12 md:w-16 md:h-16", steps[currentStep].color)} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* DIREITA: Conteúdo (responsivo) */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 bg-white relative">
          
          {/* Botão Fechar/Pular no canto superior direito */}
          <div className="absolute top-1 sm:top-4 md:top-6 right-2 sm:right-4 md:right-6 z-20">
             <button 
                onClick={handleFinish}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Pular tutorial"
             >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
             </button>
          </div>

          {/* Indicador de Passo (ex: Passo 1 de 4) */}
          <div className="mb-3 sm:mb-4 md:mb-6">
             <span className={cn(
                 "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-opacity-10",
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-500 leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer com Botões de Navegação */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 sm:mt-6 sm:pt-4 sm:border-t sm:border-slate-100 mt-2 pt-2">
            
            {/* Indicadores (Dots) */}
            <div className="flex gap-1.5 sm:gap-2 order-2 sm:order-1">
               {steps.map((_, idx) => (
                   <div 
                     key={idx}
                     className={cn(
                        "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                        idx === currentStep 
                            ? cn("w-6 sm:w-8", steps[currentStep].color.replace('text-', 'bg-')) 
                            : "w-1.5 sm:w-2 bg-slate-200"
                     )}
                   />
               ))}
            </div>

            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
               {currentStep > 0 && (
                   <button 
                     onClick={handlePrev}
                     className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 h-9 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-200 font-medium text-xs sm:text-sm"
                     title="Voltar"
                   >
                     <ChevronLeft size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                     <span className="hidden sm:inline">Voltar</span>
                   </button>
               )}
               
               <button 
                 onClick={handleNext}
                 className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 h-9 sm:h-10 rounded-full shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-200",
                    "font-medium text-white text-xs sm:text-sm",
                    steps[currentStep].color.replace('text-', 'bg-'),
                    "hover:opacity-90"
                 )}
               >
                 {currentStep === steps.length - 1 ? (
                    <>
                      <span>Começar</span>
                      <Check size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </>
                 ) : (
                    <>
                      <span>Próximo</span>
                      <ChevronRight size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </>
                 )}
               </button>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}