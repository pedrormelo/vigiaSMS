// Rotas de autenticação
// /auth/login  -> POST (email, password)
// /auth/me     -> GET (retorna usuário atual baseado no token)

const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// Login não requer token
router.post('/login', login);

// /auth/me exige token válido; usamos auth() sem roles específicas
router.get('/me', auth(), me);

module.exports = router;