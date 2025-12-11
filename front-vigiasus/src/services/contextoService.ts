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
    motivoNovaVersao?: string;
    descNovaVersao?: string;
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

export interface UltimaAtualizacaoContexto {
    contextoId: string;
    versaoId: string;
    tituloVersao?: string | null;
    tituloContexto?: string | null;
    tipo?: string | null;
    updatedAt: string;
    gerenciaNome?: string | null;
    gerenciaSlug?: string | null;
    gerenciaId?: string | null;
    autorId?: string | null;
    autorNome?: string | null;
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

export async function toggleVisibilityVersao(contextoId: string, versaoId: string): Promise<{isOculta: boolean; estaOculta: boolean}> {
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
    const data = await res.json();
    return data.versao || { isOculta: false, estaOculta: false };
}

// --- SERVIÇO DE COMENTÁRIOS (VERSÃO) ---
export async function enviarComentarioVersao(versaoId: string, texto: string): Promise<void> {
    const base = apiBase();
    const token = authService.getToken();
    const targetId = String(versaoId);
    if (!base || !token) throw new Error('Sessão expirada. Faça login novamente.');

    const res = await fetch(`${base}/comentarios/${targetId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto, privado: false })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Falha ao enviar comentário.');
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
        } catch { }
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
        } catch { }
        throw new Error(`[${res.status}] ${message}`);
    }

    return await res.json();
}

// --- SERVIÇOS DE AÇÃO (VALIDAÇÃO) ---

export async function aprovarPeloGerente(versaoId: string): Promise<void> {
    console.log(`📤 [Frontend] Aprovando versão ${versaoId} pelo Gerente`);
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/gerente-aprovar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`❌ [Frontend] Erro ao aprovar versão ${versaoId}:`, err);
        throw new Error(err.message || 'Falha ao aprovar contexto.');
    }
    console.log(`✅ [Frontend] Versão ${versaoId} aprovada pelo Gerente com sucesso!`);
}

export async function publicarPeloDiretor(versaoId: string): Promise<void> {
    console.log(`📤 [Frontend] Publicando versão ${versaoId}`);
    const base = apiBase();
    const token = authService.getToken();
    const res = await fetch(`${base}/contextos/versoes/${versaoId}/diretor-publicar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`❌ [Frontend] Erro ao publicar versão ${versaoId}:`, err);
        throw new Error(err.message || 'Falha ao publicar contexto.');
    }
    console.log(`✅ [Frontend] Versão ${versaoId} publicada com sucesso!`);
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
        const mapped = body.map(mapBackendToFrontend);
        
        // Deduplica por ID do contexto (caso o backend retorne duplicatas)
        const uniqueMap = new Map<string, Contexto>();
        mapped.forEach(ctx => {
            if (!uniqueMap.has(ctx.id)) {
                uniqueMap.set(ctx.id, ctx);
            } else {
                console.warn(`⚠️ Contexto duplicado detectado: ${ctx.id} - ${ctx.title}`);
            }
        });
        
        return Array.from(uniqueMap.values());
    } catch (err) {
        console.error("Erro ao buscar contextos por gerência:", err);
        return [];
    }
};

