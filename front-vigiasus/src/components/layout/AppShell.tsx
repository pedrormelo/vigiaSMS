// src/components/layout/AppShell.tsx
"use client";

import { usePathname } from "next/navigation"; // 1. Importação necessária para ler a rota
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Sidebar from "@/components/navbar/Sidebar";
import Navbar from "@/components/navbar/navbar";
import BottomNavigation from "@/components/navbar/BottomNavigation";
import { useState, useEffect } from "react";
import Footer from "@/components/footer/footer"; 

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // 2. Obtemos o caminho da URL atual
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = useCurrentUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openHandler = () => setSidebarOpen(true);
    const closeHandler = () => setSidebarOpen(false);

    window.addEventListener("vigiasus:sidebar-open", openHandler as EventListener);
    window.addEventListener("vigiasus:sidebar-close", closeHandler as EventListener);

    return () => {
      window.removeEventListener("vigiasus:sidebar-open", openHandler as EventListener);
      window.removeEventListener("vigiasus:sidebar-close", closeHandler as EventListener);
    };
  }, []);

  // 3. Definimos quais rotas NÃO devem ter a Navbar/Sidebar
  // O "startsWith" ajuda com rotas como "/login/esqueci-senha"
  const isAuthPage = pathname === "/login" || pathname?.startsWith("/login/");

  // 4. Se for uma página de autenticação, retornamos apenas o conteúdo limpo
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  // Layout Padrão (Com Navbar e Sidebar) para as outras páginas
  return (
    <div>
      {/* Só renderiza a Sidebar se estiver montado no cliente */}
      {isMounted && (
        <div className="hidden md:block">
          <Sidebar
            role={currentUser?.role} // Adicionei '?' caso currentUser seja null
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="main-content pb-[60px] md:pb-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
          {children}
        <Footer />
      </div>

      {/* Bottom Navigation - renderiza condicionalmente apenas em páginas autenticadas */}
      {isMounted && <BottomNavigation />}
    </div>
  );
}