// src/controllers/contextoController.js

const crypto = require('crypto');
const prisma = require('../config/prismaClient');
const { Status } = require('../constants/status');
const { mapContextoDetalhe } = require('../mappers/contextoMapper');

// Função auxiliar para mapear resposta simples
function mapContextoWithVersao(ctx, versao) {
    return {
        id: ctx.id,
        tituloConceitual: ctx.tituloConceitual,
        tipo: ctx.tipo,
        gerenciaDonaId: ctx.gerenciaDonaId,
        createdAt: ctx.createdAt,
        versaoAtiva: versao ? {
            id: versao.id,
            titulo: versao.titulo,
            status: versao.statusValidacao,
            updatedAt: versao.updatedAt
        } : null
    };
}

// GET /contextos/publicados
exports.listPublicados = async (req, res) => {
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: { isAtiva: true, statusValidacao: 'PUBLICADO' },
            include: { contexto: true },
            orderBy: { updatedAt: 'desc' },
        });
        const out = versoes.map((v) => mapContextoWithVersao(v.contexto, v));
        return res.json({ data: out });
    } catch (err) {
        console.error('Erro listPublicados:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /contextos/pendentes
exports.listPendentes = async (req, res) => {
    const user = req.user;
    try {
        if (user.role === 'GERENTE') {
            const versoes = await prisma.contextoversao.findMany({
                where: {
                    statusValidacao: 'AGUARDANDO_GERENTE',
                    contexto: { gerenciaDonaId: user.gerenciaId || '' },
                },
                include: { contexto: true },
                orderBy: { createdAt: 'desc' },
            });
            return res.json({ data: versoes });
        }
        if (user.role === 'DIRETOR') {
            const versoes = await prisma.contextoversao.findMany({
                where: {
                    statusValidacao: 'AGUARDANDO_DIRETOR',
                    contexto: { gerencia: { diretoriaId: user.diretoriaId || '' } },
                },
                include: { contexto: true },
                orderBy: { createdAt: 'desc' },
            });
            return res.json({ data: versoes });
        }
        if (user.role === 'MEMBRO') {
            const versoes = await prisma.contextoversao.findMany({
                where: {
                    statusValidacao: 'AGUARDANDO_CORRECAO',
                    solicitanteId: user.id,
                },
                include: { contexto: true },
                orderBy: { createdAt: 'desc' },
            });
            return res.json({ data: versoes });
        }
        // Se for ADMIN ou SECRETARIA, talvez mostrar tudo ou nada
        return res.json({ data: [] });
    } catch (err) {
        console.error('Erro listPendentes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /gerencias/:gerenciaId/contextos
exports.listByGerencia = async (req, res) => {
    const { gerenciaId } = req.params;
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: {
                isAtiva: true,
                statusValidacao: 'PUBLICADO',
                contexto: { gerenciaDonaId: gerenciaId }
            },
            include: { 
                contexto: true,
                versaoindicador: true,
                versaoarquivo: true,
                versaodashboard: true
            },
            orderBy: { updatedAt: 'desc' },
        });
        return res.json(versoes);
    } catch (error) {
        console.error('Erro listByGerencia:', error);
        return res.status(500).json({ message: 'Erro interno ao listar contextos da gerência' });
    }
};

// POST /contextos (Criação com Transação)
exports.createContexto = async (req, res) => {
    const user = req.user;
    const { 
        tituloConceitual, tipo, titulo, descricao, 
        linkUrl, tipoGrafico, dashboardPayload, 
        valorAtual, valorAlvo, unidade, textoComparativo, cor, icone 
    } = req.body;

    if (!user.gerenciaId) return res.status(400).json({ message: 'Usuário sem gerência.' });
    if (!tituloConceitual || !tipo || !titulo) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Criar Contexto Pai
            const ctx = await tx.contexto.create({
                data: {
                    id: crypto.randomUUID(),
                    tituloConceitual,
                    tipo,
                    autorOriginalId: user.id,
                    gerenciaDonaId: user.gerenciaId,
                },
            });

            // 2. Criar Versão 1
            const v1 = await tx.contextoversao.create({
                data: {
                    id: crypto.randomUUID(),
                    contextoId: ctx.id,
                    titulo,
                    descricao: descricao || null,
                    solicitanteId: user.id,
                    versaoNumero: 1,
                    statusValidacao: 'AGUARDANDO_GERENTE',
                    isAtiva: false,
                    isDestacado: false,
                    updatedAt: new Date(),
                },
            });

            // 3. Dados Específicos
            if (tipo === 'ARQUIVO_LINK') {
                let finalUrl = linkUrl;
                let docType = 'LINK';

                if (req.file) {
                    finalUrl = `/files/context/${req.file.filename}`;
                    const mime = req.file.mimetype;
                    if (mime === 'application/pdf') docType = 'PDF';
                    else if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) docType = 'EXCEL';
                    else if (mime.includes('word') || mime.includes('presentation') || mime.includes('powerpoint')) docType = 'DOC';
                    else docType = 'DOC';
                }

                if (!finalUrl) throw new Error("Arquivo ou URL é obrigatório.");

                await tx.versaoarquivo.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v1.id,
                        url: finalUrl,
                        docType
                    }
                });
            } else if (tipo === 'DASHBOARD') {
                if (!tipoGrafico || !dashboardPayload) throw new Error("Dados do gráfico incompletos.");
                
                // Validar enum
                const validTypes = ['PIE', 'BAR', 'LINE'];
                if (!validTypes.includes(tipoGrafico)) throw new Error(`Tipo de gráfico inválido: ${tipoGrafico}`);

                await tx.versaodashboard.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v1.id,
                        tipoGrafico,
                        payload: typeof dashboardPayload === 'object' ? JSON.stringify(dashboardPayload) : dashboardPayload
                    }
                });
            } else if (tipo === 'INDICADOR') {
                if (valorAtual === undefined) throw new Error("Valor atual obrigatório.");
                await tx.versaoindicador.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v1.id,
                        valorAtual: parseFloat(valorAtual),
                        valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null,
                        unidade: unidade || '',
                        textoComparativo: textoComparativo || null,
                        cor: cor || '#000',
                        icone: icone || 'Heart'
                    }
                });
            }

            // 4. Histórico
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v1.id,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_GERENTE',
                    justificativa: 'Criação inicial',
                    timestamp: new Date()
                }
            });

            return { ctx, v1 };
        });

        return res.status(201).json(result);
    } catch (err) {
        console.error('Erro createContexto:', err);
        return res.status(500).json({ message: err.message || 'Erro interno' });
    }
};

