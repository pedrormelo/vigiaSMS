const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota para BUSCAR o layout do dashboard de uma diretoria
 * GET /dashboardlayout/:diretoriaId
 */
router.get('/:diretoriaId', async (req, res) => {
    const { diretoriaId } = req.params;

    try {
        //
        let layout = await prisma.dashboardlayout.findUnique({
            where: {
                diretoriaId: diretoriaId
            },
            include: {
                // Inclui os itens (contextos) e sua ordem
                dashboardlayoutitem: {
                    orderBy: {
                        slotIndex: 'asc'
                    },
                    include: {
                        // Inclui os dados da versão para o frontend renderizar o card
                        contextoversao: {
                            select: {
                                id: true,
                                titulo: true,
                                contexto: {
                                    select: {
                                        tituloConceitual: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Se a diretoria ainda não tem layout, retorna um objeto vazio (mas OK)
        if (!layout) {
            return res.status(200).json(null);
        }

        res.status(200).json(layout);

    } catch (error) {
        console.error('Erro ao buscar layout do dashboard:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/**
 * Rota para SALVAR (Criar/Atualizar) o layout do dashboard
 * POST /dashboardlayout/:diretoriaId
 *
 * Esta rota usa uma transação para:
 * 1. Criar ou atualizar o 'dashboardlayout' (ex: 'GRID', 'ASYMMETRIC')
 * 2. Deletar TODOS os 'dashboardlayoutitem' antigos
 * 3. Criar TODOS os 'dashboardlayoutitem' novos que vieram do frontend
 */
router.post('/:diretoriaId', async (req, res) => {
    const { diretoriaId } = req.params;
    // O frontend deve enviar o tipo de layout e um array de itens
    // ex: { tipoLayout: 'GRID', items: [{ contextoVersaoId: 'uuid-1', slotIndex: 0 }, ...] }
    const { tipoLayout, items } = req.body;
    
    const { role, diretoriaId: userDiretoriaId } = req.user;

    // --- Permissão ---
    // Apenas um Diretor da própria diretoria pode editar o layout
    if (role !== 'DIRETOR' || userDiretoriaId !== diretoriaId) {
        return res.status(403).json({ message: 'Acesso negado. Apenas o diretor desta diretoria pode editar o layout.' });
    }

    if (!tipoLayout || !items) {
        return res.status(400).json({ message: 'tipoLayout e items são obrigatórios.' });
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // Etapa 1: Cria ou Atualiza o 'dashboardlayout' pai
            //
            const layout = await tx.dashboardlayout.upsert({
                where: { diretoriaId: diretoriaId },
                update: { 
                    tipoLayout: tipoLayout 
                },
                create: {
                    id: crypto.randomUUID(),
                    diretoriaId: diretoriaId,
                    tipoLayout: tipoLayout
                }
            });

            const layoutId = layout.id;

            // Etapa 2: Deleta TODOS os itens de layout antigos
            await tx.dashboardlayoutitem.deleteMany({
                where: { dashboardLayoutId: layoutId }
            });

            // Etapa 3: Prepara os novos dados dos itens
            const itemsData = items.map(item => ({
                id: crypto.randomUUID(),
                dashboardLayoutId: layoutId,
                contextoVersaoId: item.contextoVersaoId,
                slotIndex: item.slotIndex
            }));

            // Etapa 4: Cria os novos itens de layout
            //
            if (itemsData.length > 0) {
                await tx.dashboardlayoutitem.createMany({
                    data: itemsData
                });
            }

            return layout;
        });

        res.status(201).json({ message: 'Layout salvo com sucesso!', layout: resultado });

    } catch (error) {
        console.error('Erro ao salvar layout do dashboard:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

module.exports = router;