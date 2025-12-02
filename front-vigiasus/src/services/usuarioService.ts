// src/services/usuariosService.ts
import { authService } from "./authService";

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    role: 'SECRETARIA' | 'DIRETOR' | 'GERENTE' | 'MEMBRO';
    diretoriaId?: string | null;
    gerenciaId?: string | null;
    createdAt: string;
    
    // Campos para exibição (joins)
    diretoria?: { nome: string };
    gerencia?: { nome: string };
}

export interface CreateUpdateUserPayload {
    nome: string;
    email: string;
    cpf: string;
    role: string;
    diretoriaId?: string;
    gerenciaId?: string;
    password?: string; // Usado apenas na criação ou reset
}

export async function getUsuarios(): Promise<Usuario[]> {
    const base = apiBase();
    const token = authService.getToken();
    
    try {
        const res = await fetch(`${base}/usuarios`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        
        if (!res.ok) throw new Error('Falha ao listar usuários');
        
        const data = await res.json();
        
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        
        return []; // Fallback seguro

    } catch (error) {
        console.error("Erro getUsuarios:", error);
        return []; // Retorna array vazio em caso de erro
    }
}

export async function criarUsuario(dados: CreateUpdateUserPayload): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    
    const res = await fetch(`${base}/usuarios`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dados)
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Falha ao criar usuário');
    }
}

export async function atualizarUsuario(id: string, dados: Partial<CreateUpdateUserPayload>): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    
    const res = await fetch(`${base}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dados)
    });
    
    if (!res.ok) throw new Error('Falha ao atualizar usuário');
}

export async function resetarSenha(id: string, novaSenha: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    
    const res = await fetch(`${base}/usuarios/${id}/reset-password`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ password: novaSenha })
    });
    
    if (!res.ok) throw new Error('Falha ao redefinir senha');
}

export async function excluirUsuario(id: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    
    const res = await fetch(`${base}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Falha ao excluir usuário');
}