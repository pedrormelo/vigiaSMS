// src/services/dashboardService.ts
import { authService } from './authService';

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

export interface DashboardLayoutItem {
    contextoVersaoId: string;
    slotIndex?: number;
    titulo: string;
    tipoGrafico?: string; // PIE | BAR | LINE
    payload?: { colunas?: string[]; linhas?: any[]; cores?: string[] } | null;
    isDestacado?: boolean;
    updatedAt?: string;
    contextoTituloConceitual?: string | null;
    gerenciaId?: string | null;
    gerenciaNome?: string | null;
    diretoriaId?: string | null;
}

export interface DiretoriaDashboardLayout {
    tipoLayout: string; // ASYMMETRIC | GRID | SIDEBYSIDE
    diretoriaId: string;
    items: DashboardLayoutItem[];
}

export async function getDiretoriaDashboardLayout(diretoriaId: string): Promise<DiretoriaDashboardLayout | null> {
    if (!diretoriaId) return null;
    const base = apiBase();
    try {
        const res = await fetch(`${base}/dashboardlayout/${diretoriaId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Erro ao buscar layout da diretoria:', e);
        return null;
    }
}

export async function getDashboardHighlights(): Promise<DashboardLayoutItem[]> {
    const base = apiBase();
    try {
        const res = await fetch(`${base}/dashboardlayout/destaques`, { cache: 'no-store' });
        if (!res.ok) return [];
        const body = await res.json();
        return Array.isArray(body?.items) ? body.items : [];
    } catch (e) {
        console.error('Erro ao buscar destaques:', e);
        return [];
    }
}

// Helper to map backend layout items into GraphData-like structure for DashboardPreview
import { type GraphType, normalizeGraphType } from "@/lib/graphTypes";
import { getGerenciasPorDiretoria } from "./organizacaoService";
import { getContextosPorGerencia } from "./contextoService";
import type { Contexto } from "@/components/validar/typesDados";
import type { NomeIcone } from "@/components/popups/addContextoModal/types";

export function mapLayoutItemsToGraphData(items: DashboardLayoutItem[]) {
    return items.map(it => {
        const payload = it.payload || { colunas: [], linhas: [] };
        const chartType = normalizeGraphType(it.tipoGrafico);
        const gerenciaNome = it.gerenciaNome || it.contextoTituloConceitual || '';
        return {
            id: it.contextoVersaoId,
            type: chartType,
            title: it.titulo,
            gerencia: gerenciaNome,
            insertedDate: it.updatedAt || new Date().toISOString(),
            isHighlighted: !!it.isDestacado,
            diretoriaId: it.diretoriaId || undefined,
            gerenciaId: it.gerenciaId || undefined,
            gerenciaNome,
            data: [payload.colunas || [], ...(payload.linhas || [])],
            colors: payload.cores
        };
    });
}

export interface IndicatorMetric {
    id: string;
    contextoVersaoId: string;
    contextoId: string;
    title: string;
    descricao?: string;
    diretoriaId: string;
    diretoriaSlug?: string;
    diretoriaNome?: string;
    gerenciaId?: string;
    gerenciaSlug?: string;
    gerenciaNome?: string;
    valorAtualTexto: string;
    valorAtual?: number | null;
    valorAlvoTexto?: string;
    valorAlvo?: number | null;
    unidade?: string;
    textoComparativo?: string;
    cor?: string;
    icone?: NomeIcone;
    updatedAt?: string;
    isHighlighted?: boolean;
}

export interface DashboardKpiSelection {
    dashboardKpiId: string;
    diretoriaId: string;
    contextoVersaoId: string;
    position: number;
    isHighlighted: boolean;
    metric: IndicatorMetric;
}

function mapApiIndicatorMetric(input: any): IndicatorMetric | null {
    if (!input || typeof input !== 'object') return null;
    const contextoVersaoId = typeof input.contextoVersaoId === 'string'
        ? input.contextoVersaoId
        : (typeof input.id === 'string' ? input.id : undefined);
    const contextoId = typeof input.contextoId === 'string' ? input.contextoId : undefined;
    const title = typeof input.title === 'string' ? input.title : undefined;
    const diretoriaId = typeof input.diretoriaId === 'string' ? input.diretoriaId : undefined;
    if (!contextoVersaoId || !contextoId || !title || !diretoriaId) return null;

    const metric: IndicatorMetric = {
        id: contextoVersaoId,
        contextoVersaoId,
        contextoId,
        title,
        descricao: typeof input.descricao === 'string' ? input.descricao : undefined,
        diretoriaId,
        diretoriaSlug: typeof input.diretoriaSlug === 'string' ? input.diretoriaSlug : undefined,
        diretoriaNome: typeof input.diretoriaNome === 'string' ? input.diretoriaNome : undefined,
        gerenciaId: typeof input.gerenciaId === 'string' ? input.gerenciaId : undefined,
        gerenciaSlug: typeof input.gerenciaSlug === 'string' ? input.gerenciaSlug : undefined,
        gerenciaNome: typeof input.gerenciaNome === 'string' ? input.gerenciaNome : undefined,
        valorAtualTexto: typeof input.valorAtualTexto === 'string' && input.valorAtualTexto ? input.valorAtualTexto : '0',
        valorAtual: typeof input.valorAtual === 'number' ? input.valorAtual : (input.valorAtual === null ? null : undefined),
        valorAlvoTexto: typeof input.valorAlvoTexto === 'string' ? input.valorAlvoTexto : undefined,
        valorAlvo: typeof input.valorAlvo === 'number' ? input.valorAlvo : (input.valorAlvo === null ? null : undefined),
        unidade: typeof input.unidade === 'string' ? input.unidade : undefined,
        textoComparativo: typeof input.textoComparativo === 'string' ? input.textoComparativo : undefined,
        cor: typeof input.cor === 'string' ? input.cor : undefined,
        icone: typeof input.icone === 'string' ? input.icone as NomeIcone : undefined,
        updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : undefined,
        isHighlighted: typeof input.isHighlighted === 'boolean' ? input.isHighlighted : undefined,
    };
    return metric;
}

function mapApiKpiSelection(entry: any): DashboardKpiSelection | null {
    if (!entry || typeof entry !== 'object') return null;
    const metric = mapApiIndicatorMetric(entry.metric || entry);
    if (!metric) return null;
    const dashboardKpiId = typeof entry.dashboardKpiId === 'string' ? entry.dashboardKpiId : undefined;
    const diretoriaId = typeof entry.diretoriaId === 'string' ? entry.diretoriaId : metric.diretoriaId;
    const contextoVersaoId = typeof entry.contextoVersaoId === 'string' ? entry.contextoVersaoId : metric.contextoVersaoId;
    const position = typeof entry.position === 'number' ? entry.position : 0;
    const isHighlighted = typeof entry.isHighlighted === 'boolean' ? entry.isHighlighted : !!metric.isHighlighted;

    return {
        dashboardKpiId: dashboardKpiId || `${diretoriaId}-${contextoVersaoId}`,
        diretoriaId: diretoriaId || metric.diretoriaId,
        contextoVersaoId,
        position,
        isHighlighted,
        metric: { ...metric, isHighlighted },
    };
}

export async function getDiretoriaDashboardKpis(diretoriaId: string): Promise<DashboardKpiSelection[]> {
    if (!diretoriaId) return [];
    const base = apiBase();
    try {
        const res = await fetch(`${base}/dashboardlayout/${diretoriaId}/kpis`, { cache: 'no-store' });
        if (!res.ok) return [];
        const body = await res.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        const mapped = items.map(mapApiKpiSelection);
        const filtered = mapped.filter((item: DashboardKpiSelection | null): item is DashboardKpiSelection => item !== null);
        return filtered.sort((a: DashboardKpiSelection, b: DashboardKpiSelection) => a.position - b.position);
    } catch (error) {
        console.error('Erro ao buscar KPIs da diretoria:', error);
        return [];
    }
}

export async function listAvailableKpisForDiretoria(diretoriaId: string): Promise<IndicatorMetric[]> {
    if (!diretoriaId) return [];
    const base = apiBase();
    const token = authService.getToken();
    if (!base || !token) return [];
    try {
        const res = await fetch(`${base}/dashboardlayout/${diretoriaId}/kpis/available`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) return [];
        const body = await res.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        const mapped = items.map((entry: any) => mapApiIndicatorMetric(entry.metric || entry));
        const filtered = mapped.filter((metric: IndicatorMetric | null): metric is IndicatorMetric => metric !== null);
        return filtered.sort((a: IndicatorMetric, b: IndicatorMetric) => {
            if (!a.updatedAt && !b.updatedAt) return 0;
            if (!a.updatedAt) return 1;
            if (!b.updatedAt) return -1;
            return b.updatedAt.localeCompare(a.updatedAt);
        });
    } catch (error) {
        console.error('Erro ao listar KPIs disponíveis:', error);
        return [];
    }
}

export async function saveDiretoriaDashboardKpis(
    diretoriaId: string,
    items: Array<{ contextoVersaoId: string; position: number; isHighlighted: boolean }>
): Promise<boolean> {
    const base = apiBase();
    const token = authService.getToken();
    if (!base || !token || !diretoriaId) return false;
    try {
        const res = await fetch(`${base}/dashboardlayout/${diretoriaId}/kpis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items })
        });
        return res.ok;
    } catch (error) {
        console.error('Erro ao salvar KPIs da diretoria:', error);
        return false;
    }
}

