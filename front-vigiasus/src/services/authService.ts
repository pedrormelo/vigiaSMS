// src/services/authService.ts
"use client";

export type UserRole = "diretor" | "gerente" | "membro" | "secretaria";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  diretoriaId?: string; // optional routing hints
}

const STORAGE_KEY = "vigiasus:user";

// Simple mock auth: in real app, call your API
const mockUsers: Array<{ email: string; password: string; user: AuthUser }> = [
  { email: "diretor@vigia.sus", password: "123456", user: { id: "u1", name: "Diretor(a)", email: "diretor@vigia.sus", role: "diretor" } },
  { email: "gerente@vigia.sus", password: "123456", user: { id: "u2", name: "Gerente", email: "gerente@vigia.sus", role: "gerente" } },
  { email: "membro@vigia.sus", password: "123456", user: { id: "u3", name: "Membro", email: "membro@vigia.sus", role: "membro" } },
];

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    await new Promise((r) => setTimeout(r, 500));
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
      throw new Error("Credenciais inválidas");
    }
    return found.user;
  },
  saveUser: (user: AuthUser, remember = true) => {
    try {
      const store: Storage = remember ? window.localStorage : window.sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  },
  getUser: (): AuthUser | null => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  logout: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
