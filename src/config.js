const dayjs = require("dayjs");
const currentDay = dayjs().format("YYYY-MM-DD");

const config = {
  SCKEY: process.env.SCKEY,
  currentDay: currentDay,
  numberRange: {
    // 计算范围
    number: "BigNumber",
    precision: 20,
  },
};

module.exports = { config };
