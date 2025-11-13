// src/hooks/useCurrentUser.ts
"use client";

import { useMemo } from "react";

export type UserRole = "diretor" | "secretaria" | "usuario";

export interface CurrentUser {
  name: string;
  role: UserRole;
  diretoriaId?: string; // for diretor(a)
  gerenciaId?: string;  // for usuario
}

// Reads a simple user object from localStorage (key: 'vigiasus:user') if present.
// Example structure:
// { "name": "Ana", "role": "diretor", "diretoriaId": "gestao-sus" }
// { "name": "João", "role": "usuario", "gerenciaId": "g7" }
export function useCurrentUser(): CurrentUser {
  return useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("vigiasus:user");
        if (raw) {
          const parsed = JSON.parse(raw);
          // Basic validation with sensible fallbacks
          const role: UserRole = ["diretor", "secretaria", "usuario"].includes(parsed.role)
            ? parsed.role
            : "usuario";
          return {
            name: typeof parsed.name === "string" ? parsed.name : "Visitante",
            role,
            diretoriaId: typeof parsed.diretoriaId === "string" ? parsed.diretoriaId : undefined,
            gerenciaId: typeof parsed.gerenciaId === "string" ? parsed.gerenciaId : undefined,
          } satisfies CurrentUser;
        }
      } catch (e) {
        // ignore parse errors and fall back
      }
    }
    // Defaults for local dev/demo
    return {
      name: "Chimbinha",
      role: "usuario",
      gerenciaId: "g7", // GTI from constants
      diretoriaId: "gestao-sus",
    } satisfies CurrentUser;
  }, []);
}
