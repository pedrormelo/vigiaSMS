// src/components/layout/Navbar.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { Menu } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Esse role futuramente vem do AuthContext
  const role: "secretario" | "diretor" | "gerente" | "membro" = "diretor";

  return (
    <>
  <header className="bg-white w-full drop-shadow-md">
        <div className="container flex min-w-full min-h-[64px] justify-between items-center py-2 px-18">
          {/* Botão Menu (mobile e desktop) */}
          <button onClick={() => setOpen(true)} className="text-blue-700 hover:text-blue-500 cursor-pointer">
            <Menu strokeWidth={2.5} className="w-9 h-9" />
          </button>

          {/*Bloco central com VigiaSUS e Logo Jaboatão juntos */}
          <div className="flex items-center gap-22">
            {/* Texto VigiaSUS (visível apenas em desktop) */}
            <h1 className="hidden md:block text-2xl text-blue-700">
              Vigia<b>SUS</b>
            </h1>
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
            <button className="hover:opacity-70">
              <Image
                src="/icons/sininho.svg"
                alt="Notificações"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar role={role} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}