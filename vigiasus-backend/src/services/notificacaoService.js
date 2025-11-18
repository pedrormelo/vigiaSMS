// src/services/notificacaoService.js
const prisma = require('../config/prismaClient');
const crypto = require('crypto');

/**
 * Notifica todos os Diretores de uma Diretoria específica.
 */
async function notifyDiretoresDaDiretoria(diretoriaId, excludingUserId, versao, titulo) {
    if (!diretoriaId) return 0;

    const diretores = await prisma.user.findMany({
        where: { 
            role: 'DIRETOR', 
            diretoriaId: diretoriaId, 
            id: { not: excludingUserId } 
        },
        select: { id: true }
    });

    if (!diretores.length) return 0;

    const data = diretores.map(d => ({
        id: crypto.randomUUID(),
        destinatarioId: d.id,
        tipo: 'VALIDACAO',
        titulo,
        versaoId: versao.id
    }));

    await prisma.notificacao.createMany({ data });
    return data.length;
}

/**
 * Notifica todos os Gerentes de uma Gerência específica.
 */
async function notifyGerentesDaGerencia(gerenciaId, excludingUserId, versao, titulo) {
    if (!gerenciaId) return 0;

    const gerentes = await prisma.user.findMany({
        where: { 
            role: 'GERENTE', 
            gerenciaId: gerenciaId, 
            id: { not: excludingUserId } 
        },
        select: { id: true }
    });

    if (!gerentes.length) return 0;

    const data = gerentes.map(g => ({
        id: crypto.randomUUID(),
        destinatarioId: g.id,
        tipo: 'VALIDACAO',
        titulo: titulo,
        versaoId: versao.id,
        createdAt: new Date()
    }));

    await prisma.notificacao.createMany({ data });
    return data.length;
}

/**
 * Notifica o autor original (Solicitante) sobre mudança de status.
 */
async function notifySolicitanteStatus(versao, actorId, status) {
    if (versao.solicitanteId === actorId) return false; 

    const msgs = {
        'AGUARDANDO_DIRETOR': 'Sua versão foi aprovada pelo Gerente e aguarda o Diretor.',
        'PUBLICADO': 'Parabéns! Sua versão foi publicada pelo Diretor.',
        'INDEFERIDO': 'Sua versão foi indeferida.',
        'AGUARDANDO_CORRECAO': 'Foram solicitadas correções na sua versão.',
        'AGUARDANDO_GERENTE': 'Nova versão submetida para análise do Gerente.'
    };

    const titulo = msgs[status] || `Status atualizado para ${status}`;

    await prisma.notificacao.create({
        data: {
            id: crypto.randomUUID(),
            destinatarioId: versao.solicitanteId,
            tipo: 'VALIDACAO_STATUS',
            titulo: titulo,
            versaoId: versao.id,
            createdAt: new Date()
        }
    });
    return true;
}

/**
 * Notifica um usuário específico sobre uma mensagem privada recebida.
 */
async function notifyComentarioPrivado(destinatarioId, autorNome, versaoId) {
    if (!destinatarioId) return;

    await prisma.notificacao.create({
        data: {
            id: crypto.randomUUID(),
            destinatarioId: destinatarioId,
            tipo: 'COMENTARIO',
            titulo: `Mensagem privada de ${autorNome}`,
            versaoId: versaoId,
            createdAt: new Date()
        }
    });
}

/**
 * NOVO: Notifica toda a hierarquia sobre um novo comentário PÚBLICO.
 * Regra: Secretaria <-> Diretor <-> Gerente <-> Membro (Solicitante)
 */
async function notifyComentarioHierarquia(versaoId, autorId, texto) {
    // 1. Buscar dados da estrutura (Versão -> Contexto -> Gerência -> Diretoria)
    const versao = await prisma.contextoversao.findUnique({
        where: { id: versaoId },
        include: {
            contexto: {
                include: {
                    gerencia: true 
                }
            }
        }
    });

    if (!versao || !versao.contexto || !versao.contexto.gerencia) return;

    const gerenciaId = versao.contexto.gerencia.id;
    const diretoriaId = versao.contexto.gerencia.diretoriaId;
    const solicitanteId = versao.solicitanteId;

    // 2. Encontrar todos os usuários envolvidos na hierarquia
    const destinatarios = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'SECRETARIA' }, // Sempre vê tudo
                { role: 'DIRETOR', diretoriaId: diretoriaId }, // Diretor da área
                { role: 'GERENTE', gerenciaId: gerenciaId },   // Gerente da área
                { id: solicitanteId }   // Dono do contexto (Membro)
            ],
            id: { not: autorId } // Não notificar o próprio autor do comentário
        },
        select: { id: true }
    });

    if (!destinatarios.length) return;

    // 3. Criar as notificações em lote
    const data = destinatarios.map(u => ({
        id: crypto.randomUUID(),
        destinatarioId: u.id,
        tipo: 'COMENTARIO',
        titulo: `Novo comentário em "${versao.titulo}"`,
        versaoId: versaoId,
        createdAt: new Date()
    }));

    await prisma.notificacao.createMany({ data });
}

module.exports = {
    notifyDiretoresDaDiretoria,
    notifyGerentesDaGerencia,
    notifySolicitanteStatus,
    notifyComentarioPrivado,
    notifyComentarioHierarquia, // <--- Exportado
};