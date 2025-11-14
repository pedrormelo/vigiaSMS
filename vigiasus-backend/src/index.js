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
const contextoRoutes = require('./routes/contextoRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const diretoriasRoutes = require('./routes/diretoriasRoutes');
const gerenciasRoutes = require('./routes/gerenciasRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const dashboardLayoutRoutes = require('./routes/dashboardLayoutRoutes');

const app = express();
// DB clients
const prisma = require('./config/prismaClient');
const mysqlRaw = require('./config/db');

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
app.use('/contextos', contextoRoutes); // cada rota define seu próprio guard
app.use('/diretorias', diretoriasRoutes); // leitura pública; futuros writes exigirão auth
app.use('/gerencias', gerenciasRoutes); // leitura pública
app.use('/notificacoes', notificacaoRoutes); // auth handled inside route definitions
app.use('/comentarios', comentarioRoutes); // auth enforced per-route
app.use('/dashboardlayout', dashboardLayoutRoutes);

// Rotas básicas úteis (root + health) antes das rotas de negócio
app.get('/', (req, res) => {
    res.json({
        name: 'VigiaSUS API',
        version: '1.0.0',
        time: new Date().toISOString(),
        endpoints: [
            'GET /auth/me',
            'POST /auth/login',
            'GET /usuarios',
            'GET /contextos/publicados',
            'GET /contextos/pendentes',
            'GET /diretorias',
            'GET /gerencias',
            'GET /notificacoes',
            'GET /dashboardlayout/:diretoriaId'
        ]
    });
});

app.get('/health', async (req, res) => {
    const start = Date.now();
    let prismaStatus = 'up';
    let prismaLatency = null;
    let mysqlStatus = 'up';
    let mysqlLatency = null;
    let errorDetails = null;
    try {
        const pStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        prismaLatency = Date.now() - pStart;
    } catch (e) {
        prismaStatus = 'error';
        errorDetails = errorDetails || {};
        errorDetails.prisma = e.message;
    }
    try {
        const mStart = Date.now();
        await mysqlRaw.query('SELECT 1');
        mysqlLatency = Date.now() - mStart;
    } catch (e) {
        mysqlStatus = 'error';
        errorDetails = errorDetails || {};
        errorDetails.mysql = e.message;
    }
    const overall = (prismaStatus === 'up' && mysqlStatus === 'up') ? 'ok' : 'degraded';
    res.status(overall === 'ok' ? 200 : 503).json({
        status: overall,
        uptimeSeconds: process.uptime(),
        timestamp: Date.now(),
        prisma: { status: prismaStatus, latencyMs: prismaLatency },
        mysql: { status: mysqlStatus, latencyMs: mysqlLatency },
        durationMs: Date.now() - start,
        errors: errorDetails || undefined,
    });
});

// Porta configurável via .env (fallback 3001 para não colidir com Next.js em 3000)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
