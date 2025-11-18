-- AlterTable
ALTER TABLE `comentario` ADD COLUMN `destinatarioId` VARCHAR(191) NULL,
    ADD COLUMN `isPrivate` BOOLEAN NOT NULL DEFAULT false;
