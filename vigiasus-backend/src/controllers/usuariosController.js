// Controller de Usuários
// Objetivo: endpoints simples para listar e criar usuários (admin/secretaria)
// Obs.: Em produção, refine validações e sanitize de inputs.

const bcrypt = require('bcryptjs');
const prisma = require('../config/prismaClient');

function mapUser(model) {
    if (!model) return null;
    return {
        id: model.id,
        cpf: model.cpf,
        name: model.nome,
        email: model.email,
        role: model.role.toLowerCase(),
        diretoriaId: model.diretoriaId || null,
        gerenciaId: model.gerenciaId || null,
        createdAt: model.createdAt,
    };
}

// GET /usuarios
    
exports.list = async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json({ data: users.map(mapUser) });
    } catch (err) {
        console.error('Erro list users:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
}

// POST /usuarios
// body: { nome, email, password, role, diretoriaId?, gerenciaId? }
exports.create = async (req, res) => {
    try {
        const { nome, cpf, email, password, role, diretoriaId, gerenciaId } = req.body || {};
        if (!nome || !cpf || !email || !password || !role) {
            return res.status(400).json({ message: 'nome, cpf, email, password e role são obrigatórios' });
        }
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ message: 'Email já cadastrado' });

        const passwordHash = await bcrypt.hash(password, 10);
        const created = await prisma.user.create({
            data: { nome, cpf, email, passwordHash, role, diretoriaId: diretoriaId || null, gerenciaId: gerenciaId || null },
        });
        return res.status(201).json({ user: mapUser(created) });
    } catch (err) {
        console.error('Erro create user:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
}




