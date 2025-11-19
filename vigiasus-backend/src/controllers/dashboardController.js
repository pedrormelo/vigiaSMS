const prisma = require('../config/prismaClient');
const crypto = require('crypto');

function decimalToNumber(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'object' && value !== null) {
        if (typeof value.valueOf === 'function') {
            const primitive = value.valueOf();
            if (typeof primitive === 'number' && Number.isFinite(primitive)) return primitive;
            if (typeof primitive === 'string') {
                const parsed = Number(primitive);
                if (Number.isFinite(parsed)) return parsed;
            }
        }
        if (typeof value.toString === 'function') {
            const str = value.toString();
            const parsed = Number(str);
            if (Number.isFinite(parsed)) return parsed;
        }
    }
    return null;
}

function decimalToString(value, fallback = undefined) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value.toString();
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object' && value !== null && typeof value.toString === 'function') {
        return value.toString();
    }
    return fallback;
}

function mapVersaoIndicadorToMetric(versao) {
    if (!versao || !versao.versaoindicador) return null;
    const indicador = versao.versaoindicador;
    const contexto = versao.contexto || null;
    const gerencia = contexto?.gerencia || null;
    const diretoria = gerencia?.diretoria || null;

    const valorAtualTexto = decimalToString(indicador.valorAtual, '0') || '0';
    const valorAtual = decimalToNumber(indicador.valorAtual);
    const valorAlvoTexto = decimalToString(indicador.valorAlvo, undefined);
    const valorAlvo = decimalToNumber(indicador.valorAlvo);

    return {
        contextoVersaoId: versao.id,
        contextoId: versao.contextoId,
        title: versao.titulo,
        descricao: versao.descricao || null,
        diretoriaId: diretoria?.id || null,
        diretoriaSlug: diretoria?.slug || null,
        diretoriaNome: diretoria?.nome || null,
        gerenciaId: gerencia?.id || null,
        gerenciaSlug: gerencia?.slug || null,
        gerenciaNome: gerencia?.nome || null,
        valorAtualTexto,
        valorAtual,
        valorAlvoTexto: valorAlvoTexto || undefined,
        valorAlvo,
        unidade: indicador.unidade || undefined,
        textoComparativo: indicador.textoComparativo || undefined,
        cor: indicador.cor || undefined,
        icone: indicador.icone || undefined,
        updatedAt: versao.updatedAt ? versao.updatedAt.toISOString() : undefined,
    };
}

/**
 * Rota para BUSCAR o layout do dashboard de uma diretoria
 * GET /dashboardlayout/:diretoriaId
 */
