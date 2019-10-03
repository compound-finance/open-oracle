pragma solidity ^0.5.0;

import './DelFiPriceWithOnchainData.sol';
/**
* @title Reader
* This contracts is a pretend contract using Tellor that compares two time values
*/
contract TestContract{

	uint public startDateTime;
	uint public endDateTime;
	uint64 public startValue;
	uint64 public endValue;
	bool public longWins;
	bool public contractEnded;
	string public symbol;
	event ContractSettled(uint64 _svalue, uint64 _evalue);
	DelFiPriceWithOnchainData viewContract;

	constructor(string memory _symbol) public {
		symbol = _symbol;
	}

	function setViewContract(address _viewContract) public {
		viewContract = DelFiPriceWithOnchainData(_viewContract);
	}


    /**
    * @dev creates a start(now) and end time(now + duration specified) for testing a contract start and end period
    * @param _duration in seconds
    */
	function startContract(uint _duration) external {
		startDateTime = now;
		endDateTime = now + _duration;
		startValue = viewContract.getPrice(symbol);
	}


	/**
    * @dev testing fucntion that settles the contract by getting the first undisputed value after the startDateTime
    * and the first undisputed value after the end time of the contract and settleling(payin off) it.
	*/
	function settleContracts() external{
		require(now > endDateTime);
		endValue = viewContract.getPrice(symbol);
		if(endValue > startValue){
			longWins = true;
		}
		contractEnded = true;
		emit ContractSettled(startValue, endValue);
	}
}