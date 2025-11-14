// Rotas de Contextos e Versões
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/contextoController');
const upload = require('../config/uploadsConfig');

// Públicos
router.get('/publicados', ctrl.listPublicados);

// Protegidos
// Permite MEMBRO visualizar suas pendências de correção, e GERENTE/DIRETOR suas filas de aprovação
router.get('/pendentes', auth(['GERENTE', 'DIRETOR', 'MEMBRO']), ctrl.listPendentes);
router.post('/', auth(['MEMBRO']), upload.single('arquivo'), ctrl.createContexto);
router.post('/:contextoId/versoes', auth(['MEMBRO']), upload.single('arquivo'), ctrl.createVersao);

// Ações de validação
router.post('/versoes/:versaoId/gerente-aprovar', auth(['GERENTE']), ctrl.gerenteAprovar);
router.post('/versoes/:versaoId/diretor-publicar', auth(['DIRETOR']), ctrl.diretorPublicar);
router.post('/versoes/:versaoId/diretor-indeferir', auth(['DIRETOR']), ctrl.diretorIndeferir);
router.post('/versoes/:versaoId/solicitar-correcao', auth(['GERENTE', 'DIRETOR']), ctrl.solicitarCorrecao);

// Visibilidade (ocultar/reexibir)
router.post('/:contextoId/ocultar', auth(['GERENTE', 'DIRETOR']), ctrl.ocultarContexto);
router.post('/:contextoId/reexibir', auth(['GERENTE', 'DIRETOR']), ctrl.reexibirContexto);
router.post('/versoes/:versaoId/ocultar', auth(['GERENTE', 'DIRETOR']), ctrl.ocultarVersao);
router.post('/versoes/:versaoId/reexibir', auth(['GERENTE', 'DIRETOR']), ctrl.reexibirVersao);

// Busca e detalhes
router.get('/detalhes/:contextoId', ctrl.getDetalhes); // público se publicado; protegido caso não-publicado
router.get('/buscar', auth(), ctrl.buscar); // autenticado para consultas amplas

module.exports = router;
