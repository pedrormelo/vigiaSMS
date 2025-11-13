"use client"

import { Button } from "@/components/ui/button";
import Metrics from "./metrics"; 
import { Plus } from "lucide-react";
import Link from 'next/link';
import type { UserRole } from "@/hooks/useCurrentUser";

interface HeroProps {
  role?: UserRole;
  userName?: string;
  diretoriaId?: string;
  gerenciaId?: string;
}

export default function Hero({ role = "usuario", userName = "Visitante", diretoriaId, gerenciaId }: HeroProps) {
  const targetHref = (() => {
    if (role === "diretor") {
      const id = diretoriaId || "gestao-sus"; // fallback
      return `/dashboard/${id}`;
    }
    if (role === "secretaria") {
      return "/dashboard/secretaria";
    }
    // usuario (padrão)
    if (gerenciaId) return `/gerencia/${gerenciaId}`;
    return "/dados"; // fallback seguro
  })();

  const roleLabel = role === "diretor" ? "Diretoria"
    : role === "secretaria" ? "Secretaria"
    : "Usuário";
  return ( 
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1745FF] to-cyan-600 text-white pt-16 pb-24 px-6">

      {/* Container de fundo com brilhos e pontos */}
      <div className="absolute inset-0 z-0 bg-dot-pattern bg-dots-size">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1745FF]/50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Container principal para o conteúdo e a decoração */}
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Conteúdo superior do Hero (texto e botões) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Lado Esquerdo com o conteúdo principal */}
          <div className="flex-1 lg:max-w-2xl">
            <h2 className="text-lg font-medium text-blue-100">👋 Olá, {userName} ({roleLabel}), seja bem-vinda(o) ao:</h2>
            <h1 className="text-5xl font-bold mt-2">VigiaSUS</h1>
            <p className="mt-4 text-lg text-blue-100">
              Plataforma digital da Secretaria de Saúde de Jaboatão dos Guararapes que 
              centraliza dados, relatórios e informações estratégicas para apoiar 
              a gestão da saúde pública.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dados">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-600 rounded-2xl px-8 py-6 font-semibold">
                Acesse os Dados Gerais
              </Button>
              </Link>
              <Link href={targetHref}>
                <Button className="bg-white hover:bg-gray-100 text-blue-700 rounded-2xl px-8 py-6 font-semibold">
                  Acesse o Painel de Gráficos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Este container flutua no canto superior direito sem ocupar espaço no layout */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          {/* Ícone 1 */}
          <div className="absolute top-1/4 right-1/3 text-cyan-200/50">
            <Plus size={48} className="rotate-12" />
          </div>
          {/* Ícone 2 */}
          <div className="absolute top-0 right-0 text-white/30">
            <Plus size={32} className="-rotate-45" />
          </div>
          {/* Ícone 3 */}
          <div className="absolute bottom-1/4 left-0 text-cyan-300/40">
            <Plus size={64} className="rotate-45" />
          </div>
          {/* Ícone 4 */}
          <div className="absolute bottom-0 right-1/2 text-white/20">
            <Plus size={24} className="rotate-12" />
          </div>
          {/* Ícone 5 */}
          <div className="absolute top-1/2 right-10 text-white/25">
            <Plus size={40} className="-rotate-12" />
          </div>
        </div>
        
        <div className="mt-20">
          <Metrics />
        </div>
      </div>
    </section>
  )
}