// src/controllers/contextoController.js

const crypto = require('crypto');
const prisma = require('../config/prismaClient');
const { Status } = require('../constants/status');
const { mapContextoDetalhe } = require('../mappers/contextoMapper');
const versaoService = require('../services/versaoService');
const notificacaoService = require('../services/notificacaoService'); // Importação essencial
const fileStorageService = require('../services/fileStorageService.js');

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
        let where = {};
        
        if (user.role === 'GERENTE') {
            where = {
                statusValidacao: 'AGUARDANDO_GERENTE',
                contexto: { gerenciaDonaId: user.gerenciaId || '' },
            };
        } else if (user.role === 'DIRETOR') {
            where = {
                statusValidacao: 'AGUARDANDO_DIRETOR',
                contexto: { gerencia: { diretoriaId: user.diretoriaId || '' } },
            };
        } else if (user.role === 'MEMBRO') {
            where = {
                solicitanteId: user.id,
                statusValidacao: { in: ['AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO'] },
            };
        } else {
             return res.json({ data: [] });
        }

        const versoes = await prisma.contextoversao.findMany({
            where,
            include: { 
                // Inclui dados para visualização correta
                contexto: {
                    include: {
                        gerencia: { select: { nome: true, slug: true } }
                    }
                },
                user: { select: { nome: true } }, // Nome do solicitante
                
                versaoindicador: true, 
                versaoarquivo: true, 
                versaodashboard: true 
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ data: versoes });

    } catch (err) {
        console.error('Erro listPendentes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /contextos/detalhes/:contextoId
exports.getDetalhes = async (req, res) => {
    const { contextoId } = req.params;
    try {
        const contexto = await prisma.contexto.findUnique({ 
            where: { id: contextoId },
            include: {
                // Inclui nome da gerência
                gerencia: {
                    select: { slug: true, nome: true }
                }
            }
        });

        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });

        const versoes = await prisma.contextoversao.findMany({
            where: { contextoId },
            include: {
                versaoarquivo: true,
                versaodashboard: true,
                versaoindicador: true,
                // Inclui nome do autor da versão
                user: { select: { nome: true } }
            },
            orderBy: [{ versaoNumero: 'desc' }],
        });

        const ids = versoes.map(v => v.id);
        const historico = ids.length ? await prisma.validacaohistorico.findMany({
            where: { versaoId: { in: ids } },
            orderBy: [{ timestamp: 'desc' }],
            // Inclui nome de quem fez a ação no histórico
            include: { user: { select: { nome: true } } }
        }) : [];

        if (typeof mapContextoDetalhe === 'function') {
            return res.json(mapContextoDetalhe(contexto, versoes, historico));
        }
        return res.json({ contexto, versoes, historico });
    } catch (err) {
        console.error('Erro getDetalhes:', err);
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

// POST /contextos/versoes/:versaoId/destacar
exports.marcarDestaque = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        // Buscar versão com relação até a diretoria
        const versao = await prisma.contextoversao.findUnique({
            where: { id: versaoId },
            include: { contexto: { include: { gerencia: true } } }
        });
        if (!versao) return res.status(404).json({ message: 'Versão não encontrada' });
        if (user.role !== 'DIRETOR') return res.status(403).json({ message: 'Apenas Diretor pode destacar' });
        const diretoriaId = versao.contexto?.gerencia?.diretoriaId || null;
        if (!diretoriaId || user.diretoriaId !== diretoriaId) {
            return res.status(403).json({ message: 'Diretoria não correspondente' });
        }
        if (!(versao.isAtiva && versao.statusValidacao === 'PUBLICADO')) {
            return res.status(400).json({ message: 'Apenas versões publicadas e ativas podem ser destacadas' });
        }
        if (!versao.isDestacado) {
            const count = await prisma.contextoversao.count({
                where: {
                    isDestacado: true,
                    isAtiva: true,
                    statusValidacao: 'PUBLICADO',
                    contexto: { gerencia: { diretoriaId } }
                }
            });
            if (count >= 3) {
                return res.status(400).json({ message: 'Limite de 3 destaques por diretoria alcançado' });
            }
        }
        await prisma.contextoversao.update({ where: { id: versaoId }, data: { isDestacado: true, updatedAt: new Date() } });
        return res.json({ message: 'Marcado como destaque' });
    } catch (err) {
        console.error('Erro marcarDestaque:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /contextos/versoes/:versaoId/remover-destaque
exports.removerDestaque = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        const versao = await prisma.contextoversao.findUnique({
            where: { id: versaoId },
            include: { contexto: { include: { gerencia: true } } }
        });
        if (!versao) return res.status(404).json({ message: 'Versão não encontrada' });
        if (user.role !== 'DIRETOR') return res.status(403).json({ message: 'Apenas Diretor pode remover destaque' });
        const diretoriaId = versao.contexto?.gerencia?.diretoriaId || null;
        if (!diretoriaId || user.diretoriaId !== diretoriaId) {
            return res.status(403).json({ message: 'Diretoria não correspondente' });
        }
        await prisma.contextoversao.update({ where: { id: versaoId }, data: { isDestacado: false, updatedAt: new Date() } });
        return res.json({ message: 'Destaque removido' });
    } catch (err) {
        console.error('Erro removerDestaque:', err);
        return res.status(500).json({ message: 'Erro interno' });
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
        const ger = await prisma.gerencia.findUnique({ 
            where: { id: user.gerenciaId },
            select: { id: true, slug: true } 
        });
        
        if (!ger) return res.status(400).json({ message: 'Gerência do usuário não encontrada.' });
        
        const result = await prisma.$transaction(async (tx) => {
            // 1. Criar Contexto
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
                    try {
                        // CORREÇÃO AQUI: Passamos tituloConceitual e versaoNumero (1)
                        finalUrl = await fileStorageService.moveFileToFinalDestination(
                            req.file, 
                            ger.slug, 
                            ctx.id,
                            tituloConceitual, // <--- Título para o nome da pasta
                            1                 // <--- Versão para o nome do arquivo
                        );
                    } catch (moveError) {
                        throw new Error(`Falha ao salvar arquivo: ${moveError.message}`);
                    }
                    
                    const mime = req.file.mimetype;
                    if (mime.includes('pdf')) docType = 'PDF';
                    else if (mime.includes('sheet') || mime.includes('excel')) docType = 'EXCEL';
                    else if (mime.includes('word') || mime.includes('presentation')) docType = 'DOC';
                    else docType = 'DOC';
                }
                
                if (!finalUrl) throw new Error("Arquivo ou URL é obrigatório.");
                
                await tx.versaoarquivo.create({
                    data: { id: crypto.randomUUID(), versaoId: v1.id, url: finalUrl, docType }
                });

            } else if (tipo === 'DASHBOARD') {
                await tx.versaodashboard.create({
                    data: {
                        id: crypto.randomUUID(),
                        versaoId: v1.id,
                        tipoGrafico,
                        payload: typeof dashboardPayload === 'object' ? JSON.stringify(dashboardPayload) : dashboardPayload
                    }
                });
            } else if (tipo === 'INDICADOR') {
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

            // 5. Comentário
            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v1.id,
                    autorId: user.id, 
                    texto: "📤 Contexto criado e submetido para análise da Gerência.",
                    isPrivate: false,
                    timestamp: new Date()
                }
            });

            return { ctx, v1 };
        });

        // Notificação
        try {
            await notificacaoService.notifyGerentesDaGerencia(
                user.gerenciaId,
                user.id,
                result.v1,
                `Novo contexto "${titulo}" aguarda análise do Gerente.`
            );
        } catch (notifError) {
            console.error('Falha notif create:', notifError);
        }

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
    const { titulo, descricao, motivoNovaVersao, descNovaVersao, linkUrl, tipoGrafico, dashboardPayload, valorAtual, valorAlvo, unidade, textoComparativo, cor, icone } = req.body;

    if (!titulo) return res.status(400).json({ message: 'Título obrigatório' });

    try {
        // CORREÇÃO: Garantimos que o tituloConceitual vem na busca
        const contexto = await prisma.contexto.findUnique({ 
            where: { id: contextoId },
            include: { 
                versoes: { orderBy: { versaoNumero: 'desc' }, take: 1 },
                gerencia: { select: { slug: true } } 
            }
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

            if (contexto.tipo === 'ARQUIVO_LINK') {
                let finalUrl = linkUrl;
                let docType = 'LINK';
                
                if (req.file) {
                    try {
                        // CORREÇÃO AQUI: Passamos tituloConceitual do contexto e nextNum
                        finalUrl = await fileStorageService.moveFileToFinalDestination(
                            req.file, 
                            contexto.gerencia?.slug, 
                            contextoId,
                            contexto.tituloConceitual, // <--- Nome da pasta
                            nextNum                    // <--- Nome do arquivo (v2, v3...)
                        );
                    } catch (moveError) {
                        throw new Error(`Falha ao salvar arquivo da versão: ${moveError.message}`);
                    }

                    const mime = req.file.mimetype || '';
                    if (mime.includes('pdf')) docType = 'PDF';
                    else if (mime.includes('sheet') || mime.includes('excel')) docType = 'EXCEL';
                    else docType = 'DOC';

                } else if (!finalUrl && contexto.versoes[0]) {
                     const prev = await prisma.versaoarquivo.findUnique({ where: { versaoId: contexto.versoes[0].id }});
                     if (prev) { finalUrl = prev.url; docType = prev.docType; }
                }

                if (finalUrl) {
                    await tx.versaoarquivo.create({ data: { id: crypto.randomUUID(), versaoId: v.id, url: finalUrl, docType }});
                }

            } else if (contexto.tipo === 'DASHBOARD' && dashboardPayload) {
                 await tx.versaodashboard.create({
                    data: { id: crypto.randomUUID(), versaoId: v.id, tipoGrafico: tipoGrafico || 'BAR', payload: typeof dashboardPayload === 'object' ? JSON.stringify(dashboardPayload) : dashboardPayload }
                });
            } else if (contexto.tipo === 'INDICADOR' && valorAtual !== undefined) {
                await tx.versaoindicador.create({
                    data: { id: crypto.randomUUID(), versaoId: v.id, valorAtual: parseFloat(valorAtual), valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null, unidade: unidade||'', textoComparativo, cor: cor||'#000', icone: icone||'Heart' }
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

            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v.id,
                    autorId: user.id,
                    texto: `📤 Nova versão submetida.\nMotivo: "${motivoNovaVersao || 'Atualização'}".\nAguardando análise da Gerência.`,
                    isPrivate: false,
                    timestamp: new Date()
                }
            });

            return v;
        });

        try {
            await notificacaoService.notifyGerentesDaGerencia(
                user.gerenciaId,
                user.id,
                result,
                `Nova versão "${titulo}" aguarda análise do Gerente.`
            );
        } catch (notifError) {
            console.error('Falha notif createVersao:', notifError);
        }

        return res.status(201).json({ versao: result });
    } catch (err) {
        console.error('Erro createVersao:', err);
        return res.status(500).json({ message: err.message || 'Erro interno' });
    }
};
// GET /contextos/:versaoId/participantes
exports.listarParticipantes = async (req, res) => {
    const { versaoId } = req.params;
    const userId = req.user.id; 

    try {
        const versao = await prisma.contextoversao.findUnique({
            where: { id: versaoId },
            include: { 
                contexto: { 
                    include: { 
                        gerencia: true 
                    } 
                } 
            }
        });

        if (!versao) return res.status(404).json({ message: 'Versão não encontrada' });

        const gerenciaId = versao.contexto.gerencia.id;
        const diretoriaId = versao.contexto.gerencia.diretoriaId;
        const solicitanteId = versao.solicitanteId;

        const comentariosSecretaria = await prisma.comentario.findMany({
            where: {
                versaoId: versaoId,
                user: { role: 'SECRETARIA' }
            },
            select: { autorId: true },
            distinct: ['autorId']
        });
        
        const idsSecretariasInteragiram = comentariosSecretaria.map(c => c.autorId);

        const participantes = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: userId } },
                    {
                        OR: [
                            { role: 'DIRETOR', diretoriaId: diretoriaId }, 
                            { role: 'GERENTE', gerenciaId: gerenciaId },   
                            { id: solicitanteId },                         
                            { id: { in: idsSecretariasInteragiram } }      
                        ]
                    }
                ]
            },
            select: { 
                id: true, 
                nome: true, 
                role: true 
            }
        });

        return res.json(participantes);
    } catch (err) {
        console.error('Erro listarParticipantes:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// --- AÇÕES DE VALIDAÇÃO ---

exports.gerenteAprovar = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        await versaoService.gerenteAprova({ versaoId, actor: user });

        const versao = await prisma.contextoversao.findUnique({
            where: { id: versaoId },
            include: { contexto: { include: { gerencia: true } } }
        });

        if (versao && versao.contexto?.gerencia?.diretoriaId) {
            try {
                await notificacaoService.notifyDiretoresDaDiretoria(
                    versao.contexto.gerencia.diretoriaId,
                    user.id,
                    versao,
                    `Versão "${versao.titulo}" aguarda validação do Diretor.`
                );
            } catch (notifError) {
                console.error('Falha notif diretores:', notifError);
            }
        }

        return res.json({ message: 'Aprovado com sucesso' });
    } catch (err) {
        console.error('Erro gerenteAprovar:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Erro ao aprovar' });
    }
};

