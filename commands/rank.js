const mysql = require("mysql2");
const client = require("../index.js");

module.exports = {
    data: {
        name: "rank",
        description: "Show the ranking!",
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
            }
            )} catch(err) {
                msg.reply("Error:\n```" + err.toString() + "```");
            }
    }
};
