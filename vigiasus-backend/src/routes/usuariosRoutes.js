// source/routes/usuariosRoutes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');
const auth = require('../middlewares/authMiddleware');

// Definição de quem pode gerenciar usuários
// Se quiser que SECRETARIA também gerencie, adicione à lista: ['ADMIN', 'SECRETARIA']
const MANAGERS = ['ADMIN']; 

// Listar todos (GET /)
router.get('/', auth(MANAGERS), ctrl.listAll);

// Buscar um (GET /:id)
router.get('/:id', auth(MANAGERS), ctrl.getById);

// Criar (POST /)
router.post('/', auth(MANAGERS), ctrl.create);

// Atualizar (PUT /:id)
router.put('/:id', auth(MANAGERS), ctrl.update);

// Excluir (DELETE /:id)
router.delete('/:id', auth(MANAGERS), ctrl.delete);

// Resetar Senha (PATCH /:id/reset-password)
router.patch('/:id/reset-password', auth(MANAGERS), ctrl.resetPassword);

module.exports = router;