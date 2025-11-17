// source/routes/contextoRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/contextoController');
// Importar a configuração do Multer
const upload = require('../config/uploadsConfig');

// Públicos
router.get('/publicados', ctrl.listPublicados);

// Protegidos
router.get('/pendentes', auth(['GERENTE', 'DIRETOR', 'MEMBRO']), ctrl.listPendentes);

// --- ALTERAÇÃO AQUI ---
// Adicionamos 'upload.single("file")' para permitir o envio de arquivos (PDFs)
// O campo no formulário do frontend deve se chamar "file"
router.post('/', auth(['MEMBRO']), upload.single('file'), ctrl.createContexto);
// ----------------------

router.post('/:contextoId/versoes', auth(['MEMBRO']), upload.single('file'), ctrl.createVersao);

// Ações de validação
router.post('/versoes/:versaoId/gerente-aprovar', auth(['GERENTE']), ctrl.gerenteAprovar);
router.post('/versoes/:versaoId/diretor-publicar', auth(['DIRETOR']), ctrl.diretorPublicar);
router.post('/versoes/:versaoId/diretor-indeferir', auth(['DIRETOR']), ctrl.diretorIndeferir);
router.post('/versoes/:versaoId/solicitar-correcao', auth(['GERENTE', 'DIRETOR']), ctrl.solicitarCorrecao);

router.get('/detalhes/:contextoId', ctrl.getDetalhes);
router.get('/buscar', auth(), ctrl.buscar);

module.exports = router;