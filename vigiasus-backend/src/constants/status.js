// Backend canonical status values (from Prisma enums)
// This file maps machine values to UI labels when needed.

const Status = {
    AGUARDANDO_GERENTE: 'AGUARDANDO_GERENTE',
    AGUARDANDO_DIRETOR: 'AGUARDANDO_DIRETOR',
    AGUARDANDO_CORRECAO: 'AGUARDANDO_CORRECAO',
    PUBLICADO: 'PUBLICADO',
    INDEFERIDO: 'INDEFERIDO',
};

// Optional Portuguese labels for client display
const StatusLabels = {
    [Status.AGUARDANDO_GERENTE]: 'Aguardando análise do Gerente',
    [Status.AGUARDANDO_DIRETOR]: 'Aguardando análise do Diretor',
    [Status.AGUARDANDO_CORRECAO]: 'Aguardando Correção',
    [Status.PUBLICADO]: 'Publicado',
    [Status.INDEFERIDO]: 'Indeferido',
};

module.exports = { Status, StatusLabels };
