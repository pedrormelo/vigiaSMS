// src/components/navbar/navbar.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // AQUI: Import para refresh suave
import { Menu, Loader2 } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal";
import { getContextoById } from "@/services/contextoService";
import { Contexto } from "@/components/validar/typesDados";
import { Notification } from "@/constants/types";
import UpdateStatusPopover from "./UpdateStatusPopover";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import { authService } from "@/services/authService";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts"; // Import Toasts

type PartialContexto = Partial<Contexto> & { id: string };

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const router = useRouter(); // Hook do router
  const [lastUpdateInfo, setLastUpdateInfo] = useState({
    relative: "há 2 horas",
    label: "29/10/2025 09:15",
    itemName: "Relatório Mensal de Atendimentos - Setembro",
    isRecent: true
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDetalhesContextoOpen, setIsDetalhesContextoOpen] = useState(false);
  const [isValidationMode, setIsValidationMode] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | PartialContexto | null>(null);
  const [isLoadingContexto, setIsLoadingContexto] = useState(false);

  const userProfile = useCurrentUser();

  const {
    notifications,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    readNotifications, 
    markAsRead, 
  } = useNotifications(userProfile?.name);

  const totalUnreadCount = useMemo(() => {
    if (!notifications) return 0;
    const lidas = readNotifications || [];
    return notifications.filter(n => !lidas.includes(n.id)).length;
  }, [notifications, readNotifications]);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // --- HANDLERS DE AÇÃO (Corrigidos: Sem Alert, com Refresh Suave) ---
  
  const handleDeferir = async (versaoId: string, comentario?: string) => {
    const role = userProfile?.role;
    let endpoint = "";
    
    if (role === 'gerente') endpoint = `${apiBase}/contextos/versoes/${versaoId}/gerente-aprovar`;
    else if (role === 'diretor') endpoint = `${apiBase}/contextos/versoes/${versaoId}/diretor-publicar`;
    else return;

    try {
        const token = authService.getToken();
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ comentario })
        });
        
        if (!res.ok) throw new Error("Falha ao deferir");
        
        // Sucesso: Fecha modal e atualiza dados silenciosamente
        setIsDetalhesContextoOpen(false);
        router.refresh(); // Atualiza Server Components (listas, etc)
        
        // Nota: O Toast de sucesso é exibido pelo Modal (index.tsx), então não duplicamos aqui.
    } catch (e) {
        console.error(e);
        showErrorToast("Erro", "Não foi possível realizar a ação.");
    }
  };

  const handleIndeferir = async (versaoId: string, justificativa: string) => {
     try {
        const token = authService.getToken();
        const res = await fetch(`${apiBase}/contextos/versoes/${versaoId}/diretor-indeferir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ justificativa })
        });
        if (!res.ok) throw new Error("Falha ao indeferir");
        
        setIsDetalhesContextoOpen(false);
        router.refresh();
     } catch (e) { 
         console.error(e); 
         showErrorToast("Erro", "Não foi possível indeferir.");
    }
  };

  const handleCorrigir = async (versaoId: string, justificativa: string) => {
     try {
        const token = authService.getToken();
        const res = await fetch(`${apiBase}/contextos/versoes/${versaoId}/solicitar-correcao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ justificativa })
        });
        if (!res.ok) throw new Error("Falha ao solicitar correção");
        
        setIsDetalhesContextoOpen(false);
        router.refresh();
     } catch (e) { 
         console.error(e); 
         showErrorToast("Erro", "Não foi possível solicitar correção.");
    }
  };
  // ------------------------------------------------

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;

    const shouldValidate = (notification as any).isValidation === true;
    setIsValidationMode(shouldValidate);

    setIsLoadingContexto(true);
    setIsNotificationsOpen(false);

    handleMarkAsRead(notification.id);

    try {
      const contextoDetails = await getContextoById(notification.contextoId);
      if (contextoDetails) {
        setSelectedContexto(contextoDetails);
        setIsDetalhesContextoOpen(true);
      } else {
        console.warn(`Contexto com ID ${notification.contextoId} não encontrado.`);
        setSelectedContexto({ id: notification.contextoId }); 
        setIsDetalhesContextoOpen(true);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do contexto:", error);
      showErrorToast("Erro", "Erro ao carregar detalhes.");
      setIsNotificationsOpen(true);
    } finally {
      setIsLoadingContexto(false);
    }
  };

  const handleCloseDetalhesContexto = () => {
    setIsDetalhesContextoOpen(false);
    setSelectedContexto(null);
    setIsValidationMode(false);
  };

  const handleMarkAsRead = (notificationId: number | "all") => {
    if (notificationId === "all") {
      const allIds = notifications.map(n => n.id);
      markAsRead(allIds);
    } else {
      markAsRead([notificationId]);
    }
  };

  useEffect(() => {
    if (selectedContexto?.id && !("titulo" in selectedContexto && selectedContexto.titulo)) {
      let mounted = true;
      (async () => {
        setIsLoadingContexto(true);
        try {
          const data = await getContextoById(selectedContexto.id);
          if (mounted && data) {
            setSelectedContexto(data);
          } else if (mounted) {
            handleCloseDetalhesContexto();
          }
        } catch (error) {
          if (mounted) handleCloseDetalhesContexto();
        } finally {
          if (mounted) setIsLoadingContexto(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, [selectedContexto?.id]);

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-35">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <button
            onClick={onOpenSidebar}
            className="text-blue-700 hover:text-blue-500 transition-colors p-2 -ml-2 md:ml-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            aria-label="Abrir menu lateral"
          >
            <Menu strokeWidth={2.5} className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
            <Link href="/" className="block flex-shrink-0">
              <h1 className="text-xl md:text-2xl text-blue-700 hover:text-blue-500 transition-colors">
                Vigia<b>SUS</b>
              </h1>
            </Link>
            <Image
              src="/logos/logo-jaboatao.png"
              alt="Prefeitura de Jaboatão"
              width={150}
              height={30}
              className="h-7 md:h-8 w-auto hidden sm:block"
              priority
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4 text-blue-700">
            <UpdateStatusPopover
              lastUpdateRelative={lastUpdateInfo.relative}
              lastUpdateLabel={lastUpdateInfo.label}
              lastUpdateItemName={lastUpdateInfo.itemName}
              isRecent={lastUpdateInfo.isRecent}
            />

            <div className="relative">
              <button
                onClick={handleNotificationsClick}
                className="hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                aria-label={`Notificações (${totalUnreadCount} não lidas)`}
              >
                <Image
                  src="/icons/sininho.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
              {totalUnreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold pointer-events-none"
                  aria-hidden="true"
                >
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onOpenContextoDetails={handleOpenContextoDetails}
        notifications={notifications}
        isLoading={isLoadingNotifications}
        isError={isErrorNotifications}
        readNotifications={readNotifications || []}
        onMarkAsRead={handleMarkAsRead}
      />

      <VisualizarContextoModal
        estaAberto={isDetalhesContextoOpen}
        aoFechar={handleCloseDetalhesContexto}
        dadosDoContexto={selectedContexto}
        perfil={userProfile?.role ?? 'membro'}
        isFromHistory={selectedContexto && 'historico' in selectedContexto && (selectedContexto.historico?.length ?? 0) > 0}
        
        isValidation={isValidationMode}
        onDeferir={handleDeferir}
        onIndeferir={handleIndeferir}
        onCorrigir={handleCorrigir}
      />

      {isLoadingContexto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      )}
    </>
  );
}