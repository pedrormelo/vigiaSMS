//config
require('dotenv').config();
//req
const cors = require('cors');
const express = require('express');

//middlewares
const auth = require('./middlewares/authMiddleware.js');

//rotas
const authRoutes = require('./routes/authRoutes');
const contextosRoutes = require('./routes/contextosRoutes');
const diretoriasRoutes = require('./routes/diretoriasRoutes');
const gerenciaRoutes = require('./routes/gerenciaRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const dashboardLayoutRoutes = require('./routes/dashboardLayoutRoutes');

const app = express();

//origins permitidas
const allowedOrigins = [
    'http://localhost:3001',
    'http://10.87.20.9:3006',
];

//função de só permitir requisições de origens específicas
app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());

app.use('/auth', authRoutes); //rota login

app.use(auth); //middleware de autenticação

//rotas protegidas
app.use('/usuarios', usuariosRoutes);
app.use('/diretorias', diretoriasRoutes);
app.use('/gerencias', gerenciaRoutes);
app.use('/contextos', contextosRoutes);
app.use('/notificacoes', notificacaoRoutes);
app.use('/comentarios', comentarioRoutes);
app.use('/dashboardlayout', dashboardLayoutRoutes);

//constante de porta do servidor backend
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
