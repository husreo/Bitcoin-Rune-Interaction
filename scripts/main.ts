import { Prisma, Transaction } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import { createPaginator } from "prisma-pagination";
import prisma from "./db";
import { checkValid, init } from "./process";
import cors from "cors";

const app: Express = express();
app.use(cors());

const paginate = createPaginator({});

app.get("/tx", async (req, res) => {
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

app.get("/tx/:id", async (req: Request, res: Response) => {
  try {
    const tx = (req.params?.id ?? "") as string;
    console.log(tx);
    const t = await checkValid(tx);
    return res.json(t);
  } catch (e) {
    console.log(e);
    return res.json({});
  }
});

init();
app.listen(8080, () => {
  console.log("server started on http://0.0.0.0:8080");
});
