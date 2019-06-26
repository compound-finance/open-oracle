
module.exports = async function fetchPrices() {
  return [(+new Date) / 1000, {'eth': 260.0, 'zrx': 0.58}];
}
