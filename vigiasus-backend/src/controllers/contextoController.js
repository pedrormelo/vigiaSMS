// source/controllers/contextoController.js
const crypto = require('crypto'); // Necessário para gerar UUIDs manualmente na transação
const prisma = require('../config/prismaClient');
const { Status } = require('../constants/status');

// Função auxiliar para mapear resposta (pode ser expandida conforme necessidade)
function mapContextoResponse(ctx, versao) {
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

/**
 * GET /gerencias/:gerenciaId/contextos
 * Lista todos os contextos PUBLICADOS de uma gerência específica.
 * Usado na página pública da gerência.
 */
exports.listByGerencia = async (req, res) => {
    const { gerenciaId } = req.params;
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: {
                // Filtra apenas versões ativas (isAtiva: true) e publicadas
                isAtiva: true, 
                statusValidacao: 'PUBLICADO',
                // Filtra pela gerência dona do contexto pai
                contexto: {
                    gerenciaDonaId: gerenciaId
                }
            },
            // Inclui os dados do Contexto pai (título conceitual, tipo, etc)
            include: { 
                contexto: true,
                // Opcional: incluir dados específicos se precisar exibir logo na lista (ex: icone do indicador)
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

<<<<<<< HEAD
/**
 * GET /contextos/publicados
 * Lista contextos que já foram publicados (visíveis para todos ou filtrados)
 */
=======
// GET /contextos/publicados
// Removemos o filtro direto por `isOculta` para contornar o erro de client desatualizado (PrismaClientValidationError).
// Caso o campo exista, filtramos em memória; caso não exista ainda no client gerado, ignoramos.
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
exports.listPublicados = async (req, res) => {
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: { isAtiva: true, statusValidacao: 'PUBLICADO', contexto: { isOculto: false } },
            include: { contexto: true },
            orderBy: { updatedAt: 'desc' },
        });
<<<<<<< HEAD
        return res.json(versoes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao listar publicados' });
=======
        // Filtro defensivo (se a propriedade estiver presente na instância retornada)
        const filtradas = versoes.filter(v => (typeof v.isOculta === 'boolean' ? v.isOculta === false : true));
        const out = filtradas.map((v) => mapContextoWithVersao(v.contexto, v));
        return res.json({ data: out });
    } catch (err) {
        console.error('Erro listPublicados:', err);
        return res.status(500).json({ message: 'Erro interno' });
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
    }
};

/**
 * GET /contextos/pendentes
 * Lista contextos aguardando aprovação
 */
exports.listPendentes = async (req, res) => {
    try {
        // Aqui você pode filtrar por gerência do usuário se necessário
        const versoes = await prisma.contextoversao.findMany({
            where: {
                statusValidacao: { in: ['AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR'] }
            },
            include: { contexto: true },
            orderBy: { updatedAt: 'desc' },
        });
        return res.json(versoes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao listar pendentes' });
    }
};

/**
 * POST /contextos
 * Cria um NOVO contexto e sua primeira versão.
 * Suporta Upload de arquivo via Multer (req.file) e dados via multipart/form-data.
 */
exports.createContexto = async (req, res) => {
    const user = req.user;
<<<<<<< HEAD

    // Extrair dados do body (vindos do FormData)
    const {
        tituloConceitual, tipo, titulo, descricao,
        // Campos específicos que podem vir como string JSON ou texto simples
        linkUrl, tipoGrafico, dashboardPayload,
        valorAtual, valorAlvo, unidade, textoComparativo, cor, icone
    } = req.body;

    // Validações Básicas
    if (!user.gerenciaId) return res.status(400).json({ message: 'Usuário sem gerência associada.' });
    if (!tituloConceitual || !tipo || !titulo) return res.status(400).json({ message: 'Campos obrigatórios (Título Conceitual, Tipo, Título) ausentes.' });

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Criar o Contexto Pai
            const novoContexto = await tx.contexto.create({
=======
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
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
                data: {
                    id: crypto.randomUUID(),
                    tituloConceitual,
                    tipo, // 'ARQUIVO_LINK', 'DASHBOARD', 'INDICADOR', etc.
                    autorOriginalId: user.id,
                    gerenciaDonaId: user.gerenciaId,
                },
            });
<<<<<<< HEAD

            // 2. Criar a Versão Inicial (v1)
            const novaVersao = await tx.contextoversao.create({
=======
            const v1 = await tx.contextoversao.create({
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
                data: {
                    id: crypto.randomUUID(),
                    contextoId: novoContexto.id,
                    titulo, // Título da versão (ex: "Relatório Jan/2025")
                    descricao: descricao || null,
                    solicitanteId: user.id,
                    versaoNumero: 1,
                    statusValidacao: 'AGUARDANDO_GERENTE',
                    isAtiva: false,
                    isDestacado: false,
                    updatedAt: new Date(),
                },
            });
<<<<<<< HEAD

            // 3. Salvar dados específicos dependendo do TIPO
            switch (tipo) {
                case 'ARQUIVO_LINK':
                    let finalUrl = linkUrl;
                    let docType = 'LINK';

                    // Se veio arquivo pelo Multer
                    if (req.file) {
                        // Caminho onde o arquivo ficou salvo (configurado no uploadsConfig.js)
                        // Ajuste o prefixo conforme sua configuração de pasta estática no app.js
                        finalUrl = `/uploads/${req.file.filename}`;
                        docType = req.file.mimetype === 'application/pdf' ? 'PDF' : 'DOC';
                    }

                    if (!finalUrl) throw new Error("Para ARQUIVO_LINK, é necessário enviar um arquivo ou uma URL.");

                    await tx.versaoarquivo.create({
                        data: {
                            id: crypto.randomUUID(),
                            versaoId: novaVersao.id,
                            url: finalUrl,
                            docType
                        }
                    });
                    break;

                case 'DASHBOARD':
                    if (!tipoGrafico || !dashboardPayload) throw new Error("Dados do Dashboard incompletos.");

                    // Parse do payload se ele vier como string JSON do frontend
                    let payloadValidado = dashboardPayload;
                    if (typeof dashboardPayload === 'string') {
                        try {
                            // Apenas para validar se é JSON válido, salvamos como string no banco se o campo for String
                            JSON.parse(dashboardPayload);
                        } catch (e) {
                            // Se não for JSON, assume string normal
                        }
                    } else {
                        // Se já for objeto, converte para string para salvar no banco (se o campo for @db.Text)
                        payloadValidado = JSON.stringify(dashboardPayload);
                    }

                    await tx.versaodashboard.create({
                        data: {
                            id: crypto.randomUUID(),
                            versaoId: novaVersao.id,
                            tipoGrafico,
                            payload: payloadValidado
                        }
                    });
                    break;

                case 'INDICADOR':
                    if (valorAtual === undefined || valorAtual === null) throw new Error("Valor atual é obrigatório para indicadores.");

                    await tx.versaoindicador.create({
                        data: {
                            id: crypto.randomUUID(),
                            versaoId: novaVersao.id,
                            valorAtual: parseFloat(valorAtual),
                            valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null,
                            unidade: unidade || '',
                            textoComparativo: textoComparativo || null,
                            cor: cor || '#000000',
                            icone: icone || 'default'
                        }
                    });
                    break;

                default:
                    // Tipos desconhecidos podem ser tratados ou ignorados
                    break;
            }

            // 4. Registrar no Histórico
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: novaVersao.id,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_GERENTE',
                    justificativa: 'Criação inicial do contexto',
                    timestamp: new Date()
                }
            });

            return { novoContexto, novaVersao };
=======
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
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('Erro em createContexto:', error);
        return res.status(500).json({ message: error.message || 'Erro interno ao criar contexto.' });
    }
};

