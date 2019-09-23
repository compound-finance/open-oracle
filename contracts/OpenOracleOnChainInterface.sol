pragma solidity ^0.5.0;


/*This contract is the interface between the OpenOracle and onChain prices.
Examples of onchain price:
	ETH/USD - DAI/ETH price on DEXes
	BTC/USD - WBTC/DAI on DEX
	Onchain oracles:
		Tellor
		Chainlink
		Zap
		Maker DAO ETH/USD price

*/



interface OpenOracleOnChainInterface{
	function getCurrentValue(string calldata _symbol) external returns(bool,uint,uint); //_didGet,_value,_timestampRetrieved
}