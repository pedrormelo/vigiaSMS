const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota para Listar todas as Diretorias
 * GET /diretorias
 */
router.get('/', async (req, res) => {
    try {
        //
        const diretorias = await prisma.diretoria.findMany({
            select: {
                id: true,
                nome: true,
                corFrom: true,
                corTo: true,
                bannerImage: true,
                createdAt: true
            }
        });

        res.status(200).json(diretorias);

    } catch (error) {
        console.error('Erro ao listar diretorias:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Futuramente, podemos adicionar GET /diretorias/:id para buscar uma específica

module.exports = router;