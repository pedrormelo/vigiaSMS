// Prisma Client singleton to avoid exhausting database connections during dev (hot reloads)
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development, use a global to preserve the client between reloads
    if (!global.__prisma) {
        global.__prisma = new PrismaClient();
    }
    prisma = global.__prisma;
}

module.exports = prisma;
