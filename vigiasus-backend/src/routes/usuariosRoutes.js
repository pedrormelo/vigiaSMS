const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota para Listar todos os Usuários
 * GET /usuarios
 *
 * Esta rota é protegida automaticamente pelo authMiddleware
 * que definimos no index.js
 */
router.get('/', async (req, res) => {
    
    // Opcional: Se quiséssemos, poderíamos restringir esta rota
    // apenas para 'GERENTE' ou 'DIRETOR'
    // if (req.user.role !== 'GERENTE' && req.user.role !== 'DIRETOR') {
    //     return res.status(403).json({ message: 'Acesso negado.' });
    // }

    try {
        // 1. Busca todos os usuários no banco de dados
        const usuarios = await prisma.user.findMany({
            // 2. IMPORTANTE: Seleciona campos específicos
            // Nunca, em hipótese alguma, retorne o campo 'passwordHash'
            //
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                gerenciaId: true,
                diretoriaId: true,
                createdAt: true
            }
        });

        // 3. Retorna a lista de usuários
        res.status(200).json(usuarios);

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/*
 * NOTA: Mais tarde, podemos adicionar outras rotas aqui, como:
 * GET /usuarios/me: Para o usuário logado buscar seus próprios dados.
 * GET /usuarios/:id: Para buscar um usuário específico.
 * PUT /usuarios/:id: Para atualizar um usuário (ex: trocar de gerência).
 */

module.exports = router;