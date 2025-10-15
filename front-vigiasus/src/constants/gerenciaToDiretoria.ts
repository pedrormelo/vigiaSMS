// Provisional mapping from gerência names (as used in graphs) to diretoria IDs (keys of diretoriasConfig)
// TODO: Replace with backend-provided mapping or align gerência identifiers

export const GERENCIA_TO_DIRETORIA: Record<string, string> = {
    // Gestão do SUS
    GPLAN: "gestao-sus", // Planejamento
    GTI: "gestao-sus",   // Tecnologia da Informação
    Gestão: "gestao-sus",
    "Ouvidoria": "gestao-sus",

    // Regulação do SUS
    "Regulação": "regulacao-sus",
    "Regulação Ambulatorial": "regulacao-sus",
    "Regulação de Leitos": "regulacao-sus",

    // Atenção à Saúde
    "Atenção Básica": "atencao-saude",
    "Especialidades": "atencao-saude",

    // Vigilância em Saúde
    "Vigilância em Saúde": "vigilancia-saude",
};

export function mapGerenciaToDiretoria(gerenciaName: string): string | null {
    return GERENCIA_TO_DIRETORIA[gerenciaName] ?? null;
}
