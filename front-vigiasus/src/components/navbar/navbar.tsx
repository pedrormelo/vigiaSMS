"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Link as LucideLink, Menu } from 'lucide-react';
//import { Button } from "../button";
//import { h1 } from "framer-motion/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  
  // SIMULAÇÃO: Estado para o contador de notificações.
  // Em uma aplicação real, este valor viria de uma API.
  const [unreadNotifications, setUnreadNotifications] = useState(3); 

  // Esse role futuramente vem do AuthContext
  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  const handleNotificationsClick = () => {
    // Ao clicar no ícone, o contador é zerado
    // (Simulando que as notificações foram visualizadas)
    setUnreadNotifications(0);
  };

  return (
    <>
      <header className="bg-white w-full drop-shadow-md">
        <div className="container flex min-w-full min-h-[64px] justify-between items-center py-2 px-18">
          {/* Botão Menu (mobile e desktop) */}
          <button onClick={() => setOpen(true)} className="text-blue-700 hover:text-blue-500 cursor-pointer">
            <Menu strokeWidth={2.5} className="w-9 h-9" />
          </button>

          {/* Bloco central com VigiaSUS e Logo Jaboatão juntos */}
          <div className="flex items-center gap-22">
            {/* Texto VigiaSUS (visível apenas em desktop) */}
            <Link href="/" className="block">
              <h1 className="text-2xl text-blue-700 hover:text-blue-500 cursor-pointer transition-transform">
                Vigia<b>SUS</b>
              </h1>
            </Link>
            {/* Logo Prefeitura (visível em mobile e desktop) */}
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
              <Link href="/notifications" onClick={handleNotificationsClick} className="hover:opacity-70">
                <Image
                  src="/icons/sininho.svg"
                  alt="Notificações"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </Link>
              {unreadNotifications > 0 && (
                <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar role={role} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}