// Controller responsável por autenticação (login e usuário atual)
// Regras:
// - Login: verifica email/senha, retorna token JWT + user DTO
// - Me: usa req.user preenchido pelo middleware para retornar dados atualizados do usuário

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');
const e = require('express');

// Mapeia modelo do banco (campos em português) para DTO amigável ao frontend
async function mapUser(model) {
    if (!model) return null;
    // Buscar slugs das relações (diretoria / gerencia) para evitar outra chamada no frontend
    let diretoriaSlug = null;
    let gerenciaSlug = null;
    if (model.diretoriaId) {
        const d = await prisma.diretoria.findUnique({ where: { id: model.diretoriaId }, select: { slug: true } });
        diretoriaSlug = d?.slug || null;
    }
    if (model.gerenciaId) {
        const g = await prisma.gerencia.findUnique({ where: { id: model.gerenciaId }, select: { slug: true } });
        gerenciaSlug = g?.slug || null;
    }
    return {
        id: model.id,
        name: model.nome,
        cpf: model.cpf,
        email: model.email,
        role: model.role.toLowerCase(), // enum no prisma vem em CAIXA ALTA
        diretoriaId: model.diretoriaId || null,
        gerenciaId: model.gerenciaId || null,
        diretoriaSlug,
        gerenciaSlug,
        createdAt: model.createdAt,
    };
}

async function login(req, res) {
    const { cpf, password } = req.body;
    if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { cpf } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
        // Payload mínimo. Evite colocar dados sensíveis aqui.
    const token = jwt.sign({ id: user.id, cpf: user.cpf, role: user.role }, secret, { expiresIn: '1h' });
    const mapped = await mapUser(user);
    return res.json({ user: mapped, token });
    } catch (err) {
        console.error('Erro login:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
}

async function me(req, res) {
    // req.user vem do middleware de autenticação
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' });
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    const mapped = await mapUser(user);
    return res.json({ user: mapped });
    } catch (err) {
        console.error('Erro me:', err);
        return res.status(500).json({ message: 'Erro interno' });
    }
}

module.exports = { login, me };

