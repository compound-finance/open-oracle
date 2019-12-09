pragma solidity ^0.5.12;

/**
 * @notice Allow Open Oracle to read on-chain prices
 */
interface OpenOracleOnChainInterface{
  /**
   * @notice Returns the current value for a symbol from on-chain
   * @return (_didGet, _value, _timestampRetrieved)
   */
	function getCurrentValue(string calldata _symbol) external returns(bool, uint, uint);
}