exports.diretorPublicar = async (req, res) => {
    const { versaoId } = req.params;
    const user = req.user;
    try {
        await prisma.$transaction(async (tx) => {
            const current = await tx.contextoversao.findUnique({ where: { id: versaoId } });
            if (current) {
                await tx.contextoversao.updateMany({
                    where: { contextoId: current.contextoId, isAtiva: true },
                    data: { isAtiva: false }
                });
            }
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

            // --- NOVO: Comentário Automático ---
            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: versaoId,
                    autorId: user.id, // Assinado pelo Diretor
                    texto: "🚀 Versão Publicada e Ativa!\nO processo de validação foi concluído.",
                    isPrivate: false,
                    timestamp: new Date()
                }
            });
            // -----------------------------------
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

            // --- NOVO: Comentário Automático ---
            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: versaoId,
                    autorId: user.id,
                    texto: `❌ Indeferido.\nJustificativa: "${justificativa || 'Sem justificativa'}"`,
                    isPrivate: false,
                    timestamp: new Date()
                }
            });
            // -----------------------------------
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

            // --- NOVO: Comentário Automático ---
            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: versaoId,
                    autorId: user.id,
                    texto: `⚠️ Devolvido para Correção.\nMotivo: "${justificativa}"\nPor favor, envie uma nova versão com os ajustes.`,
                    isPrivate: false,
                    timestamp: new Date()
                }
            });
            // -----------------------------------
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
        // 1. Buscar Contexto com dados da Gerência e Diretoria (SLUGS)
        const contexto = await prisma.contexto.findUnique({ 
            where: { id: contextoId },
            include: {
                gerencia: {
                    select: {
                        slug: true,
                        nome: true,
                        diretoria: {
                            select: {
                                slug: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });

        const versoes = await prisma.contextoversao.findMany({
            where: { contextoId },
            include: {
                versaoarquivo: true,
                versaodashboard: true,
                versaoindicador: true,
                user: {
                    select: { nome: true, email: true }
                }
            },
            orderBy: [{ versaoNumero: 'desc' }],
        });

        const ids = versoes.map(v => v.id);
        const historico = ids.length ? await prisma.validacaohistorico.findMany({
            where: { versaoId: { in: ids } },
            orderBy: [{ timestamp: 'desc' }],
            include: {
                user: { select: { nome: true } } // Opcional: Nome de quem aprovou/rejeitou no histórico
            }
        }) : [];

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
            ...(q ? { contexto: { tituloConceitual: { contains: q } } } : {}), 
            ...whereVersao
        };

        const [total, rows] = await Promise.all([
            prisma.contextoversao.count({ where }),
            prisma.contextoversao.findMany({
                where,
                include: { 
                    contexto: {
                        include: { 
                            gerencia: { select: { slug: true, nome: true } } 
                        }
                    },
                    // AQUI: Inclusão do usuário para trazer o nome
                    user: { select: { nome: true } }
                },
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