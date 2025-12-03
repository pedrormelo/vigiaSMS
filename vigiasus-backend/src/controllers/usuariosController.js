// source/controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const prisma = require('../config/prismaClient');

function mapUser(model) {
    if (!model) return null;
    return {
        id: model.id,
        cpf: model.cpf,
        nome: model.nome,
        email: model.email,
        role: model.role ? model.role.toUpperCase() : 'MEMBRO', // Padronizar em Uppercase para o front
        diretoriaId: model.diretoriaId || null,
        gerenciaId: model.gerenciaId || null,
        createdAt: model.createdAt,
        // Inclui dados populados se existirem
        diretoria: model.diretoria ? { id: model.diretoria.id, nome: model.diretoria.nome, slug: model.diretoria.slug } : null,
        gerencia: model.gerencia ? { id: model.gerencia.id, nome: model.gerencia.nome, slug: model.gerencia.slug } : null
    };
}

// GET /usuarios (Listar todos)
exports.listAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: { diretoria: true, gerencia: true } // Inclui nomes para a tabela
        });
        // Retorna array direto para compatibilidade com o service frontend 'getUsuarios'
        return res.json(users.map(mapUser)); 
    } catch (err) {
        console.error('Erro list users:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// GET /usuarios/:id (Buscar um)
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { diretoria: true, gerencia: true }
        });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        return res.json(mapUser(user));
    } catch (err) {
        console.error('Erro get user:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
};

// POST /usuarios (Criar)
exports.create = async (req, res) => {
    try {
        const { nome, cpf, email, password, role, diretoriaId, gerenciaId } = req.body || {};
        
        if (!nome || !cpf || !password || !role) {
            return res.status(400).json({ message: 'Nome, CPF, Senha e Perfil são obrigatórios.' });
        }
        
        const normCpf = String(cpf).replace(/\D/g, '');
        if (normCpf.length !== 11) return res.status(400).json({ message: 'CPF inválido' });

        // Valida duplicidade
        const existsCpf = await prisma.user.findUnique({ where: { cpf: normCpf } });
        if (existsCpf) return res.status(409).json({ message: 'CPF já cadastrado' });
        
        if (email) {
            const existsEmail = await prisma.user.findUnique({ where: { email } });
            if (existsEmail) return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const created = await prisma.user.create({
            data: { 
                id: crypto.randomUUID(), // Garante UUID se o banco não gerar auto
                nome, 
                cpf: normCpf, 
                email: email || null, 
                passwordHash, 
                role: role.toUpperCase(), // Garante ENUM correto
                diretoriaId: diretoriaId || null, 
                gerenciaId: gerenciaId || null 
            },
        });
        
        return res.status(201).json(mapUser(created));
    } catch (err) {
        console.error('Erro create user:', err);
        return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
    }
};

// PUT /usuarios/:id (Atualizar)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, role, diretoriaId, gerenciaId, password } = req.body;

        // Prepara objeto de update
        const data = {
            nome,
            email: email || null,
            role: role ? role.toUpperCase() : undefined,
            diretoriaId: diretoriaId || null,
            gerenciaId: gerenciaId || null
        };

        // Se enviou senha nova, faz hash
        if (password && password.trim() !== "") {
            data.passwordHash = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.user.update({
            where: { id },
            data
        });

        return res.json(mapUser(updated));
    } catch (err) {
        console.error('Erro update user:', err);
        if (err.code === 'P2025') return res.status(404).json({ message: 'Usuário não encontrado' });
        return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
};

// DELETE /usuarios/:id (Excluir)
// Body: { password } (senha do admin que está fazendo a requisição)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const adminId = req.user.id;

        if (!password) {
            return res.status(400).json({ message: 'A senha do administrador é obrigatória para confirmar a exclusão.' });
        }

        // Buscar admin
        const adminUser = await prisma.user.findUnique({ where: { id: adminId } });
        if (!adminUser) return res.status(401).json({ message: 'Administrador não encontrado.' });

        // Verificar senha
        const isPasswordCorrect = await bcrypt.compare(password, adminUser.passwordHash);
        if (!isPasswordCorrect) {
            return res.status(403).json({ message: 'Senha incorreta.' });
        }

        // ❌ Impede excluir a si mesmo
        if (adminId === id) {
            return res.status(400).json({ message: 'Você não pode excluir a si mesmo.' });
        }

        await prisma.user.delete({ where: { id } });
        return res.status(204).send();

    } catch (err) {
        console.error('Erro delete user:', err);
        return res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
};

// PATCH /usuarios/:id/reset-password (Reset de Senha Admin)
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: 'Nova senha é obrigatória' });

        const passwordHash = await bcrypt.hash(password, 10);
        
        await prisma.user.update({
            where: { id },
            data: { passwordHash }
        });

        return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error('Erro reset password:', err);
        return res.status(500).json({ message: 'Erro ao redefinir senha' });
    }
};

// Necessário para o crypto.randomUUID na criação
const crypto = require('crypto');