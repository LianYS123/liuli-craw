const pool = require("./db");
const chalk = require("chalk");
const mysql = require("mysql2/promise");
const config = require("./config");
const { get$ } = require("./tools");
const log = console.log;
(async () => {
  const res1 = await pool.query(`delete from article where uid is null`);
  console.log(res1);
  const res2 = await pool.query(`delete from article where uid = ''`);
  console.log(res2);
  pool.end();
})();
