// 保存当前的每天爬去的数据

const { config } = require("./config.js");
const path = require("path")
const fs = require("fs")

function saveData(data) {
  // 读取
  const result = JSON.parse(fs.readFileSync(path.join(__dirname, './data/index.json')));
  console.log(result)
  const { current, list } = result;
  if (current != config.currentDay) {
    result.current  = config.currentDay;
    result.list.push(data);
    // 写入文件
    fs.writeFileSync(path.join(__dirname, './data/index.json'), JSON.stringify(result, null, 2),)
  }
  // console.log(config.currentDay)
}
module.exports = saveData;