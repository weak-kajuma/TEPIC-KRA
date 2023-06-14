const mysql = require("mysql2");
require("dotenv").config();

module.exports = {
  data: {
    name: "sql",
    description: "Control DB",
  },
  async execute(msg) {
    const s = msg.content.substring(5);
    if (!msg.member.permissions.has("BAN_MEMBERS"))
      return msg.reply("```You don't have permission to execute this!```");
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
      connection.query(s, function (err, res, fields) {
        if (err) {
          msg.reply("SqlError:\n```" + e.toString() + "```");
          return;
        }
        console.log(res);
        msg.reply("```" + JSON.stringify(res).toString() + "```");
        connection.end();
      });
    } catch (e) {
      msg.reply("Error:\n```" + e.toString() + "```");
    }
  },
};
