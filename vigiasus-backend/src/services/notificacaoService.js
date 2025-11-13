// notificacaoService.js
// Centralizes creation of notification records for version workflow events.
const prisma = require('../config/prismaClient');
const crypto = require('crypto');

async function notifyDiretoresDaDiretoria(diretoriaId, excludingUserId, versao, titulo) {
    const diretores = await prisma.user.findMany({
        where: { role: 'DIRETOR', diretoriaId, id: { not: excludingUserId } },
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

async function notifySolicitanteStatus(versao, actorId, status) {
    if (versao.solicitanteId === actorId) return false; // don't notify self
    await prisma.notificacao.create({
        data: {
            id: crypto.randomUUID(),
            destinatarioId: versao.solicitanteId,
            tipo: 'VALIDACAO_STATUS',
            titulo: `Status da versão atualizado para ${status}`,
            versaoId: versao.id
        }
    });
    return true;
}

module.exports = {
    notifyDiretoresDaDiretoria,
    notifySolicitanteStatus,
};
