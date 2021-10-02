import dayjs from "dayjs";

const currentDay = dayjs().format("YYYY-MM-DD");
export const config = {
  SCKEY: process.env.SCKEY,
  currentDay: currentDay,
  numberRange: {
    // 计算范围
    number: "BigNumber",
    precision: 20,
  },
};
