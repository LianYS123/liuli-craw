const mysql = require("mysql2/promise");
const config = require("./config");

const pool = mysql.createPool({
  database: config.DB_NAME,
  host: config.DB_HOST,
  password: config.DB_PASS,
  user: config.DB_USER,
});

module.exports = pool;
