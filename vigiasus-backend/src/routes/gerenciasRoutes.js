const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gerenciasController');

router.get('/', ctrl.listAll);
router.get('/pordiretoria/:diretoriaId', ctrl.listByDiretoria);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getById);
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
