const mysql = require("mysql2");
const { client } = require("..");
const logger = require("../logger");
const eval = require("../eval")
require("dotenv").config();

module.exports = {
  data: {
    name: "add",
    description: "ADD!",
  },
  execute(msg) {
    if (!msg.member.permissions.has("BAN_MEMBERS"))
      return msg.reply("```You don't have permission to execute this!```");
    if (msg.mentions.members.size !== 1)
      return msg.reply("```You have to choose a member you want to act```");
    const member = msg.mentions.members.first();
    const args = msg.content.split(" ");
    if (args.length < 5) return msg.reply("```You have to send enough args```");
    args.shift();
    const dc = Math.floor(eval(args[1]));
    const fc = Math.floor(eval(args[2]));
    const pc = Math.floor(eval(args[3]));

    const connection = mysql.createConnection({
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
    try {
      connection.connect();
      const id = member.id;
      connection.query(
        `insert into users select ${id}, 0,0,0 where not exists (select 1 from users where id = ${id})`,
        function (err, res, fields) {
          if (err) throw err;
        }
      );
      connection.query(
        `update users set dc = dc + ${dc}, fc = fc + ${fc}, pc = pc + ${pc} where id = ${id}`,
        function (err, res, fields) {
          if (err) throw err;
          let dcX = "+" + dc;
          let fcX = "+" + fc;
          let pcX = "+" + pc;
          if (dc < 0) dcX = dc;
          if (fc < 0) fcX = fc;
          if (pc < 0) pcX = pc;
          logger("Add", dc, fc, pc, `to ${member} from ${msg.author}`);
          msg.reply("```" + `${dcX}DC \n${fcX}FC \n${pcX}PC` + "```");
        }
      );
    } catch (e) {
      msg.reply("Error:\n```" + err.toString() + "```");
    }
  },
};
