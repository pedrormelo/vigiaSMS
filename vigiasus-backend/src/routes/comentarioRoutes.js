const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/comentariosController');

router.get('/:versaoId', auth(), ctrl.listByVersao);
router.post('/:versaoId', auth(), ctrl.addComentario);
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
