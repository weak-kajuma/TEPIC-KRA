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
        if (err) throw err
        client.channels.cache
          .get(process.env.BOT_CH)
          .send(
            "```"+
            `${
              new Date().getMonth() + 1
            }月${new Date().getDate()}日のデイリーリワードが正常に配布されました。` + "```"
          );
        connection.end();
      });
      connection.query("select * from users order by pc desc limit 5", function(err, res, fields) {
        if (err) throw err
        client.channels.cache
          .get(process.env.BOT_CH)
          .send({
            embeds: [
              {
                author: {
                  name: "KRA",
                  url: "https://discord.gg/GQvCEJCdCn"
                },
                title: "Ranking",
                description: 
                `1st : <@${res[0].id}> ${res[0].pc}PC\n`+
                `2nd : <@${res[1].id}> ${res[1].pc}PC\n`+
                `3rd : <@${res[2].id}> ${res[2].pc}PC\n`+
                `4th : <@${res[3].id}> ${res[3].pc}PC\n`+
                `5th : <@${res[4].id}> ${res[4].pc}PC\n`
              }
            ]
          })
      })
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
