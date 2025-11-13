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
    versoes: (body.versoes || []).map((v: any) => ({ id: v.numero, nome: v.titulo, data: v.updatedAt, autor: '', status: statusLabelToEnum(v.status) })),
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