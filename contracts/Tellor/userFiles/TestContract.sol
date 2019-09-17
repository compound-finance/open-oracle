pragma solidity ^0.5.0;

import './Optimistic.sol';
/**
* @title Reader
* This contracts is a pretend contract using Tellor that compares two time values
*/
contract TestContract is Optimistic{

	uint public startDateTime;
	uint public endDateTime;
	uint public startValue;
	uint public endValue;
	bool public longWins;
	bool public contractEnded;
	event ContractSettled(uint _svalue, uint _evalue);
    /**
    * @dev This constructor function is used to pass variables to the optimistic contract's constructor
    * and the function is blank
    * @param _userContract address for UserContract
    * @param _disputeFeeRequired the fee to dispute the optimistic price(price sumbitted by known trusted party)
    * @param _disputePeriod is the time frame a value can be disputed after being imputed
    * @param _requestIds are the requests Id's on the Tellor System corresponding to the data types used on this contract.
    * It is recommended to use several requestId's that pull from several API's. If requestsId's don't exist in the Tellor 
    * System be sure to create some.
    * @param _granularity is the amount of decimals desired on the requested value
    */
	constructor(address _userContract, uint _disputeFeeRequired, uint _disputePeriod, uint[] memory _requestIds, uint _granularity) 
	Optimistic(_userContract,_disputeFeeRequired,_disputePeriod, _requestIds,_granularity) public {
	}


    /**
    * @dev creates a start(now) and end time(now + duration specified) for testing a contract start and end period
    * @param _duration in seconds
    */
	function testContract(uint _duration) external {
		startDateTime = now - now % granularity;
		endDateTime = now - now % granularity + _duration;
	}


	/**
    * @dev testing fucntion that settles the contract by getting the first undisputed value after the startDateTime
    * and the first undisputed value after the end time of the contract and settleling(payin off) it.
	*/
	function settleContracts() external{
		bool _didGet;
		uint _time;
		(_didGet, startValue, _time) = getFirstUndisputedValueAfter(startDateTime);
			if(_didGet){
				(_didGet, endValue, _time) = getFirstUndisputedValueAfter(endDateTime);
				if(_didGet){
					if(endValue > startValue){
						longWins = true;
				}
				contractEnded = true;
				emit ContractSettled(startValue, endValue);
			}

		}
	}
}