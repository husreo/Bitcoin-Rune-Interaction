import { Queue, Worker } from "bullmq";
import { redisConfig } from "./config";
import { getBlockTransactions } from "./process";

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
