// Rotas de Contextos e Versões
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/contextoController');

// Públicos
router.get('/publicados', ctrl.listPublicados);

// Protegidos
router.get('/pendentes', auth(['GERENTE', 'DIRETOR']), ctrl.listPendentes);
router.post('/', auth(['MEMBRO']), ctrl.createContexto);
router.post('/:contextoId/versoes', auth(['MEMBRO']), ctrl.createVersao);

// Ações de validação
router.post('/versoes/:versaoId/gerente-aprovar', auth(['GERENTE']), ctrl.gerenteAprovar);
router.post('/versoes/:versaoId/diretor-publicar', auth(['DIRETOR']), ctrl.diretorPublicar);
router.post('/versoes/:versaoId/diretor-indeferir', auth(['DIRETOR']), ctrl.diretorIndeferir);
router.post('/versoes/:versaoId/solicitar-correcao', auth(['GERENTE', 'DIRETOR']), ctrl.solicitarCorrecao);

// Busca e detalhes
router.get('/detalhes/:contextoId', ctrl.getDetalhes); // público se publicado; protegido caso não-publicado
router.get('/buscar', auth(), ctrl.buscar); // autenticado para consultas amplas

module.exports = router;
