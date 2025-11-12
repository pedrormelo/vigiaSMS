const prisma = require('../config/prismaClient');
const crypto = require('crypto');

/**
 * Rota para LISTAR comentários de uma versão
 * GET /comentarios/:versaoId
 */

exports.listByVersao = async (req, res) => {
    const { versaoId } = req.params;

    try {
        //
        const comentarios = await prisma.comentario.findMany({
            where: {
                versaoId: versaoId
            },
            orderBy: {
                timestamp: 'asc' // Mais antigos primeiro (ordem de chat)
            },
            include: {
                // Inclui o autor do comentário
                //
                user: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });
        return res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}

/**
 * Rota para ADICIONAR um comentário
 * POST /comentarios/:versaoId
 */
exports.addComentario = async (req, res) => {
    const { versaoId } = req.params;
    const { texto } = req.body;
    const autorId = req.user.id; // ID do usuário logado

    if (!texto) {
        return res.status(400).json({ message: 'O texto do comentário é obrigatório.' });
    }

    try {
        //
        const novoComentario = await prisma.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId: versaoId,
                autorId: autorId,
                texto: texto
            },
            include: {
                // Retorna o comentário já com os dados do autor
                user: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        // (Opcional: Criar notificação para os outros participantes)

    return res.status(201).json(novoComentario);

    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}