export const getUltimaAtualizacaoContexto = async (): Promise<UltimaAtualizacaoContexto | null> => {
    const base = apiBase();
    try {
        const res = await fetch(`${base}/contextos/ultima-atualizacao`, { cache: 'no-store' });
        if (!res.ok) return null;

        const body = await res.json();
        if (!body) return null;

        const data = body?.data !== undefined ? body.data : body;
        if (!data || !data.updatedAt) return null;

        return data as UltimaAtualizacaoContexto;
    } catch (err) {
        console.error("Erro ao buscar última atualização de contexto:", err);
        return null;
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

        console.log(`📌 getContextoById response:`, {
            temContexto: !!body.contexto,
            temVersoes: Array.isArray(body.versoes),
            quantidadeVersoes: body.versoes?.length,
            versoesData: body.versoes?.map((v: any) => ({
                versaoNumero: v.versaoNumero,
                statusValidacao: v.statusValidacao,
                id: v.id
            }))
        });

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
        
        console.log('📋 [Histórico] Dados recebidos do backend:', itensBackend.map((item: any) => ({
            versaoNumero: item.versaoNumero,
            titulo: item.titulo,
            statusValidacao: item.statusValidacao,
            contextoId: item.contextoId
        })));
        
        const itensMapeados = itensBackend.map(mapBackendToFrontend);
        
        console.log('📋 [Histórico] Dados mapeados para frontend:', itensMapeados.map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            versoes: item.versoes?.map((v: any) => ({ id: v.id, status: v.status }))
        })));

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
    let autorOriginalId: string | undefined;

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

        autorOriginalId = ctx.autorOriginalId || ctx.autorId;

        gerenciaSlug = ctx.gerenciaSlug || ctx.gerencia?.slug;
        gerenciaNome = ctx.gerenciaNome || ctx.gerencia?.nome;

        versoesLista = ctx.versoes || [];
        historicoGeralLista = ctx.historico || [];

        // NOVA LÓGICA: Backend já envia a versão "capa" correta
        // Se versaoAtiva existe, usa ela; senão pega a mais recente
        const versaoAtivaBackend = ctx.versaoAtiva;
        const versaoMaisRecente = (ctx.versoes || []).reduce((acc, v) => {
            if (!acc) return v;
            return (v.versaoNumero > acc.versaoNumero) ? v : acc;
        }, ctx.versoes && ctx.versoes[0] ? ctx.versoes[0] as BackendVersao : undefined as any);

        // Usa versaoAtiva do backend (já vem com lógica de seleção correta), senão a mais recente
        versaoRecente = versaoAtivaBackend || versaoMaisRecente;
    } else {
        // É uma Versão Isolada (do endpoint /buscar)
        const v = item as BackendVersao;
        const ctxPai = v.contexto;

        console.log(`📌 Mapeando versão isolada: v${v.versaoNumero}, status=${v.statusValidacao}, contextoId=${v.contextoId}`);

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

            autorOriginalId = ctxPai.autorOriginalId || ctxPai.autorId;

            gerenciaSlug = ctxPai.gerenciaSlug || ctxPai.gerencia?.slug;
            gerenciaNome = ctxPai.gerenciaNome || ctxPai.gerencia?.nome;
            
            // CORREÇÃO: Usar todas as versões do contexto (backend agora inclui contexto.contextoversao)
            versoesLista = ctxPai.contextoversao || [v];
            console.log(`  - Contexto.contextoversao disponível: ${ctxPai.contextoversao ? ctxPai.contextoversao.length : 'não'} versões`);
        }
        // IMPORTANTE: versaoRecente é a versão ESPECÍFICA desta linha do histórico
        versaoRecente = v;
        historicoGeralLista = v.validacaohistorico || v.historico || [];
    }

    const rawArquivoUrl = (versaoRecente as any)?.versaoarquivo?.url;
    const rawArquivoDocType = (versaoRecente as any)?.versaoarquivo?.docType;

    const dadosEspecificosRaw = versaoRecente
        ? (versaoRecente.versaoarquivo || versaoRecente.versaodashboard || versaoRecente.versaoindicador || {})
        : {} as any;

    const dadosEspecificos = {
        ...dadosEspecificosRaw,
        ...(dadosEspecificosRaw && typeof (dadosEspecificosRaw as any).payload === 'string'
            ? { payload: safeJsonParse((dadosEspecificosRaw as any).payload) }
            : {}),
    } as any;

    const { frontType: arquivoFrontType } = normalizeDocType(rawArquivoDocType, rawArquivoUrl);

    let frontType: Contexto['type'] = 'pdf';
    if (tipoBackend === 'DASHBOARD') frontType = 'dashboard';
    else if (tipoBackend === 'INDICADOR') frontType = 'indicador';
    else if (tipoBackend === 'ARQUIVO_LINK') {
        frontType = arquivoFrontType;
    }

    const versoesFrontend: VersaoContexto[] = versoesLista.map(v => {
        const historicoVersaoRaw = v.historico || v.validacaohistorico || [];

        console.log(`    🔍 Versão ${v.versaoNumero}: historico bruto =`, {
            temHistorico: !!v.historico,
            temValidacao: !!v.validacaohistorico,
            quantidade: historicoVersaoRaw.length,
            eventos: historicoVersaoRaw.slice(0, 2).map((h: any) => ({
                statusNovo: h.statusNovo,
                autorNome: h.autorNome,
                timestamp: h.timestamp
            }))
        });

        const historicoVersaoFrontend: HistoricoItem[] = historicoVersaoRaw.map((h: any) => ({
            id: h.id,
            data: h.timestamp || h.data,
            autor: h.autorNome || h.user?.nome || h.autor || 'Sistema',
            acao: mapHistoricoLabel(h.statusNovo, h.justificativa),
            statusNovo: h.statusNovo,
            justificativa: h.justificativa || ""
        }));

        console.log(`    ✅ Versão ${v.versaoNumero}: histórico MAPEADO =`, {
            quantidade: historicoVersaoFrontend.length,
            eventos: historicoVersaoFrontend.slice(0, 2).map(h => ({ 
                acao: h.acao, 
                autor: h.autor,
                statusNovo: h.statusNovo,
                data: h.data 
            }))
        });

        const statusMapeado = mapStatus(v.statusValidacao);
        console.log(`  📌 Versão ${v.versaoNumero}: statusValidacao="${v.statusValidacao}" -> mapeado="${statusMapeado}"`);

        // Dados específicos da versão
        const dadosVersaoRaw = v.versaoarquivo || v.versaodashboard || v.versaoindicador || {};
        const payloadVersao = (dadosVersaoRaw && typeof (dadosVersaoRaw as any).payload === 'string')
            ? safeJsonParse((dadosVersaoRaw as any).payload)
            : (dadosVersaoRaw as any).payload;

        const tipoBackendVersao = v.contexto?.tipo || tipoBackend;
        const docTypeVersaoRaw = (v.versaoarquivo as any)?.docType;
        const rawUrlVersao = (v.versaoarquivo as any)?.url;
        const { frontType: frontTypeVersaoInferido, normalizedDocType: normalizedDocTypeVersao } = normalizeDocType(docTypeVersaoRaw, rawUrlVersao);

        let frontTypeVersao: Contexto['type'] = 'pdf';
        if (tipoBackendVersao === 'DASHBOARD') frontTypeVersao = 'dashboard';
        else if (tipoBackendVersao === 'INDICADOR') frontTypeVersao = 'indicador';
        else if (tipoBackendVersao === 'ARQUIVO_LINK') {
            frontTypeVersao = frontTypeVersaoInferido;
        } else {
            frontTypeVersao = 'doc';
        }

        const rawChartTypeVersao = (v.versaodashboard as any)?.tipoGrafico
            ?? (dadosVersaoRaw as any)?.tipoGrafico
            ?? (typeof payloadVersao?.tipoGrafico === 'string' ? payloadVersao.tipoGrafico : undefined)
            ?? (typeof payloadVersao?.type === 'string' ? payloadVersao.type : undefined);
        const chartTypeVersao = normalizeGraphType(rawChartTypeVersao);

        const absoluteUrlVersao = typeof rawUrlVersao === 'string' && /^https?:\/\//i.test(rawUrlVersao)
            ? rawUrlVersao
            : rawUrlVersao
                ? `${apiBase()}${rawUrlVersao}`
                : undefined;

        return {
            id: v.versaoNumero,
            dbId: v.id,
            nome: v.titulo,
            data: v.updatedAt,
            autor: v.solicitanteNome || v.user?.nome || v.solicitanteId || 'Sistema',
            autorId: v.solicitanteId || v.contexto?.autorId || undefined,
            status: statusMapeado,
            estaOculta: v.isOculta ?? false,
            historico: historicoVersaoFrontend,
            descricao: v.descricao,
            url: absoluteUrlVersao,
            payload: frontTypeVersao === 'dashboard' ? payloadVersao : (payloadVersao ?? dadosVersaoRaw),
            type: frontTypeVersao,
            docType: normalizedDocTypeVersao || docTypeVersaoRaw,
            chartType: chartTypeVersao,
        };
    });

    // CORREÇÃO: Para linhas do histórico (versão isolada com múltiplas versões),
    // movemos a versão específica desta linha para o começo do array
    // Isso garante que row.versoes[0] seja sempre a versão desta linha
    let versoesFrontendFinais = versoesFrontend;
    if (versoesFrontend.length > 1 && versoesLista.length > 1 && versaoRecente) {
        // Encontra o índice da versão que está sendo exibida (usando o dbId que é único)
        const indexVersaoAtual = versoesFrontend.findIndex(v => v.dbId === versaoRecente.id);
        console.log(`  - Reorganizando versões: buscando dbId="${versaoRecente.id}", encontrado índice=${indexVersaoAtual}`);
        if (indexVersaoAtual > 0) {
            versoesFrontendFinais = [...versoesFrontend];
            const [versaoAtual] = versoesFrontendFinais.splice(indexVersaoAtual, 1);
            versoesFrontendFinais.unshift(versaoAtual);
            console.log(`  ✅ Versão reorganizada: v${versaoAtual.id} agora está em primeiro lugar`);
        }
    }

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

    const absoluteUrl = typeof rawArquivoUrl === 'string' && /^https?:\/\//i.test(rawArquivoUrl)
        ? rawArquivoUrl
        : rawArquivoUrl
            ? `${apiBase()}${rawArquivoUrl}`
            : undefined;

    return {
        id: contextoId,
        title: tituloConceitual,
        type: frontType,
        insertedDate: versaoRecente?.updatedAt || new Date().toISOString(),
        status: versaoRecente ? mapStatus(versaoRecente.statusValidacao) : StatusContexto.AguardandoGerente,
        autorId: versaoRecente?.solicitanteId || versaoRecente?.contexto?.autorId || autorOriginalId,
        description: versaoRecente?.descricao || undefined,
        gerencia: gerenciaNome || gerenciaSlug || gerenciaId,
        payload: tipoBackend === 'DASHBOARD' ? (dadosEspecificos?.payload ?? undefined) : dadosEspecificos,
        url: absoluteUrl,
        estaOculto: estaOcultoBackend,
        versoes: versoesFrontendFinais,
        historico: historicoFrontend,
        solicitante: solicitantePrincipal,
        chartType,
    };
}

