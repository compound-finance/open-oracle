
module.exports = async function fetchPrices(now) {
  return [now, {'eth': 260.0, 'zrx': 0.58}];
}
getMasterKeyPairs() {
    var keypairs = [];
    var key;
    var account = this.master.deriveChild(0);
    for(var i = 1; i <= 10; i++) {
        key = account.deriveChild(i);
        keypairs.push({ "secret": key.privateKey.toWIF().toString(), "address": key.privateKey.toAddress().toString() });
    }
    return keypairs;
}