// POST /contextos/:contextoId/versoes
exports.createVersao = async (req, res) => {
    const user = req.user;
    const { contextoId } = req.params;
    const { 
        titulo, descricao, motivoNovaVersao, descNovaVersao,
        linkUrl, tipoGrafico, dashboardPayload, 
        valorAtual, valorAlvo, unidade, textoComparativo, cor, icone 
    } = req.body;

    if (!titulo) return res.status(400).json({ message: 'Título obrigatório' });

    try {
        const contexto = await prisma.contexto.findUnique({ 
            where: { id: contextoId },
            include: { versoes: { orderBy: { versaoNumero: 'desc' }, take: 1 } }
        });
        
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });
        if (contexto.gerenciaDonaId !== user.gerenciaId) return res.status(403).json({ message: 'Gerência diferente' });

        const nextNum = (contexto.versoes[0]?.versaoNumero || 0) + 1;

        const result = await prisma.$transaction(async (tx) => {
            const v = await tx.contextoversao.create({
                data: {
                    id: crypto.randomUUID(),
                    contextoId,
                    titulo,
                    descricao: descricao || null,
                    solicitanteId: user.id,
                    versaoNumero: nextNum,
                    motivoNovaVersao: motivoNovaVersao || null,
                    descNovaVersao: descNovaVersao || null,
                    statusValidacao: 'AGUARDANDO_GERENTE',
                    isAtiva: false,
                    isDestacado: false,
                    updatedAt: new Date(),
                },
            });

            // Repetir lógica de salvamento específico (Simplificada aqui)
            if (contexto.tipo === 'ARQUIVO_LINK') {
                let finalUrl = linkUrl;
                let docType = 'LINK';
                if (req.file) {
                    finalUrl = `/files/context/${req.file.filename}`;
                    // Mesma lógica de docType acima...
                    const mime = req.file.mimetype;
                    if (mime === 'application/pdf') docType = 'PDF';
                    else if (mime.includes('spreadsheet') || mime.includes('excel')) docType = 'EXCEL';
                    else docType = 'DOC';
                }
                // Fallback para URL anterior se não enviado novo
                if (!finalUrl && contexto.versoes[0]) {
                    // Precisaria buscar o versaoArquivo anterior
                    const prevFile = await prisma.versaoarquivo.findUnique({ where: { versaoId: contexto.versoes[0].id } });
                    if (prevFile) {
                        finalUrl = prevFile.url;
                        docType = prevFile.docType;
                    }
                }

                if (finalUrl) {
                    await tx.versaoarquivo.create({
                        data: { id: crypto.randomUUID(), versaoId: v.id, url: finalUrl, docType }
                    });
                }
            } else if (contexto.tipo === 'DASHBOARD' && dashboardPayload) {
                 await tx.versaodashboard.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v.id,
                        tipoGrafico: tipoGrafico || 'BAR',
                        payload: typeof dashboardPayload === 'object' ? JSON.stringify(dashboardPayload) : dashboardPayload
                    }
                });
            } else if (contexto.tipo === 'INDICADOR' && valorAtual !== undefined) {
                await tx.versaoindicador.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v.id,
                        valorAtual: parseFloat(valorAtual),
                        valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null,
                        unidade: unidade || '',
                        textoComparativo: textoComparativo || null,
                        cor: cor || '#000',
                        icone: icone || 'Heart'
                    }
                });
            }

            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v.id,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_GERENTE',
                    justificativa: 'Nova versão',
                    timestamp: new Date()
                }
            });

            return v;
        });
        return res.status(201).json({ versao: result });
    } catch (err) {
        console.error('Erro createVersao:', err);
        return res.status(500).json({ message: err.message || 'Erro interno' });
    }
};

