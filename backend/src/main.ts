import mempoolJS from "@mempool/mempool.js";
import cors from "cors";
import express, { Express } from "express";
import WebSocketServer from "ws";
import { taskQueue } from "./lib/worker";
import router from "./routes";

const app: Express = express();
app.use(cors());
app.use(router);

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
    console.log("started listening for blocks via websocket ...");
  });

  ws.on("message", async (data: any) => {
    const res = JSON.parse(data.toString());
    if (res.block) {
      const blockId = res.block.id;
      await taskQueue.add(`block-${blockId}`, { blockId: blockId });
    }
  });
};

init();
app.listen(8080, () => {
  console.log("server started on http://0.0.0.0:8080");
});
