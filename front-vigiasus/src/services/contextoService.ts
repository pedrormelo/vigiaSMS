// src/services/contextoService.ts

import { Contexto, StatusContexto, VersaoContexto, HistoricoItem } from "@/components/validar/typesDados";
import { authService } from "./authService";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

// --- INTERFACES DE ENTRADA (REQ) ---

export type DashboardPayload = string | Record<string, unknown>;

export interface CriarContextoData {
    tituloConceitual?: string;
    tipo?: 'ARQUIVO_LINK' | 'DASHBOARD' | 'INDICADOR';
    titulo?: string;
    descricao?: string;
    linkUrl?: string;
    tipoGrafico?: string;
    dashboardPayload?: DashboardPayload;
    valorAtual?: number | string;
    valorAlvo?: number | string;
    unidade?: string;
    textoComparativo?: string;
    cor?: string;
    icone?: string;
}

// --- INTERFACES DE SAÍDA (RES / BACKEND) ---

interface BackendDadosEspecificos {
    id: string;
    url?: string;
    docType?: string;
    tipoGrafico?: string;
    payload?: string | null;
    valorAtual?: number;
    valorAlvo?: number | null;
    unidade?: string;
    textoComparativo?: string | null;
    cor?: string;
    icone?: string;
}

export interface BackendVersao {
    id: string;
    titulo: string;
    descricao?: string | null;
    versaoNumero: number;
    statusValidacao: string;
    updatedAt: string;
    solicitanteId?: string;
    isAtiva: boolean;
    isDestacado: boolean;
    versaoarquivo?: BackendDadosEspecificos | null;
    versaodashboard?: BackendDadosEspecificos | null;
    versaoindicador?: BackendDadosEspecificos | null;
    contexto?: BackendContextoBase;
}

interface BackendContextoBase {
    id: string;
    tituloConceitual: string;
    tipo: string;
    gerenciaDonaId: string;
    createdAt: string;
    autorOriginalId?: string;
}

export interface BackendContexto extends BackendContextoBase {
    versoes?: BackendVersao[];
    historico?: Array<{
        id: string;
        statusNovo: string;
        justificativa?: string;
        timestamp: string;
        autorId: string;
    }>;
    versaoAtiva?: BackendVersao;
}

interface CreateContextoResponse {
    novoContexto: BackendContextoBase;
    novaVersao: BackendVersao;
}

// --- SERVIÇOS ---

