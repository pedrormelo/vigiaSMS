// Script para popular campos slug / sobre / descricao baseado na configuração antiga do frontend.
// Execute uma vez após adicionar os campos ao schema.
// node src/scripts/backfillSlugs.js

const prisma = require('../config/prismaClient');

// Mapeamento das diretorias (slug => dados)
const diretoriasData = [
    { slug: 'atencao-saude', nome: 'Diretoria de Atenção à Saúde', sobre: 'Coordena a rede de cuidados, organizando fluxos assistenciais e promovendo a continuidade do cuidado entre os diferentes níveis de atenção.', corFrom: '#1745FF', corTo: '#002BDB' },
    { slug: 'regulacao-sus', nome: 'Diretoria de Regulação do SUS', sobre: 'Gerencia o acesso a serviços (consultas, exames, internações) e regula a ocupação de leitos para garantir atendimento oportuno e equitativo.', corFrom: '#00BDFF', corTo: '#07ABE4' },
    { slug: 'gestao-sus', nome: 'Diretoria de Gestão do SUS', sobre: 'Planeja e integra processos, pessoas e recursos para apoiar decisões da gestão, com foco em eficiência e melhoria contínua.', corFrom: '#109326', corTo: '#008C32' },
    { slug: 'vigilancia-saude', nome: 'Diretoria de Vigilância em Saúde', sobre: 'Previne e controla riscos à saúde pública por meio da vigilância epidemiológica, sanitária e ambiental.', corFrom: '#FF8500', corTo: '#FD8400' },
    { slug: 'administrativo-financeira', nome: 'Diretoria Administrativa Financeiro', sobre: 'Conduz a gestão orçamentária, financeira e administrativa, garantindo suporte aos processos e contratos da Secretaria.', corFrom: '#FB4242', corTo: '#EF2828' },
    { slug: 'secretaria', nome: 'Página da Secretária', sobre: 'Painel geral com destaques, indicadores e métricas estratégicas de toda a Secretaria de Saúde.', corFrom: '#ffcb3e', corTo: '#f7721c' }
];

// Gerências associadas (simplificado, usa slugs g1.. etc)
const gerenciasData = [
    { slug: 'gerencia-fluxos-assistenciais', nome: 'Gerência de Fluxos Assistenciais', sigla: 'GFA', diretoriaSlug: 'atencao-saude' },
    { slug: 'gerencia-atencao-basica', nome: 'Gerência de Atenção Básica', sigla: 'GAB', diretoriaSlug: 'atencao-saude' },
    { slug: 'gerencia-leitos', nome: 'Gerência de Leitos', sigla: 'GL', diretoriaSlug: 'regulacao-sus' },
    { slug: 'gerencia-regulacao-ambulatorial', nome: 'Gerência de Regulação Ambulatorial', sigla: 'GRA', diretoriaSlug: 'regulacao-sus' },
    { slug: 'gerencia-controle-avaliacao', nome: 'Gerência de Controle e Avaliação', sigla: 'GCA', diretoriaSlug: 'regulacao-sus' },
    { slug: 'gerencia-planejamento', nome: 'Gerência de Planejamento', sigla: 'GPLAN', diretoriaSlug: 'gestao-sus' },
    { slug: 'gerencia-tecnologia-informacao', nome: 'Gerência de Tecnologia da Informação', sigla: 'GTI', diretoriaSlug: 'gestao-sus' },
    { slug: 'gerencia-inspecao-sanitaria', nome: 'Gerência de Insperção Sanitária', sigla: 'GIS', diretoriaSlug: 'vigilancia-saude' },
    { slug: 'gerencia-administrativo-financeiro', nome: 'Gerência Administrativa Financeiro', sigla: 'GAF', diretoriaSlug: 'administrativo-financeira' },
];

async function run() {
    console.log('Populando slugs / sobre / descricao...');
    for (const d of diretoriasData) {
        const existing = await prisma.diretoria.findFirst({ where: { slug: d.slug } });
        if (existing) {
            await prisma.diretoria.update({ where: { id: existing.id }, data: { nome: d.nome, sobre: d.sobre, corFrom: d.corFrom, corTo: d.corTo } });
            console.log('Atualizada diretoria', d.slug);
        } else {
            await prisma.diretoria.create({ data: { id: crypto.randomUUID(), slug: d.slug, nome: d.nome, sobre: d.sobre, corFrom: d.corFrom, corTo: d.corTo } });
            console.log('Criada diretoria', d.slug);
        }
    }
    for (const g of gerenciasData) {
        const parent = await prisma.diretoria.findFirst({ where: { slug: g.diretoriaSlug } });
        if (!parent) { console.warn('Diretoria não encontrada para gerência', g.slug); continue; }
        const existing = await prisma.gerencia.findFirst({ where: { slug: g.slug } });
        if (existing) {
            await prisma.gerencia.update({ where: { id: existing.id }, data: { nome: g.nome, sigla: g.sigla, diretoriaId: parent.id } });
            console.log('Atualizada gerência', g.slug);
        } else {
            await prisma.gerencia.create({ data: { id: crypto.randomUUID(), slug: g.slug, nome: g.nome, sigla: g.sigla, diretoriaId: parent.id } });
            console.log('Criada gerência', g.slug);
        }
    }
    console.log('Concluído.');
}

run().finally(() => prisma.$disconnect());