function safeJsonParse(s: string) { try { return JSON.parse(s); } catch { return undefined; } }
function normalizeDocType(rawDocType?: string, rawUrl?: string): { frontType: Contexto['type']; normalizedDocType?: string } {
    const docTypeUpper = typeof rawDocType === 'string' ? rawDocType.toUpperCase() : '';
    const ext = typeof rawUrl === 'string' && rawUrl.includes('.') ? rawUrl.substring(rawUrl.lastIndexOf('.') + 1) : '';
    const extUpper = ext.toUpperCase();

    const normalizedDocType = docTypeUpper || extUpper || undefined;

    if (docTypeUpper === 'LINK') return { frontType: 'link', normalizedDocType };

    const isPpt = docTypeUpper.includes('PPT') || docTypeUpper.includes('PRESENTATION') || docTypeUpper.includes('POWERPOINT')
        || extUpper === 'PPTX' || extUpper === 'PPT';
    if (isPpt) return { frontType: 'apresentacao', normalizedDocType };

    const isPdf = docTypeUpper.includes('PDF') || extUpper === 'PDF';
    if (isPdf) return { frontType: 'pdf', normalizedDocType };

    const isExcel = docTypeUpper.includes('XLS') || docTypeUpper.includes('SPREADSHEET') || extUpper === 'XLSX' || extUpper === 'XLS';
    if (isExcel) return { frontType: 'planilha', normalizedDocType };

    return { frontType: 'doc', normalizedDocType };
}
function mapStatus(status: string): StatusContexto {
    const resultado = (() => {
        switch (status) {
            case 'PUBLICADO': return StatusContexto.Publicado;
            case 'INDEFERIDO': return StatusContexto.Indeferido;
            case 'AGUARDANDO_DIRETOR': return StatusContexto.AguardandoDiretor;
            case 'AGUARDANDO_CORRECAO': return StatusContexto.AguardandoCorrecao;
            case 'AGUARDANDO_GERENTE': 
            default: return StatusContexto.AguardandoGerente;
        }
    })();
    console.log(`  mapStatus("${status}") -> "${resultado}"`);
    return resultado;
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