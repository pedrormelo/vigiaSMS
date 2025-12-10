// src/services/csvUploadService.ts

import { ConjuntoDeDadosGrafico, FormatoColuna } from '@/components/popups/addContextoModal/types';
import { authService } from '@/services/authService';

interface ParseResponse {
    success: boolean;
    data?: {
        colunas: string[];
        linhas: (string | number | null)[][];
        formatos: FormatoColuna[];
        avisos: string[];
        metadata: {
            delimitador: string;
            linhasOriginais: number;
            colunasOriginais: number;
            linhasImportadas: number;
            colunasImportadas: number;
        };
    };
    message?: string;
}

function apiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

export async function uploadAndParseCsv(
    file: File
): Promise<{ dataset: ConjuntoDeDadosGrafico; avisos: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const base = apiBase();
    const token = authService.getToken();

    const response = await fetch(`${base}/contextos/dashboards/parse-csv`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        let message = 'Erro ao processar arquivo CSV';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch {}
        throw new Error(`[${response.status}] ${message}`);
    }

    const data: ParseResponse = await response.json();

    if (!data.success || !data.data) {
        throw new Error(data.message || 'Erro desconhecido ao processar CSV');
    }

    return {
        dataset: {
            colunas: data.data.colunas,
            linhas: data.data.linhas,
            formatos: data.data.formatos,
        },
        avisos: data.data.avisos,
    };
}
