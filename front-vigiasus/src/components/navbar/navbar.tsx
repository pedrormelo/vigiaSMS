// src/components/navbar/navbar.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Loader2} from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal"; // <-- Importar
import { getContextoById } from "@/services/contextoService"; // <-- Importar serviço
import { Contexto } from "@/components/validar/typesDados"; // <-- Importar tipo
import { Notification } from "@/constants/notificationsData"; // <-- Importar tipo

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5); // Exemplo inicial

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
    // Poderia zerar o contador aqui ou ao fechar o modal
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    setUnreadNotifications(0); // Zerar contador ao fechar
  };

  // --- Função para abrir Detalhes do Contexto a partir de uma Notificação ---
  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;

    setIsLoadingContexto(true);
    setIsNotificationsOpen(false); // Fecha modal de notificações

    const contextoDetails = await getContextoById(notification.contextoId);
    setIsLoadingContexto(false);

    if (contextoDetails) {
      setSelectedContexto(contextoDetails);
      setIsDetalhesContextoOpen(true);
    } else {
      // Tratar erro - talvez mostrar um toast
      alert(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`);
    }
  };

  const handleCloseDetalhesContexto = () => {
    setIsDetalhesContextoOpen(false);
    setSelectedContexto(null);
    // Opcional: Reabrir notificações se desejar voltar para a lista
    // setIsNotificationsOpen(true);
  };
  // --- Fim da lógica de Detalhes do Contexto ---


  // Simulação do role (deve vir do sistema de autenticação)
  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-30">
        <div className="container flex min-w-full min-h-[64px] justify-between items-center py-2 px-18">
          {/* Botão Menu */}
          <button onClick={() => setIsSidebarOpen(true)} className="text-blue-700 hover:text-blue-500 cursor-pointer">
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
            <button className="hover:opacity-70">
              <Image
                src="/icons/online.svg"
                alt="Atualização do Sistema"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>

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
                // Indicador de notificações não lidas
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
        onOpenContextoDetails={handleOpenContextoDetails} // <-- Passar a função
      />

      {/* --- Modal de Detalhes do Contexto --- */}
      {/* Renderiza condicionalmente */}
      <DetalhesContextoModal
        isOpen={isDetalhesContextoOpen}
        onClose={handleCloseDetalhesContexto}
        contexto={selectedContexto}
        perfil={userProfile} // Passa o perfil do usuário
        // isFromHistory é opcional, mas podemos determinar se o contexto veio do histórico
        isFromHistory={selectedContexto?.historico && selectedContexto.historico.length > 0}
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