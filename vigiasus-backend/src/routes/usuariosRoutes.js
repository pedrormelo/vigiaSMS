// Rotas de usuários
// GET    /usuarios       -> lista usuários
// POST   /usuarios       -> cria usuário (requer papel adequado)

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');
const auth = require('../middlewares/authMiddleware');

// Exige apenas usuário autenticado para listar
router.get('/', auth(), ctrl.list);

// Exige um papel específico para criar (SECRETARIA ou DIRETOR)
router.post('/', auth(['SECRETARIA', 'DIRETOR']), ctrl.create);

module.exports = router;
