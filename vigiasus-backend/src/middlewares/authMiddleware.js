const jwt = require('jsonwebtoken');

// Simple JWT auth middleware.
// - Expects header: Authorization: Bearer <token>
// - Verifies with JWT_SECRET (env) and attaches decoded user to req.user
// - Use optional role guard: authMiddleware(['GERENTE', 'DIRETOR'])
module.exports = function authMiddleware(allowedRoles) {
    return function (req, res, next) {
        try {
            const auth = req.headers['authorization'] || '';
            const [, token] = auth.split(' ');
            if (!token) {
                return res.status(401).json({ message: 'Token ausente' });
            }

            const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
            const payload = jwt.verify(token, secret);
            req.user = payload; // { id, email, role, ... }

            if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
                if (!payload.role || !allowedRoles.includes(payload.role)) {
                    return res.status(403).json({ message: 'Acesso negado' });
                }
            }
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    };
};
