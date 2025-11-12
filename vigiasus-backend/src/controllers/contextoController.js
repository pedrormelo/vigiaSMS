// src/controllers/contextoController.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // Necessário para crypto.randomUUID()

const prisma = require('../config/prismaClient'); // Usar o singleton do Prisma
const router = express.Router();

// --- Configuração do Upload (Multter) ---
// [Baseado em vigiasus-backend/prisma/schema.prisma]
// Esta configuração substitui a do seu uploadsConfig.js
// para aceitar os tipos corretos (PDF, DOC, EXCEL)

const UPLOAD_DIR = path.join(__dirname, '../../files/context');

// Garante que o diretório de upload exista
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Gera um nome único para evitar sobreposições
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de arquivos alinhado com o schema.prisma
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf', // PDF
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas PDF, DOC, DOCX, XLS ou XLSX são permitidos.'), false);
    }
};

// Mapeia mimetype para o enum do Prisma
const mapMimeToDocType = (mimetype) => {
    if (mimetype === 'application/pdf') return 'PDF';
    if (mimetype.includes('word')) return 'DOC';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheetml')) return 'EXCEL';
    return null;
}

const upload = multer({ storage: storage, fileFilter: fileFilter });


//ME PARECE CERTOOOOO

// ------------------------------------------
// --- ROTAS DE CRIAÇÃO (POST) ---
// ------------------------------------------

/**
 * Rota para CRIAR um novo Contexto e sua primeira Versão
 * POST /contextos
 * (Usado por: addContexto-modal.tsx)
 */
