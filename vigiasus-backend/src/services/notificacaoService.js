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
            id: { not: excludingUserId } // Não notificar quem disparou a ação (se for o caso)
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
 * (NOVA FUNÇÃO NECESSÁRIA PARA O FLUXO INICIAL)
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
        tipo: 'VALIDACAO', // Tipo que aparece no sininho
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
    // Se quem disparou a ação for o próprio dono da versão, não notifica
    if (versao.solicitanteId === actorId) return false; 

    // Mapa de mensagens amigáveis
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

module.exports = {
    notifyDiretoresDaDiretoria,
    notifyGerentesDaGerencia, // <--- Exportando a nova função
    notifySolicitanteStatus,
};