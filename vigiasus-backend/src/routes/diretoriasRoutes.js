const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/diretoriasController');

router.get('/', ctrl.listAll);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getById);
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
