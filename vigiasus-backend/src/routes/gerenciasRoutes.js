// source/routes/gerenciasRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gerenciasController');
// IMPORTANTE: Importar o controller de contextos para usar a função de listagem
const contextoCtrl = require('../controllers/contextoController');

router.get('/:gerenciaId/contextos', contextoCtrl.getContextosDaGerencia);

// Rotas existentes de Gerência
router.get('/', ctrl.listAll);
router.get('/pordiretoria/:diretoriaId', ctrl.listByDiretoria);
router.get('/slug/:slug', ctrl.getBySlug);

// --- NOVA ROTA ADICIONADA ---
// Esta rota intercepta o pedido do frontend: /gerencias/{id}/contextos
router.get('/:gerenciaId/contextos', contextoCtrl.listByGerencia);
// ----------------------------

// Rota genérica por ID (deve ficar por último para não conflitar com rotas específicas se houver)
router.get('/:id', ctrl.getById);

router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;