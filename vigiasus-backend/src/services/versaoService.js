// src/services/versaoService.js
const prisma = require('../config/prismaClient');
const crypto = require('crypto');
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

// Aprovação pelo GERENTE: AGUARDANDO_GERENTE -> AGUARDANDO_DIRETOR
async function gerenteAprova({ versaoId, actor }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(actor.role === 'GERENTE', 'Apenas GERENTE pode aprovar');
    assert(actor.gerenciaId && actor.gerenciaId === versao.contexto.gerenciaDonaId, 'Gerente não pertence à gerência dona');
    assert(versao.statusValidacao === 'AGUARDANDO_GERENTE', 'Status atual não permite aprovação do gerente');

    // Captura o nome da Gerência para a mensagem
    const nomeGerencia = versao.contexto.gerencia.nome || "Gerência";

    const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.contextoversao.update({
            where: { id: versaoId },
            data: { statusValidacao: 'AGUARDANDO_DIRETOR', updatedAt: new Date() },
        });

        await tx.validacaohistorico.create({
            data: {
                id: crypto.randomUUID(),
                versaoId,
                autorId: actor.id,
                statusNovo: 'AGUARDANDO_DIRETOR',
                timestamp: new Date(),
            },
        });

        // Mensagem personalizada com a Gerência
        await tx.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId: versaoId,
                autorId: actor.id,
                texto: `✅ Aprovado pela ${nomeGerencia}.\nEncaminhado para análise da Diretoria.`,
                isPrivate: false,
                timestamp: new Date()
            }
        });

        return v;
    });

    // Notificação personalizada para o Diretor
    await notificacaoService.notifyDiretoresDaDiretoria(
        versao.contexto.gerencia.diretoriaId,
        actor.id,
        versao,
        `O contexto "${versao.titulo}", vindo da ${nomeGerencia}, aguarda aprovação.`
    );
    await notificacaoService.notifySolicitanteStatus(updated, actor.id, 'AGUARDANDO_DIRETOR');
    
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
            data: {
                id: crypto.randomUUID(),
                versaoId,
                autorId: actor.id,
                statusNovo: 'PUBLICADO',
                justificativa: 'Publicado pelo Diretor',
                timestamp: new Date(),
            },
        });

        await tx.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId: versaoId,
                autorId: actor.id,
                texto: "🚀 Versão Publicada e Ativa!\nO processo de validação foi concluído.",
                isPrivate: false,
                timestamp: new Date()
            }
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

    const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.contextoversao.update({
            where: { id: versaoId },
            data: { statusValidacao: 'INDEFERIDO', updatedAt: new Date() },
        });

        await tx.validacaohistorico.create({
            data: {
                id: crypto.randomUUID(),
                versaoId,
                autorId: actor.id,
                statusNovo: 'INDEFERIDO',
                justificativa: justificativa || 'Indeferido',
                timestamp: new Date(),
            }
        });

        await tx.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId: versaoId,
                autorId: actor.id,
                texto: `❌ Indeferido.\nJustificativa: "${justificativa || 'Sem justificativa'}"`,
                isPrivate: false,
                timestamp: new Date()
            }
        });

        return v;
    });

    await notificacaoService.notifySolicitanteStatus(updated, actor.id, 'INDEFERIDO');
    return updated;
}

// Solicitar correção (pode ser GERENTE ou DIRETOR)
async function solicitarCorrecao({ versaoId, actor, justificativa }) {
    const versao = await getVersaoWithContexto(versaoId);
    assert(versao, 'Versão não encontrada');
    assert(['GERENTE', 'DIRETOR'].includes(actor.role), 'Apenas GERENTE ou DIRETOR');
    
    if (actor.role === 'GERENTE') {
        assert(actor.gerenciaId && actor.gerenciaId === versao.contexto.gerenciaDonaId, 'Gerente inválido');
    } else {
        const diretoriaId = versao.contexto.gerencia.diretoriaId;
        assert(actor.diretoriaId && actor.diretoriaId === diretoriaId, 'Diretor inválido');
    }

    const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.contextoversao.update({
            where: { id: versaoId },
            data: { statusValidacao: 'AGUARDANDO_CORRECAO', updatedAt: new Date() },
        });
        
        await tx.validacaohistorico.create({
            data: {
                id: crypto.randomUUID(),
                versaoId,
                autorId: actor.id,
                statusNovo: 'AGUARDANDO_CORRECAO',
                justificativa: justificativa || null,
                timestamp: new Date(),
            }
        });

        await tx.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId: versaoId,
                autorId: actor.id,
                texto: `⚠️ Devolvido para Correção.\nMotivo: "${justificativa}"\nPor favor, envie uma nova versão com os ajustes.`,
                isPrivate: false,
                timestamp: new Date()
            }
        });

        return v;
    });

    await notificacaoService.notifySolicitanteStatus(updated, actor.id, 'AGUARDANDO_CORRECAO');
    return updated;
}

module.exports = {
    gerenteAprova,
    diretorPublica,
    diretorIndefere,
    solicitarCorrecao,
};