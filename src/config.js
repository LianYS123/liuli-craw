const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv);
// console.log(args);
const {
  base_link = "https://www.liuli.cat/wp/anime.html/page",
  proxy = "http://localhost:8001",
  pool_limit = 20,
  db_name = "db_lian",
  db_host = "localhost",
  db_pass = "tb1766318380",
  db_user = "root",
  start_page = 1,
  end_page,
} = args;

module.exports = {
  CRAW_ERROR_LOG_PATH: path.join(__dirname, "craw_error_log"),
  BASE_LINK: base_link,
  PROXY: proxy, // 代理
  POOL_LIMIT: pool_limit, // 同时请求数限制
  DB_NAME: db_name,
  DB_HOST: db_host,
  DB_PASS: db_pass,
  DB_USER: db_user,
  START_PAGE: start_page, // 开始页， 默认1
  END_PAGE: end_page, // 结束页, 默认最后一页
};
