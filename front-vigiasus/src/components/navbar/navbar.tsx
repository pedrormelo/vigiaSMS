// src/components/navbar/navbar.tsx
"use client";
// ADICIONAR 'useMemo'
import { useState, useMemo, useEffect } from "react"; 
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Loader2 } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";

//  MODAL NOVO (Sua correção)
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal"; 

import { getContextoById } from "@/services/contextoService"; 
import { Contexto } from "@/components/validar/typesDados"; 
import { Notification } from "@/constants/types"; 

import UpdateStatusPopover from "./UpdateStatusPopover";

// 3. ADICIONAR HOOK DE NOTIFICAÇÕES (Minha correção)
import { useNotifications } from "@/hooks/useNotifications"; 

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // REMOVER CONTAGEM FIXA (Minha correção)
  // const [unreadNotifications, setUnreadNotifications] = useState(5); // <-- REMOVIDO
  
  const [lastUpdateInfo, setLastUpdateInfo] = useState({
    relative: "há 2 horas", 
    label: "29/10/2025 09:15", 
    itemName: "Relatório Mensal de Atendimentos - Setembro", 
    isRecent: true 
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isDetalhesContextoOpen, setIsDetalhesContextoOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);
  const [isLoadingContexto, setIsLoadingContexto] = useState(false);
  const userProfile: "diretor" | "gerente" | "membro" = "gerente";
  
  //  PUXAR DADOS E ESTADO DE CARREGAMENTO AQUI
  // (Renomeei para evitar conflito com 'isLoadingContexto')
  const { 
    notifications, 
    isLoading: isLoadingNotifications, 
    isError: isErrorNotifications 
  } = useNotifications(); 
  
  // LEVANTAR O ESTADO 'readNotifications' PARA CÁ
  const [readNotifications, setReadNotifications] = useState<Set<number>>(
    new Set()
  );

  //  DEFINIR A FUNÇÃO DE MARCAR COMO LIDO AQUI
  const handleMarkAsRead = (id: number) => {
    setReadNotifications((prevReadIds) => {
      if (prevReadIds.has(id)) return prevReadIds; 
      
      const newSet = new Set(prevReadIds);
      newSet.add(id);
      return newSet;
    });
  };

  //  CALCULAR A CONTAGEM NÃO LIDA AQUI (usando o estado local)
  const totalUnreadCount = useMemo(() => {
    return notifications.filter(n => !readNotifications.has(n.id)).length;
  }, [notifications, readNotifications]);
  // --- FIM DA CORREÇÃO DO CONTADOR ---


  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // Esta função está ótima
  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;

    setIsLoadingContexto(true);
    setIsNotificationsOpen(false); 

    try { 
      const contextoDetails = await getContextoById(notification.contextoId); 
      if (contextoDetails) {
        setSelectedContexto(contextoDetails);
        setIsDetalhesContextoOpen(true);
      } else {
        console.error(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`); 
        alert(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`);
        setIsNotificationsOpen(true); 
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do contexto:", error);
      alert("Ocorreu um erro ao carregar os detalhes do contexto. Tente novamente.");
      setIsNotificationsOpen(true); 
    } finally {
      setIsLoadingContexto(false);
    }
  };


  const handleCloseDetalhesContexto = () => {
    setIsDetalhesContextoOpen(false);
    setSelectedContexto(null);
  };

  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  // Helper para rótulos modernos
  const buildLabels = (iso: string) => {
    const dt = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    const absolute = dt.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const timeOfDay = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let relative = "";
    if (diffSec < 60) relative = "agora mesmo";
    else if (diffMin < 60) relative = `há ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;
    else if (diffHrs < 24) relative = `há ${diffHrs} hora${diffHrs === 1 ? "" : "s"}`;
    else relative = `há ${diffDays} dia${diffDays === 1 ? "" : "s"}`;

    const isSameDay = dt.toDateString() === now.toDateString();
    const modern = isSameDay && diffHrs < 6 ? `às ${timeOfDay}` : relative;

    return { absolute, modern, relative };
  };

  // Atualizar bloco de "última atualização" baseado na notificação mais recente
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    // Assume que createdAt existe e está em ISO. Caso contrário, mantém estado inicial.
    const ordered = [...notifications].filter(n => !!n.createdAt).sort((a, b) => (new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()));
    if (ordered.length === 0) return;
    const latest = ordered[0];
    const { absolute, modern } = buildLabels(latest.createdAt!);
    setLastUpdateInfo({
      relative: modern,
      label: absolute,
      itemName: latest.title,
      isRecent: (Date.now() - new Date(latest.createdAt!).getTime()) < 6 * 60 * 60 * 1000
    });
  }, [notifications]);

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6"> 
          {/* Botão Menu (Esquerda) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-blue-700 hover:text-blue-500 transition-colors p-2 -ml-2 md:ml-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1" 
            aria-label="Abrir menu lateral"
          >
            <Menu strokeWidth={2.5} className="w-6 h-6 md:w-7 md:h-7" /> 
          </button>

          {/* Bloco central (Logos) */}
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

          {/* Ícones de ações (Direita) */}
          <div className="flex items-center gap-3 md:gap-4 text-blue-700">

            <UpdateStatusPopover
              lastUpdateRelative={lastUpdateInfo.relative}
              lastUpdateLabel={lastUpdateInfo.label}
              lastUpdateItemName={lastUpdateInfo.itemName}
              isRecent={lastUpdateInfo.isRecent}
            />

            {/* Ícone de Notificações com contador */}
            <div className="relative">
              <button
                onClick={handleNotificationsClick}
                className="hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1" 
                // 9. USAR A CONTAGEM CORRETA (Minha correção)
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
              {/* 10. USAR A CONTAGEM CORRETA (Minha correção) */}
              {totalUnreadCount > 0 && ( 
                <div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold pointer-events-none" 
                  aria-hidden="true" 
                >
                  {/* Lógica de 9+ */}
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount} 
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (Renderização condicional implícita pelo estado isOpen) */}
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Modal de Notificações */}
      {/* 11. PASSAR TODAS AS PROPS (Minha correção) */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onOpenContextoDetails={handleOpenContextoDetails}
        
        // Passar os dados do hook
        notifications={notifications}
        isLoading={isLoadingNotifications}
        isError={isErrorNotifications}
        
        // Passar o estado de "lido" e a função para atualizá-lo
        readNotifications={readNotifications}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* --- CORREÇÃO DO MODAL (Sua correção) --- */}
      {/* 12. Renderizar o MODAL NOVO (VisualizarContextoModal) */}
      <VisualizarContextoModal
        estaAberto={isDetalhesContextoOpen}
        aoFechar={handleCloseDetalhesContexto}
        dadosDoContexto={selectedContexto}
        perfil={userProfile} 
        isFromHistory={selectedContexto?.historico && selectedContexto.historico.length > 0} 
        onDeferir={undefined} 
        onIndeferir={undefined}
        onCorrigir={undefined}
      />
      {/* --- FIM DA CORREÇÃO --- */}


      {/* Indicador de Loading (com estilo corrigido) */}
      {isLoadingContexto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"> 
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      )}
    </>
  );
}