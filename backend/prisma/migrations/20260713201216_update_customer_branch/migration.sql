/*
  Warnings:

  - You are about to drop the column `name` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `branchName` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Branch` DROP COLUMN `name`,
    ADD COLUMN `branchName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Company` DROP COLUMN `name`,
    ADD COLUMN `companyName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `name`,
    ADD COLUMN `branchId` INTEGER NOT NULL,
    ADD COLUMN `customerName` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
