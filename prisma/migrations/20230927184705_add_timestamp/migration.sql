-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "blockNumber" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "blockTimestamp" INTEGER NOT NULL DEFAULT -1;
