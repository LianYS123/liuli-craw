const { notice, getUids, createLinks, get$ } = require("./tools");
const mysql = require("mysql2/promise");
const pool = require("./db");
const moment = require("dayjs");
const config = require("./config");
const fs = require("fs");
const chalk = require("chalk");
const { parseURL } = require("whatwg-url");

const log = console.log;

const insertData = async (data) => {
  const { raw_id } = data;
  const [rows] = await pool.query(
    "select count(*) c from article where raw_id = ?",
    [raw_id]
  );
  if (!raw_id) {
    notice({
      data,
      err: new Error("no raw_id"),
    });
  }
  if (rows[0].c === 0) {
    const sql = `insert into article set ?`;
    log(chalk.blue(mysql.format(sql, data)));
    await pool.query(sql, data);
    log(chalk.green(`insert ${data.title} success`));
  } else {
    const sql = `update article set ? where raw_id=${raw_id}`;
    log(chalk.blue(mysql.format(sql, data)));
    await pool.query(sql, data);
    log(chalk.green(`update ${data.title} success`));
  }
};

const parseDetail = async (listItem) => {
  const { data: listData, uri } = listItem;
  const $ = await get$(uri);
  log(chalk.underline(uri));
  let title = $(".entry-title").text();
  let rating_count = $(".post-ratings strong")
    .eq(0)
    .text()
    .trim()
    .replace(",", "");
  let rating_score = $(".post-ratings strong").eq(1).text().trim();
  let uids = getUids($(".entry-content").text());
  let data = {
    title,
    rating_count: parseInt(rating_count) || 0,
    rating_score: parseFloat(rating_score) || 0,
    uid: uids.join("|"),
    ...listData,
  };
  if (uids.length === 0) {
    notice({
      data,
      err: new Error("skip data miss uids"),
    });
    return;
  }
  try {
    await insertData(data);
  } catch (err) {
    notice({ data, err });
  }
};
const parseList = async (link) => {
  const $ = await get$(link);
  log(chalk.underline(link));
  let hrefs = [];
  $("article.post").each(function (i, el) {
    let timestr = $(el).find(".entry-header time").attr("datetime");
    const time = +moment(timestr) || new Date(timestr).getTime();
    let href = $(el).find(".entry-title a").attr("href");
    let img_src = $(el).find(".entry-content img").attr("src");
    let content = $(el).find(".entry-content").text().trim();
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
    };
    hrefs.push({ uri: href, data });
  });
  return hrefs;
};

const getEndPage = async () => {
  if (config.END_PAGE) {
    return config.END_PAGE;
  } else {
    const firstPage = config.BASE_LINK + 1;
    const $ = await get$(firstPage);
    const num = $("#wp_page_numbers .first_last_page > a").text();
    return parseInt(num) || 100;
  }
};

const start = async () => {
  try {
    const endPage = await getEndPage();
    const startPage = config.START_PAGE;
    const links = createLinks(startPage, endPage);
    console.log(chalk.cyan(`start fetching from ${startPage} to ${endPage}`));
    fs.writeFileSync(config.CRAW_ERROR_LOG_PATH, "craw error log \n\n");

    // 发送全部请求，任何一个请求成功马上处理
    for await (const hrefs of links.map(parseList)) {
      try {
        // fetch detail
        await Promise.allSettled(hrefs.map(parseDetail));
      } catch (error) {
        notice(error.message);
      }
    }
  } catch (error) {
    notice(error.message);
  } finally {
    pool.end();
  }
};

start();
