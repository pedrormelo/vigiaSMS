// src/hooks/useCurrentUser.ts
"use client";

import { useMemo } from "react";

// Atualizamos o tipo UserRole para corresponder ao da Sidebar
export type UserRole = "secretaria" | "diretor" | "gerente" | "membro";

export interface CurrentUser {
  name: string;
  role: UserRole;
  diretoriaId?: string; // for diretor(a)
  diretoriaSlug?: string; // ADICIONADO
  gerenciaId?: string;  // for gerente ou membro
  gerenciaSlug?: string; // ADICIONADO
}

// Reads a simple user object from localStorage (key: 'vigiasus:user') if present.
export function useCurrentUser(): CurrentUser {
  return useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("vigiasus:user");
        if (raw) {
          const parsed = JSON.parse(raw);

          // Criamos uma lógica de tradução para roles antigas
          let role: UserRole;
          
          if (parsed.role === "secretaria") {
            role = "secretario";
          } else if (parsed.role === "usuario") {
            role = "membro";
          } else if (["secretario", "diretor", "gerente", "membro"].includes(parsed.role)) {
            role = parsed.role;
          } else {
            role = "membro";
          }

          return {
            name: typeof parsed.name === "string" ? parsed.name : "Visitante",
            role,
            diretoriaId: typeof parsed.diretoriaId === "string" ? parsed.diretoriaId : undefined,
            // Lendo novos campos
            diretoriaSlug: typeof parsed.diretoriaSlug === "string" ? parsed.diretoriaSlug : undefined,
            gerenciaId: typeof parsed.gerenciaId === "string" ? parsed.gerenciaId : undefined,
            gerenciaSlug: typeof parsed.gerenciaSlug === "string" ? parsed.gerenciaSlug : undefined,
          } satisfies CurrentUser;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    
    // Fallback atualizado
    return {
      name: "Chimbinha",
      role: "membro",
      gerenciaId: "g7",
      // Se quiser adicionar um slug de fallback para teste:
      // gerenciaSlug: "gerencia-tecnologia-informacao", 
      diretoriaId: "gestao-sus",
    } satisfies CurrentUser;
  }, []);
}