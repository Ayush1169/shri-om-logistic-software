-- AlterTable
ALTER TABLE `Bilty` ADD COLUMN `driverId` INTEGER NULL,
    ADD COLUMN `vehicleId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Bilty_vehicleId_idx` ON `Bilty`(`vehicleId`);

-- CreateIndex
CREATE INDEX `Bilty_driverId_idx` ON `Bilty`(`driverId`);

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `Driver`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
