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
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 h-full w-full md:w-64 bg-white shadow-lg z-50 flex flex-col p-4"
      >
        {/* Botão fechar menu */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-blue-700 text-xl"
        >
          ✕
        </button>

        {/* Logo */}
        <Image
          src="/logos/logo-jaboatao.png"
          alt="Prefeitura"
          className="mb-4 mx-auto"
          width={152}
          height={32}
        />

        {/* Perfil */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 border-2 border-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl text-blue-600">👤</span>
          </div>
          <h2 className="font-bold text-blue-700 text-sm">Usuário</h2>
          <p className="text-xs text-blue-600 capitalize">{role}</p>
        </div>

        {/* Menu com scroll */}
          <nav className="flex flex-col items-center gap-2 w-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-300 min-w-30 scrollbar-track-transparent">
            {menuOptions[role].map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 w-full"
                style={{ minWidth: "180px" }}
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-center w-full">{label}</span>
              </Link>
            ))}
          </nav>
      </motion.aside>
    </>
  );
}
