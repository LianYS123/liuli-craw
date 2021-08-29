const fs = require("fs");
const PoolProxy = require("./fetchUtils/PoolProxy");
const createProxyFetch = require("./fetchUtils/createProxyFetch");
const moment = require("dayjs");
const chalk = require("chalk");
const path = require("path");

const { CRAW_LOG_PATH } = require("../config");
const config = require("../config");
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

const DATE_TIME_FORMAT = "YYYY-MM-DD hh:mm:ss";
const formatTime = (t) => moment(t).format(DATE_TIME_FORMAT);

const pathname = formatTime(Date.now());
fs.mkdirSync(path.join(CRAW_LOG_PATH, pathname));

const appendData = (data, filename) => {
  fs.appendFileSync(
    path.join(CRAW_LOG_PATH, pathname, filename),
    (typeof data === "string" ? data : JSON.stringify(data, null, 2)) + "\n"
  );
};

const logError = (error, data) => {
  console.log(chalk.red(error.message));
  if (data) {
    appendData(data, "error");
  }
  appendData(error, "error");
  appendData("-".repeat(100), "error");
};

const logWarn = (msg, data) => {
  console.log(chalk.yellow(msg));
  if (data) {
    appendData(data, "warn");
  }
  appendData(msg, "warn");
  appendData("-".repeat(100), "warn");
};

const logInfo = (info) => {
  console.log(chalk.blue(info));
  appendData(info, "info");
};

const logStat = (total) => {
  console.log(chalk.greenBright(total));
  appendData(total, "total");
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

const withErrorHandler = (func) => {
  return (...args) => {
    try {
      return func(...args);
    } catch (error) {
      logError(error);
    }
  };
};

module.exports = {
  getUids,
  xFetch,
  get$,
  createLinks,
  logError,
  logInfo,
  logWarn,
  logStat,
  formatTime,
  withErrorHandler
};