exports.getLayout = async (req, res) => {
    const { diretoriaId } = req.params;

    try {
        const layout = await prisma.dashboardlayout.findUnique({
            where: { diretoriaId },
            include: {
                dashboardlayoutitem: {
                    orderBy: { slotIndex: 'asc' },
                    include: {
                        contextoversao: {
                            include: {
                                versaodashboard: true,
                                contexto: {
                                    include: {
                                        gerencia: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!layout) return res.status(200).json(null);

        // Normalizar estrutura para o frontend
        const items = layout.dashboardlayoutitem
            .filter(i => i.contextoversao && i.contextoversao.versaodashboard && i.contextoversao.isAtiva)
            .map(i => {
                const v = i.contextoversao;
                const dash = v.versaodashboard;
                let parsedPayload;
                try { parsedPayload = dash.payload ? JSON.parse(dash.payload) : null; } catch { parsedPayload = null; }
                return {
                    contextoVersaoId: v.id,
                    slotIndex: i.slotIndex,
                    titulo: v.titulo,
                    tipoGrafico: dash.tipoGrafico,
                    payload: parsedPayload, // esperado: { colunas, linhas, cores? }
                    isDestacado: v.isDestacado,
                    updatedAt: v.updatedAt,
                    contextoTituloConceitual: v.contexto?.tituloConceitual || null,
                    gerenciaId: v.contexto?.gerencia?.id || null,
                    gerenciaNome: v.contexto?.gerencia?.nome || null,
                    diretoriaId: v.contexto?.gerencia?.diretoriaId || null
                };
            });

        return res.status(200).json({
            tipoLayout: layout.tipoLayout,
            diretoriaId: layout.diretoriaId,
            items
        });

    } catch (error) {
        console.error('Erro ao buscar layout do dashboard:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

/**
 * Rota para SALVAR (Criar/Atualizar) o layout do dashboard
 * POST /dashboardlayout/:diretoriaId
 *
 * Esta rota usa uma transação para:
 * 1. Criar ou atualizar o 'dashboardlayout' (ex: 'GRID', 'ASYMMETRIC')
 * 2. Deletar TODOS os 'dashboardlayoutitem' antigos
 * 3. Criar TODOS os 'dashboardlayoutitem' novos que vieram do frontend
 */
exports.saveLayout = async (req, res) => {
    const { diretoriaId } = req.params;
    // O frontend deve enviar o tipo de layout e um array de itens
    // ex: { tipoLayout: 'GRID', items: [{ contextoVersaoId: 'uuid-1', slotIndex: 0 }, ...] }
    const { tipoLayout, items } = req.body;
    
    const { role, diretoriaId: userDiretoriaId } = req.user;

    // --- Permissão ---
    // Apenas um Diretor da própria diretoria pode editar o layout
    if (role !== 'DIRETOR' || userDiretoriaId !== diretoriaId) {
        return res.status(403).json({ message: 'Acesso negado. Apenas o diretor desta diretoria pode editar o layout.' });
    }

    if (!tipoLayout || !items) {
        return res.status(400).json({ message: 'tipoLayout e items são obrigatórios.' });
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // Etapa 1: Cria ou Atualiza o 'dashboardlayout' pai
            //
            const layout = await tx.dashboardlayout.upsert({
                where: { diretoriaId: diretoriaId },
                update: { 
                    tipoLayout: tipoLayout 
                },
                create: {
                    id: crypto.randomUUID(),
                    diretoriaId: diretoriaId,
                    tipoLayout: tipoLayout
                }
            });

            const layoutId = layout.id;

            // Etapa 2: Deleta TODOS os itens de layout antigos
            await tx.dashboardlayoutitem.deleteMany({
                where: { dashboardLayoutId: layoutId }
            });

            // Etapa 3: Prepara os novos dados dos itens
            const itemsData = items.map(item => ({
                id: crypto.randomUUID(),
                dashboardLayoutId: layoutId,
                contextoVersaoId: item.contextoVersaoId,
                slotIndex: item.slotIndex
            }));

            // Etapa 4: Cria os novos itens de layout
            //
            if (itemsData.length > 0) {
                await tx.dashboardlayoutitem.createMany({
                    data: itemsData
                });
            }

            return layout;
        });

    return res.status(201).json({ message: 'Layout salvo com sucesso!', layout: resultado });

    } catch (error) {
        console.error('Erro ao salvar layout do dashboard:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

/**
 * Rota para listar destaques (gráficos destacados) para visão da Secretaria
 * GET /dashboardlayout/destaques
 */
exports.getHighlights = async (req, res) => {
    try {
        const versoes = await prisma.contextoversao.findMany({
            where: {
                isDestacado: true,
                isAtiva: true,
                statusValidacao: 'PUBLICADO',
                versaodashboard: { isNot: null }
            },
            include: {
                versaodashboard: true,
                contexto: {
                    include: {
                        gerencia: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 24
        });

        const items = versoes.map(v => {
            const dash = v.versaodashboard;
            let parsedPayload;
            try { parsedPayload = dash?.payload ? JSON.parse(dash.payload) : null; } catch { parsedPayload = null; }
            return {
                contextoVersaoId: v.id,
                titulo: v.titulo,
                tipoGrafico: dash?.tipoGrafico,
                payload: parsedPayload,
                isDestacado: v.isDestacado,
                updatedAt: v.updatedAt,
                diretoriaId: v.contexto?.gerencia?.diretoriaId || null,
                contextoTituloConceitual: v.contexto?.tituloConceitual || null,
                gerenciaId: v.contexto?.gerencia?.id || null,
                gerenciaNome: v.contexto?.gerencia?.nome || null
            };
        });

        return res.status(200).json({ items });
    } catch (error) {
        console.error('Erro ao buscar destaques:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getKpis = async (req, res) => {
    const { diretoriaId } = req.params;
    try {
        const registros = await prisma.dashboardkpi.findMany({
            where: { diretoriaId },
            orderBy: { position: 'asc' },
            include: {
                contextoversao: {
                    include: {
                        versaoindicador: true,
                        contexto: {
                            include: {
                                gerencia: {
                                    include: { diretoria: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const items = registros
            .map((entry) => {
                const metric = mapVersaoIndicadorToMetric(entry.contextoversao);
                if (!metric) return null;
                return {
                    dashboardKpiId: entry.id,
                    diretoriaId: entry.diretoriaId,
                    contextoVersaoId: entry.contextoVersaoId,
                    position: entry.position,
                    isHighlighted: entry.isHighlighted,
                    metric,
                };
            })
            .filter(Boolean);

        return res.status(200).json({ diretoriaId, items });
    } catch (error) {
        console.error('Erro ao buscar KPIs do dashboard:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getAvailableKpis = async (req, res) => {
    const { diretoriaId } = req.params;
    const user = req.user;

    if (!user || user.role !== 'DIRETOR' || user.diretoriaId !== diretoriaId) {
        return res.status(403).json({ message: 'Apenas o diretor desta diretoria pode listar KPIs disponíveis.' });
    }

    try {
        const versoes = await prisma.contextoversao.findMany({
            where: {
                isAtiva: true,
                statusValidacao: 'PUBLICADO',
                contexto: {
                    tipo: 'INDICADOR',
                    gerencia: { diretoriaId }
                },
                dashboardkpi: { none: { diretoriaId } }
            },
            orderBy: { updatedAt: 'desc' },
            take: 120,
            include: {
                versaoindicador: true,
                contexto: {
                    include: {
                        gerencia: {
                            include: { diretoria: true }
                        }
                    }
                }
            }
        });

        const items = versoes
            .map(mapVersaoIndicadorToMetric)
            .filter(Boolean)
            .map((metric) => ({ metric }));

        return res.status(200).json({ diretoriaId, items });
    } catch (error) {
        console.error('Erro ao listar KPIs disponíveis:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.saveKpis = async (req, res) => {
    const { diretoriaId } = req.params;
    const { items } = req.body || {};
    const user = req.user;

    if (!user || user.role !== 'DIRETOR' || user.diretoriaId !== diretoriaId) {
        return res.status(403).json({ message: 'Apenas o diretor desta diretoria pode atualizar os KPIs.' });
    }

    if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Lista de itens inválida.' });
    }

    const limitedItems = items
        .filter((item) => item && typeof item.contextoVersaoId === 'string')
        .slice(0, 5)
        .map((item) => ({
            contextoVersaoId: item.contextoVersaoId,
            position: typeof item.position === 'number' ? item.position : 0,
            isHighlighted: !!item.isHighlighted,
        }));

    if (limitedItems.length !== items.filter((item) => item && typeof item.contextoVersaoId === 'string').length) {
        return res.status(400).json({ message: 'Dados de KPI inválidos.' });
    }

    const uniqueVersoes = new Set(limitedItems.map((item) => item.contextoVersaoId));
    if (uniqueVersoes.size !== limitedItems.length) {
        return res.status(400).json({ message: 'KPIs duplicados não são permitidos.' });
    }

    const highlightCount = limitedItems.filter((item) => item.isHighlighted).length;
    if (highlightCount > 1) {
        return res.status(400).json({ message: 'Apenas um KPI pode ser destacado para a secretaria.' });
    }

    const orderedItems = [...limitedItems].sort((a, b) => a.position - b.position).map((item, index) => ({
        ...item,
        position: index,
    }));

    try {
        const versoesValidas = await prisma.contextoversao.findMany({
            where: {
                id: { in: orderedItems.map((item) => item.contextoVersaoId) },
                isAtiva: true,
                statusValidacao: 'PUBLICADO',
                contexto: {
                    tipo: 'INDICADOR',
                    gerencia: { diretoriaId }
                }
            },
            include: { versaoindicador: true }
        });

        if (versoesValidas.length !== orderedItems.length) {
            return res.status(400).json({ message: 'Ao menos um KPI selecionado não pertence à diretoria ou não está publicado.' });
        }

        if (versoesValidas.some((versao) => !versao.versaoindicador)) {
            return res.status(400).json({ message: 'Versão selecionada não possui dados de indicador válidos.' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.dashboardkpi.deleteMany({ where: { diretoriaId } });
            if (orderedItems.length > 0) {
                await tx.dashboardkpi.createMany({
                    data: orderedItems.map((item) => ({
                        id: crypto.randomUUID(),
                        diretoriaId,
                        contextoVersaoId: item.contextoVersaoId,
                        position: item.position,
                        isHighlighted: item.isHighlighted,
                    }))
                });
            }
        });

        const atualizados = await prisma.dashboardkpi.findMany({
            where: { diretoriaId },
            orderBy: { position: 'asc' },
            include: {
                contextoversao: {
                    include: {
                        versaoindicador: true,
                        contexto: {
                            include: {
                                gerencia: {
                                    include: { diretoria: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const responseItems = atualizados
            .map((entry) => {
                const metric = mapVersaoIndicadorToMetric(entry.contextoversao);
                if (!metric) return null;
                return {
                    dashboardKpiId: entry.id,
                    diretoriaId: entry.diretoriaId,
                    contextoVersaoId: entry.contextoVersaoId,
                    position: entry.position,
                    isHighlighted: entry.isHighlighted,
                    metric,
                };
            })
            .filter(Boolean);

        return res.status(201).json({ diretoriaId, items: responseItems });
    } catch (error) {
        console.error('Erro ao salvar KPIs do dashboard:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getKpiHighlights = async (req, res) => {
    try {
        const registros = await prisma.dashboardkpi.findMany({
            where: { isHighlighted: true },
            orderBy: { createdAt: 'desc' },
            include: {
                contextoversao: {
                    include: {
                        versaoindicador: true,
                        contexto: {
                            include: {
                                gerencia: {
                                    include: { diretoria: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const items = registros
            .map((entry) => {
                const metric = mapVersaoIndicadorToMetric(entry.contextoversao);
                if (!metric) return null;
                return {
                    dashboardKpiId: entry.id,
                    diretoriaId: entry.diretoriaId,
                    contextoVersaoId: entry.contextoVersaoId,
                    metric,
                };
            })
            .filter(Boolean);

        return res.status(200).json({ items });
    } catch (error) {
        console.error('Erro ao buscar KPIs destacados para a secretaria:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};