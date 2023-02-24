const fs = require("fs");
const { Client, Intents } = require("discord.js");

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
