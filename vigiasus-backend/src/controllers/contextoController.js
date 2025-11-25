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
            where: { 
                isAtiva: true, 
                statusValidacao: 'PUBLICADO',
                contexto: {
                    deletedAt: null 
                }
            },
            include: { contexto: true },
            orderBy: { updatedAt: 'desc' },
        });
        const output = versoes.map(v => mapContextoWithVersao(v.contexto, v));
        return res.json(output);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao listar publicados.' });
    }
};

// GET /contextos/pendentes
exports.listPendentes = async (req, res) => {
    const user = req.user;
    try {
        let where = {};
        
        // Regra base para todos: O contexto pai não pode estar deletado
        const baseContextFilter = { deletedAt: null };

        if (user.role === 'GERENTE') {
            where = {
                statusValidacao: 'AGUARDANDO_GERENTE',
                contexto: { 
                    gerenciaDonaId: user.gerenciaId || '',
                    ...baseContextFilter // Adiciona filtro de deletedAt
                },
            };
        } else if (user.role === 'DIRETOR') {
            where = {
                statusValidacao: 'AGUARDANDO_DIRETOR',
                contexto: { 
                    gerencia: { diretoriaId: user.diretoriaId || '' }, 
                    ...baseContextFilter // Adiciona filtro de deletedAt
                }
            };
        } else if (user.role === 'MEMBRO') {
            where = {
                solicitanteId: user.id,
                statusValidacao: { in: ['AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO'] },
                // Para membro, o filtro de contexto também é necessário
                contexto: baseContextFilter 
            };
        } else {
             return res.json({ data: [] });
        }

        const versoes = await prisma.contextoversao.findMany({
            where,
            include: { 
                contexto: {
                    include: {
                        gerencia: { select: { nome: true, slug: true } }
                    }
                },
                user: { select: { nome: true } }, // Nome do solicitante
                
                versaoindicador: true, 
                versaoarquivo: true, 
                versaodashboard: true,

                validacaohistorico: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        user: { select: { nome: true } } 
                    }
                }
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
        // 1. Buscar dados do Contexto (Pai)
        const contexto = await prisma.contexto.findUnique({
            where: { id: contextoId },
            include: {
                gerencia: {
                    select: { id: true, slug: true, nome: true }
                },
                user: {
                    select: { id: true, nome: true, email: true }
                }
            }
        });

        // [SOFT DELETE] Validação de segurança
        if (!contexto || contexto.deletedAt !== null) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        // 2. Buscar Versões com TODAS as relações necessárias
        // Isso é crucial para o botão de Deferir aparecer
        const versoes = await prisma.contextoversao.findMany({
            where: { contextoId },
            include: {
                // Tipos de conteúdo
                versaoarquivo: true,
                versaodashboard: true,
                versaoindicador: true,

                // Autor da versão
                user: { select: { id: true, nome: true } },

                // [CRUCIAL] Histórico Específico da Versão (Timeline)
                // O frontend precisa disso DENTRO da versão para saber se foi devolvido
                validacaohistorico: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        user: { select: { nome: true } }
                    }
                }
            },
            orderBy: { versaoNumero: 'desc' } // Da mais recente para a mais antiga
        });

        // 3. Histórico Global (Opcional, mas útil para log geral)
        const ids = versoes.map(v => v.id);
        const historicoGlobal = ids.length ? await prisma.validacaohistorico.findMany({
            where: { versaoId: { in: ids } },
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { nome: true } } }
        }) : [];

        // 4. [MONTAGEM DA RESPOSTA]
        // Em vez de depender de mappers externos, montamos a estrutura exata
        // que o frontend (VisualizarContextoModal) espera.
        const response = {
            ...contexto,
            // Mapeia as versões para garantir que os campos tenham os nomes esperados
            versoes: versoes.map(v => ({
                ...v,
                // Garante que o status esteja acessível na raiz do objeto da versão
                status: v.statusValidacao, 
                // Mapeia o histórico interno para o campo 'historico' que o front usa
                historico: v.validacaohistorico.map(h => ({
                    id: h.id,
                    timestamp: h.timestamp,
                    statusNovo: h.statusNovo,
                    justificativa: h.justificativa,
                    autorNome: h.user ? h.user.nome : 'Sistema',
                    user: h.user
                }))
            })),
            // Histórico geral
            historico: historicoGlobal.map(h => ({
                ...h,
                autorNome: h.user ? h.user.nome : 'Sistema'
            }))
        };

        return res.json(response);

    } catch (err) {
        console.error('Erro getDetalhes:', err);
        return res.status(500).json({ message: 'Erro interno ao buscar detalhes.' });
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

// Controla a visibilidade do contexto (ocultar/exibir)
exports.toggleVisibilityContexto = async (req, res) => {
    const { id } = req.params;

    try {
        const contexto = await prisma.contexto.findUnique({
            where: { id: id },
            select: { isOculto: true } // isOculto: CORRETO
        });

        if (!contexto) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        const novoEstado = !contexto.isOculto;

        await prisma.contexto.update({
            where: { id: id },
            data: { 
                isOculto: novoEstado,
            } 
        });

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao alternar visibilidade do contexto:", error);
        return res.status(500).json({ message: 'Erro interno ao processar visibilidade do contexto.' });
    }
};

exports.toggleVisibilityVersao = async (req, res) => {
    const { contextoId, versaoId } = req.params;
    const idVersao = versaoId; // Mantenha como string, Prisma lida com o UUID

    try {
        const versao = await prisma.contextoversao.findFirst({
            where: { 
                id: idVersao,
                contextoId: contextoId 
            },
            select: { isOculta: true } // CORRIGIDO: de 'estaOculta' para 'isOculta'
        });

        if (!versao) {
            return res.status(404).json({ message: 'Versão do contexto não encontrada.' });
        }

        const novoEstado = !versao.isOculta; // CORRIGIDO: de 'estaOculta' para 'isOculta'

        await prisma.contextoversao.update({
            where: { id: idVersao },
            data: { isOculta: novoEstado, updatedAt: new Date() } // CORRIGIDO: de 'estaOculta' para 'isOculta'
        });

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao alternar visibilidade da versão:", error);
        return res.status(500).json({ message: 'Erro interno ao processar visibilidade da versão.' });
    }
};

// DELETE /contextos/:id

exports.deleteContexto = async (req, res) => {
    const { id } = req.params; // ID do Contexto
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // 1. Buscar o contexto com TODAS as versões (não só a ativa)
        // Precisamos saber quantas existem para decidir a estratégia
        const contexto = await prisma.contexto.findUnique({
            where: { id },
            include: {
                gerencia: true,
                contextoversao: {
                    orderBy: { versaoNumero: 'desc' }, // [0] é a mais recente (a candidata a exclusão)
                    include: { versaoarquivo: true }
                }
            }
        });

        if (!contexto) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        // A versão mais recente (que deve ser a pendente)
        const versaoAlvo = contexto.contextoversao[0];
        
        if (!versaoAlvo) {
             // Se não tem versões, é um contexto vazio/corrompido, podemos apagar.
             await prisma.contexto.delete({ where: { id } });
             return res.status(200).json({ message: 'Contexto vazio excluído.' });
        }

        // REGRA DE SEGURANÇA: Só pode apagar se estiver PENDENTE
        // Isso impede que alguém apague uma versão já publicada ou indeferida (finalizada).
        const statusPermitidos = ['AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO'];
        if (!statusPermitidos.includes(versaoAlvo.statusValidacao)) {
            return res.status(403).json({ 
                message: 'Esta versão já foi finalizada e não pode ser excluída.' 
            });
        }

        // CENÁRIO A: É a única versão do contexto? -> Soft Delete do Contexto Inteiro
        if (contexto.contextoversao.length === 1) {
            
            // Move arquivo se existir e for local
            if (contexto.tipo === 'ARQUIVO_LINK' && versaoAlvo.versaoarquivo?.url) {
                if (!versaoAlvo.versaoarquivo.url.startsWith('http')) {
                    try {
                        fileStorageService.softDeleteFile(versaoAlvo.versaoarquivo.url, contexto.gerencia.slug);
                    } catch (e) { console.error("Erro mover arquivo:", e); }
                }
            }

            // Marca contexto como deletado (Soft Delete)
            await prisma.contexto.update({
                where: { id },
                data: { deletedAt: new Date(), isOculto: true }
            });

            return res.status(200).json({ message: 'Solicitação cancelada e contexto excluído (era a única versão).' });

        } else {
            // CENÁRIO B: Existem versões anteriores -> Rollback (Apaga Pendente, Restaura Anterior)
            
            const versaoAnterior = contexto.contextoversao[1]; // A versão que vai voltar a ser a ativa

            // 1. Limpeza de arquivo da versão pendente (se não for reutilizado)
            if (contexto.tipo === 'ARQUIVO_LINK' && versaoAlvo.versaoarquivo?.url) {
                 const arquivoAnteriorUrl = versaoAnterior?.versaoarquivo?.url;
                 const isMesmoArquivo = arquivoAnteriorUrl === versaoAlvo.versaoarquivo.url;

                if (!versaoAlvo.versaoarquivo.url.startsWith('http') && !isMesmoArquivo) {
                    try {
                        fileStorageService.softDeleteFile(versaoAlvo.versaoarquivo.url, contexto.gerencia.slug);
                    } catch (e) { console.error("Erro mover arquivo versão:", e); }
                }
            }

            // 2. Apaga a versão pendente do banco (Hard Delete do rascunho)
            await prisma.contextoversao.delete({
                where: { id: versaoAlvo.id }
            });

            // 3. Reativar a versão anterior (torna-se visível na grelha novamente)
            // Nota: O statusValidacao dela não muda (se estava PUBLICADO, continua PUBLICADO).
            if (versaoAnterior) {
                await prisma.contextoversao.update({
                    where: { id: versaoAnterior.id },
                    data: { isAtiva: true } 
                });
            }

            return res.status(200).json({ 
                message: `Versão ${versaoAlvo.versaoNumero} cancelada. O contexto retornou à versão ${versaoAnterior.versaoNumero}.` 
            });
        }

    } catch (error) {
        console.error("Erro ao excluir/cancelar contexto:", error);
        return res.status(500).json({ message: 'Erro interno ao processar a exclusão.' });
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
// src/controllers/contextoController.js

// src/controllers/contextoController.js

exports.createVersao = async (req, res) => {
    const user = req.user;
    const { contextoId } = req.params;
    const { 
        titulo, 
        descricao, 
        motivoNovaVersao, 
        descNovaVersao, 
        linkUrl, 
        tipoGrafico, 
        dashboardPayload, 
        valorAtual, 
        valorAlvo, 
        unidade, 
        textoComparativo, 
        cor, 
        icone 
    } = req.body;

    if (!titulo) return res.status(400).json({ message: 'Título obrigatório' });

    try {
        // 1. Busca o contexto e a última versão
        // [CORREÇÃO]: Nome correto da relação no schema é 'contextoversao'
        const contexto = await prisma.contexto.findUnique({ 
            where: { id: contextoId },
            include: { 
                contextoversao: { 
                    orderBy: { versaoNumero: 'desc' }, 
                    take: 1 
                },
                gerencia: { select: { slug: true } } 
            }
        });
        
        if (!contexto) return res.status(404).json({ message: 'Contexto não encontrado' });
        
        // Verifica se o usuário pertence à mesma gerência
        if (contexto.gerenciaDonaId !== user.gerenciaId) {
             return res.status(403).json({ message: 'Você não tem permissão para criar versões nesta gerência.' });
        }

        // [CORREÇÃO]: Acessa 'contextoversao' em vez de 'versoes'
        const ultimaVersao = contexto.contextoversao[0];
        
        // [LÓGICA DE CORREÇÃO]: Verifica se é uma resposta a uma correção solicitada
        // Se a última versão está AGUARDANDO_CORRECAO, não criamos uma nova (v2), 
        // mas atualizamos a mesma versão para AGUARDANDO_GERENTE.
        const isCorrectionSubmission = ultimaVersao?.statusValidacao === 'AGUARDANDO_CORRECAO';
        
        // Se for correção, mantém o número. Se for nova versão sequencial, incrementa.
        const nextNum = isCorrectionSubmission 
            ? ultimaVersao.versaoNumero 
            : (ultimaVersao?.versaoNumero || 0) + 1;

        // Variáveis para o arquivo
        let finalUrl = linkUrl;
        let docType = 'LINK';
        let isFileUploaded = !!req.file;

        // Processamento de Arquivo (para ambos os casos)
        if (contexto.tipo === 'ARQUIVO_LINK') {
            if (req.file) {
                try {
                    finalUrl = await fileStorageService.moveFileToFinalDestination(
                        req.file, 
                        contexto.gerencia?.slug, 
                        contextoId,
                        contexto.tituloConceitual, 
                        nextNum
                    );
                } catch (moveError) {
                    throw new Error(`Falha ao salvar arquivo da versão: ${moveError.message}`);
                }

                const mime = req.file.mimetype || '';
                if (mime.includes('pdf')) docType = 'PDF';
                else if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) docType = 'EXCEL';
                else if (mime.includes('word') || mime.includes('document')) docType = 'DOC';
                else docType = 'PDF';

            } else if (!finalUrl && ultimaVersao) {
                 // Se não enviou nada novo, tenta copiar da versão anterior
                 const prev = await prisma.versaoarquivo.findUnique({ 
                     where: { versaoId: ultimaVersao.id }
                 });
                 if (prev) { 
                     finalUrl = prev.url; 
                     docType = prev.docType; 
                 }
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            let v; // A versão que estamos trabalhando

            if (isCorrectionSubmission) {
                // --- FLUXO DE CORREÇÃO (UPDATE) ---
                // Atualizamos a versão existente para voltar ao fluxo de aprovação
                
                v = await tx.contextoversao.update({
                    where: { id: ultimaVersao.id },
                    data: {
                        titulo,
                        descricao: descricao || null,
                        // Mantemos o ID do solicitante original ou atualizamos? Geralmente atualizamos para quem corrigiu.
                        solicitanteId: user.id, 
                        motivoNovaVersao: motivoNovaVersao || null, // Motivo da correção
                        descNovaVersao: descNovaVersao || null,
                        statusValidacao: 'AGUARDANDO_GERENTE', // VOLTA PARA O GERENTE
                        updatedAt: new Date(),
                    },
                });

                // Se houve upload de novo arquivo, removemos o anexo antigo antes de criar o novo
                if (contexto.tipo === 'ARQUIVO_LINK' && (isFileUploaded || (linkUrl && linkUrl !== ultimaVersao.versaoarquivo?.url))) {
                    await tx.versaoarquivo.deleteMany({ where: { versaoId: v.id } });
                }
                
                // Limpa dados antigos se for dashboard/indicador para recriar (opcional, ou update)
                if (contexto.tipo === 'DASHBOARD') await tx.versaodashboard.deleteMany({ where: { versaoId: v.id } });
                if (contexto.tipo === 'INDICADOR') await tx.versaoindicador.deleteMany({ where: { versaoId: v.id } });

            } else {
                // --- FLUXO DE NOVA VERSÃO (CREATE) ---
                // Criamos uma nova entrada no histórico de versões
                
                v = await tx.contextoversao.create({
                    data: {
                        id: crypto.randomUUID(),
                        contextoId,
                        titulo,
                        descricao: descricao || null,
                        solicitanteId: user.id,
                        versaoNumero: nextNum,
                        motivoNovaVersao: motivoNovaVersao || "Nova versão",
                        descNovaVersao: descNovaVersao || null,
                        statusValidacao: 'AGUARDANDO_GERENTE',
                        isAtiva: false,
                        isDestacado: false,
                        isOculta: false,
                        updatedAt: new Date(),
                    },
                });
            }

            // --- CRIAÇÃO DOS DADOS ESPECÍFICOS (Comum aos dois fluxos) ---

            if (contexto.tipo === 'ARQUIVO_LINK' && finalUrl) {
                await tx.versaoarquivo.create({ 
                    data: { 
                        id: crypto.randomUUID(), 
                        versaoId: v.id, 
                        url: finalUrl, 
                        docType 
                    }
                });
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
                        textoComparativo, 
                        cor: cor || '#000', 
                        icone: icone || 'Heart' 
                    }
                });
            }

            // --- HISTÓRICO E NOTIFICAÇÕES ---
            
            // Sempre cria um novo registro no histórico, mesmo que seja uma correção (Update)
            // Isso garante que sabemos quantas vezes foi corrigido.
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v.id,
                    autorId: user.id,
                    statusNovo: 'AGUARDANDO_GERENTE',
                    justificativa: isCorrectionSubmission ? 'Correção enviada' : (motivoNovaVersao || 'Nova versão'),
                    timestamp: new Date()
                }
            });

            await tx.comentario.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: v.id,
                    autorId: user.id,
                    texto: `📤 ${isCorrectionSubmission ? 'Correção' : 'Nova versão'} submetida.\nMotivo: "${motivoNovaVersao || 'Atualização'}".\nAguardando análise da Gerência.`,
                    isPrivate: false,
                    timestamp: new Date()
                }
            });

            return v;
        });

        // Notificações
        try {
            if (notificacaoService && typeof notificacaoService.notifyGerentesDaGerencia === 'function') {
                await notificacaoService.notifyGerentesDaGerencia(
                    user.gerenciaId,
                    user.id,
                    result,
                    `${isCorrectionSubmission ? 'Correção' : 'Nova versão'} "${titulo}" aguarda análise do Gerente.`
                );
            } else {
                await notificacaoService.notificarNovaVersao(contexto, result, user);
            }
        } catch (notifError) {
            console.error('Falha notif createVersao:', notifError);
        }

        return res.status(201).json({ versao: result });

    } catch (err) {
        console.error('Erro createVersao:', err);
        return res.status(500).json({ message: err.message || 'Erro interno ao criar versão.' });
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

        //  Verifique se existe E se não está deletado
        if (!contexto || contexto.deletedAt !== null) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        // Buscar Todas as Versões com dados do Autor
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
            // [SOFT DELETE]: Filtra excluídos E aplica busca por título se 'q' existir
            contexto: {
                deletedAt: null,
                ...(q ? { tituloConceitual: { contains: q } } : {})
            },
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
                    // Inclusão do usuário para trazer o nome
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

// src/controllers/contextoController.js

// [NOVA FUNÇÃO]: Lista Contextos únicos (Caixas Organizadoras)
exports.getContextosDaGerencia = async (req, res) => {
    const { gerenciaId } = req.params;
    const user = req.user;
    
    // Define se o usuário pode ver itens ocultos/pendentes
    const isInterno = user && (user.role === 'GERENTE' || user.role === 'DIRETOR' || (user.role === 'MEMBRO' && user.gerenciaId === gerenciaId));

    try {
        const contextos = await prisma.contexto.findMany({
            where: {
                gerenciaDonaId: gerenciaId,
                deletedAt: null, // Ignora lixeira
                // Se não for interno, só traz contextos que tenham pelo menos uma versão publicada e ativa
                ...( !isInterno ? {
                    isOculto: false,
                    contextoversao: {
                        some: { statusValidacao: 'PUBLICADO', isAtiva: true }
                    }
                } : {})
            },
            include: {
                gerencia: { select: { slug: true, nome: true } },
                // Trazemos as versões para o frontend decidir qual mostrar
                contextoversao: {
                    orderBy: { versaoNumero: 'desc' }, // A [0] será a mais recente (seja pendente ou publicada)
                    include: {
                        versaoarquivo: true,
                        versaodashboard: true,
                        versaoindicador: true,
                        user: { select: { nome: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mapeamento inteligente: Define qual versão é a "Capa" da caixa
        const output = contextos.map(ctx => {
            // Se for interno (Gestor), vê a versão mais recente absoluta (mesmo que seja rascunho/pendente)
            // Se for público, vê a versão mais recente que esteja PUBLICADA
            
            let versaoAtiva = null;
            
            if (isInterno) {
                // Pega a topo da pilha (ex: v2 pendente)
                versaoAtiva = ctx.contextoversao[0];
            } else {
                // Pega a primeira que for PUBLICADA e ATIVA
                versaoAtiva = ctx.contextoversao.find(v => v.statusValidacao === 'PUBLICADO' && v.isAtiva);
            }

            // Se não houver versão visível para este perfil, ignora o contexto (ou retorna null para filtrar depois)
            if (!versaoAtiva) return null;

            return mapContextoWithVersao(ctx, versaoAtiva, ctx.contextoversao);
        }).filter(Boolean); // Remove os nulos

        return res.json(output);

    } catch (error) {
        console.error("Erro ao listar contextos da gerência:", error);
        return res.status(500).json({ message: 'Erro ao carregar contextos.' });
    }
};

// Função auxiliar de mapeamento (atualize ou adicione se não existir)
function mapContextoWithVersao(ctx, versaoPrincipal, todasVersoes) {
    // Usa o mapper existente ou cria este objeto consolidado
    return {
        id: ctx.id,
        tituloConceitual: ctx.tituloConceitual,
        tipo: ctx.tipo,
        gerenciaDonaId: ctx.gerenciaDonaId,
        estaOculto: ctx.isOculto, // Importante para o badge
        createdAt: ctx.createdAt,
        
        // Dados da versão "Capa"
        titulo: versaoPrincipal.titulo,
        descricao: versaoPrincipal.descricao,
        status: versaoPrincipal.statusValidacao,
        versaoNumero: versaoPrincipal.versaoNumero,
        updatedAt: versaoPrincipal.updatedAt,
        autor: versaoPrincipal.user?.nome || 'Sistema',
        
        // Anexos da versão capa
        url: versaoPrincipal.versaoarquivo?.url,
        docType: versaoPrincipal.versaoarquivo?.docType,
        payload: versaoPrincipal.versaodashboard?.payload 
            ? JSON.parse(versaoPrincipal.versaodashboard.payload) 
            : null,
        
        // Lista completa para o histórico no modal
        versoes: todasVersoes
    };
}