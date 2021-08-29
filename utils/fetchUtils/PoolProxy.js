const { delay } = require("./utils");
class Pool {
  cache = [];
  flag = false;
  size = 0;
  constructor(limit, gap) {
    this.limit = limit;
    this.gap = gap;
  }
  setSize = (size) => {
    if (size <= this.size) {
      this.size = size;
      this.onSizeDecrease();
    } else {
      this.size = size;
    }
  };
  onSizeDecrease = () => {
    if (!this.cache.length) {
      if (!this.size) {
        this.flag = false;
      }
      return;
    }
    if (this.size < this.limit) {
      const rest = this.limit - this.size;
      for (let i = 0; i < rest; i++) {
        this.start();
      }
    }
  };
  run = async () => {
    const { args, cb, fn } = this.cache.shift();
    await fn(...args)
      .then(cb.resolve)
      .catch(cb.reject);
  };
  start = async () => {
    if (this.cache.length) {
      this.setSize(this.size + 1);
      await this.run();
      this.setSize(this.size - 1);
    }
  };
  delayStart = async () => {
    if (this.cache.length) {
      await this.run();
      await delay(this.gap);
      this.delayStart();
    }
  };
  addMethod =
    (fn) =>
    (...args) => {
      return new Promise((resolve, reject) => {
        this.cache.push({
          fn,
          args,
          cb: {
            resolve,
            reject,
          },
        });
        if (!this.flag) {
          this.flag = true;
          if (this.gap) {
            this.delayStart();
            return;
          }
          this.setSize(this.size);
        }
      });
    };
}
class ProxyPool {
  pool = new Pool();
  constructor(limit = 10, gap) {
    this.pool.limit = limit;
    this.pool.gap = gap;
  }
  addMethod = this.pool.addMethod;
  setLimit = (limit) => (this.pool.limit = limit);
  getLimit = () => this.pool.limit;
  setGap = (gap) => (this.pool.gap = gap);
  getGap = () => this.pool.gap;
  getSize = () => this.pool.size;
}
module.exports = ProxyPool;
