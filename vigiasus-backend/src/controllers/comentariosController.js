// src/controllers/comentariosController.js
const prisma = require('../config/prismaClient');
const crypto = require('crypto');
const notificacaoService = require('../services/notificacaoService');

exports.listByVersao = async (req, res) => {
    const { versaoId } = req.params;
    const userId = req.user.id;

    try {
        const comentarios = await prisma.comentario.findMany({
            where: { versaoId: versaoId },
            orderBy: { timestamp: 'asc' },
            include: {
                user: { 
                    select: { 
                        id: true, 
                        nome: true, 
                        role: true,
                        // AQUI: Incluídos para a etiqueta
                        diretoria: { select: { nome: true } },
                        gerencia: { select: { nome: true } }
                    } 
                } 
            }
        });

        const destinatarioIds = comentarios
            .filter(c => c.destinatarioId)
            .map(c => c.destinatarioId);
        
        const uniqueDestIds = [...new Set(destinatarioIds)];

        let mapNomesDestinatarios = {};
        if (uniqueDestIds.length > 0) {
            const usuariosDestino = await prisma.user.findMany({
                where: { id: { in: uniqueDestIds } },
                select: { id: true, nome: true }
            });
            usuariosDestino.forEach(u => {
                mapNomesDestinatarios[u.id] = u.nome;
            });
        }

        const comentariosFinais = comentarios
            .map(c => {
                const nomeDest = c.destinatarioId ? mapNomesDestinatarios[c.destinatarioId] : null;
                return {
                    ...c,
                    destinatarioNome: nomeDest
                };
            })
            .filter(c => {
                if (!c.isPrivate) return true;
                return c.autorId === userId || c.destinatarioId === userId;
            });

        return res.status(200).json(comentariosFinais);

    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}

exports.addComentario = async (req, res) => {
    const { versaoId } = req.params;
    const { texto, privado, destinatarioId } = req.body;
    const autorId = req.user.id;
    const autorNome = req.user.nome || "Usuário";

    // Busca dados completos do autor (incluindo Diretoria/Gerência)
    const userFull = await prisma.user.findUnique({
        where: { id: autorId },
        select: { 
            role: true, 
            diretoria: { select: { nome: true } }, 
            gerencia: { select: { nome: true } } 
        }
    });

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
            include: { 
                user: { 
                    select: { 
                        id: true, 
                        nome: true, 
                        role: true,
                        diretoria: { select: { nome: true } },
                        gerencia: { select: { nome: true } }
                    } 
                } 
            }
        });

        let destinatarioNome = null;
        if (destinatarioId) {
            const destUser = await prisma.user.findUnique({
                where: { id: destinatarioId },
                select: { nome: true }
            });
            destinatarioNome = destUser?.nome;
        }

        const resposta = {
            ...novoComentario,
            destinatarioNome: destinatarioNome,
            user: novoComentario.user || { ...novoComentario.user, ...userFull }
        };

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