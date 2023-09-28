import { Request, Response, Router } from "express";
import { paginate, prisma } from "../lib/db";
import { Prisma, Transaction } from "@prisma/client";
import { checkValid } from "../lib/process";

const router = Router();

router.get("/tx", async (req: Request, res: Response) => {
  const txs = await paginate<Transaction, Prisma.TransactionFindManyArgs>(
    prisma.transaction,
    {
      orderBy: {
        blockHeight: "desc",
      },
    },
    { page: req.query.page as any, perPage: req.query.perPage as any }
  );
  return res.json(txs);
});

router.get("/tx/:id", async (req: Request, res: Response) => {
  try {
    const tx = (req.params?.id ?? "") as string;
    const t = await checkValid(tx);
    return res.json(t);
  } catch (e) {
    console.log(e);
    return res.json({});
  }
});

export default router;
