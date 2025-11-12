// Canonical roles (match Prisma enum user_role)
const Roles = {
    MEMBRO: 'MEMBRO',
    GERENTE: 'GERENTE',
    DIRETOR: 'DIRETOR',
    SECRETARIA: 'SECRETARIA',
};

// Lowercase mapping useful for frontends expecting lowercase tokens
const RoleClientTokens = {
    [Roles.MEMBRO]: 'membro',
    [Roles.GERENTE]: 'gerente',
    [Roles.DIRETOR]: 'diretor',
    [Roles.SECRETARIA]: 'secretaria',
};

module.exports = { Roles, RoleClientTokens };
