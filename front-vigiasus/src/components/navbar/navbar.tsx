// src/components/navbar/navbar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Loader2 } from "lucide-react";
import NotificationsModal from "@/components/notifications/notificationsModal";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal";
import { getContextoById, getUltimaAtualizacao } from "@/services/contextoService";
import { Contexto } from "@/components/validar/typesDados";
import { Notification } from "@/constants/notificationsData";
import UpdateStatusPopover from "@/components/navbar/UpdateStatusPopover";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [lastUpdateLabel, setLastUpdateLabel] = useState<string>("");
  const [lastUpdateRelative, setLastUpdateRelative] = useState<string>("");
  const [lastUpdateItem, setLastUpdateItem] = useState<
    { id: string; nome: string; data: string } | null
  >(null);
  const [isRecent, setIsRecent] = useState(false);

  // Estado para o modal de notificações
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // --- Estados para o modal de Detalhes do Contexto ---
  const [isDetalhesContextoOpen, setIsDetalhesContextoOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);
  const [isLoadingContexto, setIsLoadingContexto] = useState(false);
  // Simulação do perfil do usuário (poderia vir de autenticação)
  const userProfile: "diretor" | "gerente" | "membro" = "gerente";
  // --- Fim dos estados de Detalhes do Contexto ---

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    setUnreadNotifications(0);
  };

  // --- Função para abrir Detalhes do Contexto a partir de uma Notificação ---
  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;

    setIsLoadingContexto(true);
    setIsNotificationsOpen(false);

    const contextoDetails = await getContextoById(notification.contextoId);
    setIsLoadingContexto(false);

    if (contextoDetails) {
      setSelectedContexto(contextoDetails);
      setIsDetalhesContextoOpen(true);
    } else {
      alert(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`);
    }
  };

  const handleCloseDetalhesContexto = () => {
    setIsDetalhesContextoOpen(false);
    setSelectedContexto(null);
  };
  // --- Fim da lógica de Detalhes do Contexto ---

  // Simulação do role (deve vir do sistema de autenticação)
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const info = await getUltimaAtualizacao();
      if (!mounted) return;
      if (info?.data) {
        try {
          const { absolute, modern, relative } = buildLabels(info.data);
          setLastUpdateLabel(`Último envio: ${absolute}`);
          setLastUpdateRelative(modern || relative);
          setLastUpdateItem(info);
          // Freshness: within last 6 hours
          const dt = new Date(info.data);
          const now = new Date();
          const diffMs = now.getTime() - dt.getTime();
          setIsRecent(diffMs < 6 * 60 * 60 * 1000);
        } catch {
          setLastUpdateLabel("Último envio: —");
          setLastUpdateRelative("—");
          setLastUpdateItem(null);
          setIsRecent(false);
        }
      } else {
        setLastUpdateLabel("Último envio: —");
        setLastUpdateRelative("—");
        setLastUpdateItem(null);
        setIsRecent(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-30 bg-white border-b border-white/20 shadow-md">
        <div className="container flex min-w-full min-h-[64px] justify-between items-center py-2 px-18">
          {/* Botão Menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-blue-700 hover:text-blue-500 cursor-pointer"
          >
            <Menu strokeWidth={2.5} className="w-9 h-9" />
          </button>

          {/* Bloco central */}
          <div className="flex items-center gap-22">
            <Link href="/" className="block">
              <h1 className="text-2xl text-blue-700 hover:text-blue-500 cursor-pointer transition-transform">
                Vigia<b>SUS</b>
              </h1>
            </Link>
            <Image
              src="/logos/logo-jaboatao.png"
              alt="Prefeitura de Jaboatão"
              width={170}
              height={32}
              className="h-8"
            />
          </div>

          {/* Ícones de ações */}
          <div className="flex items-center gap-4 text-blue-700">
            <UpdateStatusPopover
              lastUpdateRelative={lastUpdateRelative}
              lastUpdateLabel={lastUpdateLabel}
              lastUpdateItemName={lastUpdateItem?.nome ?? null}
              isRecent={isRecent}
            />

            {/* Ícone de Notificações */}
            <div className="relative">
              <button onClick={handleNotificationsClick} className="hover:opacity-70">
                <Image
                  src="/icons/sininho.svg"
                  alt="Notificações"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
              {unreadNotifications > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadNotifications}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Modal de Notificações */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onOpenContextoDetails={handleOpenContextoDetails}
      />

      {/* --- Modal de Detalhes do Contexto --- */}
      <DetalhesContextoModal
        isOpen={isDetalhesContextoOpen}
        onClose={handleCloseDetalhesContexto}
        contexto={selectedContexto}
        perfil={userProfile}
        isFromHistory={!!(selectedContexto?.historico && selectedContexto.historico.length > 0)}
      />
      {/* Indicador de Loading (opcional) */}
      {isLoadingContexto && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[60] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      )}
      {/* --- Fim do Modal de Detalhes do Contexto --- */}
    </>
  );
}