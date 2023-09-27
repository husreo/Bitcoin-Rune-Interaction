import axios from "axios";
import prisma from "./db";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function update() {
  const txs = await prisma.transaction.findMany({
    where: { blockNumber: "-1", blockTimestamp: "-1" },
  });
  console.log(txs.length);

  await Promise.all(
    txs.map(async (tx) => {
      await delay(10000);
      const response = await axios.get(`https://mempool.space/api/tx/${tx.id}`);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          blockNumber: response.data.status?.block_hash,
          blockTimestamp: response.data.status?.block_time?.toString(),
        },
      });
    })
  );
}

update();
