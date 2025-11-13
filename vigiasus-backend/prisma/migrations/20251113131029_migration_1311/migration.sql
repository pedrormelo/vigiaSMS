/*
  Warnings:

  - A unique constraint covering the columns `[contextoId,versaoNumero]` on the table `contextoversao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ContextoVersao_contextoId_versaoNumero_key` ON `contextoversao`(`contextoId`, `versaoNumero`);
