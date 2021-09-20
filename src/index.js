const { readFileSync } = require("fs");
const { resolve } = require("path");
const axios = require("axios");
const dayjs = require("dayjs");
const ejs = require("ejs");
const {sendMessage} = require("./sendWChat/index.js");

const nowDay = dayjs().format("YYYY-MM-DD");

const SCKEY = process.env.SCKEY;

// note 读取fundJSON中数据
const fundIds = JSON.parse(
  readFileSync(resolve(__dirname, "./fund.json"), "utf-8")
);

// 获取基金当天的详情
function getMyFundDetail(list) {
  return new Promise(async (resolve, reject) => {
    for (let index = 0; index < fundIds.length; index++) {
      const item = fundIds[index];
      const fundLink = `https://fundmobapi.eastmoney.com/FundMApi/FundVarietieValuationDetail.ashx?FCODE=${item.fundCode}&deviceid=D03E8A22-9E0A-473F-B045-3745FC7931C4&plat=Iphone&product=EFund&version=6.2.9&GTOKEN=793EAE9248BC4181A9380C49938D1E31`;
      const {
        data: { Expansion },
      } = await axios.get(fundLink);
      const totalMoney = item.haveShare * Expansion.GZ;
      const currentFound = {
        code: Expansion.FCODE,
        haveShare: item.haveShare, // 基金的用户的份额
        foundName: Expansion.SHORTNAME, // 基金名称
        price: Expansion.GZ, // 当前价格
        changeRate: Expansion.GSZZL, // 变化率
        totalMoney,
        money: item.money,
        channel: item.channel,
      };
      list.push(currentFound);
    }
    resolve(list);
  });
}

// note 处理获取的到的信息
function parseMessage(list) {
  const title = `${nowDay} 您所拥有的基金变化情况`;
  let desc = "";
  list.forEach((item, index) => {
    const template = readFileSync(`${__dirname}/template.ejs`);
    const DescItem = ejs.render(template.toString(), item);
    desc += DescItem + '\n';
  });

  return {
    title,
    desc,
  };
}


async function main() {
  const list = [];
  await getMyFundDetail(list);
  const { title, desc } = await parseMessage(list);
  sendMessage(title, desc, SCKEY).then(res => {
    console.log(res.data)
  })
}

main();
