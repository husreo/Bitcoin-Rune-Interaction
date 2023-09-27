-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "blockNumber" SET DEFAULT '',
ALTER COLUMN "blockNumber" SET DATA TYPE TEXT,
ALTER COLUMN "blockTimestamp" SET DEFAULT '',
ALTER COLUMN "blockTimestamp" SET DATA TYPE TEXT;
