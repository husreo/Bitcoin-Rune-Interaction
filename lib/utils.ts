import { Transaction } from "@prisma/client";
import prisma from "./db";

export async function getTransactions(): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });
}
