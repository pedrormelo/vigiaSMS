// Inicialização de variáveis de ambiente
require('dotenv').config();
// Dependências principais
const cors = require('cors');
const express = require('express');

// Middleware de autenticação (factory que aceita lista de roles)
const auth = require('./middlewares/authMiddleware.js');

// Rotas existentes (algumas ainda serão implementadas)
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
// TODO: implementar e então ativar estas rotas abaixo
// const contextoRoutes = require('./routes/contextoRoutes');
// const diretoriasRoutes = require('./routes/diretoriasRoutes');
// const gerenciasRoutes = require('./routes/gerenciasRoutes');
// const notificacaoRoutes = require('./routes/notificacaoRoutes');
// const comentarioRoutes = require('./routes/comentarioRoutes');
// const dashboardLayoutRoutes = require('./routes/dashboardLayoutRoutes');

const app = express();

// Lista de origens permitidas. Adicionamos localhost:3000 (Next.js) além das já existentes.
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://10.87.20.9:3006',
];

// CORS com whitelist simples + suporte a cookies (credentials)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // requests sem origin (ex: curl) são liberadas
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json()); // parse de JSON no corpo das requisições

// Rota pública de autenticação (login & me)
app.use('/auth', authRoutes);

// Rotas protegidas. Chamamos auth() SEM roles => qualquer usuário autenticado.
// Para restringir: app.use('/usuarios', auth(['SECRETARIA','DIRETOR']), usuariosRoutes)
app.use('/usuarios', auth(), usuariosRoutes);

// Placeholder para futuras rotas protegidas:
// app.use('/contextos', auth(), contextoRoutes);
// app.use('/diretorias', auth(), diretoriasRoutes);
// app.use('/gerencias', auth(), gerenciasRoutes);
// app.use('/notificacoes', auth(), notificacaoRoutes);
// app.use('/comentarios', auth(), comentarioRoutes);
// app.use('/dashboardlayout', auth(), dashboardLayoutRoutes);

// Porta configurável via .env (fallback 3000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
