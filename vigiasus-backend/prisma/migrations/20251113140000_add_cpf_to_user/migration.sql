-- Add CPF column to user and make email optional
-- This migration assumes MySQL 8+ and an empty table during dev reset; for existing data, backfill before setting NOT NULL.

ALTER TABLE `user`
  ADD COLUMN `cpf` VARCHAR(191) NOT NULL,
  MODIFY `email` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_cpf_key` ON `user`(`cpf`);
