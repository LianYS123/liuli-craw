module.exports = {
  calcTime: async (fn, ...args) => {
    const t1 = Date.now();
    await fn(...args);
    const t2 = Date.now();
    return t2 - t1;
  },
  delay: (t) => new Promise((resolve) => setTimeout(resolve, t))
};
