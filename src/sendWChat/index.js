const axios = require("axios");
const { stringify } = require("qs");

function sendMessage(text, desp, SCKEY) {
  return axios.post(
    `https://sc.ftqq.com/${SCKEY}.send`,
    stringify({
      text,
      desp,
    }),
    {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    }
  );
}

module.exports = { sendMessage };
