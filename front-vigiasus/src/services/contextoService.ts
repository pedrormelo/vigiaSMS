// src/services/contextoService.ts

import { Contexto, StatusContexto, VersaoContexto, HistoricoItem } from "@/components/validar/typesDados";
import { authService } from "./authService";
import { normalizeGraphType } from "@/lib/graphTypes";

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

interface BackendContextoBase {
    id: string;
    tituloConceitual: string;
    tipo: string;
    gerenciaDonaId: string;
    isOculto?: boolean; 
    estaOculto?: boolean; 
    
    gerenciaSlug?: string;
    gerenciaNome?: string; 
    diretoriaSlug?: string;
    
    gerencia?: { 
        slug?: string; 
        nome?: string; 
        id?: string;
        diretoriaId?: string; 
    };
    
    createdAt: string;
    autorOriginalId?: string;
}

export interface BackendVersao {
    id: string;
    titulo: string;
    descricao?: string | null;
    versaoNumero: number;
    statusValidacao: string;
    updatedAt: string;
    solicitanteId?: string;
    solicitanteNome?: string;
    user?: { nome: string; email?: string };
    isAtiva: boolean;
    isDestacado: boolean;
    isOculta?: boolean; 
    versaoarquivo?: BackendDadosEspecificos | null;
    versaodashboard?: BackendDadosEspecificos | null;
    versaoindicador?: BackendDadosEspecificos | null;
    contexto?: BackendContextoBase;
    
    historico?: any[]; 
    validacaohistorico?: Array<{
        id: string;
        statusNovo: string;
        justificativa?: string;
        timestamp: string;
        autorId: string;
        user?: { nome: string };
    }>;
}

export interface BackendContexto extends BackendContextoBase {
    versoes?: BackendVersao[];
    historico?: Array<{
        id: string;
        statusNovo: string;
        justificativa?: string;
        timestamp: string;
        autorId: string;
        autorNome?: string;
        user?: { nome: string };
    }>;
    versaoAtiva?: BackendVersao;
}

interface CreateContextoResponse {
    novoContexto: BackendContextoBase;
    novaVersao: BackendVersao;
}

export interface HistoricoResponse {
    data: Contexto[];
    total: number;
    page: number;
    totalPages: number;
}

// --- SERVIÇOS DE VISIBILIDADE ---

export async function toggleVisibilityContexto(contextoId: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/${contextoId}/alternar-visibilidade`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao alternar visibilidade do contexto.');
    }
}

export async function toggleVisibilityVersao(contextoId: string, versaoId: number): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/${contextoId}/versoes/${versaoId}/alternar-visibilidade`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao alternar visibilidade da versão.');
    }
}

// --- SERVIÇOS DE EXCLUSÃO (NOVO) ---

export async function deleteContexto(contextoId: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    
    const res = await fetch(`${base}/contextos/${contextoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Repassa a mensagem específica do backend (ex: "Este contexto já passou por análise...")
        throw new Error(err.message || 'Falha ao excluir contexto.');
    }
}

// --- SERVIÇOS DE CRIAÇÃO ---

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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!res.ok) {
        let message = 'Erro ao criar contexto.';
        try {
            const j = await res.json();
            message = j?.message || message;
        } catch {}
        throw new Error(`[${res.status}] ${message}`);
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!res.ok) {
        let message = 'Erro ao criar nova versão.';
        try {
            const j = await res.json();
            message = j?.message || message;
        } catch {}
        throw new Error(`[${res.status}] ${message}`);
    }

    return await res.json();
}

// --- SERVIÇOS DE AÇÃO (VALIDAÇÃO) ---

export async function aprovarPeloGerente(versaoId: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/gerente-aprovar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao aprovar contexto.');
    }
}

export async function publicarPeloDiretor(versaoId: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/diretor-publicar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao publicar contexto.');
    }
}

export async function indeferirContexto(versaoId: string, justificativa: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/diretor-indeferir`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificativa })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao indeferir contexto.');
    }
}

