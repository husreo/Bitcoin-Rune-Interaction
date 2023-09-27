import { exit } from "process";
import { getBlockTransactions } from "./process";
import axios from "axios";

let blockIds: string[] = [];

// async function main() {
//   const response = await axios.get(
//     "https://mempool.space/api/v1/blocks/809612"
//   );
//   const blocks = response.data;
//   for (const b of blocks) {
//     blockIds.push(b.id);
//   }

//   console.log("no of blocks: ", blockIds.length);
//   await Promise.all(
//     blockIds.map(async (id) => {
//       await getBlockTransactions(id);
//       console.log("finished id: ", id);
//     })
//   );
// }
// main();

getBlockTransactions(
  "000000000000000000001f3c3226f9061fb0d695ed74ebbd2ad8fc2d8fae1f7e"
).then(() => {
  exit(0);
});
