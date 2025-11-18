// src/controllers/comentariosController.js
const prisma = require('../config/prismaClient');
const crypto = require('crypto');
const notificacaoService = require('../services/notificacaoService');

/**
 * Rota para LISTAR comentários de uma versão
 * GET /comentarios/:versaoId
 */
exports.listByVersao = async (req, res) => {
    const { versaoId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Buscar todos os comentários da versão
        const comentarios = await prisma.comentario.findMany({
            where: { versaoId: versaoId },
            orderBy: { timestamp: 'asc' },
            include: {
                user: { select: { id: true, nome: true } } // Inclui dados do autor
            }
        });

        // 2. Coletar IDs de todos os destinatários (para buscar os nomes de uma vez)
        const destinatarioIds = comentarios
            .filter(c => c.destinatarioId) // Só os que têm destinatário
            .map(c => c.destinatarioId);
        
        // Remove duplicados
        const uniqueDestIds = [...new Set(destinatarioIds)];

        // 3. Buscar os nomes desses usuários
        let mapNomesDestinatarios = {};
        if (uniqueDestIds.length > 0) {
            const usuariosDestino = await prisma.user.findMany({
                where: { id: { in: uniqueDestIds } },
                select: { id: true, nome: true }
            });
            // Cria mapa: ID -> Nome
            usuariosDestino.forEach(u => {
                mapNomesDestinatarios[u.id] = u.nome;
            });
        }

        // 4. Processar e Filtrar
        const comentariosFinais = comentarios
            .map(c => {
                // Anexa o nome do destinatário se existir
                const nomeDest = c.destinatarioId ? mapNomesDestinatarios[c.destinatarioId] : null;
                
                // Retorna objeto formatado (pode adicionar mais campos se o front precisar)
                return {
                    ...c,
                    destinatarioNome: nomeDest // O Front vai ler isto como 'toAuthor'
                };
            })
            .filter(c => {
                // Regra de Privacidade:
                // - Se for Público (isPrivate = false): Mostra para todos
                // - Se for Privado: Mostra SÓ se for o Autor OU o Destinatário
                if (!c.isPrivate) return true;
                return c.autorId === userId || c.destinatarioId === userId;
            });

        return res.status(200).json(comentariosFinais);

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
    const { texto, privado, destinatarioId } = req.body;
    const autorId = req.user.id;
    const autorNome = req.user.nome || "Usuário";

    if (!texto) return res.status(400).json({ message: 'Texto obrigatório.' });

    try {
        const novoComentario = await prisma.comentario.create({
            data: {
                id: crypto.randomUUID(),
                versaoId,
                autorId,
                texto,
                isPrivate: !!privado,
                destinatarioId: privado ? destinatarioId : null
            },
            include: { user: { select: { id: true, nome: true } } }
        });

        // Buscar nome do destinatário para devolver já na resposta (feedback imediato)
        let destinatarioNome = null;
        if (destinatarioId) {
            const destUser = await prisma.user.findUnique({
                where: { id: destinatarioId },
                select: { nome: true }
            });
            destinatarioNome = destUser?.nome;
        }

        // Objeto de resposta enriquecido
        const resposta = {
            ...novoComentario,
            destinatarioNome: destinatarioNome
        };

        // Notificações
        if (privado && destinatarioId) {
            try {
                await notificacaoService.notifyComentarioPrivado(destinatarioId, autorNome, versaoId);
            } catch (e) { console.error(e); }
        } else {
            try {
                await notificacaoService.notifyComentarioHierarquia(versaoId, autorId, texto);
            } catch (e) { console.error(e); }
        }

        return res.status(201).json(resposta);

    } catch (error) {
        console.error('Erro addComentario:', error);
        return res.status(500).json({ message: 'Erro interno.' });
    }
};