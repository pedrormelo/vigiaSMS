export type GraphType = "line" | "chart" | "pie";

/**
 * Normaliza códigos vindos do backend para os tipos de gráfico usados no frontend.
 * Aceita variações como "AREA", "LINE_CHART", "pizza" ou valores em português.
 */
export function normalizeGraphType(input: unknown): GraphType {
    if (typeof input !== "string") {
        return "chart";
    }

    const value = input.trim().toLowerCase();
    if (!value) {
        return "chart";
    }

    if (value.includes("pie") || value.includes("pizza") || value.includes("setor")) {
        return "pie";
    }

    if (
        value.includes("line") ||
        value.includes("linha") ||
        value.includes("área") ||
        value.includes("area") ||
        value.includes("area_chart")
    ) {
        return "line";
    }

    return "chart";
}