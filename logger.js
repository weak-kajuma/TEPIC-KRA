const client = require(".");

require("dotenv").config();

const bot_ch = process.env.BOT_CH;

module.exports = (type, dc, fc, pc, options = "") => {
  client.channels.cache.get(bot_ch).send({
    embeds: [
      {
        author: {
          name: "KRA",
          url: "https://discord.gg/GQvCEJCdCn", // nameプロパティのテキストに紐付けられるURL
        },
        title: "Log",
        description: `${type} ${dc}DC ${fc}FC ${pc}PC ${options}`,
      },
    ],
  });
};
