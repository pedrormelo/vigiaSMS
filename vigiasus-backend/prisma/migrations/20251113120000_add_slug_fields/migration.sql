-- Add slug and descriptive columns to diretoria and gerencia
ALTER TABLE `diretoria` ADD COLUMN `slug` VARCHAR(191) NULL, ADD COLUMN `sobre` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Diretoria_slug_key` ON `diretoria`(`slug`);

ALTER TABLE `gerencia` ADD COLUMN `slug` VARCHAR(191) NULL, ADD COLUMN `descricao` VARCHAR(191) NULL, ADD COLUMN `image` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Gerencia_slug_key` ON `gerencia`(`slug`);
