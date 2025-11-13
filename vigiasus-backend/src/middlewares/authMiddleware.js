const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

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
            // Enrich with current DB user info (role/relations may have changed)
            prisma.user.findUnique({ where: { id: payload.id } })
                .then(user => {
                    if (!user) return res.status(401).json({ message: 'Usuário inválido' });
                    req.user = {
                        id: user.id,
                        cpf: user.cpf,
                        role: user.role,
                        gerenciaId: user.gerenciaId || null,
                        diretoriaId: user.diretoriaId || null,
                    };
                    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
                        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
                            return res.status(403).json({ message: 'Acesso negado' });
                        }
                    }
                    next();
                })
                .catch(() => res.status(401).json({ message: 'Token inválido' }));
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    };
};