export async function criarContexto(dados: CriarContextoData, file?: File | null): Promise<CreateContextoResponse> {
    const base = apiBase();
    const token = authService.getToken();
    const formData = new FormData();

    (Object.keys(dados) as Array<keyof CriarContextoData>).forEach((key) => {
        const value = dados[key];
        if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    if (file) {
        formData.append('file', file);
    }

    const res = await fetch(`${base}/contextos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar contexto.');
    }

    return await res.json();
}

export async function criarVersao(contextoId: string, dados: Partial<CriarContextoData>, file?: File | null): Promise<BackendVersao> {
    const base = apiBase();
    const token = authService.getToken();
    const formData = new FormData();

    (Object.keys(dados) as Array<keyof CriarContextoData>).forEach((key) => {
        const value = dados[key];
        if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    if (file) {
        formData.append('file', file);
    }

    const res = await fetch(`${base}/contextos/${contextoId}/versoes`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar nova versão.');
    }

    return await res.json();
}

// --- Funções de Leitura ---

// NOVO: Função para buscar itens pendentes (para Validação)
export const getContextosPendentes = async (): Promise<Contexto[]> => {
    const base = apiBase();
    const token = authService.getToken(); // Autenticação necessária
    try {
        const res = await fetch(`${base}/contextos/pendentes`, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store' 
        });
        
        if (!res.ok) return [];
        
        const body: (BackendVersao | BackendContexto)[] = await res.json();
        return body.map(mapBackendToFrontend);
    } catch (err) {
        console.error("Erro ao buscar contextos pendentes:", err);
        return [];
    }
};

export const getContextosPorGerencia = async (idGerencia: string): Promise<Contexto[]> => {
    if (!idGerencia) return [];
    const base = apiBase();
    try {
        const res = await fetch(`${base}/gerencias/${idGerencia}/contextos`, { cache: 'no-store' });
        if (!res.ok) return [];
        
        const body: (BackendVersao | BackendContexto)[] = await res.json();
        return body.map(mapBackendToFrontend);
    } catch (err) {
        console.error("Erro ao buscar contextos por gerência:", err);
        return [];
    }
};

export const getContextoById = async (id: string): Promise<Contexto | null> => {
    const base = apiBase();
    const token = authService.getToken(); // Pode precisar de token se for detalhe protegido
    try {
        const res = await fetch(`${base}/contextos/detalhes/${id}`, { 
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            cache: 'no-store' 
        });
        if (!res.ok) return null;
        
        const body: BackendContexto = await res.json();
        return mapBackendToFrontend(body);
    } catch (err) {
        console.error("Erro ao buscar detalhes do contexto:", err);
        return null;
    }
};

// --- HELPERS ---

function mapBackendToFrontend(item: BackendContexto | BackendVersao): Contexto {
    let contextoId: string;
    let tituloConceitual: string;
    let tipoBackend: string;
    let gerenciaId: string;
    
    let versaoRecente: BackendVersao | undefined;
    let versoesLista: BackendVersao[] = [];
    let historicoLista: any[] = [];

    if ('tituloConceitual' in item) {
        const ctx = item as BackendContexto;
        contextoId = ctx.id;
        tituloConceitual = ctx.tituloConceitual;
        tipoBackend = ctx.tipo;
        gerenciaId = ctx.gerenciaDonaId;
        versoesLista = ctx.versoes || [];
        historicoLista = ctx.historico || [];
        versaoRecente = ctx.versoes?.[0] || ctx.versaoAtiva;
    } else {
        const v = item as BackendVersao;
        const ctxPai = v.contexto;
        
        if (!ctxPai) {
            contextoId = "unknown";
            tituloConceitual = v.titulo; 
            tipoBackend = "ARQUIVO_LINK";
            gerenciaId = "";
        } else {
            contextoId = ctxPai.id;
            tituloConceitual = ctxPai.tituloConceitual;
            tipoBackend = ctxPai.tipo;
            gerenciaId = ctxPai.gerenciaDonaId;
        }
        
        versaoRecente = v;
        versoesLista = [v]; 
    }

    const dadosEspecificos = versaoRecente 
        ? (versaoRecente.versaoarquivo || versaoRecente.versaodashboard || versaoRecente.versaoindicador || {})
        : {};

    const versoesFrontend: VersaoContexto[] = versoesLista.map(v => ({
        id: v.versaoNumero,
        nome: v.titulo,
        data: v.updatedAt,
        autor: v.solicitanteId || 'Sistema',
        status: mapStatus(v.statusValidacao),
        estaOculta: !v.isAtiva
    }));

    const historicoFrontend: HistoricoItem[] = historicoLista.map(h => ({
        data: h.timestamp,
        autor: h.autorId || 'Sistema',
        acao: mapHistoricoLabel(h.statusNovo, h.justificativa)
    }));

    return {
        id: contextoId,
        title: tituloConceitual,
        type: mapDocType(tipoBackend),
        insertedDate: versaoRecente?.updatedAt || new Date().toISOString(),
        status: versaoRecente ? mapStatus(versaoRecente.statusValidacao) : StatusContexto.AguardandoGerente,
        description: versaoRecente?.descricao || undefined,
        gerencia: gerenciaId,
        payload: dadosEspecificos, 
        estaOculto: false,
        versoes: versoesFrontend,
        historico: historicoFrontend,
        solicitante: versaoRecente?.solicitanteId || ''
    };
}

function mapDocType(tipo: string | undefined): Contexto['type'] {
    switch (tipo) {
        case 'ARQUIVO_LINK': return 'pdf'; 
        case 'DASHBOARD': return 'dashboard';
        case 'INDICADOR': return 'indicador';
        default: return 'pdf';
    }
}

function mapStatus(status: string): StatusContexto {
    switch (status) {
        case 'PUBLICADO': return StatusContexto.Publicado;
        case 'INDEFERIDO': return StatusContexto.Indeferido;
        case 'AGUARDANDO_DIRETOR': return StatusContexto.AguardandoDiretor;
        case 'AGUARDANDO_CORRECAO': return StatusContexto.AguardandoCorrecao;
        case 'AGUARDANDO_GERENTE': 
        default: return StatusContexto.AguardandoGerente;
    }
}

function mapHistoricoLabel(status: string, justificativa?: string): string {
    const labels: Record<string, string> = {
        'AGUARDANDO_GERENTE': 'Criado / Aguardando Gerente',
        'AGUARDANDO_DIRETOR': 'Aprovado pelo Gerente',
        'PUBLICADO': 'Publicado',
        'INDEFERIDO': 'Indeferido',
        'AGUARDANDO_CORRECAO': 'Correção Solicitada'
    };
    const base = labels[status] || status;
    return justificativa ? `${base}: ${justificativa}` : base;
}

export interface HistoricoResponse {
    data: Contexto[];
    total: number;
    page: number;
    totalPages: number;
}

/**
 * Busca o histórico de contextos com filtros de data, busca textual e paginação.
 * Rota esperada no backend: GET /contextos/buscar?q=...&from=...&to=...&page=...&limit=...
 */
export async function getHistoricoContextos(
    query: string, 
    dateRange: { from?: Date; to?: Date } | undefined, 
    page: number, 
    limit: number
): Promise<HistoricoResponse> {
    const base = apiBase();
    const token = authService.getToken();
    
    // Montar Query String
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    try {
        const res = await fetch(`${base}/contextos/buscar?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            // Se der erro, retorna estrutura vazia para não quebrar a UI
            return { data: [], total: 0, page: 1, totalPages: 1 };
        }

        const body = await res.json();
        
        // Mapear a resposta (assumindo que o backend retorna { data: [...], meta: { total, pages } })
        // Se o backend retornar array direto, ajuste aqui.
        const itensBackend = body.data || [];
        const itensMapeados = itensBackend.map(mapBackendToFrontend);

        return {
            data: itensMapeados,
            total: body.meta?.total || itensMapeados.length,
            page: body.meta?.page || page,
            totalPages: body.meta?.totalPages || 1
        };

    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        return { data: [], total: 0, page: 1, totalPages: 1 };
    }
}