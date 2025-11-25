// source/routes/gerenciasRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gerenciasController');
const contextoCtrl = require('../controllers/contextoController');
const optionalAuth = require('../middlewares/optionalAuthMiddleware');

router.get('/:gerenciaId/contextos', optionalAuth(), contextoCtrl.getContextosDaGerencia);

// Rotas existentes de Gerência
router.get('/', ctrl.listAll);
router.get('/pordiretoria/:diretoriaId', ctrl.listByDiretoria);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/health', (req, res) => res.json({ ok: true }));

// Rota genérica por ID (deve ficar por último para não conflitar com rotas específicas se houver)
router.get('/:id', ctrl.getById);

module.exports = router;