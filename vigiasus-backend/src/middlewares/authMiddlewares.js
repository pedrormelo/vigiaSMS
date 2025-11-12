const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação
 * Verifica o token JWT em todas as rotas protegidas
 */
const authMiddleware = (req, res, next) => {
    // Pega o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;

    // 1. Verifica se o cabeçalho de autorização existe
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido. Acesso negado.' });
    }

    // O cabeçalho vem no formato "Bearer <token>"
    // Precisamos separar e pegar apenas o token
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token em formato inválido.' });
    }

    const token = parts[1];

    try {
        // 2. Verifica se o token é válido
        // Usaremos um segredo que será armazenado em .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Se for válido, anexa os dados do usuário (payload) à requisição
        // Isso permite que nossas rotas saibam QUEM está fazendo a requisição
        req.user = decoded; // Ex: { id: 'uuid-do-usuario', role: 'GERENTE' }

        // 4. Passa para a próxima etapa (a rota que o usuário quer acessar)
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;