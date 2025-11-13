const prisma = require('../config/prismaClient');

// GET /notificacoes -> list for current user
exports.listForUser = async (req, res) => {
    try {
        const rows = await prisma.notificacao.findMany({
            where: { destinatarioId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return res.json({ data: rows });
    } catch (err) {
        console.error('Erro list notificacoes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
}

// POST /notificacoes/:id/ler -> mark as read
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const n = await prisma.notificacao.findUnique({ where: { id } });
        if (!n || n.destinatarioId !== req.user.id) return res.status(404).json({ message: 'Notificação não encontrada' });
        if (n.isLida) return res.json({ message: 'Já marcada como lida' });
        await prisma.notificacao.update({ where: { id }, data: { isLida: true } });
        return res.json({ message: 'OK' });
    } catch (err) {
        console.error('Erro marcar leitura notificacao:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

