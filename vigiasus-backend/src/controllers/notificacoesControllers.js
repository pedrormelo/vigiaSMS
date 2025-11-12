const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota para LISTAR as notificações do usuário logado
 * GET /notificacoes
 */
router.get('/', async (req, res) => {
    const usuarioId = req.user.id; // ID do usuário logado

    try {
        //
        const notificacoes = await prisma.notificacao.findMany({
            where: {
                destinatarioId: usuarioId
            },
            orderBy: {
                createdAt: 'desc' // Mais recentes primeiro
            },
            include: {
                // Inclui dados da versão para o frontend saber onde clicar
                //
                contextoversao: {
                    select: {
                        id: true,
                        titulo: true,
                        contextoId: true
                    }
                }
            }
        });

        res.status(200).json(notificacoes);

    } catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/**
 * Rota para MARCAR UMA notificação como lida
 * PUT /notificacoes/:id/read
 */
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    try {
        //
        await prisma.notificacao.update({
            where: {
                id: id,
                // Garante que o usuário só possa ler a *sua* notificação
                destinatarioId: usuarioId 
            },
            data: {
                isLida: true
            }
        });

        res.status(200).json({ message: 'Notificação marcada como lida.' });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/**
 * Rota para MARCAR TODAS as notificações como lidas
 * PUT /notificacoes/read-all
 */
router.put('/read-all', async (req, res) => {
    const usuarioId = req.user.id;

    try {
        //
        await prisma.notificacao.updateMany({
            where: {
                destinatarioId: usuarioId,
                isLida: false
            },
            data: {
                isLida: true
            }
        });

        res.status(200).json({ message: 'Todas as notificações foram marcadas como lidas.' });
    } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

