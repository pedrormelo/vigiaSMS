const express = require('express');
const router = express.Router();

// TODO: implementar endpoints reais
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
