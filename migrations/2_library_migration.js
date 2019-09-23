/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
var TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
var TellorStake = artifacts.require("./libraries/TellorStake.sol");
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require("./libraries/TellorGettersLibrary.sol");
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
var OldTellorTransfer = artifacts.require("./oldContracts/libraries/OldTellorTransfer.sol")
var OldTellorDispute = artifacts.require("./oldContracts/libraries/OldTellorDispute.sol")
var OldTellorLibrary = artifacts.require("./oldContracts/libraries/OldTellorLibrary.sol")
var Tellor = artifacts.require("./Tellor.sol");
var TellorMaster = artifacts.require("./TellorMaster.sol");
/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
*@dev Use this for setting up contracts for testing 
*this will link the Factory and Tellor Library

*These commands that need to be ran:
*truffle migrate --network rinkeby
*truffle exec scripts/Migrate_1.js --network rinkeby
*truffle exec scripts/Migrate_2.js --network rinkeby
*/
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
// module.exports = function (deployer) {
//     deployer.deploy(TellorLibrary).then(() => {
//         deployer.deploy(Tellor);
//     });
//     deployer.link(TellorLibrary, Tellor);
// };

module.exports = async function (deployer) {

    //OLD DEPS
  await deployer.deploy(OldTellorTransfer);

  // deploy dispute
  await deployer.link(OldTellorTransfer,OldTellorDispute);
  await deployer.deploy(OldTellorDispute);

    // deploy stake
  await deployer.link(OldTellorTransfer,TellorStake);
  await deployer.link(OldTellorDispute,TellorStake);
  await deployer.deploy(TellorStake);

  // deploy getters lib
  await deployer.deploy(TellorGettersLibrary);

  // deploy lib
  await deployer.link(OldTellorDispute, OldTellorLibrary);
  await deployer.link(OldTellorTransfer, OldTellorLibrary);
  await deployer.link(TellorStake, OldTellorLibrary);
  await deployer.deploy(OldTellorLibrary);


  // deploy tellor
  await deployer.link(OldTellorTransfer,OldTellor);
  await deployer.link(OldTellorDispute,OldTellor);
  await deployer.link(TellorStake,OldTellor);
  await deployer.link(OldTellorLibrary,OldTellor);
  await deployer.deploy(OldTellor);

  // deploy tellor master
  await deployer.link(OldTellorTransfer,TellorMaster);
  await deployer.link(TellorGettersLibrary,TellorMaster);
    await deployer.link(TellorStake,TellorMaster);
  await deployer.deploy(OldTellor).then(async function() {
    await deployer.deploy(TellorMaster, OldTellor.address)
  });



  // deploy transfer
	await deployer.deploy(TellorTransfer);

  // deploy dispute
  await deployer.link(TellorTransfer,TellorDispute);
	await deployer.deploy(TellorDispute);

  // deploy stake
  await deployer.link(TellorTransfer,TellorStake);
  await deployer.link(TellorDispute,TellorStake);
	await deployer.deploy(TellorStake);


  // deploy lib
  await deployer.link(TellorDispute, TellorLibrary);
  await deployer.link(TellorTransfer, TellorLibrary);
  await deployer.link(TellorStake, TellorLibrary);
  await deployer.deploy(TellorLibrary);

  // deploy tellor
  await deployer.link(TellorTransfer,Tellor);
  await deployer.link(TellorDispute,Tellor);
  await deployer.link(TellorStake,Tellor);
  await deployer.link(TellorLibrary,Tellor);
  await deployer.deploy(Tellor);

  // deploy tellor master
  // await deployer.link(TellorTransfer,TellorMaster);
  // await deployer.link(TellorGettersLibrary,TellorMaster);
  //   await deployer.link(TellorStake,TellorMaster);
  // await deployer.deploy(Tellor).then(async function() {
  //   await deployer.deploy(TellorMaster, Tellor.address)
  // });



};
/****Uncomment the body to run this with Truffle migrate for truffle testing*/
