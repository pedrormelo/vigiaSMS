const prisma = require('../config/prismaClient');

exports.listAll = async (req, res) => {
    try {
        const diretorias = await prisma.diretoria.findMany({
            select: {
                id: true,
                slug: true,
                nome: true,
                sobre: true,
                corFrom: true,
                corTo: true,
                bannerImage: true,
                createdAt: true,
                gerencia: {
                    select: {
                        id: true,
                        slug: true,
                        nome: true,
                        sigla: true,
                        descricao: true,
                        image: true,
                        diretoriaId: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { nome: 'asc' },
        });
        return res.status(200).json(diretorias);
    } catch (error) {
        console.error('Erro ao listar diretorias:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const d = await prisma.diretoria.findUnique({
            where: { id },
            select: {
                id: true,
                slug: true,
                nome: true,
                sobre: true,
                corFrom: true,
                corTo: true,
                bannerImage: true,
                createdAt: true,
                gerencia: {
                    select: {
                        id: true,
                        slug: true,
                        nome: true,
                        sigla: true,
                        descricao: true,
                        image: true,
                        diretoriaId: true,
                        createdAt: true,
                    }
                }
            },
        });
        if (!d) return res.status(404).json({ message: 'Diretoria não encontrada' });
        return res.json(d);
    } catch (error) {
        console.error('Erro ao buscar diretoria:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// Buscar diretoria por slug
exports.getBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const d = await prisma.diretoria.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                nome: true,
                sobre: true,
                corFrom: true,
                corTo: true,
                bannerImage: true,
                createdAt: true,
                gerencia: {
                    select: {
                        id: true,
                        slug: true,
                        nome: true,
                        sigla: true,
                        descricao: true,
                        image: true,
                        diretoriaId: true,
                        createdAt: true,
                    }
                }
            },
        });
        if (!d) return res.status(404).json({ message: 'Diretoria não encontrada' });
        return res.json(d);
    } catch (error) {
        console.error('Erro ao buscar diretoria por slug:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
