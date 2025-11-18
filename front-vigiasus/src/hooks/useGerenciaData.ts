// src/hooks/useGerenciaData.ts
import { useCallback, useEffect, useState } from "react";
import { getGerenciaBySlug, type Gerencia } from "@/services/organizacaoService";
import { getContextosPorGerencia } from "@/services/contextoService";
import type { Contexto } from "@/components/validar/typesDados";

export function useGerenciaData(slug: string | undefined) {
    const [gerencia, setGerencia] = useState<Gerencia | null>(null);
    const [contextos, setContextos] = useState<Contexto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        if (!slug) return;
        try {
            setIsLoading(true);
            setError(null);
            const g = await getGerenciaBySlug(slug);
            if (!g) throw new Error("Gerência não encontrada.");
            setGerencia(g);
            const ctxs = await getContextosPorGerencia(g.id);
            setContextos(ctxs);
        } catch (err: any) {
            console.error("Erro ao carregar dados da gerência:", err);
            setError(err?.message || "Falha ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => { reload(); }, [reload]);

    return { gerencia, contextos, isLoading, error, reload, setContextos } as const;
}