// --- AÇÕES DE VALIDAÇÃO ---

exports.gerenteAprovar = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: 'AGUARDANDO_DIRETOR', updatedAt: new Date() }
            });
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_DIRETOR',
                    justificativa: 'Aprovado pelo Gerente',
                    timestamp: new Date()
                }
            });
        });
        return res.json({ message: 'Aprovado com sucesso' });
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao aprovar' });
    }
};

exports.diretorPublicar = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        await prisma.$transaction(async (tx) => {
            // Desativar anteriores
            const current = await tx.contextoversao.findUnique({ where: { id: versaoId } });
            if (current) {
                await tx.contextoversao.updateMany({
                    where: { contextoId: current.contextoId, isAtiva: true },
                    data: { isAtiva: false }
                });
            }
            // Publicar atual
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: 'PUBLICADO', isAtiva: true, updatedAt: new Date() }
            });
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId,
                    autorId: user.id,
                    statusNovo: 'PUBLICADO',
                    justificativa: 'Publicado pelo Diretor',
                    timestamp: new Date()
                }
            });
        });
        return res.json({ message: 'Publicado com sucesso' });
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao publicar' });
    }
};

exports.diretorIndeferir = async (req, res) => {
    const { versaoId } = req.params;
    const { justificativa } = req.body;
    const user = req.user;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: 'INDEFERIDO', updatedAt: new Date() }
            });
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId,
                    autorId: user.id,
                    statusNovo: 'INDEFERIDO',
                    justificativa: justificativa || 'Indeferido',
                    timestamp: new Date()
                }
            });
        });
        return res.json({ message: 'Indeferido com sucesso' });
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao indeferir' });
    }
};

exports.solicitarCorrecao = async (req, res) => {
    const { versaoId } = req.params;
    const { justificativa } = req.body;
    const user = req.user;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: 'AGUARDANDO_CORRECAO', updatedAt: new Date() }
            });
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_CORRECAO',
                    justificativa: justificativa || 'Correção Solicitada',
                    timestamp: new Date()
                }
            });
        });
        return res.json({ message: 'Correção solicitada' });
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao solicitar correção' });
    }
};

// GET /contextos/detalhes/:contextoId
exports.getDetalhes = async (req, res) => {
    const { contextoId } = req.params;
    try {
        const contexto = await prisma.contexto.findUnique({ where: { id: contextoId } });
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });

        const versoes = await prisma.contextoversao.findMany({
            where: { contextoId },
            include: {
                versaoarquivo: true,
                versaodashboard: true,
                versaoindicador: true
            },
            orderBy: [{ versaoNumero: 'desc' }],
        });

        const ids = versoes.map(v => v.id);
        const historico = ids.length ? await prisma.validacaohistorico.findMany({
            where: { versaoId: { in: ids } },
            orderBy: [{ timestamp: 'desc' }],
        }) : [];

        // Se tiver função de mapeamento importada, use-a, senão retorne cru
        if (typeof mapContextoDetalhe === 'function') {
            return res.json(mapContextoDetalhe(contexto, versoes, historico));
        }
        return res.json({ contexto, versoes, historico });
    } catch (err) {
        console.error('Erro getDetalhes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /contextos/buscar
exports.buscar = async (req, res) => {
    const { q, status, from, to, page = '1', pageSize = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const skip = (pageNum - 1) * sizeNum;

    const whereVersao = {};
    if (status) whereVersao.statusValidacao = status;
    if (from || to) {
        whereVersao.updatedAt = {};
        if (from) whereVersao.updatedAt.gte = new Date(from);
        if (to) whereVersao.updatedAt.lte = new Date(to);
    }

    try {
        const where = {
            ...(q ? { contexto: { tituloConceitual: { contains: q } } } : {}), // removido mode insensitive p/ compatibilidade simples
            ...whereVersao
        };

        // Busca simplificada para evitar conflito de types do prisma dependendo da versão
        const [total, rows] = await Promise.all([
            prisma.contextoversao.count({ where }),
            prisma.contextoversao.findMany({
                where,
                include: { contexto: true },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: sizeNum,
            }),
        ]);

        return res.json({ 
            data: rows, 
            meta: { total, page: pageNum, totalPages: Math.ceil(total / sizeNum) } 
        });
    } catch (err) {
        console.error('Erro buscar:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};