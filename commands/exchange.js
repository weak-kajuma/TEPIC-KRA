const mysql = require("mysql2");
const { client } = require("..");
require("dotenv").config();
const exchange = require("../utils");

module.exports = {
  data: {
    name: "exchange",
    description: "Exchange your moneies",
  },
  async execute(msg) {
    let data = await exchange(msg);
    msg.reply("```+" + data[0] + "FC \n+" + data[1] + "PC" + "```");
  },
};
