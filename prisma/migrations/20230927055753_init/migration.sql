-- CreateEnum
CREATE TYPE "Type" AS ENUM ('transaction', 'issuance');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "transaction" JSONB,
    "issuance" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
