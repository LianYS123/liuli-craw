const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const writeFile = (stream, pathname) => {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(pathname);
    stream.pipe(ws);
    ws.on('close', () => {
      resolve(pathname);
    });
    ws.on('error', err => {
      reject(err);
    });
  });
};
const get = (src, opts = {}) => {
  const method = src.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    method.get(src, { ...opts }, resolve).on('error', reject);
  });
};
const getExtname = src => {
  let extname = path.extname(src);
  extname =
    extname.indexOf('?') === -1
      ? extname
      : extname.substring(0, extname.lastIndexOf('?'));
  return extname;
};
const fetchFile = async (src, { filename, agent } = {}) => {
  const extname = getExtname(src);
  const basename = path.basename(src);
  const res = await get(src, { agent });
  if (res.statusCode === 303 || res.statusCode === 302) {
    return fetchFile(res.headers.location, filename);
  }
  assert(res.statusCode < 300, 'statusCode: ' + res.statusCode);
  const result = await writeFile(res, filename || basename + extname);
  return result;
};
module.exports = fetchFile;
