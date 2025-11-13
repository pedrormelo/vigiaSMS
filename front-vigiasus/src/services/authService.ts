// src/services/authService.ts
"use client";

export type UserRole = "diretor" | "gerente" | "membro" | "secretaria";

export interface AuthUser {
    id: string;
    name: string;
    cpf: string;
    email?: string | null;
    role: UserRole;
    diretoriaId?: string | null;
    gerenciaId?: string | null;
}

const USER_KEY = "vigiasus:user";
const TOKEN_KEY = "vigiasus:token";

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

async function jsonOrThrow(res: Response) {
    let body: any = null;
    try { body = await res.json(); } catch {}
    if (!res.ok) {
        const msg = body?.message || `Erro ${res.status}`;
        throw new Error(msg);
    }
    return body;
}

export const authService = {
    login: async (cpf: string, password: string): Promise<AuthUser> => {
        const base = apiBase();
        if (!base) throw new Error("API base não configurada (NEXT_PUBLIC_API_BASE_URL)");
        const res = await fetch(`${base}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), password }),
        });
        const data = await jsonOrThrow(res);
        const user = data.user as AuthUser;
        const token = data.token as string;
        if (!user || !token) throw new Error("Resposta de login inválida");
        // store token and user (caller may choose remember= session vs local later)
        try { window.localStorage.setItem(TOKEN_KEY, token); } catch {}
        return user;
    },
    saveUser: (user: AuthUser, remember = true) => {
        try {
            const store: Storage = remember ? window.localStorage : window.sessionStorage;
            store.setItem(USER_KEY, JSON.stringify(user));
        } catch {}
    },
    getUser: (): AuthUser | null => {
        try {
            const raw = window.localStorage.getItem(USER_KEY) || window.sessionStorage.getItem(USER_KEY);
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch { return null; }
    },
    getToken: (): string | null => {
        try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
    },
    logout: () => {
        try {
            window.localStorage.removeItem(USER_KEY);
            window.sessionStorage.removeItem(USER_KEY);
            window.localStorage.removeItem(TOKEN_KEY);
        } catch {}
    },
};
