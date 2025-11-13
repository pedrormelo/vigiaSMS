-- CreateTable
CREATE TABLE `Diretoria` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `corFrom` VARCHAR(191) NULL,
    `corTo` VARCHAR(191) NULL,
    `bannerImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gerencia` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NULL,
    `diretoriaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Gerencia_diretoriaId_idx`(`diretoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('MEMBRO', 'GERENTE', 'DIRETOR', 'SECRETARIA') NOT NULL,
    `gerenciaId` VARCHAR(191) NULL,
    `diretoriaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_gerenciaId_idx`(`gerenciaId`),
    INDEX `User_diretoriaId_idx`(`diretoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contexto` (
    `id` VARCHAR(191) NOT NULL,
    `tituloConceitual` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ARQUIVO_LINK', 'DASHBOARD', 'INDICADOR') NOT NULL,
    `autorOriginalId` VARCHAR(191) NOT NULL,
    `gerenciaDonaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Contexto_gerenciaDonaId_idx`(`gerenciaDonaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContextoVersao` (
    `id` VARCHAR(191) NOT NULL,
    `contextoId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `solicitanteId` VARCHAR(191) NOT NULL,
    `versaoNumero` INTEGER NOT NULL,
    `motivoNovaVersao` VARCHAR(191) NULL,
    `descNovaVersao` VARCHAR(191) NULL,
    `statusValidacao` ENUM('AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO', 'PUBLICADO', 'INDEFERIDO') NOT NULL,
    `isAtiva` BOOLEAN NOT NULL DEFAULT false,
    `isDestacado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContextoVersao_contextoId_idx`(`contextoId`),
    INDEX `ContextoVersao_statusValidacao_createdAt_idx`(`statusValidacao`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VersaoArquivo` (
    `id` VARCHAR(191) NOT NULL,
    `versaoId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `docType` ENUM('PDF', 'EXCEL', 'DOC', 'LINK') NOT NULL,

    UNIQUE INDEX `VersaoArquivo_versaoId_key`(`versaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VersaoDashboard` (
    `id` VARCHAR(191) NOT NULL,
    `versaoId` VARCHAR(191) NOT NULL,
    `tipoGrafico` ENUM('PIE', 'BAR', 'LINE') NOT NULL,
    `payload` JSON NOT NULL,

    UNIQUE INDEX `VersaoDashboard_versaoId_key`(`versaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VersaoIndicador` (
    `id` VARCHAR(191) NOT NULL,
    `versaoId` VARCHAR(191) NOT NULL,
    `valorAtual` DECIMAL(18, 4) NOT NULL,
    `valorAlvo` DECIMAL(18, 4) NULL,
    `unidade` VARCHAR(191) NOT NULL,
    `textoComparativo` VARCHAR(191) NULL,
    `cor` VARCHAR(191) NOT NULL,
    `icone` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VersaoIndicador_versaoId_key`(`versaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValidacaoHistorico` (
    `id` VARCHAR(191) NOT NULL,
    `versaoId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `statusNovo` ENUM('AGUARDANDO_GERENTE', 'AGUARDANDO_DIRETOR', 'AGUARDANDO_CORRECAO', 'PUBLICADO', 'INDEFERIDO') NOT NULL,
    `justificativa` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ValidacaoHistorico_versaoId_idx`(`versaoId`),
    INDEX `ValidacaoHistorico_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comentario` (
    `id` VARCHAR(191) NOT NULL,
    `versaoId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `texto` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comentario_versaoId_idx`(`versaoId`),
    INDEX `Comentario_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` VARCHAR(191) NOT NULL,
    `destinatarioId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `isLida` BOOLEAN NOT NULL DEFAULT false,
    `versaoId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacao_destinatarioId_idx`(`destinatarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardLayout` (
    `id` VARCHAR(191) NOT NULL,
    `diretoriaId` VARCHAR(191) NOT NULL,
    `tipoLayout` ENUM('ASYMMETRIC', 'GRID', 'SIDEBYSIDE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DashboardLayout_diretoriaId_key`(`diretoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardLayoutItem` (
    `id` VARCHAR(191) NOT NULL,
    `dashboardLayoutId` VARCHAR(191) NOT NULL,
    `contextoVersaoId` VARCHAR(191) NOT NULL,
    `slotIndex` INTEGER NOT NULL,

    UNIQUE INDEX `DashboardLayoutItem_dashboardLayoutId_slotIndex_key`(`dashboardLayoutId`, `slotIndex`),
    UNIQUE INDEX `DashboardLayoutItem_dashboardLayoutId_contextoVersaoId_key`(`dashboardLayoutId`, `contextoVersaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Gerencia` ADD CONSTRAINT `Gerencia_diretoriaId_fkey` FOREIGN KEY (`diretoriaId`) REFERENCES `Diretoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_gerenciaId_fkey` FOREIGN KEY (`gerenciaId`) REFERENCES `Gerencia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_diretoriaId_fkey` FOREIGN KEY (`diretoriaId`) REFERENCES `Diretoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contexto` ADD CONSTRAINT `Contexto_autorOriginalId_fkey` FOREIGN KEY (`autorOriginalId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contexto` ADD CONSTRAINT `Contexto_gerenciaDonaId_fkey` FOREIGN KEY (`gerenciaDonaId`) REFERENCES `Gerencia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContextoVersao` ADD CONSTRAINT `ContextoVersao_contextoId_fkey` FOREIGN KEY (`contextoId`) REFERENCES `Contexto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContextoVersao` ADD CONSTRAINT `ContextoVersao_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VersaoArquivo` ADD CONSTRAINT `VersaoArquivo_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VersaoDashboard` ADD CONSTRAINT `VersaoDashboard_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VersaoIndicador` ADD CONSTRAINT `VersaoIndicador_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacaoHistorico` ADD CONSTRAINT `ValidacaoHistorico_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValidacaoHistorico` ADD CONSTRAINT `ValidacaoHistorico_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_versaoId_fkey` FOREIGN KEY (`versaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardLayout` ADD CONSTRAINT `DashboardLayout_diretoriaId_fkey` FOREIGN KEY (`diretoriaId`) REFERENCES `Diretoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardLayoutItem` ADD CONSTRAINT `DashboardLayoutItem_dashboardLayoutId_fkey` FOREIGN KEY (`dashboardLayoutId`) REFERENCES `DashboardLayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardLayoutItem` ADD CONSTRAINT `DashboardLayoutItem_contextoVersaoId_fkey` FOREIGN KEY (`contextoVersaoId`) REFERENCES `ContextoVersao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
