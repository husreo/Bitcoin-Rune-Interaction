import { checkValid, init } from "./process";
import express, { Express, Request, Response } from "express";
import prisma from "./db";

const app: Express = express();

app.get("/tx", async (req, res) => {
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
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
