const fs = require("fs");
const PoolProxy = require("./fetchUtils/PoolProxy");
const createProxyFetch = require("./fetchUtils/createProxyFetch");
const chalk = require("chalk");

const { CRAW_ERROR_LOG_PATH } = require("./config");
const config = require("./config");
const { load } = require("cheerio");
function getUids(content) {
  if (!content) return [];
  let uids = [],
    hasNext = true;
  let reg = /([0-9a-z]{40}|[0-9a-z]{32}|[0-9a-z]+本站不提供下载[0-9a-f]+)/gi;
  while (hasNext) {
    let matchs = reg.exec(content);
    if (matchs) {
      uids.push(matchs[0].split("本站不提供下载").join(""));
    } else {
      hasNext = false;
    }
  }
  return uids;
}

const notice = (msg) => {
  const errorMsg = msg?.message || msg?.err?.message || msg;
  console.log(chalk.red(errorMsg));
  fs.appendFileSync(
    CRAW_ERROR_LOG_PATH,
    (typeof msg === "string" ? msg : JSON.stringify(msg, null, 2)) + "\n"
  );
};

//抓取从start到end页的数据
function createLinks(start, end) {
  let links = [];
  for (let i = start; i <= end; i++) {
    links.push(`${config.BASE_LINK}/${i}`);
  }
  return links;
}

const fetch = createProxyFetch(config.PROXY);
const xFetch = new PoolProxy(config.POOL_LIMIT).addMethod(fetch);
const get$ = async (link) => {
  const text = await xFetch(link).then((res) => res.text());
  return load(text);
};

module.exports = {
  notice,
  getUids,
  xFetch,
  get$,
  createLinks,
};