export async function listIndicatorsForDiretoria(diretoriaId: string): Promise<IndicatorMetric[]> {
    const selections = await getDiretoriaDashboardKpis(diretoriaId);
    return selections.map((item) => ({ ...item.metric, isHighlighted: item.isHighlighted }));
}

export async function listIndicatorsForSecretaria(): Promise<IndicatorMetric[]> {
    const base = apiBase();
    try {
        const res = await fetch(`${base}/dashboardlayout/destaques/kpis`, { cache: 'no-store' });
        if (!res.ok) return [];
        const body = await res.json();
        const items = Array.isArray(body?.items) ? body.items : [];
        const mapped = items.map(mapApiKpiSelection);
        const filtered = mapped.filter((item: DashboardKpiSelection | null): item is DashboardKpiSelection => item !== null);
        return filtered.map((item: DashboardKpiSelection) => ({ ...item.metric, isHighlighted: true }));
    } catch (error) {
        console.error('Erro ao buscar KPIs destacados da secretaria:', error);
        return [];
    }
}

// List available published dashboards for a diretoria aggregated from its gerências
export async function listAvailableGraphsForDiretoria(diretoriaId: string) {
    if (!diretoriaId) return [] as Array<{ id: string; type: GraphType; title: string; gerencia: string; insertedDate: string; data: any[]; colors?: string[] }>
    const gerencias = await getGerenciasPorDiretoria(diretoriaId);
    const all: Contexto[] = [] as any;
    for (const g of gerencias) {
        const ctxs = await getContextosPorGerencia(g.id);
        all.push(...ctxs);
    }
    const dashboards = all.filter(c => c.type === 'dashboard' && c.chartType && c.payload);
    const mapped = dashboards.map(c => {
        const published = (c.versoes || []).find(v => v.status?.toUpperCase().includes('PUBLICADO') && !v.estaOculta);
        if (!published?.dbId) {
            return null; // Skip dashboards without a published/active version
        }
        const payload = (c.payload as any) || { colunas: [], linhas: [] };
        const chartType = normalizeGraphType(c.chartType);
        return {
            id: published.dbId,
            type: chartType,
            title: c.title,
            gerencia: c.gerencia || '',
            insertedDate: published.data || c.insertedDate,
            data: [payload.colunas || [], ...(payload.linhas || [])],
            colors: payload.cores,
        };
    });
    return mapped.filter((item): item is NonNullable<typeof mapped[number]> => item !== null);
}

