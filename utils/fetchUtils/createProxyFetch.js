const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
const createProxyFetch = (proxyAddress) => {
  const agent = new HttpsProxyAgent(proxyAddress);
  const xFetch = (link, options) => {
    return fetch(link, { ...options, agent });
  };
  return xFetch;
};
module.exports = createProxyFetch;
// xFetch('http://www.google.com').then(res => res.text()).then(console.log)
