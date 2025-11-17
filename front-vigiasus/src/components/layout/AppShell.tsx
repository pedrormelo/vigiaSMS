// src/components/layout/AppShell.tsx
"use client";

import { usePathname } from "next/navigation"; // 1. Importação necessária para ler a rota
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Sidebar from "@/components/navbar/Sidebar";
import Navbar from "@/components/navbar/navbar";
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
        <Sidebar
          role={currentUser?.role} // Adicionei '?' caso currentUser seja null
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-content">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
          {children}
        <Footer />
      </div>
    </div>
  );
}