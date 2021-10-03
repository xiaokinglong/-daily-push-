import { readFileSync } from "fs";
import { resolve } from "path";
import ejs from "ejs";
import { sendMessage } from "./sendWChat/index.js";
import { config } from "./config.js";

import getFundsData from "./fund.js";
async function main() {
  const info = await getFundsData();
  sendMessage(config.currentDay, info, config.SCKEY);
}

main();
