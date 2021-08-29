const pool = require("./utils/db");
const chalk = require("chalk");
const mysql = require("mysql2/promise");
const config = require("./config");
const { get$ } = require("./utils");
const log = console.log;
const data = {
  title: "[にじいろばんび] えっちな秘密基地2 （1+2）",
  rating_count: 190,
  rating_score: 4.39,
  uid: "230db57e368ff5d1a2e8cac8280ed8771d4030c3|fc7457678e63b81c9e684a11c550e5207f0ba9fc",
  raw_id: "56478",
  time: 1515127362000,
  href: "https://www.hacg.cat/wp/56478.html",
  img_src: "http://ww1.acg.gy/0060lm7Tly1fn5ma1tb5aj30m80goq5z.jpg",
  tags: "3D|3D动画|にじいろばんび|兄妹",
  content:
    "[にじいろばんび]这个社团我很喜欢，于是去找了一下他们之前的作品，果然都很实用。\n秘密基地1和秘密基地2，主角都是一样的，场景换了，我就整合一下，一起为大家介绍一下。\n第1部主要是普通兄妹，第2部就是監禁play。 继续阅读 →",
};
(async () => {
  const firstPage = config.BASE_LINK + "/1";
  const $ = await get$(firstPage);
  const num = $("#wp_page_numbers .first_last_page > a").text();
  console.log(num);
})();
