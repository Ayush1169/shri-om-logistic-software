-- CreateTable
CREATE TABLE `Vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleNumber` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `capacity` DECIMAL(10, 2) NULL,
    `gpsNumber` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_vehicleNumber_key`(`vehicleNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `rcNumber` VARCHAR(191) NULL,
    `insuranceNumber` VARCHAR(191) NULL,
    `permitNumber` VARCHAR(191) NULL,
    `fitnessNumber` VARCHAR(191) NULL,
    `pollutionNumber` VARCHAR(191) NULL,
    `insuranceExpiry` DATETIME(3) NULL,
    `permitExpiry` DATETIME(3) NULL,
    `fitnessExpiry` DATETIME(3) NULL,
    `pollutionExpiry` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VehicleDocument_vehicleId_key`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `driverName` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `aadhaarNumber` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Driver_aadhaarNumber_key`(`aadhaarNumber`),
    UNIQUE INDEX `Driver_licenseNumber_key`(`licenseNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DriverDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `driverId` INTEGER NOT NULL,
    `licenseExpiry` DATETIME(3) NULL,
    `aadhaarFront` VARCHAR(191) NULL,
    `aadhaarBack` VARCHAR(191) NULL,
    `licenseImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DriverDocument_driverId_key`(`driverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bilty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `biltyNumber` VARCHAR(191) NOT NULL,
    `bookingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `branchId` INTEGER NOT NULL,
    `consignorId` INTEGER NOT NULL,
    `consigneeId` INTEGER NOT NULL,
    `pickupAddress` VARCHAR(191) NOT NULL,
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `goodsDescription` VARCHAR(191) NOT NULL,
    `packageCount` INTEGER NOT NULL,
    `actualWeight` DECIMAL(10, 2) NULL,
    `chargeableWeight` DECIMAL(10, 2) NULL,
    `freight` DECIMAL(12, 2) NOT NULL,
    `gst` DECIMAL(12, 2) NULL,
    `hamali` DECIMAL(12, 2) NULL,
    `loadingCharges` DECIMAL(12, 2) NULL,
    `unloadingCharges` DECIMAL(12, 2) NULL,
    `insuranceCharges` DECIMAL(12, 2) NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `paymentType` ENUM('PAID', 'TO_PAY', 'BILLING') NOT NULL,
    `eWayBillNumber` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('BOOKED', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'BOOKED',
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Bilty_biltyNumber_key`(`biltyNumber`),
    INDEX `Bilty_bookingDate_idx`(`bookingDate`),
    INDEX `Bilty_status_idx`(`status`),
    INDEX `Bilty_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleDocument` ADD CONSTRAINT `VehicleDocument_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Driver` ADD CONSTRAINT `Driver_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DriverDocument` ADD CONSTRAINT `DriverDocument_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `Driver`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_consigneeId_fkey` FOREIGN KEY (`consigneeId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bilty` ADD CONSTRAINT `Bilty_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
