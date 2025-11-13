const prisma = require('../config/prismaClient');

/**
 * Rota para Listar todas as Gerências
 * GET /gerencias
 */
exports.listAll = async (req, res) => {
    try {
        const gerencias = await prisma.gerencia.findMany({
            select: { id: true, nome: true, sigla: true, diretoriaId: true, createdAt: true },
            orderBy: { nome: 'asc' },
        });
        return res.status(200).json(gerencias);
    } catch (error) {
        console.error('Erro ao listar gerências:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

/**
 * Rota para Listar todas as Gerências de UMA Diretoria
 * GET /gerencias/pordiretoria/:diretoriaId
 */
exports.listByDiretoria = async (req, res) => {
    const { diretoriaId } = req.params;
    try {
        const gerencias = await prisma.gerencia.findMany({
            where: { diretoriaId },
            select: { id: true, nome: true, sigla: true, diretoriaId: true },
            orderBy: { nome: 'asc' },
        });
        return res.status(200).json(gerencias);
    } catch (error) {
        console.error('Erro ao listar gerências por diretoria:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// rota para buscar uma gerência por ID
/**
 * Rota para BUSCAR uma gerência por ID
 * GET /gerencias/:id
 */
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const gerencia = await prisma.gerencia.findUnique({
            where: { id },
            select: { id: true, nome: true, sigla: true, diretoriaId: true, createdAt: true },
        });
        if (!gerencia) return res.status(404).json({ message: 'Gerência não encontrada' });
        return res.json(gerencia);
    } catch (error) {
        console.error('Erro ao buscar gerência:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};