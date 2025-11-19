// src/controllers/notificacoesController.js
const prisma = require('../config/prismaClient');

// GET /notificacoes
exports.listForUser = async (req, res) => {
    const user = req.user;
    try {
        const notificacoes = await prisma.notificacao.findMany({
            where: { destinatarioId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { 
                    select: { id: true, nome: true, email: true }
                },
                contextoversao: {
                    select: {
                        statusValidacao: true,
                        contextoId: true,
                        versaoarquivo: {
                            select: { docType: true }
                        },
                        versaodashboard: {
                            select: { id: true } 
                        },
                        versaoindicador: {
                            select: { id: true } 
                        },
                        contexto: {
                            select: {
                                id: true,
                                tituloConceitual: true,
                                tipo: true,
                                // AQUI: Buscamos IDs necessários para a validação de permissão
                                gerencia: { 
                                    select: { 
                                        id: true, 
                                        nome: true,
                                        diretoriaId: true 
                                    } 
                                }
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