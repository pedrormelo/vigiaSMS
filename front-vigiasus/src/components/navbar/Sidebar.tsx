// src/components/navbar/Sidebar.tsx
"use client";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { useState, useEffect } from "react"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  HiHome,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from "react-icons/hi";
import {
  PanelRightOpen,
  CircleUserRound,
  BookCheck,
  LayoutDashboard,
  GalleryVerticalEnd,
  Layers,
  MessageSquareMore,
  FolderClock,
  MessageCircleQuestionMark
} from 'lucide-react';

interface SidebarProps {
  role: string; 
  isOpen: boolean;
  onClose: () => void;
}

// icones da sidebar LUCIDE + react icons
const icons = {
  home: HiHome,
  validarContextos: HiOutlineClipboardList,
  contextos: BookCheck,
  logout: HiOutlineLogout,
  comentarios: MessageSquareMore,
  book: BookCheck,
  dashboard: LayoutDashboard,
  dadosGerais: GalleryVerticalEnd,
  minhasGerencias: Layers,
  contextosEnviados: FolderClock,
  ajuda: MessageCircleQuestionMark
};

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  // 2. Estado para controlar a hidratação
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- LÓGICA DE DADOS ---
  
  // 3. Normalizar o role
  const normalizedRole = (isMounted ? role : "membro")?.toLowerCase() || "membro";
  const safeRole = normalizedRole === "admin" ? "secretario" : normalizedRole;

  // 4. Obter os dados do usuário dinamicamente
  const getUserData = () => {
    if (!isMounted) return null;
    try {
      return authService.getUser();
    } catch {
      return null;
    }
  };

  const userData = getUserData();

  // Slugs e IDs para os links
  // Fallback para string vazia ou rota segura se não encontrar
  const diretoriaSlug = userData?.diretoriaSlug || userData?.diretoriaId || "gestao-sus";
  const diretoriaId = userData?.diretoriaId || userData?.diretoriaSlug || ""; // Usado para a página Minhas Gerências
  const gerenciaSlug = userData?.gerenciaSlug || userData?.gerenciaId || "";

  // 5. Definição do Menu
  const menuOptions: Record<string, any[]> = {
    secretario: [
      { label: "Página Inicial", icon: icons.home, href: "/" },
      { label: "Dashboard", icon: icons.dashboard, href: `/dashboard/secretaria` },
      { label: "Dados Gerais", icon: icons.dadosGerais, href: "/dados" },
      { label: "Meus Comentários", icon: icons.comentarios, href: "/comentarios" },
      { label: "Central de Ajuda", icon: icons.ajuda, href: "/ajuda"},
      { label: "Sair do Sistema", icon: icons.logout, href: "/logout" },
    ],
    diretor: [
      { label: "Página Inicial", icon: icons.home, href: "/" },
      { label: "Dashboard da Diretoria", icon: icons.dashboard, href: `/dashboard/${diretoriaSlug}` },
      // Link dinâmico para a página de lista de gerências
      { label: "Minhas Gerências", icon: icons.minhasGerencias, href: `/minhas-gerencias/${diretoriaId}` }, 
      { label: "Validar Contextos", icon: icons.contextos, href: "/validar" },
      { label: "Dados Gerais", icon: icons.dadosGerais, href: "/dados" },
      { label: "Central de Ajuda", icon: icons.ajuda, href: "/ajuda"},
      { label: "Sair do Sistema", icon: icons.logout, href: "/logout" },
    ],
    gerente: [
      { label: "Página Inicial", icon: icons.home, href: "/" },
      // Link dinâmico para a página da gerência específica
      { label: "Minha Gerência", icon: icons.minhasGerencias, href: `/gerencia/${gerenciaSlug}` }, 
      { label: "Validar Contextos", icon: icons.contextos, href: "/validar" },
      { label: "Dados Gerais", icon: icons.dadosGerais, href: "/dados" },
      { label: "Central de Ajuda", icon: icons.ajuda, href: "/ajuda"},
      { label: "Sair do Sistema", icon: icons.logout, href: "/logout" },
    ],
    membro: [
      { label: "Página Inicial", icon: icons.home, href: "/" },
      // Link dinâmico para a página da gerência específica
      { label: "Minha Gerência", icon: icons.minhasGerencias, href: `/gerencia/${gerenciaSlug}` },
      { label: "Contextos Enviados", icon: icons.contextosEnviados, href: "/validar" },
      { label: "Dados Gerais", icon: icons.dadosGerais, href: "/dados" },
      { label: "Central de Ajuda", icon: icons.ajuda, href: "/ajuda"},
      { label: "Sair do Sistema", icon: icons.logout, href: "/logout" },
    ],
  };

  // Seleciona as opções com base no role seguro
  const currentOptions = menuOptions[safeRole] || menuOptions['membro'];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    
    // Lógica especial para dashboards e gerências para manter ativo em sub-rotas
    if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
    if (href.startsWith("/gerencia")) return pathname.startsWith("/gerencia");
    if (href.startsWith("/minhas-gerencias")) return pathname.startsWith("/minhas-gerencias");

    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Overlay escuro no fundo */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />}

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 114, damping: 20 }}
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
          <h2 className="font-bold text-blue-700 text-sm">
             {isMounted ? userData?.name || "Usuário" : "..."}
          </h2>
          <p className="text-xs text-blue-600 capitalize">{isMounted ? role : "..."}</p>
        </div>

        {/* Menu com scroll */}
        <nav className="flex flex-col gap-2 w-full overflow-y-auto px-2 pr-1 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {currentOptions.map(({ label, icon: Icon, href }) => {
            const active = isActive(href);
            
            // Se o link estiver vazio (ex: gerente sem gerencia vinculada), desabilita ou esconde
            // Aqui optamos por manter mas talvez desativado visualmente se href for curto demais
            if (href.length < 2 && label !== "Página Inicial") return null; 

            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={onClose} // Fecha o menu ao clicar
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-[15px] text-sm justify-center w-full border transition-colors",
                  active
                    ? "bg-blue-400/70 text-blue-700 font-medium border-blue-400/50 shadow-sm hover:bg-blue-300 hover:border-blue-400/30"
                    : "bg-blue-600 text-white border-blue-700/20 hover:bg-blue-700"
                )}
              >
                <Icon size={18} className={cn(active ? "text-blue-700" : "text-white")} />
                <span className="w-full text-center">{label}</span>
              </Link>
            );
          })}
        </nav>

      </motion.aside>
    </>
  );
}