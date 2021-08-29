const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv);
// console.log(args);
const {
  base_link = "https://www.hacg.cat/wp/page",
  proxy = "http://localhost:8001",
  pool_limit = 50,
  db_name = "db_lian",
  db_host = "localhost",
  db_pass = "tb1766318380",
  db_user = "root",
  start_page = 1,
  end_page,
  skip_ads = true,
  skip_empty_uids = false,
  l,  // 指定页面
  d,  // 指定详情页
} = args;

const config = {
  CRAW_LOG_PATH: path.join(__dirname, "../log"),
  BASE_LINK: base_link,
  PROXY: proxy, // 代理
  POOL_LIMIT: pool_limit, // 同时请求数限制
  DB_NAME: db_name,
  DB_HOST: db_host,
  DB_PASS: db_pass,
  DB_USER: db_user,
  START_PAGE: start_page, // 开始页， 默认1
  END_PAGE: end_page, // 结束页, 默认最后一页
  SKIP_ADS: skip_ads,
  SKIP_EMPTY_UIDS: skip_empty_uids,
  LINK: l,
  DETAIL_LINK: d
};


// 创建日志文件
if (!fs.existsSync(config.CRAW_LOG_PATH)) {
  fs.mkdirSync(config.CRAW_LOG_PATH);
}

module.exports = config;
