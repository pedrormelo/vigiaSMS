const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/dashboardController');

// Public read of a diretoria's dashboard layout
router.get('/:diretoriaId', ctrl.getLayout);
// Save layout - requires auth; controller enforces director/directoria match
router.post('/:diretoriaId', auth(), ctrl.saveLayout);
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
