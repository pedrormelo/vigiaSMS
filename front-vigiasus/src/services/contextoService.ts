// src/services/contextoService.ts (API-backed)
import { Contexto, StatusContexto } from "@/components/validar/typesDados";
import { authService } from "./authService";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

function statusLabelToEnum(code: string): StatusContexto {
  switch (code) {
    case 'AGUARDANDO_GERENTE': return StatusContexto.AguardandoGerente;
    case 'AGUARDANDO_DIRETOR': return StatusContexto.AguardandoDiretor;
    case 'AGUARDANDO_CORRECAO': return StatusContexto.AguardandoCorrecao;
    case 'PUBLICADO': return StatusContexto.Publicado;
    case 'INDEFERIDO': return StatusContexto.Indeferido;
    default: return StatusContexto.AguardandoGerente;
  }
}

function mapDocType(tipo: string | null | undefined): Contexto["type"] {
  switch (tipo) {
    case 'ARQUIVO_LINK': return 'link';
    case 'DASHBOARD': return 'dashboard';
    case 'INDICADOR': return 'indicador';
    default: return 'pdf';
  }
}

function withAuth(init: RequestInit = {}): RequestInit {
  const token = authService.getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

export interface HistoricoResponse {
  data: Contexto[];
  total: number;
}

// Abertos (pendentes) preferindo endpoint autenticado; fallback para publicados
export const getContextos = async (): Promise<Contexto[]> => {
  const base = apiBase();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/contextos/pendentes`, withAuth());
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = await res.json();
    const versoes: any[] = body.data || [];
    const mapped = versoes.map((v) => ({
      id: v.contexto.id,
      title: v.titulo || v.contexto.tituloConceitual,
      type: mapDocType(v.contexto.tipo),
      insertedDate: v.createdAt || v.updatedAt,
      status: statusLabelToEnum(v.statusValidacao),
      description: v.descricao || undefined,
      gerencia: v.contexto.gerenciaDonaId,
      versoes: [{ id: v.versaoNumero, nome: v.titulo, data: v.updatedAt, autor: '', status: statusLabelToEnum(v.statusValidacao) }],
    }));
    const byId = new Map<string, Contexto>();
    for (const item of mapped) {
      const prev = byId.get(item.id);
      if (!prev) {
        byId.set(item.id, item as any);
      } else {
        const prevDate = new Date(prev.insertedDate).getTime();
        const currDate = new Date(item.insertedDate).getTime();
        if (currDate > prevDate) byId.set(item.id, item as any);
      }
    }
    return Array.from(byId.values());
  } catch {
    const res = await fetch(`${base}/contextos/publicados`);
    if (!res.ok) return [];
    const body = await res.json();
    const items: any[] = body.data || body || [];
    return items.map((it) => ({
      id: it.id,
      title: it.tituloConceitual,
      type: mapDocType(it.tipo),
      insertedDate: it.versaoAtiva?.updatedAt || it.createdAt,
      status: StatusContexto.Publicado,
      gerencia: it.gerenciaDonaId,
    }));
  }
};

// Histórico via busca paginada
export const getHistoricoContextos = async (
  searchQuery?: string,
  dateRange?: { from: Date | undefined; to: Date | undefined },
  page: number = 1,
  limit: number = 10
): Promise<HistoricoResponse> => {
  const base = apiBase();
  if (!base) return { data: [], total: 0 };
  const params = new URLSearchParams();
  if (searchQuery) params.set('q', searchQuery);
  if (dateRange?.from) params.set('from', dateRange.from.toISOString());
  if (dateRange?.to) params.set('to', dateRange.to.toISOString());
  params.set('page', String(page));
  params.set('pageSize', String(limit));
  const res = await fetch(`${base}/contextos/buscar?${params.toString()}`, withAuth());
  if (!res.ok) return { data: [], total: 0 };
  const body = await res.json();
  const rows: any[] = body.data || body || [];
  const out: Contexto[] = rows.map(r => ({
    id: r.contextoId || r.id,
    title: r.tituloConceitual || r.titulo,
    type: 'pdf',
    insertedDate: r.updatedAt || r.createdAt,
    status: statusLabelToEnum(r.status || r.statusValidacao),
  }));
  return { data: out, total: body.total || out.length };
};

// Detalhes por ID
export const getContextoById = async (id: string): Promise<Contexto | null> => {
  const base = apiBase();
  if (!base) return null;
  const res = await fetch(`${base}/contextos/detalhes/${id}`, withAuth());
  if (!res.ok) return null;
  const body = await res.json();
  const latest = body.versoes?.[0];
  const ctx: Contexto = {
    id: body.id,
    title: body.tituloConceitual,
    type: mapDocType(body.tipo),
    insertedDate: latest?.updatedAt || body.createdAt,
    status: latest ? statusLabelToEnum(latest.status) : StatusContexto.Publicado,
    description: latest?.descricao || undefined,
    gerencia: body.gerenciaDonaId,
  versoes: (body.versoes || []).map((v: any) => ({ id: v.numero, dbId: v.id, nome: v.titulo, data: v.updatedAt, autor: '', status: statusLabelToEnum(v.status) })),
    historico: (body.historico || []).map((h: any) => ({ data: h.timestamp, autor: '', acao: (h.statusNovoLabel || h.statusNovo) + (h.justificativa ? `: ${h.justificativa}` : '') })),
  };
  return ctx;
};

// Publicados por gerência (filtro client-side por enquanto)
export const getContextosPorGerencia = async (idGerencia: string): Promise<Contexto[]> => {
  if (!idGerencia) return [];
  const base = apiBase();
  if (!base) return [];
  const res = await fetch(`${base}/contextos/publicados`);
  if (!res.ok) return [];
  const body = await res.json();
  const items: any[] = body.data || body || [];
  return items
    .filter((it) => it.gerenciaDonaId === idGerencia)
    .map((it) => ({
      id: it.id,
      title: it.tituloConceitual,
      type: mapDocType(it.tipo),
      insertedDate: it.versaoAtiva?.updatedAt || it.createdAt,
      status: StatusContexto.Publicado,
      gerencia: it.gerenciaDonaId,
    }));
};

// ---- Mutations: visibilidade ----
export async function ocultarContexto(contextoId: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const res = await fetch(`${base}/contextos/${encodeURIComponent(contextoId)}/ocultar`, withAuth({ method: 'POST' }));
  return res.ok;
}

export async function reexibirContexto(contextoId: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const res = await fetch(`${base}/contextos/${encodeURIComponent(contextoId)}/reexibir`, withAuth({ method: 'POST' }));
  return res.ok;
}

export async function ocultarVersao(versaoId: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const res = await fetch(`${base}/contextos/versoes/${encodeURIComponent(versaoId)}/ocultar`, withAuth({ method: 'POST' }));
  return res.ok;
}

export async function reexibirVersao(versaoId: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  const res = await fetch(`${base}/contextos/versoes/${encodeURIComponent(versaoId)}/reexibir`, withAuth({ method: 'POST' }));
  return res.ok;
}

// ---- Mutations: criação de contexto/versão ----
type CreateContextoInput =
  | { kind: 'contexto'; tituloConceitual: string; titulo: string; descricao?: string; fileType?: 'pdf'|'excel'|'doc'|'link'; url?: string; file?: File | null }
  | { kind: 'dashboard'; tituloConceitual: string; titulo: string; descricao?: string; grafico: 'pie'|'chart'|'line'; dataset: any }
  | { kind: 'indicador'; tituloConceitual: string; titulo: string; descricao?: string; valorAtual: string; valorAlvo?: string; unidade: string; textoComparativo?: string; cor: string; icone: string };

export async function criarContexto(input: CreateContextoInput): Promise<{ contextoId: string } | null> {
  const base = apiBase();
  if (!base) return null;
  // Mapear para API body
  const mapDocType = (ft?: string) => {
    switch (ft) {
      case 'pdf': return 'PDF';
      case 'excel': return 'EXCEL';
      case 'doc': return 'DOC';
      case 'link': return 'LINK';
      default: return 'PDF';
    }
  };
  const mapTipoGrafico = (g: 'pie'|'chart'|'line') => (g === 'pie' ? 'PIE' : g === 'chart' ? 'BAR' : 'LINE');

  const body: any = (() => {
    switch (input.kind) {
      case 'contexto':
        return {
          tituloConceitual: input.tituloConceitual,
          tipo: 'ARQUIVO_LINK',
          titulo: input.titulo,
          descricao: input.descricao || null,
          arquivo: { docType: mapDocType(input.fileType), url: input.url || null },
        };
      case 'dashboard':
        return {
          tituloConceitual: input.tituloConceitual,
          tipo: 'DASHBOARD',
          titulo: input.titulo,
          descricao: input.descricao || null,
          dashboard: { tipoGrafico: mapTipoGrafico(input.grafico), payload: JSON.stringify(input.dataset || {}) },
        };
      case 'indicador':
        return {
          tituloConceitual: input.tituloConceitual,
          tipo: 'INDICADOR',
          titulo: input.titulo,
          descricao: input.descricao || null,
          indicador: {
            valorAtual: input.valorAtual,
            valorAlvo: input.valorAlvo || null,
            unidade: input.unidade,
            textoComparativo: input.textoComparativo || null,
            cor: input.cor,
            icone: input.icone,
          },
        };
    }
  })();

  // If it's a contexto with a file, use multipart/form-data
  if (input.kind === 'contexto' && input.file) {
    const fd = new FormData();
    fd.append('tituloConceitual', input.tituloConceitual);
    fd.append('tipo', 'ARQUIVO_LINK');
    fd.append('titulo', input.titulo);
    if (input.descricao) fd.append('descricao', input.descricao);
    // Supporting link-only upload as well
    if (input.url) fd.append('url', input.url);
    fd.append('arquivo', input.file, (input.file as any).name || 'arquivo');
    const res = await fetch(`${base}/contextos`, withAuth({ method: 'POST', body: fd }));
    if (!res.ok) return null;
    const json = await res.json();
    return { contextoId: json?.contexto?.id || json?.id };
  }

  const res = await fetch(`${base}/contextos`, withAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
  if (!res.ok) return null;
  const json = await res.json();
  return { contextoId: json?.contexto?.id || json?.id };
}