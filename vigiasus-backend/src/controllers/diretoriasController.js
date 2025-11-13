const prisma = require('../config/prismaClient');

exports.listAll = async (req, res) => {
    try {
        const diretorias = await prisma.diretoria.findMany({
            select: {
                id: true,
                nome: true,
                corFrom: true,
                corTo: true,
                bannerImage: true,
                createdAt: true,
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
            select: { id: true, nome: true, corFrom: true, corTo: true, bannerImage: true, createdAt: true },
        });
        if (!d) return res.status(404).json({ message: 'Diretoria não encontrada' });
        return res.json(d);
    } catch (error) {
        console.error('Erro ao buscar diretoria:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