export async function solicitarCorrecao(versaoId: string, justificativa: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/solicitar-correcao`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificativa })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao solicitar correção.');
    }
}

// --- SERVIÇOS DE LEITURA ---

export const getContextosPendentes = async (): Promise<Contexto[]> => {
    const base = apiBase();
    const token = authService.getToken();
    try {
        const res = await fetch(`${base}/contextos/pendentes`, { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            cache: 'no-store' 
        });
        
        if (!res.ok) return [];
        
        const raw = await res.json();
        const list: (BackendVersao | BackendContexto)[] = Array.isArray(raw) ? raw : (raw?.data || []);
        return list.map(mapBackendToFrontend);
    } catch (err) {
        console.error("Erro ao buscar contextos pendentes:", err);
        return [];
    }
};

export const getContextosPorGerencia = async (idGerencia: string): Promise<Contexto[]> => {
    if (!idGerencia) return [];
    const base = apiBase();
    try {
        const token = authService.getToken();
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${base}/gerencias/${idGerencia}/contextos`, {
            cache: 'no-store',
            headers,
        });
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
    const token = authService.getToken();
    try {
        const res = await fetch(`${base}/contextos/detalhes/${id}`, { 
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            cache: 'no-store' 
        });
        if (!res.ok) return null;
        const body: any = await res.json();
        
        let normalized: BackendContexto | BackendVersao;
        if (body && body.contexto && Array.isArray(body.versoes)) {
            const ctx = body.contexto;
            const versoes = body.versoes.map((v: any) => ({
                ...v,
                contexto: { ...ctx } as BackendContextoBase,
            }));
            normalized = {
                ...ctx,
                versoes,
                historico: body.historico || [],
            } as BackendContexto;
        } else {
            normalized = body as (BackendContexto | BackendVersao);
        }
        
        return mapBackendToFrontend(normalized);
    } catch (err) {
        console.error("Erro ao buscar detalhes do contexto:", err);
        return null;
    }
};

