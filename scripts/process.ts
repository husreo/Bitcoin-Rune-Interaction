import mempoolJS from "@mempool/mempool.js";
import axios from "axios";
import { Queue, Worker } from "bullmq";
import { cleanEnv, num, str } from "envalid";
import WebSocketServer from "ws";
import { Tx } from "./@types";
import prisma from "./db";
import { decodeRuneScript } from "./decoder";

const config = cleanEnv(process.env, {
  REDIS_HOST: str({ default: "localhost" }),
  REDIS_PORT: num({ default: 6379 }),
});
const redisConfig = { host: config.REDIS_HOST, port: config.REDIS_PORT };

export const taskQueue = new Queue("tasks", {
  connection: redisConfig,
});

export const taskWorker = new Worker(
  "tasks",
  async (job) => {
    console.log(`processing #${job.id} ${job.data.blockId}`);
    const { blockId } = job.data;
    await getBlockTransactions(blockId);
  },
  { connection: redisConfig }
);

interface BlockDetails {
  blockId: string;
  blockTimestamp: string;
  blockHeight: number;
}

export async function extractAndStoreTx(
  tx: Tx,
  { blockId, blockTimestamp, blockHeight }: BlockDetails
): Promise<number> {
  let count = 0;
  for (const out of tx.vout) {
    try {
      const asm: string = out.scriptpubkey;
      if (!asm.startsWith("6a0152")) continue;
      const result = decodeRuneScript(Buffer.from(asm, "hex"));
      await prisma.transaction.upsert({
        where: { id: tx.txid },
        create: {
          id: tx.txid,
          issuance: result.issueData,
          transfers: result.transfers,
          blockNumber: blockId,
          blockTimestamp: blockTimestamp.toString(),
          blockHeight,
        },
        update: {},
      });
      count += 1;
    } catch (e) {
      console.error(e);
      continue;
    }
  }
  return count;
}

// example blockID = "00000000000000000000e8d59be395d83db9043bfcb81b3da9f0188a7030a00b"

export async function getBlockTransactions(blockId: string) {
  const block = await getBlock(blockId);
  const response = await axios.get(
    `https://mempool.space/api/block/${blockId}/txs`
  );
  const txs: Tx[] = response.data;
  console.log("no of transactions: ", txs.length);

  let blockValidTxCount = 0;

  for (const tx of txs) {
    const numOfValidTxs = await extractAndStoreTx(tx, {
      blockId: block.id,
      blockTimestamp: block.timestamp,
      blockHeight: block.height,
    });
    blockValidTxCount += numOfValidTxs;
  }
  console.log("valid block tx: ", blockValidTxCount);
}

export const init = async () => {
  const {
    bitcoin: { websocket },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const ws: WebSocketServer = websocket.initServer({
    options: ["blocks", ""],
  });

  ws.on("open", () => {
    console.log("connected ...");
  });

  ws.on("message", async (data: any) => {
    const res = JSON.parse(data.toString());
    if (res.block) {
      const blockId = res.block.id;
      await taskQueue.add(`block-${blockId}`, { blockId: blockId });
    }
  });
};

export async function getBlock(
  blockId: string
): Promise<{ id: string; timestamp: string; height: number }> {
  const response = await axios.get(
    `https://mempool.space/api/v1/block/${blockId}`
  );
  const { id, timestamp, height } = response.data;
  return { id, timestamp, height };
}

export async function checkValid(tx: string) {
  const response = await axios.get(`https://mempool.space/api/tx/${tx}`);
  await extractAndStoreTx(response.data, {
    blockId: response.data?.status?.block_hash,
    blockTimestamp: response.data?.status?.block_time,
    blockHeight: response.data?.status?.block_height,
  });
  return prisma.transaction.findFirst({ where: { id: tx } });
}
