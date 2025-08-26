// src/app/components/navbar/Sidebar.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  HiHome,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineChatAlt,
} from "react-icons/hi";
import { 
  PanelRightOpen,
  CircleUserRound 
} from 'lucide-react';



interface SidebarProps {
  role: "secretario" | "diretor" | "gerente" | "membro";
  isOpen: boolean;
  onClose: () => void;
}

const menuOptions = {
  secretario: [
    { label: "Página Inicial", icon: HiHome, href: "/" },
    { label: "Dashboard", icon: HiOutlineClipboardList, href: "/dashboard" },
    { label: "Dados Gerais", icon: HiOutlineClipboardList, href: "/dados" },
    { label: "Meus Comentários", icon: HiOutlineChatAlt, href: "/comentarios" },
    { label: "Sair do Sistema", icon: HiOutlineLogout, href: "/logout" },
  ],
  diretor: [
    { label: "Página Inicial", icon: HiHome, href: "/" },
    { label: "Dashboard da Diretoria", icon: HiOutlineClipboardList, href: "/dashboard" },
    { label: "Minhas Gerências", icon: HiOutlineClipboardList, href: "/gerencias" },
    { label: "Validar Contextos", icon: HiOutlineClipboardList, href: "/validar" },
    { label: "Dados Gerais", icon: HiOutlineClipboardList, href: "/dados" },
    { label: "Meus Comentários", icon: HiOutlineChatAlt, href: "/comentarios" },
    { label: "Sair do Sistema", icon: HiOutlineLogout, href: "/logout" },
  ],
  gerente: [
    { label: "Página Inicial", icon: HiHome, href: "/" },
    { label: "Dashboard da Gerência", icon: HiOutlineClipboardList, href: "/dashboard" },
    { label: "Validar Contextos", icon: HiOutlineClipboardList, href: "/validar" },
    { label: "Dados Gerais", icon: HiOutlineClipboardList, href: "/dados" },
    { label: "Meus Comentários", icon: HiOutlineChatAlt, href: "/comentarios" },
    { label: "Sair do Sistema", icon: HiOutlineLogout, href: "/logout" },
  ],
  membro: [
    { label: "Página Inicial", icon: HiHome, href: "/" },
    { label: "Contextos Enviados", icon: HiOutlineClipboardList, href: "/validar" },
    { label: "Dados Gerais", icon: HiOutlineClipboardList, href: "/dados" },
    { label: "Meus Comentários", icon: HiOutlineChatAlt, href: "/comentarios" },
    { label: "Sair do Sistema", icon: HiOutlineLogout, href: "/logout" },
  ],
};

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay escuro no fundo */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm"
        />
      )}

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 h-full w-full min-w-2xs md:w-64 bg-white shadow-lg z-50 flex flex-col p-4"
      >
        {/* Botão fechar menu */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-green-700 text-xl cursor-pointer"
        >
          <PanelRightOpen className="w-8 h-8" />
        </button>

        {/* Logo alinhado à esquerda */}
        <div className="mb-4 flex justify-start">
          <Image
            src="/logos/logo-jaboatao2.png"
            alt="Prefeitura"
            className="max-h-28 max-w-28"
            width={152}
            height={32}
          />
        </div>

        {/* Perfil */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-2">
            <span className=" text-blue-600"><CircleUserRound strokeWidth={0.75} className="w-20 h-20" /></span>
          </div>
          <h2 className="font-bold text-blue-700 text-sm">Usuário</h2>
          <p className="text-xs text-blue-600 capitalize">{role}</p>
        </div>

        {/* Menu com scroll */}
        <nav className="flex flex-col gap-2 w-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {menuOptions[role].map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
