// src/components/layout/AppShell.tsx
"use client"

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

type Props = {
    children: React.ReactNode;
    navbarClassName?: string;
};

/**
 * Client-side shell that conditionally shows Navbar/Footer based on route.
 * Hides chrome on auth pages like /login.
 */
export default function AppShell({ children }: Props) {
    const pathname = usePathname();
    const hideChrome = pathname === "/login" || pathname?.startsWith("/login/") || pathname === "/logout";

    if (hideChrome) {
        return <main className="flex-1">{children}</main>;
    }

    // --- INÍCIO DA CORREÇÃO ---
    // Trocamos o Fragmento React (<> ... </>) por um <div>.
    // Adicionamos 'min-h-full' para garantir que este div preencha
    // a altura do <GlobalScrollArea> (que é h-screen).
    // Adicionamos 'flex flex-col' para que os filhos (Navbar, main, Footer)
    // se empilhem verticalmente e o 'flex-1' do <main> funcione.
    return (
        <div className="flex flex-col min-h-full">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
    // --- FIM DA CORREÇÃO ---
}