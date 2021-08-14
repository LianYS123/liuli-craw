const {
  getUids,
  createLinks,
  get$,
  logError,
  logWarn,
  logStat,
  formatTime,
} = require("./tools");
const mysql = require("mysql2/promise");
const pool = require("./db");
const moment = require("dayjs");
const config = require("./config");
const chalk = require("chalk");
const { parseURL } = require("whatwg-url");
const { SKIP_ADS, SKIP_EMPTY_UIDS } = require("./config");

const log = console.log;

let insertCount = 0;
let updateCount = 0;

const insertData = async (data) => {
  const { raw_id } = data;
  const [rows] = await pool.query(
    "select count(*) c from article where raw_id = ?",
    [raw_id]
  );
  if (!raw_id) {
    const error = new Error("no raw_id");
    logError(error, data);
  }
  if (rows[0].c === 0) {
    const sql = `insert into article set ?`;
    log(chalk.blue(mysql.format(sql, data)));
    await pool.query(sql, data);
    insertCount++;
    log(chalk.green(`insert ${data.title} success`));
  } else {
    const sql = `update article set ? where raw_id=?`;
    log(chalk.blue(mysql.format(sql, data)));
    await pool.query(sql, [data, raw_id]);
    updateCount++;
    log(chalk.green(`update ${data.title} success`));
  }
};

const parseDetail = async (listItem) => {
  const { data: listData, uri } = listItem;
  const $ = await get$(uri);
  log(chalk.cyanBright(uri));
  let title = $(".entry-title").text();
  let rating_count = $(".post-ratings strong")
    .eq(0)
    .text()
    .trim()
    .replace(",", "");
  let rating_score = $(".post-ratings strong").eq(1).text().trim();
  const entry_content = $(".entry-content").text();
  const entry_html = $(".entry-content").html();
  const imgs = [];
  $(".entry-content")
    .find("img")
    .each((i, el) => {
      const src = $(el).attr("src");
      imgs.push(src);
    });
  let uids = getUids(entry_content);
  let data = {
    title,
    entry_content,
    entry_html,
    rating_count: parseInt(rating_count) || 0,
    rating_score: parseFloat(rating_score) || 0,
    uid: uids.join("|"),
    imgs: imgs.join("|"),
    ...listData,
  };
  if (SKIP_EMPTY_UIDS && uids.length === 0) {
    // logError(new Error("skip data miss uids"), data);
    logWarn("skip data miss uids", data);
    return;
  }
  try {
    await insertData(data);
  } catch (err) {
    logError(err);
  }
};
const parseList = async (link) => {
  const $ = await get$(link);
  log(chalk.cyan(link));
  let hrefs = [];
  $("article.post").each(function (i, el) {
    let timestr = $(el).find(".entry-header time").attr("datetime");
    const time = +moment(timestr) || new Date(timestr).getTime();
    let href = $(el).find(".entry-title a").attr("href");
    let img_src = $(el).find(".entry-content img").attr("src");
    let content = $(el).find(".entry-content").text().trim();
    const cat = $(el).find("span.cat-links > a").text();
    let tags = [];
    $(el)
      .find(".tag-links a[rel=tag]")
      .each(function () {
        let tag = $(this).text();
        tags.push(tag);
      });
    const raw_id = parseURL(href).path.pop().replace(".html", "");
    let data = {
      raw_id,
      time,
      href,
      img_src,
      tags: tags.join("|"),
      content,
      cat,
    };
    const title = $(el).find("header > .entry-title").text().trim();
    const testStr = title + content;
    const adArr = ["广告", "点击购买", "优惠券"];
    if (
      (SKIP_ADS && !title) ||
      adArr.some((adStr) => testStr.includes(adStr))
    ) {
      logWarn("skip ad", data);
      return;
    }
    hrefs.push({ uri: href, data });
  });
  return hrefs;
};

const getEndPage = async () => {
  if (config.END_PAGE) {
    return config.END_PAGE;
  } else {
    const firstPage = config.BASE_LINK + '/1';
    const $ = await get$(firstPage);
    const num = $("#wp_page_numbers .first_last_page > a").text();
    console.log(num);
    return parseInt(num) || 100;
  }
};

const start = async () => {
  try {
    const startTime = Date.now();
    const endPage = await getEndPage();
    const startPage = config.START_PAGE;
    const links = createLinks(startPage, endPage);
    console.log(chalk.cyan(`start fetching from ${startPage} to ${endPage}`));

    const promises = [];

    // 发送全部请求，任何一个请求成功马上处理
    for await (const hrefs of links.map(parseList)) {
      // 解析列表数据, 并加入promises列表中
      promises.push(...hrefs.map(parseDetail));
    }
    // 监控列表请求全部完成
    await Promise.allSettled(promises);
    const endTime = Date.now();
    const cost = Math.ceil((endTime - startTime) / 1000); // s
    logStat(`${formatTime(startTime)} - ${formatTime(endTime)}`);
    logStat(`cost time: ${cost}s (${(cost / 60).toFixed(2)}min)`);
    logStat(`insert ${insertCount} items`);
    logStat(`update ${updateCount} items`);
    logStat(`total ${insertCount + updateCount}`);
  } catch (error) {
    logError(error);
  } finally {
    pool.end();
  }
};

start();
