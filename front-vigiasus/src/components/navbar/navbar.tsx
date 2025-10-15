"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  
  // Novo estado para controlar a visibilidade do modal de notificações
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  const handleNotificationsClick = () => {
    // Abre o modal
    setIsNotificationsOpen(true);
    // Ao abrir, o contador é zerado (simulando que foram lidas)
    setUnreadNotifications(0);
  };

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-30">
        <div className="container flex min-w-full min-h-[64px] justify-between items-center py-2 px-18">
          {/* Botão Menu (mobile e desktop) */}
          <button onClick={() => setOpen(true)} className="text-blue-700 hover:text-blue-500 cursor-pointer">
            <Menu strokeWidth={2.5} className="w-9 h-9" />
          </button>

          {/* Bloco central com VigiaSUS e Logo Jaboatão juntos */}
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
            
            {/* Ícone de Notificações com sinal de alerta */}
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
                <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar role={role} isOpen={open} onClose={() => setOpen(false)} />

      {/* O modal de notificações é renderizado aqui e controlado pelo estado `isNotificationsOpen` */}
      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}