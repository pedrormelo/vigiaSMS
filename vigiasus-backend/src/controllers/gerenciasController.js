const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota para Listar todas as Gerências
 * GET /gerencias
 */
router.get('/', async (req, res) => {
    try {
        //
        const gerencias = await prisma.gerencia.findMany({
            select: {
                id: true,
                nome: true,
                sigla: true,
                diretoriaId: true,
                createdAt: true
            }
        });

        res.status(200).json(gerencias);

    } catch (error)
 {
        console.error('Erro ao listar gerências:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/**
 * Rota para Listar todas as Gerências de UMA Diretoria
 * GET /gerencias/pordiretoria/:diretoriaId
 */
router.get('/pordiretoria/:diretoriaId', async (req, res) => {
    const { diretoriaId } = req.params;

    try {
        //
        const gerencias = await prisma.gerencia.findMany({
            where: {
                diretoriaId: diretoriaId,
            },
            select: {
                id: true,
                nome: true,
                sigla: true,
                diretoriaId: true,
            }
        });

        res.status(200).json(gerencias);

    } catch (error) {
        console.error('Erro ao listar gerências por diretoria:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});
