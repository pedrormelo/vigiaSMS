// Serviço de regras de negócio para transições de status de ContextoVersao
// Implementa a lógica de aprovação por GERENTE, publicação por DIRETOR, etc.

const prisma = require('../config/prismaClient');
const notificacaoService = require('./notificacaoService');

async function getVersaoWithContexto(versaoId) {
    return prisma.contextoversao.findUnique({
        where: { id: versaoId },
        include: {
            contexto: {
                include: {
                    gerencia: { include: { diretoria: true } },
                },
            },
        },
    });
}

function assert(condition, message) {
    if (!condition) {
        const err = new Error(message || 'Operação inválida');
        err.status = 400;
        throw err;
    }
}

async function registrarHistorico(versaoId, autorId, statusNovo, justificativa) {
    await prisma.validacaohistorico.create({
        data: { versaoId, autorId, statusNovo, justificativa: justificativa || null },
    });
}

// Aprovação pelo GERENTE: AGUARDANDO_GERENTE -> AGUARDANDO_DIRETOR
async function gerenteAprova({ versaoId, actor }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(actor.role === 'GERENTE', 'Apenas GERENTE pode aprovar');
    assert(actor.gerenciaId && actor.gerenciaId === versao.contexto.gerenciaDonaId, 'Gerente não pertence à gerência dona');
    assert(versao.statusValidacao === 'AGUARDANDO_GERENTE', 'Status atual não permite aprovação do gerente');

    const updated = await prisma.contextoversao.update({
        where: { id: versaoId },
        data: { statusValidacao: 'AGUARDANDO_DIRETOR', updatedAt: new Date() },
    });
    await registrarHistorico(versaoId, actor.id, 'AGUARDANDO_DIRETOR');
    // Notify directors of the diretoria except actor
    await notificacaoService.notifyDiretoresDaDiretoria(
        versao.contexto.gerencia.diretoriaId,
        actor.id,
        versao,
        `O contexto "${versao.titulo}" aguarda aprovação do Diretor.`
    );
    return updated;
}

// Publicação pelo DIRETOR: AGUARDANDO_DIRETOR -> PUBLICADO e isAtiva = true
async function diretorPublica({ versaoId, actor }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(actor.role === 'DIRETOR', 'Apenas DIRETOR pode publicar');
    const diretoriaId = versao.contexto.gerencia.diretoriaId;
    assert(actor.diretoriaId && actor.diretoriaId === diretoriaId, 'Diretor não pertence à diretoria dona');
    assert(versao.statusValidacao === 'AGUARDANDO_DIRETOR', 'Status atual não permite publicação');

    // Transação: desativar versões antigas e ativar esta
    const result = await prisma.$transaction(async (tx) => {
        await tx.contextoversao.updateMany({
            where: { contextoId: versao.contextoId },
            data: { isAtiva: false },
        });
        const published = await tx.contextoversao.update({
            where: { id: versaoId },
            data: { statusValidacao: 'PUBLICADO', isAtiva: true, updatedAt: new Date() },
        });
        await tx.validacaohistorico.create({
            data: { versaoId, autorId: actor.id, statusNovo: 'PUBLICADO' },
        });
        return published;
    });
    await notificacaoService.notifySolicitanteStatus(result, actor.id, 'PUBLICADO');
    return result;
}

// Indeferir pelo DIRETOR
async function diretorIndefere({ versaoId, actor, justificativa }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(actor.role === 'DIRETOR', 'Apenas DIRETOR pode indeferir');
    const diretoriaId = versao.contexto.gerencia.diretoriaId;
    assert(actor.diretoriaId && actor.diretoriaId === diretoriaId, 'Diretor não pertence à diretoria dona');
    assert(['AGUARDANDO_DIRETOR', 'AGUARDANDO_GERENTE'].includes(versao.statusValidacao), 'Status atual não permite indeferir');

    const updated = await prisma.contextoversao.update({
        where: { id: versaoId },
        data: { statusValidacao: 'INDEFERIDO', updatedAt: new Date() },
    });
    await registrarHistorico(versaoId, actor.id, 'INDEFERIDO', justificativa);
    await notificacaoService.notifySolicitanteStatus(updated, actor.id, 'INDEFERIDO');
    return updated;
}

// Solicitar correção (pode ser GERENTE ou DIRETOR)
async function solicitarCorrecao({ versaoId, actor, justificativa }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(['GERENTE', 'DIRETOR'].includes(actor.role), 'Apenas GERENTE ou DIRETOR');
    // Checagens de pertencimento
    if (actor.role === 'GERENTE') {
        assert(actor.gerenciaId && actor.gerenciaId === versao.contexto.gerenciaDonaId, 'Gerente inválido');
    } else {
        const diretoriaId = versao.contexto.gerencia.diretoriaId;
        assert(actor.diretoriaId && actor.diretoriaId === diretoriaId, 'Diretor inválido');
    }

    const updated = await prisma.contextoversao.update({
        where: { id: versaoId },
        data: { statusValidacao: 'AGUARDANDO_CORRECAO', updatedAt: new Date() },
    });
    await registrarHistorico(versaoId, actor.id, 'AGUARDANDO_CORRECAO', justificativa);
    await notificacaoService.notifySolicitanteStatus(updated, actor.id, 'AGUARDANDO_CORRECAO');
    return updated;
}

module.exports = {
    gerenteAprova,
    diretorPublica,
    diretorIndefere,
    solicitarCorrecao,
};
