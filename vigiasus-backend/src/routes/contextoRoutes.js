// source/routes/contextoRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/contextoController');
<<<<<<< HEAD
// Importar a configuração do Multer
=======
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
const upload = require('../config/uploadsConfig');

// Públicos
router.get('/publicados', ctrl.listPublicados);

// Protegidos
router.get('/pendentes', auth(['GERENTE', 'DIRETOR', 'MEMBRO']), ctrl.listPendentes);
<<<<<<< HEAD

// --- ALTERAÇÃO AQUI ---
// Adicionamos 'upload.single("file")' para permitir o envio de arquivos (PDFs)
// O campo no formulário do frontend deve se chamar "file"
router.post('/', auth(['MEMBRO']), upload.single('file'), ctrl.createContexto);
// ----------------------

router.post('/:contextoId/versoes', auth(['MEMBRO']), upload.single('file'), ctrl.createVersao);
=======
router.post('/', auth(['MEMBRO']), upload.single('arquivo'), ctrl.createContexto);
router.post('/:contextoId/versoes', auth(['MEMBRO']), upload.single('arquivo'), ctrl.createVersao);
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836

// Ações de validação
router.post('/versoes/:versaoId/gerente-aprovar', auth(['GERENTE']), ctrl.gerenteAprovar);
router.post('/versoes/:versaoId/diretor-publicar', auth(['DIRETOR']), ctrl.diretorPublicar);
router.post('/versoes/:versaoId/diretor-indeferir', auth(['DIRETOR']), ctrl.diretorIndeferir);
router.post('/versoes/:versaoId/solicitar-correcao', auth(['GERENTE', 'DIRETOR']), ctrl.solicitarCorrecao);

<<<<<<< HEAD
router.get('/detalhes/:contextoId', ctrl.getDetalhes);
router.get('/buscar', auth(), ctrl.buscar);
=======
// Visibilidade (ocultar/reexibir)
router.post('/:contextoId/ocultar', auth(['GERENTE', 'DIRETOR']), ctrl.ocultarContexto);
router.post('/:contextoId/reexibir', auth(['GERENTE', 'DIRETOR']), ctrl.reexibirContexto);
router.post('/versoes/:versaoId/ocultar', auth(['GERENTE', 'DIRETOR']), ctrl.ocultarVersao);
router.post('/versoes/:versaoId/reexibir', auth(['GERENTE', 'DIRETOR']), ctrl.reexibirVersao);

// Busca e detalhes
router.get('/detalhes/:contextoId', ctrl.getDetalhes); // público se publicado; protegido caso não-publicado
router.get('/buscar', auth(), ctrl.buscar); // autenticado para consultas amplas
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836

module.exports = router;