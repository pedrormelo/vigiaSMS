// src/components/layout/AppShell.tsx
"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import Sidebar from "@/components/navbar/Sidebar";
import Navbar from "@/components/navbar/navbar";
import { useState, useEffect } from "react";
import { Footer } from "react-day-picker";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 1. Estado para controlar a montagem

  const currentUser = useCurrentUser();

  // 2. useEffect roda apenas no cliente, após o primeiro render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      {/* 3. Só renderiza a Sidebar se estiver montado no cliente */}
      {isMounted && (
        <Sidebar
          role={currentUser.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="main-content">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        {children}
      </div>
       <Footer/>
    </div>
  );
}