function toBackendLayoutType(layout: 'asymmetric' | 'grid' | 'sideBySide') {
    if (layout === 'asymmetric') return 'ASYMMETRIC';
    if (layout === 'sideBySide') return 'SIDEBYSIDE';
    return 'GRID';
}

export async function saveDiretoriaDashboardLayout(
    diretoriaId: string,
    layout: 'asymmetric' | 'grid' | 'sideBySide',
    items: Array<{ contextoVersaoId: string; slotIndex: number }>
): Promise<boolean> {
    const base = apiBase();
    const token = authService.getToken();
    if (!base || !token || !diretoriaId) return false;
    try {
        const res = await fetch(`${base}/dashboardlayout/${diretoriaId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tipoLayout: toBackendLayoutType(layout), items })
        });
        return res.ok;
    } catch (e) {
        console.error('Erro ao salvar layout da diretoria:', e);
        return false;
    }
}

// Mark/unmark a versão as destaque (for Secretaria dashboard)
interface HighlightResponse {
    ok: boolean
    message?: string
}

export async function setVersaoDestaque(versaoId: string, highlighted: boolean): Promise<HighlightResponse> {
    const base = apiBase();
    const token = authService.getToken();
    if (!base || !token || !versaoId) return { ok: false, message: 'Requisição inválida.' };
    const path = highlighted ? 'destacar' : 'remover-destaque';
    try {
        const res = await fetch(`${base}/contextos/versoes/${versaoId}/${path}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            return { ok: true };
        }
        let message: string | undefined;
        try {
            const body = await res.json();
            if (body && typeof body.message === 'string') message = body.message;
        } catch {}
        return { ok: false, message };
    } catch (e) {
        console.error('Erro ao alterar destaque da versão:', e);
        return { ok: false, message: 'Erro ao comunicar com o servidor.' };
    }
}
