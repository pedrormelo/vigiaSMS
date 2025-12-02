// src/hooks/useCurrentUser.ts
"use client";

import { useEffect, useState } from "react";
import { authService, type AuthUser } from "@/services/authService";

// [ATUALIZADO]: Adicionado 'admin' à lista de tipos permitidos
export type UserRole = "admin" | "secretaria" | "diretor" | "gerente" | "membro";

export interface CurrentUser {
  name: string;
  role: UserRole;
  diretoriaId?: string; 
  diretoriaSlug?: string; 
  gerenciaId?: string;  
  gerenciaSlug?: string; 
}

// Reads a simple user object from localStorage (key: 'vigiasus:user') if present.
export function useCurrentUser(): CurrentUser {
  const readUser = (): CurrentUser => {
    const stored = authService.getUser();
    
    if (stored) {
      const parsed = stored as AuthUser;
      let role: UserRole;
      
      // Normaliza para minúsculas para evitar erros de case-sensitive
      const rawRole = (parsed.role as string)?.toLowerCase() || "membro";
      
      if (["admin", "secretaria", "diretor", "gerente", "membro"].includes(rawRole)) {
        role = rawRole as UserRole;
      } else {
        // Fallback padrão para qualquer outro valor (ex: 'usuario')
        role = "membro";
      }

      return {
        name: typeof parsed.name === "string" ? parsed.name : "Visitante",
        role,
        diretoriaId: typeof parsed.diretoriaId === "string" ? parsed.diretoriaId : undefined,
        diretoriaSlug: typeof parsed.diretoriaSlug === "string" ? parsed.diretoriaSlug : undefined,
        gerenciaId: typeof parsed.gerenciaId === "string" ? parsed.gerenciaId : undefined,
        gerenciaSlug: typeof parsed.gerenciaSlug === "string" ? parsed.gerenciaSlug : undefined,
      } satisfies CurrentUser;
    }
    
    // Safe fallback: non-editing default
    return { name: "Visitante", role: "membro" } satisfies CurrentUser;
  };

  const [user, setUser] = useState<CurrentUser>(() => readUser());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes("vigiasus:")) {
        setUser(readUser());
      }
    };
    
    const onUserChange = () => setUser(readUser());
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('vigiasus:user-change', onUserChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('vigiasus:user-change', onUserChange as EventListener);
    };
  }, []);

  return user;
}