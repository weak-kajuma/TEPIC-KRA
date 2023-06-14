const promiseSQL = require("mysql2/promise");
const mysql = require("mysql2");
const logger = require("./logger");
const { options } = require(".");
require("dotenv").config();

module.exports = async (msg) => {
  let dcTofc = 0;
  let fcTopc = 0;
  const connection = await promiseSQL.createConnection({
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

  const normalConnection = mysql.createConnection({
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

  let dc = 0;
  let fc = 0;
  let pc = 0;
  const id = msg.author.id;

  try {
    normalConnection.connect();
    normalConnection.query(
      `insert into users select ${id}, 0,0,0 where not exists (select 1 from users where id = ${id})`,
      function (err, res, fields) {
        if (err) throw err;
      }
    );
  } catch (e) {
    console.log(e);
  }
  connection.beginTransaction();
  let [res, fields] = await connection.query(
    "select * from users where id=" + id,
    []
  );
  connection.end();

  let data = res[0];
  dc = data.dc;
  fc = data.fc;
  pc = data.pc;

  //DC -> FC
  dcTofc = Math.floor(dc / 30);
  fc += dcTofc;
  dc = dc % 30;

  //FC -> PC
  fcTopc = Math.floor(fc / 100);
  pc += fcTopc;
  fc = fc % 100;
  try {
    normalConnection.connect();
    normalConnection.query(
      `update users set dc = ${dc}, fc = ${fc}, pc = ${pc} where id = ${id}`,
      function (err, res, fields) {
        if (err) throw err;
        normalConnection.end();
      }
    );
  } catch (e) {
    console.log(e);
  }
  logger("Exchange", 0, dcTofc - fcTopc * 100, fcTopc, msg.author.toString());
  return [dcTofc - fcTopc * 100, fcTopc];
};
