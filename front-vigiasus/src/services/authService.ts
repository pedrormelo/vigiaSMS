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
    diretoriaSlug?: string | null;
    gerenciaId?: string | null;
    gerenciaSlug?: string | null;
    createdAt?: string;
    token?: string; // JWT armazenado junto quando conveniente
}

interface LoginResponse {
    user: {
        id: string; name: string; cpf: string; email: string | null; role: string; diretoriaId: string | null; diretoriaSlug?: string | null; gerenciaId: string | null; gerenciaSlug?: string | null; createdAt: string;
    };
    token: string;
}

const STORAGE_KEY_USER = "vigiasus:user";
const STORAGE_KEY_TOKEN = "vigiasus:token";

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function persist(key: string, value: string, remember: boolean) {
    const store: Storage = remember ? window.localStorage : window.sessionStorage;
    store.setItem(key, value);
}

export const authService = {
    async login(cpf: string, password: string): Promise<AuthUser> {
        const base = apiBase();
        if (!base) throw new Error("API base não configurada (NEXT_PUBLIC_API_BASE_URL)");
        const res = await fetch(`${base}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: cpf.replace(/\D/g, ""), password })
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || `Erro de login (${res.status})`);
        }
        const body: LoginResponse = await res.json();
        const mapped: AuthUser = {
            id: body.user.id,
            name: body.user.name,
            cpf: body.user.cpf,
            email: body.user.email,
            role: body.user.role as UserRole,
            diretoriaId: body.user.diretoriaId,
            diretoriaSlug: body.user.diretoriaSlug ?? null,
            gerenciaId: body.user.gerenciaId,
            gerenciaSlug: body.user.gerenciaSlug ?? null,
            createdAt: body.user.createdAt,
            token: body.token
        };
        return mapped;
    },
    saveUser(user: AuthUser, remember = true) {
        try {
            persist(STORAGE_KEY_USER, JSON.stringify(user), remember);
            if (user.token) persist(STORAGE_KEY_TOKEN, user.token, remember);
        } catch { /* noop */ }
    },
    getUser(): AuthUser | null {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY_USER) || window.sessionStorage.getItem(STORAGE_KEY_USER);
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch { return null; }
    },
    getToken(): string | null {
        try {
            return window.localStorage.getItem(STORAGE_KEY_TOKEN) || window.sessionStorage.getItem(STORAGE_KEY_TOKEN);
        } catch { return null; }
    },
    async refreshMe(): Promise<AuthUser | null> {
        const base = apiBase();
        const token = this.getToken();
        if (!base || !token) return null;
        const res = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return null;
        const body = await res.json();
        const user = body.user;
        const mapped: AuthUser = {
            id: user.id,
            name: user.name,
            cpf: user.cpf,
            email: user.email,
            role: user.role as UserRole,
            diretoriaId: user.diretoriaId,
            diretoriaSlug: user.diretoriaSlug ?? null,
            gerenciaId: user.gerenciaId,
            gerenciaSlug: user.gerenciaSlug ?? null,
            createdAt: user.createdAt,
            token
        };
        this.saveUser(mapped, true);
        return mapped;
    },
    logout() {
        try {
            window.localStorage.removeItem(STORAGE_KEY_USER);
            window.localStorage.removeItem(STORAGE_KEY_TOKEN);
            window.sessionStorage.removeItem(STORAGE_KEY_USER);
            window.sessionStorage.removeItem(STORAGE_KEY_TOKEN);
        } catch { /* noop */ }
    }
};

export function isAuthenticated(): boolean { return !!authService.getToken(); }

