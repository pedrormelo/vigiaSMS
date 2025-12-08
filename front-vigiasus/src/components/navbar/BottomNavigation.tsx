// src/components/navbar/BottomNavigation.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authService } from "@/services/authService";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { HiHome, HiOutlineLogout } from "react-icons/hi";
import {
  ShieldCheck,
  LayoutDashboard,
  GalleryVerticalEnd,
  Layers,
  MessageCircleQuestionMark,
  Box,
  Folder,
  FolderClock,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

// Ícones Lucide + react-icons
const icons = {
  home: HiHome,
  admin: ShieldCheck,
  dashboard: LayoutDashboard,
  dadosGerais: GalleryVerticalEnd,
  minhasGerencias: Layers,
  contextos: Box,
  gerencia: Folder,
  contextosEnviados: FolderClock,
  ajuda: MessageCircleQuestionMark,
  logout: HiOutlineLogout,
};

export default function BottomNavigation() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!user) return null;

  // Obter dados do usuário autenticado
  const userData = authService.getUser();
  const diretoriaSlug = userData?.diretoriaSlug || "gestao-sus";
  const diretoriaId = userData?.diretoriaId || diretoriaSlug;
  const gerenciaSlug = userData?.gerenciaSlug || userData?.gerenciaId || "";

  // Normalizar role
  const normalizedRole = (user.role || "membro").toLowerCase();
  const allowedRoles = ["admin", "secretaria", "diretor", "gerente", "membro"];
  const safeRole = allowedRoles.includes(normalizedRole) ? normalizedRole : "membro";

  // Menu por role (baseado na Sidebar com ícones Lucide)
  const menuByRole: Record<string, NavItem[]> = {
    admin: [
      { id: "home", label: "Inicial", icon: icons.home, href: "/" },
      { id: "admin", label: "Gestão", icon: icons.admin, href: "/admin" },
      { id: "dados", label: "Dados", icon: icons.dadosGerais, href: "/dados" },
      { id: "ajuda", label: "Ajuda", icon: icons.ajuda, href: "/ajuda" },
      { id: "logout", label: "Sair", icon: icons.logout, href: "/logout" },
    ],
    secretaria: [
      { id: "home", label: "Inicial", icon: icons.home, href: "/" },
      { id: "dashboard", label: "Dashboard", icon: icons.dashboard, href: "/dashboard/secretaria" },
      { id: "dados", label: "Dados", icon: icons.dadosGerais, href: "/dados" },
      { id: "ajuda", label: "Ajuda", icon: icons.ajuda, href: "/ajuda" },
      { id: "logout", label: "Sair", icon: icons.logout, href: "/logout" },
    ],
    diretor: [
      { id: "home", label: "Inicial", icon: icons.home, href: "/" },
      { id: "dashboard", label: "Dashboard", icon: icons.dashboard, href: `/dashboard/${diretoriaSlug}` },
      { id: "gerencias", label: "Gerências", icon: icons.minhasGerencias, href: `/minhas-gerencias/${diretoriaId}` },
      { id: "validar", label: "Validar", icon: icons.contextos, href: "/validar" },
      { id: "dados", label: "Dados", icon: icons.dadosGerais, href: "/dados" },
      { id: "ajuda", label: "Ajuda", icon: icons.ajuda, href: "/ajuda" },
      { id: "logout", label: "Sair", icon: icons.logout, href: "/logout" },
    ],
    gerente: [
      { id: "home", label: "Inicial", icon: icons.home, href: "/" },
      { id: "gerencia", label: "Minha Gerência", icon: icons.gerencia, href: `/gerencia/${gerenciaSlug}` },
      { id: "validar", label: "Validar", icon: icons.contextos, href: "/validar" },
      { id: "dados", label: "Dados", icon: icons.dadosGerais, href: "/dados" },
      { id: "ajuda", label: "Ajuda", icon: icons.ajuda, href: "/ajuda" },
      { id: "logout", label: "Sair", icon: icons.logout, href: "/logout" },
    ],
    membro: [
      { id: "home", label: "Inicial", icon: icons.home, href: "/" },
      { id: "gerencia", label: "Minha Gerência", icon: icons.gerencia, href: `/gerencia/${gerenciaSlug}` },
      { id: "enviados", label: "Enviados", icon: icons.contextosEnviados, href: "/validar" },
      { id: "dados", label: "Dados", icon: icons.dadosGerais, href: "/dados" },
      { id: "ajuda", label: "Ajuda", icon: icons.ajuda, href: "/ajuda" },
      { id: "logout", label: "Sair", icon: icons.logout, href: "/logout" },
    ],
  };

  const navItems = menuByRole[safeRole] || [];
  
  // Itens principais (mostrados diretamente) - primeiros 4
  const mainItems = navItems.slice(0, 4);
  // Itens extras (dropdown) - resto
  const extraItems = navItems.slice(4);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
    if (href.startsWith("/gerencia")) return pathname.startsWith("/gerencia");
    if (href.startsWith("/minhas-gerencias")) return pathname.startsWith("/minhas-gerencias");
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Renderiza item de navegação com ícones Lucide/react-icons
  const NavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const IconComponent = item.icon;

    if (item.href === "/logout") {
      return (
        <button
          onClick={() => {
            authService.logout();
            window.location.href = "/login";
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all duration-200 text-xs font-medium",
            active ? "text-blue-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          )}
          title={item.label}
        >
          <IconComponent className="w-6 h-6" />
          <span className="text-xs">{item.label}</span>
        </button>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all duration-200 text-xs font-medium",
          active ? "text-blue-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        )}
        title={item.label}
      >
        <IconComponent className="w-6 h-6" />
        <span className="text-xs">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Bottom Navigation - Visível apenas em mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-40 pb-safe" id="tour-mobile-navbar">
        <div className="flex items-center justify-between h-[70px] px-1">
          {/* Links principais */}
          {mainItems.map((item) => (
            <div key={item.id} className="flex-1 flex justify-center" id={`tour-mobile-nav-${item.id}`}>
              <NavItem item={item} />
            </div>
          ))}

          {/* Menu "Mais" (dropdown) - só mostra se houver itens extras */}
          {extraItems.length > 0 && (
            <div key="more" className="flex-1 flex justify-center relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all duration-200",
                  showMoreMenu
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                )}
                title="Mais opções"
              >
                <span className="text-lg">⋯</span>
                <span className="text-xs">Mais</span>
              </button>

              {/* Dropdown menu */}
              {showMoreMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[140px]">
                  {extraItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.id} className="mb-1 last:mb-0">
                        {item.href === "/logout" ? (
                          <button
                            onClick={() => {
                              authService.logout();
                              window.location.href = "/login";
                              setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <IconComponent className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setShowMoreMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <IconComponent className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Espaço de segurança para notch (iPhone) */}
      {typeof window !== "undefined" && (
        <style>{`
          @supports (padding: max(0px)) {
            .pb-safe {
              padding-bottom: max(8px, env(safe-area-inset-bottom));
            }
          }
        `}</style>
      )}
    </>
  );
}