router.post(
    '/',
    upload.single('arquivo'), // 'arquivo' é o name do input no form-data
    async (req, res) => {
        const {
            tituloConceitual,
            gerenciaDonaId,
            tipo,
            titulo,
            descricao,
            motivoNovaVersao,
            url, // Para tipo LINK
            payload, // Para tipo DASHBOARD
            tipoGrafico,
            valorAtual, // Para tipo INDICADOR
            valorAlvo,
            unidade,
            textoComparativo,
            cor,
            icone
        } = req.body;

        const autorId = req.user.id; // Injetado pelo authMiddleware

        if (!tituloConceitual || !gerenciaDonaId || !tipo || !titulo) {
             // Se houver um arquivo, apaga-o em caso de erro de validação
             if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Campos obrigatórios (tituloConceitual, gerenciaDonaId, tipo, titulo) ausentes.' });
        }

        try {
            const resultado = await prisma.$transaction(async (tx) => {
                // Etapa A: Cria o 'Contexto' principal
                const novoContexto = await tx.contexto.create({
                    data: {
                        id: crypto.randomUUID(),
                        tituloConceitual: tituloConceitual,
                        tipo: tipo,
                        autorOriginalId: autorId,
                        gerenciaDonaId: gerenciaDonaId,
                    }
                });

                // Etapa B: Cria a primeira 'ContextoVersao'
                const novaVersao = await tx.contextoversao.create({
                    data: {
                        id: crypto.randomUUID(),
                        contextoId: novoContexto.id,
                        titulo: titulo,
                        descricao: descricao,
                        solicitanteId: autorId,
                        versaoNumero: 1,
                        motivoNovaVersao: motivoNovaVersao || "Versão inicial",
                        // Inicia o fluxo de validação
                        statusValidacao: 'AGUARDANDO_GERENTE', 
                        isAtiva: false, // Só fica ativa depois de PUBLICADO
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                // Etapa C: Salva os dados específicos do TIPO
                switch (tipo) {
                    case 'ARQUIVO_LINK':
                        if (req.file) {
                            // Se foi feito upload de um arquivo
                            await tx.versaoarquivo.create({
                                data: {
                                    id: crypto.randomUUID(),
                                    versaoId: novaVersao.id,
                                    url: req.file.path, // Salva o caminho do arquivo no servidor
                                    docType: mapMimeToDocType(req.file.mimetype)
                                }
                            });
                        } else if (url) {
                            // Se foi fornecido um link externo
                            await tx.versaoarquivo.create({
                                data: {
                                    id: crypto.randomUUID(),
                                    versaoId: novaVersao.id,
                                    url: url,
                                    docType: 'LINK'
                                }
                            });
                        } else {
                            throw new Error('Para o tipo ARQUIVO_LINK, é necessário um arquivo ou uma URL.');
                        }
                        break;

                    case 'DASHBOARD':
                        if (!payload || !tipoGrafico) {
                            throw new Error('Para o tipo DASHBOARD, o payload (JSON) e o tipoGrafico são obrigatórios.');
                        }
                        await tx.versaodashboard.create({
                            data: {
                                id: crypto.randomUUID(),
                                versaoId: novaVersao.id,
                                tipoGrafico: tipoGrafico,
                                payload: payload, // payload JSON como string
                            }
                        });
                        break;

                    case 'INDICADOR':
                        if (valorAtual === undefined || !unidade || !cor || !icone) {
                            throw new Error('Para o tipo INDICADOR, valorAtual, unidade, cor e icone são obrigatórios.');
                        }
                        await tx.versaoindicador.create({
                            data: {
                                id: crypto.randomUUID(),
                                versaoId: novaVersao.id,
                                valorAtual: parseFloat(valorAtual),
                                valorAlvo: valorAlvo ? parseFloat(valorAlvo) : null,
                                unidade: unidade,
                                textoComparativo: textoComparativo,
                                cor: cor,
                                icone: icone
                            }
                        });
                        break;
                    default:
                        throw new Error('Tipo de contexto inválido.');
                }

                // --- Etapa D: Notificar o Gerente ---
                // (Implementando a lógica solicitada)
                
                // 1. Achar o(s) gerente(s) da 'gerenciaDonaId'
                const gerentes = await tx.user.findMany({
                    where: {
                        role: 'GERENTE',
                        gerenciaId: gerenciaDonaId,
                        // Não notifica o gerente se ele mesmo for o solicitante
                        id: { 
                            not: autorId 
                        }
                    },
                    select: {
                        id: true // Apenas o ID para a notificação
                    }
                });

                // 2. Se houver gerentes (que não sejam o autor), cria os dados da notificação
                if (gerentes.length > 0) {
                    const notificacoesData = gerentes.map(gerente => ({
                        id: crypto.randomUUID(),
                        destinatarioId: gerente.id,
                        tipo: 'VALIDACAO', // Tipo para o frontend identificar
                        titulo: `Novo contexto "${novaVersao.titulo}" aguarda sua análise.`,
                        versaoId: novaVersao.id // Link para a versão
                    }));

                    // 3. Cria as notificações em lote
                    await tx.notificacao.createMany({
                        data: notificacoesData
                    });
                }
                
                // --- Fim da Etapa D ---

                return { novoContexto, novaVersao };
            });

            res.status(201).json({
                message: 'Contexto criado e enviado para validação!',
                contexto: resultado.novoContexto
            });

        } catch (error) {
            console.error('Erro ao criar contexto:', error);
            // Se der erro, apaga o arquivo que foi salvo
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
        }
    }
);

// NÃO SEI.................

// ------------------------------------------
// --- ROTAS DE LEITURA (GET) ---
// ------------------------------------------

/**
 * Rota para LISTAR todos os Contextos (Visão Admin/Completa)
 * GET /contextos
 */
router.get('/', async (req, res) => {
    try {
        const contextos = await prisma.contexto.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                gerencia: { select: { id: true, nome: true, sigla: true } },
                user: { select: { id: true, nome: true } }, // Autor original
                contextoversao: { // Retorna TODAS as versões
                    orderBy: { versaoNumero: 'desc' },
                    include: {
                        user: { select: { id: true, nome: true } }, // Solicitante da versão
                        versaoarquivo: true,
                        versaodashboard: true,
                        versaoindicador: true,
                    }
                }
            }
        });
        res.status(200).json(contextos);
    } catch (error) {
        console.error('Erro ao listar contextos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

//ME PARECE CERTOOOOO
/**
 * Rota para LISTAR Contextos PUBLICADOS
 * GET /contextos/publicados
 * Usado por: app/dados/page.tsx, app/gerencia/[id]/page.tsx
 */
router.get('/publicados', async (req, res) => {
    try {
        const contextos = await prisma.contexto.findMany({
            where: {
                // Filtra contextos que tenham PELO MENOS UMA versão ativa e publicada
                contextoversao: {
                    some: {
                        isAtiva: true,
                        statusValidacao: 'PUBLICADO'
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                gerencia: { select: { id: true, nome: true, sigla: true } },
                user: { select: { id: true, nome: true } }, // Autor original
                contextoversao: {
                    where: {
                        isAtiva: true, // Retorna APENAS a versão ativa
                        statusValidacao: 'PUBLICADO'
                    },
                    include: {
                        user: { select: { id: true, nome: true } },
                        versaoarquivo: true,
                        versaodashboard: true,
                        versaoindicador: true,
                    }
                }
            }
        });
        res.status(200).json(contextos);
    } catch (error) {
        console.error('Erro ao listar contextos publicados:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// A LÓGICA ME PARECE CERTA
/**
 * Rota para LISTAR Contextos PARA VALIDAÇÃO (Pendentes)
 * GET /contextos/validacao
 * Usado por: app/validar/page.tsx
 * Retorna apenas itens que o usuário logado pode validar, conforme sua regra.
 */
router.get('/validacao', async (req, res) => {
    const { role, gerenciaId, diretoriaId } = req.user; // Do authMiddleware

    let whereClause = {};

    // Define a cláusula de busca baseada no cargo do usuário
    if (role === 'GERENTE') {
        // Gerente vê o que está AGUARDANDO_GERENTE *na sua gerência*
        whereClause = {
            statusValidacao: 'AGUARDANDO_GERENTE',
            contexto: { gerenciaDonaId: gerenciaId } 
        };
    } else if (role === 'DIRETOR') {
        // Diretor vê o que está AGUARDANDO_DIRETOR *na sua diretoria*
        whereClause = {
            statusValidacao: 'AGUARDANDO_DIRETOR',
            contexto: {
                gerencia: { diretoriaId: diretoriaId } 
            }
        };
    } else if (role === 'MEMBRO') {
        // Membros veem o que ELES enviaram e está pendente de correção
        whereClause = {
            statusValidacao: 'AGUARDANDO_CORRECAO',
            solicitanteId: req.user.id
        }
    }

    // SERÁAAAAAAA? NÃO TINHA PENSADO SOBRE ISSO
    else {
        // Outros cargos (ex: SECRETARIA) podem ver tudo? 
        // Por agora, vamos permitir que vejam tudo o que está pendente.
        whereClause = {
            statusValidacao: {
                in: ['AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO']
            }
        };
    }

    try {
        const versoesPendentes = await prisma.contextoversao.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' }, // Mais antigos primeiro
            include: {
                contexto: { // Para saber o Título Conceitual, tipo, e gerência
                    include: {
                        gerencia: { select: { nome: true, sigla: true } }
                    }
                },
                user: { select: { nome: true } } // Solicitante
            }
        });
        res.status(200).json(versoesPendentes);
    } catch (error) {
        console.error('Erro ao listar contextos para validação:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/**
 * Rota para LISTAR Histórico de Validação (Timeline)
 * GET /contextos/historico
 * Usado por: app/validar/historico/page.tsx
 */
router.get('/historico', async (req, res) => {
    try {
        const historico = await prisma.validacaohistorico.findMany({
            orderBy: { timestamp: 'desc' },
            include: {
                user: { select: { nome: true } }, // Autor da ação
                contextoversao: { // Versão que sofreu a ação
                    select: {
                        id: true,
                        titulo: true,
                        versaoNumero: true,
                        contexto: { select: { tituloConceitual: true } }
                    }
                }
            }
        });
        res.status(200).json(historico);
    } catch (error) {
        console.error('Erro ao listar histórico:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ME PARECE CERTOOOO

/**
 * Rota para BUSCAR UM Contexto ÚNICO (Completo com todas as versões)
 * GET /contextos/:id
 * Usado por: components/popups/visualizarContextoModal/index.tsx
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const contexto = await prisma.contexto.findUnique({
            where: { id: id },
            include: {
                gerencia: { select: { id: true, nome: true, sigla: true } },
                user: { select: { id: true, nome: true } }, // Autor original
                contextoversao: { // Todas as versões
                    orderBy: { versaoNumero: 'desc' },
                    include: {
                        user: { select: { id: true, nome: true } }, // Solicitante da versão
                        versaoarquivo: true,
                        versaodashboard: true,
                        versaoindicador: true,
                        // Inclui o histórico de validação DESTA versão
                        validacaohistorico: {
                            orderBy: { timestamp: 'asc' },
                            include: {
                                user: { select: { nome: true } } // Autor da ação
                            }
                        }
                    }
                }
            }
        });

        if (!contexto) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }
        res.status(200).json(contexto);
    } catch (error) {
        console.error('Erro ao buscar contexto:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ME PARECE CERTOOOO
// ------------------------------------------
// --- ROTAS DE ATUALIZAÇÃO (PUT/PATCH) ---
// ------------------------------------------

/**
 * Rota para ATUALIZAR STATUS (Fluxo de Validação)
 * PUT /contextos/validar/:versaoId
 * Usado por: deferirContextoModal.tsx, IndeferirContextoModal.tsx
 * ESTA É A ROTA PRINCIPAL DO MÓDULO 4
 */
router.put('/validar/:versaoId', async (req, res) => {
    const { versaoId } = req.params;
    // statusNovo: (ex: 'AGUARDANDO_DIRETOR', 'PUBLICADO', 'INDEFERIDO', 'AGUARDANDO_CORRECAO')
    const { statusNovo, justificativa } = req.body; 
    const autorAcao = req.user; // Usuário logado (vem do authMiddleware)

    if (!statusNovo) {
        return res.status(400).json({ message: 'O "statusNovo" (novo status) é obrigatório.' });
    }

    // Validação da Justificativa
    if ((statusNovo === 'AGUARDANDO_CORRECAO' || statusNovo === 'INDEFERIDO') && !justificativa) {
        return res.status(400).json({ message: 'A justificativa é obrigatória para indeferir ou solicitar correção.' });
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Busca a versão e seus dados relacionados (contexto, gerencia)
            const versao = await tx.contextoversao.findUnique({
                where: { id: versaoId },
                include: {
                    contexto: {
                        include: {
                            gerencia: true // Para saber a diretoriaId
                        }
                    }
                }
            });

            if (!versao) throw new Error('Versão do contexto não encontrada.');

            // 2. Lógica de Permissão (REQ. 1 do Módulo 4)
            // Garante que a ação é permitida para este usuário.
            const statusAtual = versao.statusValidacao;
            const { role, gerenciaId, diretoriaId } = autorAcao;

            if (statusAtual === 'AGUARDANDO_GERENTE') {
                if (role !== 'GERENTE' || versao.contexto.gerenciaDonaId !== gerenciaId) {
                    throw new Error('Acesso negado. Apenas o Gerente da gerência dona pode aprovar/rejeitar esta etapa.');
                }
            } else if (statusAtual === 'AGUARDANDO_DIRETOR') {
                if (role !== 'DIRETOR' || versao.contexto.gerencia.diretoriaId !== diretoriaId) {
                    throw new Error('Acesso negado. Apenas um Diretor da diretoria correspondente pode aprovar/rejeitar esta etapa.');
                }
            } else {
                // Se já estiver PUBLICADO, INDEFERIDO, etc.
                throw new Error(`Ação não permitida. O contexto já está com status: ${statusAtual}`);
            }
            
            // 3. Cria o registro no histórico (REQ. 3 do Módulo 4)
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: versaoId,
                    autorId: autorAcao.id,
                    statusNovo: statusNovo,
                    justificativa: justificativa,
                }
            });

            // 4. Atualiza o status da versão (REQ. 2 do Módulo 4)
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: statusNovo }
            });

            // 5. Lógica Pós-Aprovação (Se for PUBLICADO)
            if (statusNovo === 'PUBLICADO') {
                // Desativa todas as OUTRAS versões deste contexto
                await tx.contextoversao.updateMany({
                    where: {
                        contextoId: versao.contextoId,
                        NOT: { id: versaoId } // Não desativar a si mesma
                    },
                    data: { isAtiva: false }
                });
                // Ativa a versão atual
                await tx.contextoversao.update({
                    where: { id: versaoId },
                    data: { isAtiva: true, updatedAt: new Date() } // Marca como ativa
                });
            }

            // --- Etapa 6: Lógica de Notificação (Expandida) ---

            // CASO A: Aprovado pelo Gerente -> Notificar o(s) Diretor(es)
            if (statusNovo === 'AGUARDANDO_DIRETOR') {
                const diretoriaId = versao.contexto.gerencia.diretoriaId;
                
                // 1. Achar o(s) diretor(es) daquela diretoria
                const diretores = await tx.user.findMany({
                    where: {
                        role: 'DIRETOR',
                        diretoriaId: diretoriaId,
                        id: { not: autorAcao.id } // Não notificar o autor da ação (caso um diretor aprove por um gerente)
                    },
                    select: { id: true }
                });

                // 2. Criar notificações para eles
                if (diretores.length > 0) {
                    const notificacoesData = diretores.map(dir => ({
                        id: crypto.randomUUID(),
                        destinatarioId: dir.id,
                        tipo: 'VALIDACAO',
                        titulo: `O contexto "${versao.titulo}" aguarda sua aprovação (Diretoria).`,
                        versaoId: versaoId
                    }));
                    await tx.notificacao.createMany({ data: notificacoesData });
                }
            } 
            
            // CASO B: Ação final (Aprovado, Rejeitado, Correção) -> Notificar o Solicitante
            else if (statusNovo === 'PUBLICADO' || statusNovo === 'INDEFERIDO' || statusNovo === 'AGUARDANDO_CORRECAO') {
                
                // Só notifica o solicitante se ele não for o próprio autor da ação
                if (versao.solicitanteId !== autorAcao.id) {
                    await tx.notificacao.create({
                        data: {
                            id: crypto.randomUUID(),
                            destinatarioId: versao.solicitanteId,
                            tipo: 'VALIDACAO_STATUS', // Tipo diferente para o frontend
                            titulo: `O status do contexto "${versao.titulo}" foi atualizado para ${statusNovo}`,
                            versaoId: versaoId
                        }
                    });
                }
            }

            // --- Fim da Etapa 6 ---

            return { message: `Contexto atualizado para ${statusNovo} com sucesso!` };
        });

        res.status(200).json(resultado);

    } catch (error) {
        console.error('Erro ao validar contexto:', error);
        res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
    }
});

//OBSERVARRRRRR
/**
 * Rota para ATUALIZAR DESTAQUE
 * PUT /contextos/destacar/:versaoId
 * Usado por: components/contextosCard/contextoCard.tsx (no menu '...')
 */
router.put('/destacar/:versaoId', async (req, res) => {
    const { versaoId } = req.params;
    const { isDestacado } = req.body; // true ou false
    const { role } = req.user;

    // Regra de Negócio: Apenas Diretores ou Secretarias podem destacar
    if (role !== 'DIRETOR' && role !== 'SECRETARIA') {
        return res.status(403).json({ message: 'Acesso negado. Apenas Diretores ou Secretarias podem destacar.' });
    }
    if (isDestacado === undefined) {
        return res.status(400).json({ message: 'Propriedade "isDestacado" (true/false) é obrigatória.' });
    }

    try {
        await prisma.contextoversao.update({
            where: { id: versaoId },
            data: { isDestacado: isDestacado }
        });
        res.status(200).json({ message: `Destaque atualizado para ${isDestacado}` });
    } catch (error) {
        console.error('Erro ao atualizar destaque:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


// ME PARECE CERTOOOO

// ------------------------------------------
// --- ROTA DE "DELEÇÃO" (OCULTAR) ---
// ------------------------------------------

/**
 * Rota para OCULTAR um Contexto (desativar sua versão ativa)
 * PUT /contextos/ocultar/:contextoId
 * Usado por: components/popups/ocultarContextoModal.tsx
 *
 * Esta rota NÃO apaga o contexto. Ela apenas encontra a versão
 * que está 'isAtiva = true' e a define como 'isAtiva = false'.
 */
router.put('/ocultar/:contextoId', async (req, res) => {
    const { contextoId } = req.params;
    // Pega o usuário logado (role, gerenciaId)
    const { role, gerenciaId } = req.user;

    try {
        // 1. Busca o contexto para verificar a permissão
        const contexto = await prisma.contexto.findUnique({
            where: { id: contextoId }
        });

        if (!contexto) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        // 2. Regra de Permissão (CORRIGIDA)
        // Apenas o MEMBRO da gerência dona pode ocultar.
        const isMembroDono = (role === 'MEMBRO' && contexto.gerenciaDonaId === gerenciaId);

        if (!isMembroDono) {
            return res.status(403).json({ 
                message: 'Acesso negado. Apenas um membro da gerência dona pode ocultar este contexto.' 
            });
        }

        // 3. Ação de Ocultar
        // Encontra todas as versões ativas (isAtiva = true) deste contexto...
        // ... e as define como inativas (isAtiva = false).
        const updateResult = await prisma.contextoversao.updateMany({
            where: {
                contextoId: contextoId,
                isAtiva: true // Só afeta as versões atualmente publicadas
            },
            data: {
                isAtiva: false, // Define como inativo
                updatedAt: new Date()
            }
        });

        if (updateResult.count === 0) {
            // O contexto existia, mas não tinha nenhuma versão *ativa* para ocultar.
            return res.status(200).json({ 
                message: 'Contexto já estava oculto (nenhuma versão ativa). Nenhuma alteração foi necessária.' 
            });
        }

        res.status(200).json({ message: 'Contexto ocultado com sucesso. A versão ativa foi desativada.' });

    } catch (error) {
        console.error('Erro ao ocultar contexto:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


module.exports = router;