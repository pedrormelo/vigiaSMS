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

    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
