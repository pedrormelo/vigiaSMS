// src/controllers/notificacoesController.js
const prisma = require('../config/prismaClient');

// GET /notificacoes
// CORREÇÃO: O nome da função deve ser listForUser para bater com a rota
exports.listForUser = async (req, res) => {
    const user = req.user;
    try {
        const notificacoes = await prisma.notificacao.findMany({
            where: { destinatarioId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                // Inclui os dados do remetente (opcional)
                user: { // Se a relação se chamar 'user' no schema para o remetente, senão ajuste conforme seu schema
                    select: { id: true, nome: true, email: true }
                },
                // Entramos na versão e pedimos para incluir o Contexto Pai
                contextoversao: {
                    include: {
                        contexto: {
                            select: {
                                id: true,
                                tituloConceitual: true,
                                tipo: true
                            }
                        }
                    }
                }
            }
        });

        return res.json({ data: notificacoes });

    } catch (error) {
        console.error('Erro listNotificacoes:', error);
        return res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
};

// POST /notificacoes/:id/ler
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        // Verifica se a notificação pertence ao usuário
        const notif = await prisma.notificacao.findFirst({
            where: { id, destinatarioId: user.id }
        });

        if (!notif) return res.status(404).json({ message: 'Notificação não encontrada' });

        await prisma.notificacao.update({
            where: { id },
            data: { isLida: true }
        });

        return res.json({ message: 'Marcada como lida' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar notificação' });
    }
};