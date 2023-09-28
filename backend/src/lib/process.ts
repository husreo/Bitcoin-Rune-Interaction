import axios from "axios";
import { BlockDetails, GetBlockResponse, Tx } from "../@types";
import { config } from "./config";
import { prisma } from "./db";
import { decodeRuneScript } from "./decoder";

const ASM_SCRIPT_PREFIX = "6a0152";

export async function extractAndStoreTx(
  tx: Tx,
  info: BlockDetails
): Promise<number> {
  let count = 0;
  for (const out of tx.vout) {
    try {
      const asm: string = out.scriptpubkey;
      if (!asm.startsWith(ASM_SCRIPT_PREFIX)) continue;
      const result = decodeRuneScript(Buffer.from(asm, "hex"));
      await prisma.transaction.upsert({
        where: { id: tx.txid },
        create: {
          id: tx.txid,
          issuance: result.issueData,
          transfers: result.transfers,
          blockNumber: info.blockId,
          blockTimestamp: info.blockTimestamp.toString(),
          blockHeight: info.blockHeight,
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
    `${config.MEMPOOL_BASE_URL}/block/${blockId}/txs`
  );
  const txs: Tx[] = response.data;
  console.log("no of transactions in block: ", txs.length);

  let blockValidTxCount = 0;

  for (const tx of txs) {
    const numOfValidTxs = await extractAndStoreTx(tx, {
      blockId: block.id,
      blockTimestamp: block.timestamp,
      blockHeight: block.height,
    });
    blockValidTxCount += numOfValidTxs;
  }
  console.log("valid rune txs: ", blockValidTxCount);
}

export async function getBlock(blockId: string): Promise<GetBlockResponse> {
  const response = await axios.get(
    `${config.MEMPOOL_BASE_URL}/v1/block/${blockId}`
  );
  const { id, timestamp, height } = response.data;
  return { id, timestamp, height };
}

export async function checkValid(tx: string) {
  const response = await axios.get(`${config.MEMPOOL_BASE_URL}/tx/${tx}`);
  await extractAndStoreTx(response.data, {
    blockId: response.data?.status?.block_hash,
    blockTimestamp: response.data?.status?.block_time,
    blockHeight: response.data?.status?.block_height,
  });
  return prisma.transaction.findFirst({ where: { id: tx } });
}
