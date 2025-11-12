// Mapping Prisma entities to API DTOs.
const { StatusLabels } = require('../constants/status');

function mapVersao(prismaVersao) {
    if (!prismaVersao) return null;
    return {
        id: prismaVersao.id,
        numero: prismaVersao.versaoNumero,
        titulo: prismaVersao.titulo,
        descricao: prismaVersao.descricao || null,
        status: prismaVersao.statusValidacao,
        statusLabel: StatusLabels[prismaVersao.statusValidacao] || prismaVersao.statusValidacao,
        ativo: prismaVersao.isAtiva,
        destacado: prismaVersao.isDestacado,
        solicitanteId: prismaVersao.solicitanteId,
        updatedAt: prismaVersao.updatedAt,
        createdAt: prismaVersao.createdAt,
    };
}

function mapHistorico(record) {
    return {
        id: record.id,
        versaoId: record.versaoId,
        autorId: record.autorId,
        statusNovo: record.statusNovo,
        statusNovoLabel: StatusLabels[record.statusNovo] || record.statusNovo,
        justificativa: record.justificativa || null,
        timestamp: record.timestamp,
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
        versaoAtiva: versaoAtiva ? mapVersao(versaoAtiva) : null,
    };
}

function mapContextoDetalhe(prismaContexto, versoes = [], historico = []) {
    return {
        id: prismaContexto.id,
        tituloConceitual: prismaContexto.tituloConceitual,
        tipo: prismaContexto.tipo,
        gerenciaDonaId: prismaContexto.gerenciaDonaId,
        autorOriginalId: prismaContexto.autorOriginalId,
        createdAt: prismaContexto.createdAt,
        versoes: versoes.map(mapVersao),
        historico: historico.map(mapHistorico),
    };
}

module.exports = {
    mapVersao,
    mapHistorico,
    mapContexto,
    mapContextoDetalhe,
};
