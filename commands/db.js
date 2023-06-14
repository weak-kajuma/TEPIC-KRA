const mysql = require("mysql2");
const { client } = require("..");
require("dotenv").config();

module.exports = {
  data: {
    name: "db",
    description: "Reply DB results",
  },
  async execute(msg) {
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
      const member = msg.mentions.members.first();
      let id = 0;
      if (member === void 0) id = msg.author.id;
      else id = member.id;
      connection.query(
        `insert into users select ${id}, 0,0,0 where not exists (select 1 from users where id = ${id})`,
        function (err, res, fields) {
          if (err) throw err;
        }
      );
      connection.query(
        "select * from users where id=" + id,
        function (err, results, fields) {
          if (err) throw err;
          const date = new Date();
          msg.reply({
            embeds: [
              {
                author: {
                  name: "KRA",
                  url: "https://discord.gg/GQvCEJCdCn", // nameプロパティのテキストに紐付けられるURL
                  icon_url: msg.author.avatarURL(),
                },
                title: "ステータス",
                description: "Check your status now!",
                color: 7506394,
                timestamp: date,
                fields: [
                  {
                    name: "**DC**",
                    value: `${results[0].dc}`,
                  },
                  {
                    name: "**FC**",
                    value: `${results[0].fc}`,
                  },
                  {
                    name: "**PC**",
                    value: `${results[0].pc}`,
                  },
                  {
                    name: "DC再配布まで",
                    value: `あと**${23 - date.getHours()}時間${
                      59 - date.getMinutes()
                    }分${59 - date.getSeconds()}秒**`,
                    inline: true,
                  },
                ],
              },
            ],
          });
          connection.end();
        }
      );
    } catch (err) {
      msg.reply("Error:\n```" + err.toString() + "```");
    }
  },
};
