
-- CreateTable
CREATE TABLE `CashReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `receiptDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `biltyId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `consigneeId` INTEGER NULL,
    `consigneeName` VARCHAR(191) NULL,
    `packageCount` INTEGER NOT NULL DEFAULT 0,
    `fromLocation` VARCHAR(191) NULL,
    `freight` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `stationCharges` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `unloadingCharges` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `godownCharges` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `refund` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `paidAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CashReceipt_receiptNumber_key`(`receiptNumber`),
    INDEX `CashReceipt_biltyId_idx`(`biltyId`),
    INDEX `CashReceipt_branchId_idx`(`branchId`),
    INDEX `CashReceipt_createdById_idx`(`createdById`),
    INDEX `CashReceipt_consigneeId_idx`(`consigneeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CashReceipt`
ADD CONSTRAINT `CashReceipt_biltyId_fkey`
FOREIGN KEY (`biltyId`) REFERENCES `Bilty`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CashReceipt`
ADD CONSTRAINT `CashReceipt_branchId_fkey`
FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CashReceipt`
ADD CONSTRAINT `CashReceipt_createdById_fkey`
FOREIGN KEY (`createdById`) REFERENCES `User`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CashReceipt`
ADD CONSTRAINT `CashReceipt_consigneeId_fkey`
FOREIGN KEY (`consigneeId`) REFERENCES `Customer`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
