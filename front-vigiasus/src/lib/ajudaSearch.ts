// src/lib/ajudaSearch.ts
"use client";

import { ajudaSearchIndex, type HelpSearchEntry } from "@/constants/ajudaSearchIndex";

const ACCENT_REGEX = /[\u0300-\u036f]/g;

export const normalizeHelpSearchText = (value: string): string =>
    value
        .toLowerCase()
        .normalize("NFD")
        .replace(ACCENT_REGEX, "")
        .trim();

export const buildHelpSearchTokens = (rawValue: string): string[] => {
    const normalized = normalizeHelpSearchText(rawValue);
    if (!normalized) return [];
    return normalized.split(/\s+/).filter(Boolean);
};

export const searchAjudaEntries = (
    areaId: string | null,
    tokens: string[],
    limit = 12
): HelpSearchEntry[] => {
    if (!tokens.length) return [];

    return ajudaSearchIndex
        .filter(entry => (areaId ? entry.areaId === areaId : true))
        .map<HelpSearchEntry | null>(entry => {
            const haystack = normalizeHelpSearchText(
                `${entry.title} ${entry.summary} ${(entry.keywords ?? []).join(" ")}`
            );
            return tokens.every(token => haystack.includes(token)) ? entry : null;
        })
        .filter((entry): entry is HelpSearchEntry => entry !== null)
        .slice(0, limit);
};
