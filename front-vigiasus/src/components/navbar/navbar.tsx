// src/components/navbar/navbar.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Loader2 } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal"; // <-- Importar
import { getContextoById } from "@/services/contextoService"; // <-- Importar serviço
import { Contexto } from "@/components/validar/typesDados"; // <-- Importar tipo
import { Notification } from "@/constants/types"; // <-- CORRIGIDO: Importar de types.ts

// --- Adicionado UpdateStatusPopover ---
import UpdateStatusPopover from "./UpdateStatusPopover";
// --- Fim da adição ---

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Simulação - buscar dados reais de notificação/atualização
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [lastUpdateInfo, setLastUpdateInfo] = useState({
    relative: "há 2 horas", // Ex: 'agora', 'há 5 min', 'há 1 dia'
    label: "29/10/2025 09:15", // Ex: Data/Hora completa
    itemName: "Relatório Mensal de Atendimentos - Setembro", // Nome do último item
    isRecent: true // Se a atualização é considerada recente
  });
  // --- Fim da simulação ---


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
    // Simulação: Zerar contador ao fechar (ajustar conforme regra de negócio)
    // setUnreadNotifications(0);
  };

  // --- Função para abrir Detalhes do Contexto a partir de uma Notificação ---
  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;

    setIsLoadingContexto(true);
    setIsNotificationsOpen(false); // Fecha modal de notificações

    try { // Adicionado try/catch
      const contextoDetails = await getContextoById(notification.contextoId); //
      if (contextoDetails) {
        setSelectedContexto(contextoDetails);
        setIsDetalhesContextoOpen(true);
      } else {
        // Tratar erro - talvez mostrar um toast
        console.error(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`); // Log de erro
        alert(`Erro: Contexto com ID ${notification.contextoId} não encontrado.`);
        setIsNotificationsOpen(true); // Reabre notificações se contexto não encontrado
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do contexto:", error);
      alert("Ocorreu um erro ao carregar os detalhes do contexto. Tente novamente.");
      setIsNotificationsOpen(true); // Reabre notificações em caso de erro na busca
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
  // --- Fim da lógica de Detalhes do Contexto ---


  // Simulação do role (deve vir do sistema de autenticação)
  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-30">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6"> {/* Ajustado padding e altura */}
          {/* Botão Menu (Esquerda) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-blue-700 hover:text-blue-500 transition-colors p-2 -ml-2 md:ml-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1" // Melhorias de acessibilidade e clique
            aria-label="Abrir menu lateral"
          >
            <Menu strokeWidth={2.5} className="w-6 h-6 md:w-7 md:h-7" /> {/* Tamanho responsivo */}
          </button>

          {/* Bloco central (Logos) */}
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8"> {/* Espaçamento responsivo */}
            <Link href="/" className="block flex-shrink-0">
              <h1 className="text-xl md:text-2xl text-blue-700 hover:text-blue-500 transition-colors">
                Vigia<b>SUS</b>
              </h1>
            </Link>
            {/* Logo Jaboatão escondido em telas pequenas para economizar espaço */}
            <Image
              src="/logos/logo-jaboatao.png"
              alt="Prefeitura de Jaboatão"
              width={150} // Ajustado
              height={30} // Ajustado
              className="h-7 md:h-8 w-auto hidden sm:block" // Esconde em 'xs'
              priority // Prioriza carregamento da logo
            />
          </div>

          {/* Ícones de ações (Direita) */}
          <div className="flex items-center gap-3 md:gap-4 text-blue-700">

            {/* --- Popover de Status do Sistema --- */}
            <UpdateStatusPopover
              lastUpdateRelative={lastUpdateInfo.relative}
              lastUpdateLabel={lastUpdateInfo.label}
              lastUpdateItemName={lastUpdateInfo.itemName}
              isRecent={lastUpdateInfo.isRecent}
            />
            {/* --- Fim do Popover --- */}


            {/* Ícone de Notificações com contador */}
            <div className="relative">
              <button
                onClick={handleNotificationsClick}
                className="hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1" // Melhorias de acessibilidade
                aria-label={`Notificações (${unreadNotifications} não lidas)`}
              >
                <Image
                  src="/icons/sininho.svg"
                  alt="" // Alt vazio pois o aria-label descreve
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
              {unreadNotifications > 0 && (
                // Indicador de notificações não lidas
                <div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold pointer-events-none" // Impede que o número bloqueie o clique no sino
                  aria-hidden="true" // Esconde de leitores de tela (já informado no aria-label do botão)
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications} {/* Limita a 9+ */}
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
        isFromHistory={selectedContexto?.historico && selectedContexto.historico.length > 0} //
      />

      {/* Indicador de Loading (com estilo corrigido) */}
      {isLoadingContexto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"> {/* MODIFICADO: bg-black/60 */}
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      )}
      {/* --- Fim do Modal de Detalhes do Contexto --- */}
    </>
  );
}