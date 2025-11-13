// prisma/seed.js
// Development-only seed that inserts a small dataset for testing the API.
// DO NOT run on production databases.

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function uuid() { return crypto.randomUUID(); }

async function main() {
    if (process.env.NODE_ENV === 'production') {
        console.error('Refusing to seed in production. Aborting.');
        process.exit(1);
    }

    console.log('Seeding database (development)...');

    // 1) Diretorias
    const diretoriaSaudeId = uuid();
    await prisma.diretoria.upsert({
        where: { id: diretoriaSaudeId },
        update: {},
        create: {
            id: diretoriaSaudeId,
            nome: 'Diretoria de Vigilância em Saúde',
            corFrom: '#3b82f6',
            corTo: '#06b6d4',
            bannerImage: null,
        },
    });

    // 2) Gerências
    const gerenciaVigilanciaId = uuid();
    await prisma.gerencia.upsert({
        where: { id: gerenciaVigilanciaId },
        update: {},
        create: {
            id: gerenciaVigilanciaId,
            nome: 'Gerência de Vigilância em Saúde',
            sigla: 'GVS',
            diretoriaId: diretoriaSaudeId,
        },
    });

    // 3) Users (MEMBRO, GERENTE, DIRETOR, SECRETARIA)
    const pass = await bcrypt.hash('123456', 10);
    const membroId = uuid();
    const gerenteId = uuid();
    const diretorId = uuid();
    const secretariaId = uuid();

    await prisma.user.upsert({
        where: { cpf: '11111111111' },
        update: { email: 'membro@vigia.sus' },
        create: { id: membroId, nome: 'Membro Teste', cpf: '11111111111', email: 'membro@vigia.sus', passwordHash: pass, role: 'MEMBRO', gerenciaId: gerenciaVigilanciaId },
    });
    await prisma.user.upsert({
        where: { cpf: '22222222222' },
        update: { email: 'gerente@vigia.sus' },
        create: { id: gerenteId, nome: 'Gerente Teste', cpf: '22222222222', email: 'gerente@vigia.sus', passwordHash: pass, role: 'GERENTE', gerenciaId: gerenciaVigilanciaId },
    });
    await prisma.user.upsert({
        where: { cpf: '33333333333' },
        update: { email: 'diretor@vigia.sus' },
        create: { id: diretorId, nome: 'Diretor Teste', cpf: '33333333333', email: 'diretor@vigia.sus', passwordHash: pass, role: 'DIRETOR', diretoriaId: diretoriaSaudeId },
    });
    await prisma.user.upsert({
        where: { cpf: '44444444444' },
        update: { email: 'secretaria@vigia.sus' },
        create: { id: secretariaId, nome: 'Secretaria Teste', cpf: '44444444444', email: 'secretaria@vigia.sus', passwordHash: pass, role: 'SECRETARIA' },
    });

    // Fetch actual IDs (existing or newly created) to satisfy FKs
    const membro = await prisma.user.findUnique({ where: { cpf: '11111111111' } });
    const gerente = await prisma.user.findUnique({ where: { cpf: '22222222222' } });
    const diretor = await prisma.user.findUnique({ where: { cpf: '33333333333' } });
    const secretaria = await prisma.user.findUnique({ where: { cpf: '44444444444' } });

    // 4) Contexto + Versões + Histórico
    const contextoId = uuid();
    await prisma.contexto.create({
        data: {
            id: contextoId,
            tituloConceitual: 'Relatório Epidemiológico Semanal',
            tipo: 'ARQUIVO_LINK',
            autorOriginalId: membro.id,
            gerenciaDonaId: gerenciaVigilanciaId,
        },
    });

    const versao1Id = uuid();
    await prisma.contextoversao.create({
        data: {
            id: versao1Id,
            contextoId,
            titulo: 'v1 - Relatório Semana 35',
            descricao: 'Primeira versão submetida pelo membro',
            solicitanteId: membro.id,
            versaoNumero: 1,
            statusValidacao: 'AGUARDANDO_GERENTE',
            isAtiva: false,
            isDestacado: false,
            updatedAt: new Date(),
        },
    });

    await prisma.validacaohistorico.create({
        data: {
            id: uuid(),
            versaoId: versao1Id,
            autorId: membro.id,
            statusNovo: 'AGUARDANDO_GERENTE',
            justificativa: null,
        },
    });

    // Optional second version already approved by GERENTE and awaiting DIRETOR
    const versao2Id = uuid();
    await prisma.contextoversao.create({
        data: {
            id: versao2Id,
            contextoId,
            titulo: 'v2 - Ajustes solicitados',
            descricao: 'Correções aplicadas após feedback do gerente',
            solicitanteId: membro.id,
            versaoNumero: 2,
            statusValidacao: 'AGUARDANDO_DIRETOR',
            isAtiva: false,
            isDestacado: false,
            updatedAt: new Date(),
        },
    });

    await prisma.validacaohistorico.create({
        data: {
            id: uuid(),
            versaoId: versao2Id,
            autorId: gerente.id,
            statusNovo: 'AGUARDANDO_DIRETOR',
            justificativa: 'Aprovado pelo gerente. Encaminhado ao diretor.',
        },
    });

    console.log('Seed complete.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
