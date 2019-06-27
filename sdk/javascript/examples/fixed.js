
module.exports = async function fetchPrices() {
  return [Math.floor((+new Date) / 1000), {'eth': 260.0, 'zrx': 0.58}];
}