/**
 * POST /contextos/:contextoId/versoes
 * Cria uma NOVA VERSÃO para um contexto existente.
 */
exports.createVersao = async (req, res) => {
    const { contextoId } = req.params;
    const user = req.user;
<<<<<<< HEAD
    const {
        titulo, descricao,
        linkUrl, tipoGrafico, dashboardPayload,
        valorAtual, valorAlvo, unidade, textoComparativo, cor, icone
    } = req.body;
=======
    const { contextoId } = req.params;
    const { titulo, descricao, motivoNovaVersao, descNovaVersao, dashboard, indicador } = req.body || {};
    if (user.role !== 'MEMBRO') return res.status(403).json({ message: 'Apenas MEMBRO pode criar versão' });
    if (!titulo) return res.status(400).json({ message: 'Título obrigatório' });
    try {
        const contexto = await prisma.contexto.findUnique({ where: { id: contextoId } });
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });
        if (contexto.gerenciaDonaId !== user.gerenciaId) return res.status(403).json({ message: 'Gerência diferente' });
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836

    try {
        // Buscar contexto para saber o tipo e o último número de versão
        const contexto = await prisma.contexto.findUnique({
            where: { id: contextoId },
            include: { versoes: { orderBy: { versaoNumero: 'desc' }, take: 1 } }
        });

<<<<<<< HEAD
=======
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
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });

        const proximoNumero = (contexto.versoes[0]?.versaoNumero || 0) + 1;

        const result = await prisma.$transaction(async (tx) => {
            const novaVersao = await tx.contextoversao.create({
                data: {
                    id: crypto.randomUUID(),
                    contextoId: contexto.id,
                    titulo,
                    descricao: descricao || null,
                    solicitanteId: user.id,
                    versaoNumero: proximoNumero,
                    statusValidacao: 'AGUARDANDO_GERENTE',
                    isAtiva: false,
                    updatedAt: new Date(),
                },
            });

            // Repetir lógica de salvar dados específicos (Reutilizando lógica seria ideal, mas repetindo para clareza)
            switch (contexto.tipo) {
                case 'ARQUIVO_LINK':
                    let finalUrl = linkUrl;
                    let docType = 'LINK'; // Padrão se for apenas um link externo

                    // Se veio arquivo físico
                    if (req.file) {
                        finalUrl = `/files/context/${req.file.filename}`;
                        const mime = req.file.mimetype;

                        // Classificação precisa baseada no MIME Type
                        if (mime === 'application/pdf') {
                            docType = 'PDF';
                        }
                        // Planilhas e Dados (XLS, XLSX, CSV) -> EXCEL
                        else if (
                            mime.includes('spreadsheet') ||
                            mime.includes('excel') ||
                            mime.includes('csv') ||
                            mime === 'text/csv'
                        ) {
                            docType = 'EXCEL';
                        }
                        // Documentos de Texto e Apresentações (DOC, DOCX, PPT, PPTX) -> DOC
                        else if (
                            mime.includes('word') ||
                            mime.includes('presentation') ||
                            mime.includes('powerpoint')
                        ) {
                            docType = 'DOC';
                        }
                        else {
                            docType = 'DOC'; // Fallback seguro
                        }
                    }

                    if (!finalUrl) throw new Error("Para ARQUIVO_LINK, é necessário enviar um arquivo ou uma URL.");

                    await tx.versaoarquivo.create({
                        data: {
                            id: crypto.randomUUID(),
                            versaoId: novaVersao.id,
                            url: finalUrl,
                            docType
                        }
                    });
                    break;
                case 'DASHBOARD':
                    if (dashboardPayload) {
                        const payloadStr = typeof dashboardPayload === 'object' ? JSON.stringify(dashboardPayload) : dashboardPayload;
                        await tx.versaodashboard.create({
                            data: {
                                id: crypto.randomUUID(),
                                versaoId: novaVersao.id,
                                tipoGrafico: tipoGrafico || 'BARRA',
                                payload: payloadStr
                            }
                        });
                    }
                    break;

                case 'INDICADOR':
                    if (valorAtual !== undefined) {
                        await tx.versaoindicador.create({
                            data: {
                                id: crypto.randomUUID(),
                                versaoId: novaVersao.id,
                                valorAtual: parseFloat(valorAtual),
                                valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null,
                                unidade: unidade || '',
                                textoComparativo: textoComparativo || null,
                                cor: cor || '#000',
                                icone: icone || 'default'
                            }
                        });
                    }
                    break;
            }

            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: novaVersao.id,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_GERENTE',
                    justificativa: 'Nova versão criada',
                    timestamp: new Date()
                }
            });

            return novaVersao;
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('Erro em createVersao:', error);
        return res.status(500).json({ message: error.message });
    }
};

<<<<<<< HEAD
// Métodos de Validação (Placeholders para manter integridade se chamados)
exports.gerenteAprovar = async (req, res) => { /* Lógica de update status */ res.json({ ok: true }) };
exports.diretorPublicar = async (req, res) => { /* Lógica de update status + isAtiva */ res.json({ ok: true }) };
exports.diretorIndeferir = async (req, res) => { /* Lógica de update status */ res.json({ ok: true }) };
exports.solicitarCorrecao = async (req, res) => { /* Lógica de update status */ res.json({ ok: true }) };
exports.getDetalhes = async (req, res) => { /* Lógica de getById com include */ res.json({ ok: true }) };
exports.buscar = async (req, res) => { /* Lógica de busca */ res.json({ ok: true }) };
=======
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

>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
