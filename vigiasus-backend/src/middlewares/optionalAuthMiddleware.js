const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

/**
 * Optional authentication middleware.
 * - If a valid Bearer token is present, attaches the user to req.user.
 * - If the token is missing or invalid, the request proceeds without a user.
 * - When allowedRoles is provided, the user is only attached if their role is included.
 */
module.exports = function optionalAuthMiddleware(allowedRoles) {
    return async function (req, res, next) {
        const authHeader = req.headers['authorization'] || '';
        const [, token] = authHeader.split(' ');

        if (!token) {
            return next();
        }

        try {
            const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
            const payload = jwt.verify(token, secret);
            const user = await prisma.user.findUnique({ where: { id: payload.id } });

            if (!user) {
                return next();
            }

            if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return next();
            }

            req.user = {
                id: user.id,
                cpf: user.cpf,
                role: user.role,
                gerenciaId: user.gerenciaId || null,
                diretoriaId: user.diretoriaId || null,
            };
        } catch (error) {
            // Falha silenciosa: segue como usuário público
        }

        return next();
    };
};
