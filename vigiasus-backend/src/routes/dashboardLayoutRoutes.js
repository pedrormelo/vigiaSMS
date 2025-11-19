const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/dashboardController');

// Highlights for Secretaria (must be before param route)
router.get('/destaques', ctrl.getHighlights);
router.get('/destaques/kpis', ctrl.getKpiHighlights);

// Diretoria KPI selection endpoints
router.get('/:diretoriaId/kpis/available', auth(), ctrl.getAvailableKpis);
router.get('/:diretoriaId/kpis', ctrl.getKpis);
router.post('/:diretoriaId/kpis', auth(), ctrl.saveKpis);

// Public read of a diretoria's dashboard layout
router.get('/:diretoriaId', ctrl.getLayout);
// Save layout - requires auth; controller enforces director/directoria match
router.post('/:diretoriaId', auth(), ctrl.saveLayout);
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
