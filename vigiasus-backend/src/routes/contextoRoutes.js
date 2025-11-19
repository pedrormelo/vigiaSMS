// src/routes/contextoRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/contextoController'); // Aqui importamos como 'ctrl'
const upload = require('../config/uploadsConfig');

// Públicos
router.get('/publicados', ctrl.listPublicados);

// Protegidos
router.get('/pendentes', auth(['GERENTE', 'DIRETOR', 'MEMBRO']), ctrl.listPendentes);

// Criação
router.post('/', auth(['MEMBRO']), upload.single('file'), ctrl.createContexto);
router.post('/:contextoId/versoes', auth(['MEMBRO']), upload.single('file'), ctrl.createVersao);

// Ações de validação
router.post('/versoes/:versaoId/gerente-aprovar', auth(['GERENTE']), ctrl.gerenteAprovar);
router.post('/versoes/:versaoId/diretor-publicar', auth(['DIRETOR']), ctrl.diretorPublicar);
router.post('/versoes/:versaoId/diretor-indeferir', auth(['DIRETOR']), ctrl.diretorIndeferir);
router.post('/versoes/:versaoId/solicitar-correcao', auth(['GERENTE', 'DIRETOR']), ctrl.solicitarCorrecao);
// Destaque (Secretaria)
router.post('/versoes/:versaoId/destacar', auth(['DIRETOR']), ctrl.marcarDestaque);
router.post('/versoes/:versaoId/remover-destaque', auth(['DIRETOR']), ctrl.removerDestaque);

// Detalhes e Busca
router.get('/detalhes/:contextoId', ctrl.getDetalhes);
router.get('/buscar', auth(), ctrl.buscar);

// --- CORREÇÃO AQUI ---
// Usamos 'ctrl' porque foi assim que importamos lá em cima
router.get('/:versaoId/participantes', auth(), ctrl.listarParticipantes);
// ---------------------

module.exports = router;