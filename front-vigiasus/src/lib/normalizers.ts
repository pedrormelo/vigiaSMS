// src/utils/normalizers.ts
import { Contexto, StatusContexto } from '@/components/validar/typesDados';

export function normalizarContexto(raw: any): Contexto {
    if (!raw) throw new Error("Contexto inválido");

    // 1. Se já estiver normalizado, retorna direto
    if (raw.__normalizado === true) {
        return raw as Contexto;
    }

    // 2. Normaliza título
    const titulo = raw.title || raw.tituloConceitual || "Sem título";

    // 3. Prepara histórico global e versões
    let versoes: any[] = Array.isArray(raw.versoes) ? raw.versoes : [];
    const historicoGlobal = Array.isArray(raw.historico) ? raw.historico : [];

    // Se não existirem versões, cria uma versão fictícia baseada no cabeçalho
    if (versoes.length === 0) {
        versoes = [
            {
                id: 1,
                nome: titulo,
                data: raw.insertedDate || new Date().toISOString(),
                autor: raw.solicitante || "N/A",
                estaOculta: false,
                status: raw.status || StatusContexto.Publicado,
                historico: historicoGlobal
            }
        ];
    }

    // 4. Normaliza cada versão (AQUI ESTÁ A CORREÇÃO MÁGICA)
    const versoesNormalizadas = versoes.map((v, i) => {
        const eAUltima = i === versoes.length - 1;

        // 4.1. Resolve o histórico da versão
        const historicoBruto =
            (Array.isArray(v.historico) && v.historico.length > 0)
                ? v.historico
                : (v.validacaohistorico || (eAUltima ? historicoGlobal : []));

        console.log(`    📌 [Normalizer] Versão ${v.id}: histórico`, {
            temHistorico: Array.isArray(v.historico),
            tamHistorico: v.historico?.length,
            temValidacao: !!v.validacaohistorico,
            tamValidacao: v.validacaohistorico?.length,
            historicoBrutoLength: historicoBruto?.length,
            historicoBruto: historicoBruto
        });

        const historicoNormalizado = (historicoBruto || []).map((h: any) => ({
            id: h.id,
            timestamp: h.timestamp || h.data || new Date().toISOString(),
            statusNovo: h.statusNovo || h.acao || "Ação desconhecida",
            statusNovoLabel: h.statusNovo || h.acao || "Ação desconhecida",
            autorNome: h.user?.nome || h.autor || h.autorNome || "Sistema",
            justificativa: h.justificativa || ""
        }));

        // 4.2. DEDUÇÃO DO STATUS REAL (Correção da Timeline)
        // Em vez de confiar cegamente em v.status ou raw.status, olhamos para o último evento.
        let statusCalculado = v.status || v.statusValidacao;

        // Se tiver histórico, a verdade está no último evento (ordenado por data)
        if (historicoNormalizado.length > 0) {
            // Ordena temporariamente para pegar o mais recente
            const ultimoEvento = [...historicoNormalizado].sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];
            
            // Se o último evento tiver um status válido, usamos ele
            if (ultimoEvento && ultimoEvento.statusNovo) {
                // Mapeia strings de ação para StatusContexto se necessário
                const statusMapeado = mapActionToStatus(ultimoEvento.statusNovo);
                statusCalculado = statusMapeado || statusCalculado;
            }
        }

        // Fallback final se ainda não tivermos status
        if (!statusCalculado) {
            statusCalculado = eAUltima ? raw.status : StatusContexto.Publicado;
        }

        const versaoFinal = {
            ...v,
            id: v.id || i + 1,
            nome: v.nome || v.titulo || `Versão ${v.versaoNumero || i + 1}`,
            data: v.data || v.createdAt || v.updatedAt || new Date().toISOString(),
            autor: v.autor || v.user?.nome || raw.solicitante || "N/A",
            estaOculta: v.estaOculta ?? v.isOculta ?? false,
            status: statusCalculado, // Usa o status calculado pelo histórico
            historico: historicoNormalizado
        };

        console.log(`    ✅ [Normalizer] Versão ${v.id} FINAL:`, {
            historicoQtd: historicoNormalizado.length,
            historico: historicoNormalizado
        });

        return versaoFinal;
    });

    // 5. Determina o status global
    const ultimaVersao = versoesNormalizadas.reduce((a, b) => {
        // Lógica robusta para pegar a última versão (maior ID ou data mais recente)
        const idA = Number(a.versaoNumero || a.id) || 0;
        const idB = Number(b.versaoNumero || b.id) || 0;
        if (idA !== idB) return idA > idB ? a : b;
        return new Date(a.data).getTime() >= new Date(b.data).getTime() ? a : b;
    });

    return {
        ...raw,
        id: raw.id,
        title: titulo,
        tituloConceitual: titulo,
        versoes: versoesNormalizadas,
        estaOculto: raw.estaOculto ?? raw.isOculto ?? false,
        status: ultimaVersao.status, // O contexto herda o status REAL da última versão
        __normalizado: true
    };
}

// Helper para converter ações do histórico em Status do enum
function mapActionToStatus(action: string): StatusContexto | null {
    const upper = String(action).toUpperCase();
    
    if (upper.includes('INDEFERIDO')) return StatusContexto.Indeferido;
    if (upper.includes('PUBLICADO') || upper.includes('DEFERIDO')) return StatusContexto.Publicado;
    if (upper.includes('DIRETOR')) return StatusContexto.AguardandoDiretor;
    if (upper.includes('GERENTE')) return StatusContexto.AguardandoGerente;
    if (upper.includes('CORRECAO') || upper.includes('CORREÇÃO')) return StatusContexto.AguardandoCorrecao;
    
    return null; // Retorna null para manter o status original se não reconhecer a ação
}