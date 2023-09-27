/*
  Warnings:

  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "type";

-- DropEnum
DROP TYPE "Type";
