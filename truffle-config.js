require('dotenv').config()
var HDWalletProvider = require("truffle-hdwallet-provider");
//var NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")


//var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";

//Public - 0xe010ac6e0248790e08f42d5f697160dedf97e024
//Private - 3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216
//ganache-cli -m "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish" -l 10000000

//ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

//var nick = "the ureau";
//public - 0xb204edaf0410675e00e6c8a7e448a9e8e2db69aa
// private -fe5f52e7e0381448fe7d4a99e409b6da987b31362125ccb7bca781949cf61710
var mnemonic = process.env.ETH_MNEMONIC;
var accessToken = process.env.INFURA_ACCESS_TOKEN;
var rinkAccessToken = process.env.rinkeby_infura;
var Mainnet_alchemy = process.env.main_alchemy;



module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 8000000
    } ,
    mocha: {
    enableTimeouts: false,
    before_timeout: 210000// Here is 2min but can be whatever timeout is suitable for you.
},
  //   dev2: {
  //     host: "localhost",
  //     port: 8546,
  //     network_id: "*" // Match any network id
  //   },
  //   poa:  {
  //     provider: new HDWalletProvider(mnemonic, "http://40.117.249.181:8545"),
  //     network_id:"*",
  //     gas: 4612388,
  //     gasPrice: 17e9
  //   },
  //   test:  {
  //     provider: new HDWalletProvider(mnemonic, "http://localhost:8545"),
  //     network_id:"*",
  //     gas: 4612388,
  //     gasPrice: 17e9
  //   },
  //   ropsten: {
  //     provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io"),
  //     network_id: 3,
  //     gas: 4612388
  //   },
  //   rinkeby: {
  //           provider: function() {
  //       return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced")
  //     },
  //     network_id: 4
  //   }  
  
    rinkeby: {
      provider: () =>
      new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216","https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"),
      network_id: 4
    }   ,
    mainnet: {
      provider: () =>
      new HDWalletProvider("","https://mainnet.infura.io/v3/bc3e399903ae407fa477aa0854a00cdc"),
      network_id: 1
    }    
/*
    rinkeby: {
      network_id: "4",
      provider: function () {
        var wallet = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3' + accessToken)
        var nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: 4,
      gas: 4700000,
      gasPrice: 4000000000
    },

      mainnet: {
      network_id: "1",
      provider: function () {
        var wallet = new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/v3' + accessToken)
        var nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: 1,
      gas: 4700000,
      gasPrice: 7000000000
    }
*/


   }
};