const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const ejs = require("ejs");
const { create, all, unit } = require("mathjs");
const { config } = require("./config.js");

// 初始化 mathjs
const mathjs = create(all, config.numberRange);
// 获取基金数据
function getFundsData() {
  return new Promise(async (resolve, reject) => {
    // 读取读取拥有基金的数据
    const jsonPath = path.join(__dirname, 'JSON/fund.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let fundsInfo = "";
    for (let index = 0; index < jsonData.length; index++) {
      const { code, haveShare, money, title } = jsonData[index];
      // const link = `https://fundmobapi.eastmoney.com/FundMApi/FundVarietieValuationDetail.ashx?FCODE=${code}&deviceid=D03E8A22-9E0A-473F-B045-3745FC7931C4&plat=Iphone&product=EFund&version=6.2.9`;
      const link = `http://fund.eastmoney.com/${code}.html`;
      // try {
      const result = await axios.get(link);
      // console.log(result.data);
      const fundInfo = html2Object(result.data, haveShare, code);

      const calculateInfo = calculate(fundInfo, haveShare, money);

      const info = parseMessage({
        ...fundInfo,
        ...calculateInfo,
        money,
        title,
        link,
        code,
      });
      // } catch (e) {
      //   console.log(e)
      fundsInfo += info + "\n";
      //   console.log(`获取${code}数据时出错了`);
      // }
    }
    resolve(fundsInfo);
  });
}

// 对html进行解析
function html2Object(html, haveShare, code) {
  const $ = cheerio.load(html);
  // str.("[( )]", "~");
  const updateTime = $("#gz_gztime").text();
  // 单位净值
  const unitPrice = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.dataOfFund > dl.dataItem02 > dd.dataNums > span.ui-font-large.ui-color-red.ui-num"
  ).text();
  // 日涨幅
  const dailyIncreases = $(
    "#body div.fundDetail-main > div.fundInfoItem > div.dataOfFund > dl.dataItem02 > dd.dataNums > span.ui-font-middle"
  ).text();
  // 当前交易状态
  const status = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.choseBuyWay.canBuy > div.buyWayWrap > div.buyWayStatic > div:nth-child(1)"
  ).text();
  // 锁定期
  const lockDate = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.infoOfFund > table > tbody > tr:nth-child(3) > td"
  ).text();
  // 基金经理
  const manager = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.infoOfFund > table > tbody > tr:nth-child(1) > td:nth-child(3) > a"
  ).text();
  const managerInfoLink = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.infoOfFund > table > tbody > tr:nth-child(1) > td:nth-child(3) > a"
  ).attr("href");
  // 基金类型
  const type = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.infoOfFund > table > tbody > tr:nth-child(1) > td:nth-child(1) > a"
  ).text();
  // 基金类型
  const fundSize = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.fundInfoItem > div.infoOfFund > table > tbody > tr:nth-child(1) > td:nth-child(2)"
  ).text();
  // 手续费
  const poundage = $(
    "#body > div:nth-child(11) > div > div > div.fundDetail-main > div.choseBuyWay.canBuy > div.buyWayWrap > div.buyWayStatic > div:nth-child(5) > span:nth-child(2) > span.nowPrice"
  ).text();

  return {
    updateTime,
    unitPrice,
    dailyIncreases,
    status,
    lockDate,
    manager,
    managerInfoLink,
    type,
    fundSize,
    poundage,
    holdingsDetails: `http://fundf10.eastmoney.com/ccmx_${code}.html`,
  };
  console.log({
    updateTime,
    unitPrice,
    dailyIncreases,
    status,
    lockDate,
    manager,
    managerInfoLink,
    type,
    fundSize,
    poundage,
  });
}

// 对某些数据进行运算
/**
 * @param {*} fundInfo 爬取的基金信息
 * @param {*} haveShare 拥有的份额
 * @param {*} cost 花费金额
 */
function calculate(fundInfo, haveShare, cost) {
  const { unitPrice, dailyIncreases } = fundInfo;
  // console.log(fundInfo);
  // 当前的金额
  // console.log(unitPrice);
  const currentMoney = mathjs.multiply(haveShare, unitPrice).toFixed(2);
  // const currentMoney = mathjs.multiply(haveShare, unitPrice);
  // 是否盈利
  const isProfit = cost <= currentMoney ? "盈利" : "亏损";
  // 盈利金额
  const profit = mathjs.add(currentMoney, -cost).toFixed(2);
  // 当日收益
  // const currentProfit = mathjs
  //   .multiply(haveShare,dailyIncreases.replace('%', '')/ 100)
  //   .toFixed(2);

  return {
    currentMoney,
    isProfit,
    profit,
  };
  // proFit
  console.log({
    currentMoney,
    isProfit,
    profit,
    // currentProfit,
  });
}

// note 处理获取的到的信息
function parseMessage(info) {
  const template = fs.readFileSync(`./template.ejs`);
  const DescItem = ejs.render(template.toString(), info);
  // console.log(DescItem);
  return DescItem;
}


module.exports = getFundsData
