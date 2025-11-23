// source/jobs/cleanupService.js
const prisma = require('../config/prismaClient');
const fs = require('fs');
const path = require('path');

async function cleanUpDeletedContexts() {
    console.log('Iniciando limpeza de contextos expirados...');
    
    // Data limite: 90 dias atrás
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 90);

    try {
        // 1. Buscar contextos deletados há mais de 90 dias
        const contextosParaExcluir = await prisma.contexto.findMany({
            where: {
                deletedAt: {
                    lt: dateLimit // Less Than (menor que) data limite
                }
            },
            include: {
                gerencia: true,
                contextoversao: {
                    include: { versaoarquivo: true }
                }
            }
        });

        console.log(`Encontrados ${contextosParaExcluir.length} contextos para exclusão definitiva.`);

        for (const ctx of contextosParaExcluir) {
            // 2. Apagar arquivo físico (se existir na pasta 'apagados')
            // Nota: O arquivo já foi movido para 'apagados/slug/...' na fase do Soft Delete.
            // Aqui podemos tentar encontrar e apagar, ou simplesmente confiar que o sistema de arquivos
            // pode ser limpo de outra forma. Mas vamos tentar limpar:
            
            // Como renomeamos o arquivo ao mover (timestamp_), é difícil saber o nome exato aqui
            // a menos que tivéssemos salvo o "caminho da lixeira" no banco.
            // Simplificação: O Prisma apaga o registro. A pasta 'apagados' pode ser limpa por 
            // data de modificação do arquivo via script do SO (find /path -mtime +90 -delete).
            
            // 3. Apagar do Banco (Hard Delete)
            await prisma.contexto.delete({
                where: { id: ctx.id }
            });
            console.log(`Contexto ${ctx.id} removido definitivamente.`);
        }

    } catch (error) {
        console.error('Erro no job de limpeza:', error);
    }
}

// Se rodar diretamente via node:
if (require.main === module) {
    cleanUpDeletedContexts()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = cleanUpDeletedContexts;