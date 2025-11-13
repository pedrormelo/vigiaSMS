const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/notificacoesController');

// List notifications for current user
router.get('/', auth(), ctrl.listForUser);
// Mark a notification as read
router.post('/:id/ler', auth(), ctrl.markAsRead);
// Simple health check (optional)
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
