-- Add visibility flags to contexto and contextoversao
ALTER TABLE `contexto` ADD COLUMN `isOculto` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `contextoversao` ADD COLUMN `isOculta` BOOLEAN NOT NULL DEFAULT false;
