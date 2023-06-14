const fs = require("fs");
const { Client, Intents } = require("discord.js");
const cron = require("node-cron");
const mysql = require("mysql2");

require("dotenv").config();

//Discord Settings
const client = new Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
});

module.exports = client;

const prefix = process.env.PREFIX;

//Commands Read
const commands = {};
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const e of commandFiles) {
  const command = require(`./commands/${e}`);
  commands[command.data.name] = command;
}

client.on("ready", async () => {
  console.log(`${client.user.tag} is ready!`);

  //Scheduler
  cron.schedule("0 0 0 * * *", () => {
    const s = "update users set dc = 5";
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
          console.log(err);
        }
        client.channels.cache
          .get(bot_ch)
          .send(
            `${
              new Date().getMonth() + 1
            }月${new Date().getDate()}日のデイリーリワードが正常に配布されました。`
          );
        connection.end();
      });
    } catch (e) {
      console.log(e);
    }
  });
});

client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;
  const cmd = commands[msg.content.split(" ")[0].substring(prefix.length)];
  try {
    await cmd.execute(msg);
  } catch (e) {
    msg.reply("```エラーが発生しました```");
    console.log(e);
  }
});

client.login(process.env.BOT_TOKEN);
