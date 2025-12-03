// src/services/authService.ts
"use client";

import Cookies from "js-cookie";

// Tipos de usuários
export type UserRole = "admin" | "diretor" | "gerente" | "membro" | "secretaria";

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
    token?: string;
}

interface LoginResponse {
    user: {
        id: string;
        name: string;
        cpf: string;
        email: string | null;
        role: string;
        diretoriaId: string | null;
        diretoriaSlug?: string | null;
        gerenciaId: string | null;
        gerenciaSlug?: string | null;
        createdAt: string;
    };
    token: string;
}

const STORAGE_KEY_USER = "vigiasus:user";
const STORAGE_KEY_TOKEN = "vigiasus:token";

const COOKIE_KEY_TOKEN = "vigiasus_token";
const COOKIE_KEY_ROLE = "vigiasus_role";

// Base da API
function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

// Persistência no storage
function persistStorage(key: string, value: string, remember: boolean) {
    const store: Storage = remember ? window.localStorage : window.sessionStorage;
    store.setItem(key, value);
}

export const authService = {
    /** LOGIN */
    async login(cpf: string, password: string, remember = true): Promise<AuthUser> {
        const base = apiBase();
        if (!base) throw new Error("API URL not set");

        // Remove máscara do CPF
        const cpfNormalized = cpf.replace(/\D/g, "");

        const res = await fetch(`${base}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cpf: cpfNormalized,
                password,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Falha no login");
        }

        const data: LoginResponse = await res.json();

        const normalizedRole = (data.user.role || "membro").toLowerCase() as UserRole;

        const user: AuthUser = {
            id: data.user.id,
            name: data.user.name,
            cpf: data.user.cpf,
            email: data.user.email,
            role: normalizedRole,
            diretoriaId: data.user.diretoriaId,
            diretoriaSlug: data.user.diretoriaSlug ?? null,
            gerenciaId: data.user.gerenciaId,
            gerenciaSlug: data.user.gerenciaSlug ?? null,
            createdAt: data.user.createdAt,
            token: data.token,
        };

        // Salva no storage
        this.saveUser(user, remember);

        // Salva nos cookies (SSR + Middleware)
        const cookieOptions = { expires: remember ? 7 : undefined, path: "/" };
        Cookies.set(COOKIE_KEY_TOKEN, data.token, cookieOptions);
        Cookies.set(COOKIE_KEY_ROLE, normalizedRole, cookieOptions);

        return user;
    },

    /** SALVAR USUÁRIO */
    saveUser(user: AuthUser, remember = true) {
        const userStr = JSON.stringify(user);
        const tokenStr = user.token || "";

        persistStorage(STORAGE_KEY_USER, userStr, remember);
        if (tokenStr) persistStorage(STORAGE_KEY_TOKEN, tokenStr, remember);

        try {
            window.dispatchEvent(
                new CustomEvent("vigiasus:user-change", { detail: { user } })
            );
        } catch {}
    },

    /** PEGAR USUÁRIO */
    getUser(): AuthUser | null {
        if (typeof window === "undefined") return null;

        try {
            let raw = window.localStorage.getItem(STORAGE_KEY_USER);
            if (!raw) raw = window.sessionStorage.getItem(STORAGE_KEY_USER);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    /** PEGAR TOKEN */
    getToken(): string | null {
        if (typeof window === "undefined") return null;

        const cookieToken = Cookies.get(COOKIE_KEY_TOKEN);
        if (cookieToken) return cookieToken;

        try {
            let t = window.localStorage.getItem(STORAGE_KEY_TOKEN);
            if (!t) t = window.sessionStorage.getItem(STORAGE_KEY_TOKEN);
            return t;
        } catch {
            return null;
        }
    },

    /** REFRESH USER (Mantém sessão viva) */
    async refreshMe(): Promise<AuthUser | null> {
        const base = apiBase();
        const token = this.getToken();
        if (!base || !token) return null;

        try {
            const res = await fetch(`${base}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 401) this.logout();
                return null;
            }

            const body = await res.json();
            const user = body.user;

            const normalizedRole = (user.role || "membro").toLowerCase() as UserRole;

            const mapped: AuthUser = {
                id: user.id,
                name: user.name,
                cpf: user.cpf,
                email: user.email,
                role: normalizedRole,
                diretoriaId: user.diretoriaId,
                diretoriaSlug: user.diretoriaSlug ?? null,
                gerenciaId: user.gerenciaId,
                gerenciaSlug: user.gerenciaSlug ?? null,
                createdAt: user.createdAt,
                token,
            };

            this.saveUser(mapped, true);
            Cookies.set(COOKIE_KEY_ROLE, normalizedRole, { expires: 7, path: "/" });

            return mapped;
        } catch (e) {
            console.error("Erro refreshMe", e);
            return null;
        }
    },

    /** LOGOUT */
    logout() {
        try {
            window.localStorage.removeItem(STORAGE_KEY_USER);
            window.localStorage.removeItem(STORAGE_KEY_TOKEN);
            window.sessionStorage.removeItem(STORAGE_KEY_USER);
            window.sessionStorage.removeItem(STORAGE_KEY_TOKEN);

            Cookies.remove(COOKIE_KEY_TOKEN, { path: "/" });
            Cookies.remove(COOKIE_KEY_ROLE, { path: "/" });

            try {
                window.dispatchEvent(
                    new CustomEvent("vigiasus:user-change", { detail: { user: null } })
                );
            } catch {}
        } catch {}
    },
};
