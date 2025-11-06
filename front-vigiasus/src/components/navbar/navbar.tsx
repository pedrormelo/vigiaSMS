// src/components/navbar/navbar.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Loader2 } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";

// --- INÍCIO DA CORREÇÃO ---
// 1. REMOVER A IMPORTAÇÃO DO MODAL ANTIGO
// import DetalhesContextoModal from "@/components/popups/detalhesContextoModal"; // <-- REMOVIDO

// 2. ADICIONAR A IMPORTAÇÃO DO MODAL NOVO E CORRIGIDO
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal"; 
// --- FIM DA CORREÇÃO ---

import { getContextoById } from "@/services/contextoService"; 
import { Contexto } from "@/components/validar/typesDados"; 
import { Notification } from "@/constants/types"; 

import UpdateStatusPopover from "./UpdateStatusPopover";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Simulação - buscar dados reais de notificação/atualização
  const [unreadNotifications, setUnreadNotifications] = useState(5);
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

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

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
    // Opcional: Reabrir notificações se desejar voltar para a lista
    // setIsNotificationsOpen(true);
  };


  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-30">
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
                aria-label={`Notificações (${unreadNotifications} não lidas)`}
              >
                <Image
                  src="/icons/sininho.svg"
                  alt="" 
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
              {unreadNotifications > 0 && (
                <div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold pointer-events-none" 
                  aria-hidden="true" 
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications} 
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (Renderização condicional implícita pelo estado isOpen) */}
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Modal de Notificações */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onOpenContextoDetails={handleOpenContextoDetails} 
      />

      {/* --- INÍCIO DA CORREÇÃO --- */}
      {/* 3. Renderizar o MODAL NOVO (VisualizarContextoModal) em vez do antigo */}
      <VisualizarContextoModal
        estaAberto={isDetalhesContextoOpen}
        aoFechar={handleCloseDetalhesContexto}
        dadosDoContexto={selectedContexto}
        perfil={userProfile} 
        isFromHistory={selectedContexto?.historico && selectedContexto.historico.length > 0} 
        // Estes handlers são para a pág /validar, então não são necessários aqui
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