export async function getHistoricoContextos(
    query: string, dateRange: { from?: Date; to?: Date } | undefined, page: number, limit: number
): Promise<HistoricoResponse> {
    const base = apiBase();
    const token = authService.getToken();
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    try {
        const res = await fetch(`${base}/contextos/buscar?${params.toString()}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) return { data: [], total: 0, page: 1, totalPages: 1 };

        const body = await res.json();
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

// --- MAPPER CORRIGIDO ---

function mapBackendToFrontend(item: BackendContexto | BackendVersao): Contexto {
    let contextoId: string;
    let tituloConceitual: string;
    let tipoBackend: string;
    let gerenciaId: string;
    let gerenciaSlug: string | undefined;
    let gerenciaNome: string | undefined;
    let estaOcultoBackend: boolean = false; 

    let versaoRecente: BackendVersao | undefined;
    let versoesLista: BackendVersao[] = [];
    let historicoGeralLista: any[] = [];

    if ('tituloConceitual' in item) {
        // É um Contexto Completo
        const ctx = item as BackendContexto;
        contextoId = ctx.id;
        tituloConceitual = ctx.tituloConceitual;
        tipoBackend = ctx.tipo;
        gerenciaId = ctx.gerenciaDonaId;
        
        estaOcultoBackend = ctx.isOculto ?? ctx.estaOculto ?? false;
        
        gerenciaSlug = ctx.gerenciaSlug || ctx.gerencia?.slug;
        gerenciaNome = ctx.gerenciaNome || ctx.gerencia?.nome;

        versoesLista = ctx.versoes || [];
        historicoGeralLista = ctx.historico || [];
        
            if (ctx.versaoAtiva) {
                versaoRecente = ctx.versaoAtiva;
            } else if (ctx.versoes && ctx.versoes.length) {
                versaoRecente = ctx.versoes.reduce((acc, v) => {
                    return (!acc || (v.versaoNumero > acc.versaoNumero)) ? v : acc;
                }, ctx.versoes[0] as BackendVersao);
            } else {
                versaoRecente = undefined;
            }
    } else {
        // É uma Versão Isolada
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
            estaOcultoBackend = ctxPai.isOculto ?? ctxPai.estaOculto ?? false;
            
            gerenciaSlug = ctxPai.gerenciaSlug || ctxPai.gerencia?.slug;
            gerenciaNome = ctxPai.gerenciaNome || ctxPai.gerencia?.nome;
        }
        versaoRecente = v;
        versoesLista = [v];
        historicoGeralLista = v.validacaohistorico || v.historico || [];
    }

    const dadosEspecificosRaw = versaoRecente 
        ? (versaoRecente.versaoarquivo || versaoRecente.versaodashboard || versaoRecente.versaoindicador || {})
        : {} as any;
    
    const dadosEspecificos = {
        ...dadosEspecificosRaw,
        ...(dadosEspecificosRaw && typeof (dadosEspecificosRaw as any).payload === 'string'
            ? { payload: safeJsonParse((dadosEspecificosRaw as any).payload) }
            : {}),
    } as any;

    let frontType: Contexto['type'] = 'pdf';
    if (tipoBackend === 'DASHBOARD') frontType = 'dashboard';
    else if (tipoBackend === 'INDICADOR') frontType = 'indicador';
    else if (tipoBackend === 'ARQUIVO_LINK') {
        const docType = (versaoRecente as any)?.versaoarquivo?.docType;
        if (docType === 'LINK') frontType = 'link';
        else if (docType === 'PDF') frontType = 'pdf';
        else if (docType === 'EXCEL') frontType = 'planilha';
        else frontType = 'doc';
    }

    const versoesFrontend: VersaoContexto[] = versoesLista.map(v => {
        const historicoVersaoRaw = v.historico || v.validacaohistorico || [];
        
        const historicoVersaoFrontend: HistoricoItem[] = historicoVersaoRaw.map((h: any) => ({
            id: h.id,
            data: h.timestamp || h.data,
            autor: h.autorNome || h.user?.nome || h.autor || 'Sistema',
            acao: mapHistoricoLabel(h.statusNovo, h.justificativa),
            statusNovo: h.statusNovo, 
            justificativa: h.justificativa || ""
        }));

        return {
            id: v.versaoNumero,
            dbId: v.id,
            nome: v.titulo,
            data: v.updatedAt,
            autor: v.solicitanteNome || v.user?.nome || v.solicitanteId || 'Sistema',
            status: mapStatus(v.statusValidacao),
            estaOculta: v.isOculta ?? false, 
            historico: historicoVersaoFrontend
        };
    });

    const historicoFrontend: HistoricoItem[] = historicoGeralLista.map((h: any) => ({
        id: h.id,
        data: h.timestamp || h.data,
        autor: h.autorNome || h.user?.nome || h.autor || 'Sistema',
        acao: mapHistoricoLabel(h.statusNovo, h.justificativa),
        statusNovo: h.statusNovo, 
        justificativa: h.justificativa || ""
    }));

    const solicitantePrincipal = versaoRecente?.solicitanteNome || versaoRecente?.user?.nome || versaoRecente?.solicitanteId || '';

    const rawChartType = (versaoRecente as any)?.versaodashboard?.tipoGrafico
        ?? (dadosEspecificosRaw as any)?.tipoGrafico
        ?? (typeof dadosEspecificos?.payload?.tipoGrafico === 'string' ? dadosEspecificos.payload.tipoGrafico : undefined)
        ?? (typeof dadosEspecificos?.payload?.type === 'string' ? dadosEspecificos.payload.type : undefined);
    const chartType = normalizeGraphType(rawChartType);

    const rawUrl = (versaoRecente as any)?.versaoarquivo?.url;
    const absoluteUrl = typeof rawUrl === 'string' && /^https?:\/\//i.test(rawUrl)
        ? rawUrl
        : rawUrl
            ? `${apiBase()}${rawUrl}`
            : undefined;

    return {
        id: contextoId,
        title: tituloConceitual,
        type: frontType,
        insertedDate: versaoRecente?.updatedAt || new Date().toISOString(),
        status: versaoRecente ? mapStatus(versaoRecente.statusValidacao) : StatusContexto.AguardandoGerente,
        description: versaoRecente?.descricao || undefined,
        gerencia: gerenciaNome || gerenciaSlug || gerenciaId,
        payload: tipoBackend === 'DASHBOARD' ? (dadosEspecificos?.payload ?? undefined) : dadosEspecificos, 
        url: absoluteUrl,
        estaOculto: estaOcultoBackend, 
        versoes: versoesFrontend,
        historico: historicoFrontend,
        solicitante: solicitantePrincipal,
        chartType,
    };
}

function safeJsonParse(s: string) { try { return JSON.parse(s); } catch { return undefined; } }
function mapStatus(status: string): StatusContexto {
    switch (status) {
        case 'PUBLICADO': return StatusContexto.Publicado;
        case 'INDEFERIDO': return StatusContexto.Indeferido;
        case 'AGUARDANDO_DIRETOR': return StatusContexto.AguardandoDiretor;
        case 'AGUARDANDO_CORRECAO': return StatusContexto.AguardandoCorrecao;
        case 'AGUARDANDO_GERENTE': default: return StatusContexto.AguardandoGerente;
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