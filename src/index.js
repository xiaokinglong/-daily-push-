const {  sendMessage }  =  require("./sendWChat/index.js")
const {  config }  =  require("./config.js")
const getFundsData  =  require("./fund.js")

async function main() {
  const info = await getFundsData();
  sendMessage(config.currentDay, info, config.SCKEY).then((value) => {console.log(value);});
}

main();
