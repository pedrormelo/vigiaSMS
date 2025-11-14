// Clean Contexto Controller (no router), used by contextoRoutes.js
// Rules: MEMBRO creates contextos/versões; GERENTE approves; DIRETOR publishes/indeferes; both can request corrections.

const prisma = require('../config/prismaClient');
const versaoService = require('../services/versaoService');
const { mapContextoDetalhe } = require('../mappers/contextoMapper');
const { Status } = require('../constants/status');

function mapContextoWithVersao(ctx, versao) {
    return {
        id: ctx.id,
        tituloConceitual: ctx.tituloConceitual,
        tipo: ctx.tipo,
        gerenciaDonaId: ctx.gerenciaDonaId,
        createdAt: ctx.createdAt,
        versaoAtiva: versao
            ? {
                id: versao.id,
                titulo: versao.titulo,
                status: versao.statusValidacao,
                isDestacado: versao.isDestacado,
                updatedAt: versao.updatedAt,
            }
            : null,
    };
};

// GET /contextos/publicados
// Removemos o filtro direto por `isOculta` para contornar o erro de client desatualizado (PrismaClientValidationError).
// Caso o campo exista, filtramos em memória; caso não exista ainda no client gerado, ignoramos.
exports.listPublicados = async (req, res) => {
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: { isAtiva: true, statusValidacao: 'PUBLICADO', contexto: { isOculto: false } },
            include: { contexto: true },
            orderBy: { updatedAt: 'desc' },
        });
        // Filtro defensivo (se a propriedade estiver presente na instância retornada)
        const filtradas = versoes.filter(v => (typeof v.isOculta === 'boolean' ? v.isOculta === false : true));
        const out = filtradas.map((v) => mapContextoWithVersao(v.contexto, v));
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
        return res.status(403).json({ message: 'Sem pendências para este perfil' });
    } catch (err) {
        console.error('Erro listPendentes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /contextos
exports.createContexto = async (req, res) => {
    const user = req.user;
    const { tituloConceitual, tipo, titulo, descricao, dashboard, indicador } = req.body || {};
    if (user.role !== 'MEMBRO') return res.status(403).json({ message: 'Apenas MEMBRO pode criar contexto' });
    if (!user.gerenciaId) return res.status(400).json({ message: 'Usuário sem gerência' });
    if (!tituloConceitual || !tipo || !titulo) return res.status(400).json({ message: 'Campos obrigatórios ausentes' });

    try {
        // Logging defensivo para depuração de 500 em produção
        console.log('[createContexto] user', { id: user.id, role: user.role, gerenciaId: user.gerenciaId });
        console.log('[createContexto] body', { tituloConceitual, tipo, titulo, hasDescricao: !!descricao });
        console.log('[createContexto] file', { hasFile: !!req.file, mimetype: req.file?.mimetype, originalname: req.file?.originalname });
        console.log('[createContexto] url?', req.body?.url);
        const created = await prisma.$transaction(async (tx) => {
            const ctx = await tx.contexto.create({
                data: {
                    tituloConceitual,
                    tipo,
                    autorOriginalId: user.id,
                    gerenciaDonaId: user.gerenciaId,
                },
            });
            const v1 = await tx.contextoversao.create({
                data: {
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
            // Criar payload específico por tipo, usando req.file para ARQUIVO_LINK quando presente
            if (tipo === 'ARQUIVO_LINK') {
                const file = req.file;
                let docType = 'PDF';
                let url = null;
                if (file) {
                    const rel = `/files/uploads/${user.gerenciaId || 'misc'}/${file.filename}`;
                    url = rel;
                    const mt = file.mimetype;
                    if (mt.includes('spreadsheet') || mt === 'application/vnd.ms-excel' || mt === 'text/csv') docType = 'EXCEL';
                    else if (mt.includes('word') || mt === 'application/msword' || mt.includes('presentation')) docType = 'DOC';
                    else if (mt === 'application/pdf') docType = 'PDF';
                } else if (req.body && req.body.url) {
                    docType = 'LINK';
                    url = req.body.url;
                }
                await tx.versaoarquivo.create({ data: { versaoId: v1.id, url: url || '', docType } });
            }
            if (tipo === 'DASHBOARD' && dashboard) {
                const tipoGrafico = dashboard.tipoGrafico; // 'PIE' | 'BAR' | 'LINE'
                const payload = dashboard.payload || '{}';
                await tx.versaodashboard.create({ data: { versaoId: v1.id, tipoGrafico, payload } });
            }
            if (tipo === 'INDICADOR' && indicador) {
                const { valorAtual, valorAlvo, unidade, textoComparativo, cor, icone } = indicador;
                await tx.versaoindicador.create({ data: { versaoId: v1.id, valorAtual, valorAlvo: valorAlvo || null, unidade, textoComparativo: textoComparativo || null, cor, icone } });
            }
            return { ctx, v1 };
        });
        return res.status(201).json({ contexto: created.ctx, versao: created.v1 });
    } catch (err) {
        console.error('Erro createContexto:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /contextos/:contextoId/versoes
exports.createVersao = async (req, res) => {
    const user = req.user;
    const { contextoId } = req.params;
    const { titulo, descricao, motivoNovaVersao, descNovaVersao, dashboard, indicador } = req.body || {};
    if (user.role !== 'MEMBRO') return res.status(403).json({ message: 'Apenas MEMBRO pode criar versão' });
    if (!titulo) return res.status(400).json({ message: 'Título obrigatório' });
    try {
        const contexto = await prisma.contexto.findUnique({ where: { id: contextoId } });
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });
        if (contexto.gerenciaDonaId !== user.gerenciaId) return res.status(403).json({ message: 'Gerência diferente' });

        const max = await prisma.contextoversao.aggregate({
            where: { contextoId },
            _max: { versaoNumero: true },
        });
        const nextNum = (max._max.versaoNumero || 0) + 1;

        const v = await prisma.$transaction(async (tx) => {
            const created = await tx.contextoversao.create({
                data: {
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
            // Child payload based on contexto.tipo
            if (contexto.tipo === 'ARQUIVO_LINK') {
                const file = req.file;
                let docType = 'PDF';
                let url = null;
                if (file) {
                    const rel = `/files/uploads/${user.gerenciaId || 'misc'}/${file.filename}`;
                    url = rel;
                    const mt = file.mimetype;
                    if (mt.includes('spreadsheet') || mt === 'application/vnd.ms-excel' || mt === 'text/csv') docType = 'EXCEL';
                    else if (mt.includes('word') || mt === 'application/msword' || mt.includes('presentation')) docType = 'DOC';
                    else if (mt === 'application/pdf') docType = 'PDF';
                } else if (req.body && req.body.url) {
                    docType = 'LINK';
                    url = req.body.url;
                }
                await tx.versaoarquivo.create({ data: { versaoId: created.id, url: url || '', docType } });
            }
            if (contexto.tipo === 'DASHBOARD' && dashboard) {
                await tx.versaodashboard.create({ data: { versaoId: created.id, tipoGrafico: dashboard.tipoGrafico, payload: dashboard.payload || '{}' } });
            }
            if (contexto.tipo === 'INDICADOR' && indicador) {
                const { valorAtual, valorAlvo, unidade, textoComparativo, cor, icone } = indicador;
                await tx.versaoindicador.create({ data: { versaoId: created.id, valorAtual, valorAlvo: valorAlvo || null, unidade, textoComparativo: textoComparativo || null, cor, icone } });
            }
            return created;
        });
        return res.status(201).json({ versao: v });
    } catch (err) {
        console.error('Erro createVersao:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// Ações de validação
// aprovar
exports.gerenteAprovar = async (req, res) => {
    try {
        const updated = await versaoService.gerenteAprova({ versaoId: req.params.versaoId, actor: req.user });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro gerenteAprovar:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Erro interno' });
    }
};

// publicar
exports.diretorPublicar = async (req, res) => {
    try {
        const updated = await versaoService.diretorPublica({ versaoId: req.params.versaoId, actor: req.user });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro diretorPublicar:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Erro interno' });
    }
};

// indeferir
exports.diretorIndeferir = async (req, res) => {
    try {
        const updated = await versaoService.diretorIndefere({ versaoId: req.params.versaoId, actor: req.user, justificativa: req.body?.justificativa });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro diretorIndeferir:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Erro interno' });
    }
};

// solicitar correcao
exports.solicitarCorrecao = async (req, res) => {
    try {
        const updated = await versaoService.solicitarCorrecao({ versaoId: req.params.versaoId, actor: req.user, justificativa: req.body?.justificativa });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro solicitarCorrecao:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Erro interno' });
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
            orderBy: [{ versaoNumero: 'desc' }],
        });
        const ids = versoes.map(v => v.id);
        const historico = ids.length ? await prisma.validacaohistorico.findMany({
            where: { versaoId: { in: ids } },
            orderBy: [{ timestamp: 'desc' }],
        }) : [];

        if (!req.user) {
            const publishedActive = versoes.find(v => v.isAtiva && v.statusValidacao === Status.PUBLICADO);
            if (!publishedActive) return res.status(403).json({ message: 'Conteúdo não publicado' });
        }

        return res.json(mapContextoDetalhe(contexto, versoes, historico));
    } catch (err) {
        console.error('Erro getDetalhes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /contextos/buscar?q=&status=&from=&to=&page=&pageSize=
exports.buscar = async (req, res) => {
    const { q, status, from, to, page = '1', pageSize = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const skip = (pageNum - 1) * sizeNum;

    const whereVersao = {};
    if (status && typeof status === 'string') whereVersao.statusValidacao = status;
    if (from || to) {
        whereVersao.updatedAt = {};
        if (from) whereVersao.updatedAt.gte = new Date(from);
        if (to) whereVersao.updatedAt.lte = new Date(to);
    }

    try {
        const where = {
            ...(q ? { contexto: { OR: [{ tituloConceitual: { contains: q, mode: 'insensitive' } }] } } : {}),
            ...(Object.keys(whereVersao).length ? whereVersao : {}),
        };

        const [total, rows] = await Promise.all([
            prisma.contextoversao.count({ where }),
            prisma.contextoversao.findMany({
                where,
                include: { contexto: true },
                orderBy: [{ updatedAt: 'desc' }],
                skip,
                take: sizeNum,
            }),
        ]);

        const data = rows.map(v => ({
            contextoId: v.contextoId,
            tituloConceitual: v.contexto.tituloConceitual,
            versaoId: v.id,
            versaoNumero: v.versaoNumero,
            status: v.statusValidacao,
            updatedAt: v.updatedAt,
            isAtiva: v.isAtiva,
        }));

        return res.json({ page: pageNum, pageSize: sizeNum, total, data });
    } catch (err) {
        console.error('Erro buscar:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// ---- Visibilidade (ocultar/reexibir) ----
// POST /contextos/:contextoId/ocultar
exports.ocultarContexto = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Não autenticado' });
        if (!['GERENTE', 'DIRETOR'].includes(user.role)) {
            return res.status(403).json({ message: 'Sem permissão' });
        }
        const { contextoId } = req.params;
        const ctx = await prisma.contexto.findUnique({ where: { id: contextoId }, include: { gerencia: true } });
        if (!ctx) return res.status(404).json({ message: 'Contexto não encontrado' });
        // Checagem básica de pertencimento
        if (user.role === 'GERENTE' && user.gerenciaId !== ctx.gerenciaDonaId) return res.status(403).json({ message: 'Gerência diferente' });
        if (user.role === 'DIRETOR' && user.diretoriaId !== ctx.gerencia.diretoriaId) return res.status(403).json({ message: 'Diretoria diferente' });

        const updated = await prisma.contexto.update({ where: { id: contextoId }, data: { isOculto: true } });
        return res.json({ contexto: updated });
    } catch (err) {
        console.error('Erro ocultarContexto:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /contextos/:contextoId/reexibir
exports.reexibirContexto = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Não autenticado' });
        if (!['GERENTE', 'DIRETOR'].includes(user.role)) {
            return res.status(403).json({ message: 'Sem permissão' });
        }
        const { contextoId } = req.params;
        const ctx = await prisma.contexto.findUnique({ where: { id: contextoId }, include: { gerencia: true } });
        if (!ctx) return res.status(404).json({ message: 'Contexto não encontrado' });
        if (user.role === 'GERENTE' && user.gerenciaId !== ctx.gerenciaDonaId) return res.status(403).json({ message: 'Gerência diferente' });
        if (user.role === 'DIRETOR' && user.diretoriaId !== ctx.gerencia.diretoriaId) return res.status(403).json({ message: 'Diretoria diferente' });

        const updated = await prisma.contexto.update({ where: { id: contextoId }, data: { isOculto: false } });
        return res.json({ contexto: updated });
    } catch (err) {
        console.error('Erro reexibirContexto:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /versoes/:versaoId/ocultar
exports.ocultarVersao = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Não autenticado' });
        if (!['GERENTE', 'DIRETOR'].includes(user.role)) {
            return res.status(403).json({ message: 'Sem permissão' });
        }
        const { versaoId } = req.params;
        const v = await prisma.contextoversao.findUnique({ where: { id: versaoId }, include: { contexto: { include: { gerencia: true } } } });
        if (!v) return res.status(404).json({ message: 'Versão não encontrada' });
        if (user.role === 'GERENTE' && user.gerenciaId !== v.contexto.gerenciaDonaId) return res.status(403).json({ message: 'Gerência diferente' });
        if (user.role === 'DIRETOR' && user.diretoriaId !== v.contexto.gerencia.diretoriaId) return res.status(403).json({ message: 'Diretoria diferente' });

        const updated = await prisma.contextoversao.update({ where: { id: versaoId }, data: { isOculta: true } });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro ocultarVersao:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /versoes/:versaoId/reexibir
exports.reexibirVersao = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Não autenticado' });
        if (!['GERENTE', 'DIRETOR'].includes(user.role)) {
            return res.status(403).json({ message: 'Sem permissão' });
        }
        const { versaoId } = req.params;
        const v = await prisma.contextoversao.findUnique({ where: { id: versaoId }, include: { contexto: { include: { gerencia: true } } } });
        if (!v) return res.status(404).json({ message: 'Versão não encontrada' });
        if (user.role === 'GERENTE' && user.gerenciaId !== v.contexto.gerenciaDonaId) return res.status(403).json({ message: 'Gerência diferente' });
        if (user.role === 'DIRETOR' && user.diretoriaId !== v.contexto.gerencia.diretoriaId) return res.status(403).json({ message: 'Diretoria diferente' });

        const updated = await prisma.contextoversao.update({ where: { id: versaoId }, data: { isOculta: false } });
        return res.json({ versao: updated });
    } catch (err) {
        console.error('Erro reexibirVersao:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

