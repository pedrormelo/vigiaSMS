// src/services/organizacaoService.ts

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

export interface Diretoria {
    id: string;
    slug?: string | null;
    nome: string;
    sobre?: string | null;
    corFrom?: string | null;
    corTo?: string | null;
    bannerImage?: string | null;
    createdAt?: string;
    gerencia?: Gerencia[];
}

export interface Gerencia {
    id: string;
    slug?: string | null;
    nome: string;
    sigla?: string | null;
    descricao?: string | null;
    image?: string | null;
    diretoriaId: string;
    createdAt?: string;
}

export async function getDiretorias(): Promise<Diretoria[]> {
    const base = apiBase();
    if (!base) return [];
    const res = await fetch(`${base}/diretorias`, { cache: 'no-store' });
    if (!res.ok) return [];
    const rows = await res.json();
    // Backend already returns the needed shape
    return Array.isArray(rows) ? rows : [];
}

export async function getDiretoriaById(id: string): Promise<Diretoria | null> {
    const base = apiBase();
    if (!base) return null;
    const res = await fetch(`${base}/diretorias/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
}

export async function getDiretoriaBySlug(slug: string): Promise<Diretoria | null> {
    const base = apiBase();
    if (!base) return null;
    const res = await fetch(`${base}/diretorias/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
}

export async function getGerencias(): Promise<Gerencia[]> {
    const base = apiBase();
    if (!base) return [];
    const res = await fetch(`${base}/gerencias`, { cache: 'no-store' });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
}

export async function getGerenciasPorDiretoria(diretoriaId: string): Promise<Gerencia[]> {
    const base = apiBase();
    if (!base || !diretoriaId) return [];
    const res = await fetch(`${base}/gerencias/pordiretoria/${encodeURIComponent(diretoriaId)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
}

export async function getGerenciaBySlug(slug: string): Promise<Gerencia | null> {
    const base = apiBase();
    if (!base) return null;
    const res = await fetch(`${base}/gerencias/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
}

export async function getGerenciaById(id: string): Promise<Gerencia | null> {
    const base = apiBase();
    if (!base) return null;
    const res = await fetch(`${base}/gerencias/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
}
