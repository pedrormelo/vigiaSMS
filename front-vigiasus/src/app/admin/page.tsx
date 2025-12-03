// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck,
  Users,
  Building2,
  Settings,
  FileText,
  Lock,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

// Módulos do painel administrativo
const adminModules = [
  {
    title: "Gestão de Usuários",
    description: "Criar, editar, remover usuários e redefinir senhas.",
    icon: Users,
    href: "/admin/usuarios",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    active: true,
  },
  {
    title: "Diretorias e Gerências",
    description: "Gerenciar estrutura organizacional da SMS.",
    icon: Building2,
    href: "/admin/organizacao",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    active: false,
  },
  {
    title: "Configurações do Sistema",
    description: "Editar parâmetros gerais e notificações.",
    icon: Settings,
    href: "/admin/configuracoes",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    active: false,
  },
  {
    title: "Logs de Auditoria",
    description: "Acompanhe ações realizadas dentro da plataforma.",
    icon: FileText,
    href: "/admin/logs",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    active: false,
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { role } = useCurrentUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Proteção de rota
  useEffect(() => {
    const timer = setTimeout(() => {
      if (role === "admin") {
        setIsAuthorized(true);
      } else {
        router.replace("/");
      }
      setChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [role, router]);

  if (checking) return null;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* HERO - Cabeçalho semelhante à Central de Ajuda */}
      <div className="text-center py-14 px-4">
        <h1 className="text-4xl font-bold text-blue-700">
          Painel Administrativo
        </h1>
        <p className="text-gray-500 text-lg mt-3">
          Gerencie usuários, diretoria, configurações e auditorias do sistema.
        </p>
      </div>

      {/* GRID DE MÓDULOS */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {adminModules.map((module, index) => {
            const Icon = module.icon;
            const Card = module.active ? Link : "div";

            return (
              <Card
                key={index}
                href={module.href}
                className={cn(
                  "block bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center transition-all",
                  module.active
                    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Ícone círculo como na Central de Ajuda */}
                <div
                  className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6",
                    module.bgColor
                  )}
                >
                  <Icon className={cn("w-8 h-8", module.color)} />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {module.title}
                </h3>

                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {module.description}
                </p>

                {!module.active && (
                  <div className="mt-5">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-semibold">
                      <Lock size={12} /> Em breve
                    </span>
                  </div>
                )}
              </Card>
            );
          })}

        </div>
      </div>
    </div>
  );
}
