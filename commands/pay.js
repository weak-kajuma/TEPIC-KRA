const mysql = require("mysql2");
const promiseMysql = require("mysql2/promise");
const { client } = require("..");
const logger = require("../logger");
require("dotenv").config();

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
    },
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  return connection;
}

async function getConnectionWithPromise() {
  const connection = await promiseMysql.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
    },
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  return connection;
}

module.exports = {
  data: {
    name: "pay",
    description: "PAY!",
  },
  async execute(msg) {
    const errorHandling = (e) =>
      msg.reply("Error:\n```" + e.toString() + "```");
    const connectionErrorHandling = (e) => {
      if (e) throw e;
    };
    if (msg.mentions.members.size !== 1)
      return msg.reply("```You have to choose a member you want to act```");
    const args = msg.content.split(" ");
    if (args.length < 5) return msg.reply("```You have to send valid args```");
    args.shift();
    //定数
    const sender = msg.author; //せんだー
    const receiver = msg.mentions.members.first(); //れしーばー
    const dc = Math.floor(eval(args[1]));
    const fc = Math.floor(eval(args[2]));
    const pc = Math.floor(eval(args[3]));
    //正判定
    if (dc < 0 || fc < 0 || pc < 0)
      return msg.reply("```You have to pay valid amount```");
    //アカウント確認
    try {
      const con = await getConnection();
      con.connect();
      con.query(
        `insert into users select ${sender.id}, 0,0,0 where not exists (select 1 from users where id = ${sender.id})`,
        connectionErrorHandling
      );
      con.query(
        `insert into users select ${receiver.id}, 0,0,0 where not exists (select 1 from users where id = ${receiver.id})`,
        connectionErrorHandling
      );
      con.end();
    } catch (e) {
      errorHandling(e);
    }
    //不足してないかどうか
    try {
      const con = await getConnectionWithPromise();
      con.connect();
      let [senderData, senderFields] = await con.execute(
        `select * from users where id = ${sender.id}`
      );
      let [receiverData, receiverFields] = await con.execute(
        `select * from users where id = ${receiver.id}`
      );
      senderData = senderData[0];
      receiverData = receiverData[0];
      if (dc > senderData.dc || fc > senderData.fc || pc > senderData.pc) {
        return msg.reply("```You don't have enough money to act this```");
      }
    } catch (e) {
      errorHandling(e);
    }
    //計算
    try {
      const con = await getConnection();
      con.connect();
      //せんだーから減量
      con.query(
        `update users set dc = dc - ${dc}, fc = fc - ${fc}, pc = pc - ${pc} where id = ${sender.id}`,
        connectionErrorHandling
      );
      //れしーばーに増量
      con.query(
        `update users set dc = dc + ${dc}, fc = fc + ${fc}, pc = pc + ${pc} where id = ${receiver.id}`,
        connectionErrorHandling
      );
      logger("Pay", dc, fc, pc, `to ${receiver} from ${sender}`);
      return msg.reply(
        "```" + `-${dc}DC \n` + `-${fc}FC \n` + `-${pc}PC ` + "```"
      );
    } catch (e) {
      errorHandling(e);
    }
  },
};
