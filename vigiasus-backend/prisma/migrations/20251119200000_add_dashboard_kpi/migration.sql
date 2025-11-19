-- CreateTable
CREATE TABLE dashboardkpi (
    id VARCHAR(191) NOT NULL,
    diretoriaId VARCHAR(191) NOT NULL,
    contextoVersaoId VARCHAR(191) NOT NULL,
    position INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE INDEX DashboardKpi_contextoVersaoId_key (contextoVersaoId),
    UNIQUE INDEX DashboardKpi_diretoriaId_position_key (diretoriaId, position),
    CONSTRAINT DashboardKpi_diretoriaId_fkey FOREIGN KEY (diretoriaId) REFERENCES diretoria(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT DashboardKpi_contextoVersaoId_fkey FOREIGN KEY (contextoVersaoId) REFERENCES contextoversao(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
