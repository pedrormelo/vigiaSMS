// src/mappers/contextoMapper.js
const { StatusLabels } = require('../constants/status');

function mapHistorico(record) {
    if (!record) return null;
    return {
        id: record.id,
        versaoId: record.versaoId,
        autorId: record.autorId,
        statusNovo: record.statusNovo,
        statusNovoLabel: StatusLabels[record.statusNovo] || record.statusNovo,
        justificativa: record.justificativa || null,
        timestamp: record.timestamp,
        // AQUI: Garante que o nome do autor é extraído do objeto user incluído pelo Controller
        autorNome: record.user ? record.user.nome : (record.autorNome || "Sistema"), 
    };
}

function mapVersao(prismaVersao) {
    if (!prismaVersao) return null;
    
    // Verifica se existe histórico bruto (validacaohistorico) ou já mapeado (historico)
    const rawHistorico = prismaVersao.validacaohistorico || prismaVersao.historico || [];
    // Mapeia cada item do histórico usando a função auxiliar
    const historicoFormatado = Array.isArray(rawHistorico) ? rawHistorico.map(mapHistorico) : [];

    return {
        id: prismaVersao.id,
        versaoNumero: prismaVersao.versaoNumero, // Mantém para compatibilidade
        numero: prismaVersao.versaoNumero,       // Frontend pode usar este
        titulo: prismaVersao.titulo,
        descricao: prismaVersao.descricao || null,
        
        status: prismaVersao.statusValidacao,
        statusLabel: StatusLabels[prismaVersao.statusValidacao] || prismaVersao.statusValidacao,
        
        ativo: prismaVersao.isAtiva,
        destacado: prismaVersao.isDestacado,
        solicitanteId: prismaVersao.solicitanteId,
        updatedAt: prismaVersao.updatedAt,
        createdAt: prismaVersao.createdAt,
        
        solicitanteNome: prismaVersao.user ? prismaVersao.user.nome : null,
        
        // [CORREÇÃO CRÍTICA] Inclui o histórico dentro da versão
        historico: historicoFormatado,

        // Dados específicos
        versaoarquivo: prismaVersao.versaoarquivo,
        versaodashboard: prismaVersao.versaodashboard,
        versaoindicador: prismaVersao.versaoindicador
    };
}

function mapContexto(prismaContexto, versaoAtiva) {
    return {
        id: prismaContexto.id,
        tituloConceitual: prismaContexto.tituloConceitual,
        tipo: prismaContexto.tipo,
        gerenciaDonaId: prismaContexto.gerenciaDonaId,
        autorOriginalId: prismaContexto.autorOriginalId,
        createdAt: prismaContexto.createdAt,
        // Define status do contexto baseado na versão ativa
        status: versaoAtiva ? versaoAtiva.statusValidacao : (prismaContexto.status || 'AGUARDANDO_GERENTE'),
        versaoAtiva: versaoAtiva ? mapVersao(versaoAtiva) : null,
    };
}

function mapContextoDetalhe(prismaContexto, versoes = [], historicoGeral = []) {
    // Tenta encontrar o status mais recente
    let statusGeral = prismaContexto.status;
    if (!statusGeral && versoes.length > 0) {
        // Assume que versões vêm ordenadas ou pega a primeira (que no controller ordenamos desc)
        // Mas para garantir, pegamos a com maior número
        const ultima = versoes.reduce((prev, current) => (prev.versaoNumero > current.versaoNumero) ? prev : current, versoes[0]);
        statusGeral = ultima.statusValidacao;
    }

    return {
        id: prismaContexto.id,
        tituloConceitual: prismaContexto.tituloConceitual,
        title: prismaContexto.tituloConceitual, // Alias para frontend
        tipo: prismaContexto.tipo,
        gerenciaDonaId: prismaContexto.gerenciaDonaId,
        autorOriginalId: prismaContexto.autorOriginalId,
        createdAt: prismaContexto.createdAt,
        
        // Status na raiz para facilitar frontend
        status: statusGeral || 'AGUARDANDO_GERENTE',
        
        // Mapeia todas as versões (agora com histórico interno)
        versoes: versoes.map(mapVersao),
        
        // Histórico geral (fallback)
        historico: historicoGeral.map(mapHistorico),

        // Dados de Gerência/Diretoria
        gerenciaSlug: prismaContexto.gerencia ? prismaContexto.gerencia.slug : null,
        gerenciaNome: prismaContexto.gerencia ? prismaContexto.gerencia.nome : null,
        diretoriaSlug: prismaContexto.gerencia?.diretoria ? prismaContexto.gerencia.diretoria.slug : null,
    };
}

module.exports = {
    mapVersao,
    mapHistorico,
    mapContexto,
    mapContextoDetalhe,
};