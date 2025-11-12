const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
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

// ------------------------------------------
// --- ROTAS DE CRIAÇÃO (POST) ---
// ------------------------------------------

/**
 * Rota para CRIAR um novo Contexto
 * POST /contextos
 * (Já implementado anteriormente, mantido aqui)
 */
router.post(
    '/',
    upload.single('arquivo'), 
    async (req, res) => {
        const {
            tituloConceitual,
            gerenciaDonaId,
            tipo, 
            titulo,
            descricao,
            motivoNovaVersao, // Adicionado
            url, 
            payload, 
            tipoGrafico, // Adicionado
            valorAtual, // Adicionado
            valorAlvo,
            unidade,
            textoComparativo,
            cor,
            icone
        } = req.body;

        const autorId = req.user.id; 

        if (!tituloConceitual || !gerenciaDonaId || !tipo || !titulo) {
            return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
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
                        statusValidacao: 'AGUARDANDO_GERENTE', 
                        isAtiva: false, 
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                // Etapa C: Salva os dados específicos do TIPO
                switch (tipo) {
                    case 'ARQUIVO_LINK':
                        if (req.file) { 
                            await tx.versaoarquivo.create({
                                data: {
                                    id: crypto.randomUUID(),
                                    versaoId: novaVersao.id,
                                    url: req.file.path, 
                                    docType: mapMimeToDocType(req.file.mimetype)
                                }
                            });
                        } else if (url) { 
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
                                tipoGrafico: tipoGrafico, //
                                payload: payload, 
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
                                valorAtual: parseFloat(valorAtual), //
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

                // (Opcional: Criar notificação para o gerente da gerenciaDonaId)

                return { novoContexto, novaVersao };
            });

            res.status(201).json({
                message: 'Contexto criado e enviado para validação!',
                contexto: resultado.novoContexto
            });

        } catch (error) {
            console.error('Erro ao criar contexto:', error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
        }
    }
);

// ------------------------------------------
// --- ROTAS DE LEITURA (GET) ---
// ------------------------------------------

/**
 * Rota para LISTAR todos os Contextos (Visão Admin)
 * GET /contextos
 * (Já implementado anteriormente, mantido aqui)
 */
router.get('/', async (req, res) => {
    try {
        const contextos = await prisma.contexto.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                gerencia: { select: { id: true, nome: true, sigla: true } },
                user: { select: { id: true, nome: true } }, // Autor original
                contextoversao: {
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
                user: { select: { id: true, nome: true } },
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


/**
 * Rota para LISTAR Contextos PARA VALIDAÇÃO (Pendentes)
 * GET /contextos/validacao
 * Usado por: app/validar/page.tsx
 * Retorna apenas itens que o usuário logado pode validar.
 */
router.get('/validacao', async (req, res) => {
    const { role, gerenciaId, diretoriaId } = req.user;

    let whereClause = {};

    // Define a cláusula de busca baseada no cargo do usuário
    if (role === 'GERENTE') {
        whereClause = {
            statusValidacao: 'AGUARDANDO_GERENTE',
            contexto: { gerenciaDonaId: gerenciaId } // Só pode ver da sua gerência
        };
    } else if (role === 'DIRETOR') {
        whereClause = {
            statusValidacao: 'AGUARDANDO_DIRETOR',
            contexto: {
                gerencia: { diretoriaId: diretoriaId } // Só pode ver da sua diretoria
            }
        };
    } else if (role === 'MEMBRO') {
         // Membros veem o que ELES enviaram e está pendente de correção
         whereClause = {
            statusValidacao: 'AGUARDANDO_CORRECAO',
            solicitanteId: req.user.id
         }
    }
     else {
        // Outros cargos (ex: SECRETARIA) podem ver tudo? (Defina sua regra)
        // Por enquanto, vamos deixar que vejam tudo pendente.
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
                contexto: { // Para saber o Título Conceitual, tipo, etc.
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
 * Rota para LISTAR Histórico de Validação
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

/**
 * Rota para BUSCAR UM Contexto ÚNICO (Completo)
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


// ------------------------------------------
// --- ROTAS DE ATUALIZAÇÃO (PUT/PATCH) ---
// ------------------------------------------

/**
 * Rota para ATUALIZAR STATUS (Fluxo de Validação)
 * PUT /contextos/validar/:versaoId
 * Usado por: deferirContextoModal.tsx, IndeferirContextoModal.tsx
 */
router.put('/validar/:versaoId', async (req, res) => {
    const { versaoId } = req.params;
    const { statusNovo, justificativa } = req.body; // Ex: 'PUBLICADO', 'INDEFERIDO', 'AGUARDANDO_CORRECAO'
    const autorAcao = req.user; // Usuário logado (vem do authMiddleware)

    if (!statusNovo) {
        return res.status(400).json({ message: 'O "statusNovo" é obrigatório.' });
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Busca a versão e seus dados relacionados
            const versao = await tx.contextoversao.findUnique({
                where: { id: versaoId },
                include: {
                    contexto: {
                        include: {
                            gerencia: true // Para saber a diretoria
                        }
                    }
                }
            });

            if (!versao) throw new Error('Versão do contexto não encontrada.');

            // 2. Lógica de Permissão (Baseado no seu frontend `podeTransitar.ts`)
            const statusAtual = versao.statusValidacao;
            const role = autorAcao.role;
            const gerenciaId = autorAcao.gerenciaId;
            const diretoriaId = autorAcao.diretoriaId;

            //
            if (statusAtual === 'AGUARDANDO_GERENTE') {
                if (role !== 'GERENTE' || versao.contexto.gerenciaDonaId !== gerenciaId) {
                    throw new Error('Apenas o gerente da gerência dona pode aprovar esta etapa.');
                }
            } else if (statusAtual === 'AGUARDANDO_DIRETOR') {
                 if (role !== 'DIRETOR' || versao.contexto.gerencia.diretoriaId !== diretoriaId) {
                    throw new Error('Apenas um diretor da diretoria dona pode aprovar esta etapa.');
                }
            }
            // (Membros podem reenviar 'AGUARDANDO_CORRECAO', mas isso é uma *nova versão*, não esta rota)

            // 3. Cria o registro no histórico
            //
            await tx.validacaohistorico.create({
                data: {
                    id: crypto.randomUUID(),
                    versaoId: versaoId,
                    autorId: autorAcao.id,
                    statusNovo: statusNovo,
                    justificativa: justificativa,
                }
            });

            // 4. Atualiza o status da versão
            await tx.contextoversao.update({
                where: { id: versaoId },
                data: { statusValidacao: statusNovo }
            });
            
            // 5. Lógica Pós-Aprovação
            if (statusNovo === 'PUBLICADO') {
                // Desativa todas as OUTRAS versões deste contexto
                await tx.contextoversao.updateMany({
                    where: {
                        contextoId: versao.contextoId,
                        NOT: { id: versaoId }
                    },
                    data: { isAtiva: false }
                });
                // Ativa a versão atual
                await tx.contextoversao.update({
                    where: { id: versaoId },
                    data: { isAtiva: true, updatedAt: new Date() } // Marca como ativa
                });
            }

            // 6. Criar Notificação
            let destinatarioId = versao.solicitanteId; // Por padrão, notifica o solicitante
            let tituloNotif = `Status do contexto "${versao.titulo}" atualizado para ${statusNovo}`;

            if (statusNovo === 'AGUARDANDO_DIRETOR') {
                // TODO: Achar os diretores da diretoria
                // Esta lógica é complexa, pode ser implementada depois
                tituloNotif = `Contexto "${versao.titulo}" aguardando sua aprovação.`;
            }
            
            //
            await tx.notificacao.create({
                 data: {
                    id: crypto.randomUUID(),
                    destinatarioId: destinatarioId,
                    tipo: 'VALIDACAO',
                    titulo: tituloNotif,
                    versaoId: versaoId
                 }
            });

            return { message: `Contexto atualizado para ${statusNovo} com sucesso!` };
        });

        res.status(200).json(resultado);

    } catch (error) {
        console.error('Erro ao validar contexto:', error);
        res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
    }
});


/**
 * Rota para ATUALIZAR DESTAQUE
 * PUT /contextos/destacar/:versaoId
 * Usado por: components/contextosCard/contextoCard.tsx (no menu '...')
 */
router.put('/destacar/:versaoId', async (req, res) => {
    const { versaoId } = req.params;
    const { isDestacado } = req.body; // true ou false
    const { role } = req.user;

    // Apenas Diretores ou Secretarias podem destacar
    if (role !== 'DIRETOR' && role !== 'SECRETARIA') {
        return res.status(403).json({ message: 'Acesso negado. Apenas Diretores podem destacar.' });
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

// ------------------------------------------
// --- ROTAS DE DELEÇÃO (DELETE) ---
// ------------------------------------------

/**
 * Rota para DELETAR um Contexto
 * DELETE /contextos/:id
 * Usado por: components/popups/ocultarContextoModal.tsx
 * Deleta o contexto PAI, e o Prisma (schema) deleta tudo em cascata.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { role, gerenciaId } = req.user;

    try {
        const contexto = await prisma.contexto.findUnique({
            where: { id: id }
        });

        if (!contexto) {
            return res.status(404).json({ message: 'Contexto não encontrado.' });
        }

        // Regra de permissão: Apenas o Gerente da gerência dona ou um Diretor
        if (role !== 'DIRETOR' && (role !== 'GERENTE' || contexto.gerenciaDonaId !== gerenciaId)) {
             return res.status(403).json({ message: 'Acesso negado. Apenas o gerente dono ou um diretor podem deletar.' });
        }

        // Graças ao 'onDelete: Cascade' no schema.prisma, 
        // deletar o contexto remove todas as versões, arquivos, dashboards,
        // indicadores, comentários, etc.
        //
        await prisma.contexto.delete({
            where: { id: id }
        });

        res.status(200).json({ message: 'Contexto e todas as suas versões foram deletados com sucesso.' });

    } catch (error) {
        console.error('Erro ao deletar contexto:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


module.exports = router;