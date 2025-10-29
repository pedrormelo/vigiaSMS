"use client";

import { useMemo } from "react";

export type StalenessVariant = "recent" | "stale" | "error" | "unknown";

export interface UseStalenessOptions {
    dates?: Array<Date | string | number | null | undefined>;
    extractors?: Array<() => Array<Date | string | number | null | undefined>>;
    thresholds?: { recentDays?: number; staleDays?: number };
    locale?: string; // e.g., 'pt-BR'
}

export interface StalenessState {
    variant: StalenessVariant;
    label: string;
    lastUpdatedAt: Date | null;
    days: number | null;
}

function toDate(value: Date | string | number | null | undefined): Date | null {
    if (value == null) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

export function useStaleness({ dates = [], extractors = [], thresholds, locale = "pt-BR" }: UseStalenessOptions): StalenessState {
    const recentDays = thresholds?.recentDays ?? 7;
    const staleDays = thresholds?.staleDays ?? 30;

    const allDates = useMemo(() => {
        const out: Date[] = [];
        for (const d of dates) {
            const dt = toDate(d);
            if (dt) out.push(dt);
        }
        for (const fn of extractors) {
            const arr = fn?.() ?? [];
            for (const d of arr) {
                const dt = toDate(d);
                if (dt) out.push(dt);
            }
        }
        return out;
    }, [dates, extractors]);

    const { lastUpdatedAt, days } = useMemo(() => {
        if (allDates.length === 0) return { lastUpdatedAt: null as Date | null, days: null as number | null };
        const max = new Date(Math.max.apply(null, allDates.map((d) => d.getTime())));
        const diffMs = Date.now() - max.getTime();
        const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return { lastUpdatedAt: max, days: d };
    }, [allDates]);

    const label = useMemo(() => {
        if (days == null || lastUpdatedAt == null) return "Sem atualizações";
        const rel = days <= 0 ? "hoje" : days === 1 ? "há 1 dia" : `há ${days} dias`;
        return days <= recentDays ? `Atualizado ${rel}` : days <= staleDays ? `Sem atualizações ${rel}` : `Inativo ${rel}`;
    }, [days, lastUpdatedAt, recentDays, staleDays, locale]);

    const variant: StalenessVariant = useMemo(() => {
        if (days == null) return "unknown";
        if (days <= recentDays) return "recent";
        if (days <= staleDays) return "stale";
        return "error";
    }, [days, recentDays, staleDays]);

    return { variant, label, lastUpdatedAt, days };
}
