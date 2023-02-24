const mysql = require("mysql2");
require("dotenv").config();

module.exports = {
    data: {
        name: "sql",
        description: "Control DB",
    },
    async execute(msg) {
        const s = msg.content.substring(5);
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
                if (err) throw err;
                console.log(res);
                msg.reply("```" + JSON.stringify(res).toString() + "```");
                connection.end();
            });
        } catch (e) {
            throw e;
        }
    },
};
