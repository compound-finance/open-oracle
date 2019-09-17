pragma solidity ^0.5.0;

import './UsingTellor.sol';
import '../TellorMaster.sol';
import '../Tellor.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract Optimistic is UsingTellor{

    //Can we rework soem of these mappings into a struct?
	mapping(uint => bool) public isValue;//mapping for timestamp to bool where it's true if the value as been set
	mapping(uint => uint) valuesByTimestamp; //mapping of timestamp to value
	mapping(uint => bool) public disputedValues;//maping of timestamp to bool where it's true if the value has been disputed
	mapping(uint => uint[]) public requestIdsIncluded; //mapping of timestamp to requestsId's to include

    // struct infoForTimestamp {
    // 	bool isValue;
    // 	uint valuesByTimestamp;
    // 	bool disputedValues;
    // 	uint[] requestIdsIncluded;
    // }
    // mapping(uint => infoForTimestamp) public infoForTimestamps;//mapping timestampt to InfoForTimestamp struct

	uint[] timestamps; //timestamps with values
	uint[] requestIds;
	uint[] disputedValuesArray;
	uint public granularity;
	uint public disputeFee; //In Tributes
	uint public disputePeriod;
	
	event NewValueSet(uint indexed _timestamp, uint _value);
	event ValueDisputed(address _disputer,uint _timestamp, uint _value);
	event TellorValuePlaced(uint _timestamp, uint _value);

    /*Constructor*/
	/**
    * @dev This constructor function is used to pass variables to the UserContract's constructor and set several variables
    * the variables for the Optimistic.sol constructor come for the Reader.Constructor function.
    * @param _userContract address for UserContract
    * @param _disputeFeeRequired the fee to dispute the optimistic price(price sumbitted by known trusted party)
    * @param _disputePeriod is the time frame a value can be disputed after being imputed
    * @param _requestIds are the requests Id's on the Tellor System corresponding to the data types used on this contract.
    * It is recommended to use several requestId's that pull from several API's. If requestsId's don't exist in the Tellor 
    * System be sure to create some.
    * @param _granularity is the amount of decimals desired on the requested value
    */
	constructor(address _userContract, uint _disputeFeeRequired, uint _disputePeriod, uint[] memory _requestIds, uint _granularity) UsingTellor(_userContract) public{
		disputeFee = _disputeFeeRequired;
		disputePeriod = _disputePeriod;
		granularity = _granularity;
		requestIds = _requestIds;
	}

    /*Functions*/
    /**
    * @dev allows contract owner, a centralized party to enter value
    * @param _timestamp is the timestamp for the value
    * @param _value is the value for the timestamp specified
    */
	function setValue(uint _timestamp, uint _value) external{
		//Only allows owner to set value
		require(msg.sender == owner);
		//Checks that no value has already been set for the timestamp
		require(getIsValue(_timestamp) == false);
		//sets timestamp
		valuesByTimestamp[_timestamp] = _value;
		//sets isValue to true once value is set
		isValue[_timestamp] = true;
		//adds timestamp to the timestamps array
		timestamps.push(_timestamp);
		//lets the network know a new timestamp and value have been added
		emit NewValueSet(_timestamp,_value);

	}

    /**
    * @dev allows user to initiate dispute on the value of the specified timestamp
    * @param _timestamp is the timestamp for the value to be disputed
    */
	function disputeOptimisticValue(uint _timestamp) external payable{
		require(msg.value >= disputeFee);
		//require that isValue for the timestamp being disputed to exist/be true
		require(isValue[_timestamp]);
		// assert disputePeriod is still open
		require(now - now % granularity  <= _timestamp + disputePeriod);
        //set the disputValues for the disputed timestamp to true 
		disputedValues[_timestamp] = true;
		//add the disputed timestamp to the diputedValues array
		disputedValuesArray.push(_timestamp);
		emit ValueDisputed(msg.sender,_timestamp,valuesByTimestamp[_timestamp]);
	}


	/**
    * @dev This function gets the Tellor requestIds values for the disputed timestamp. It averages the values on the 
    * requestsIds and replaces the value set by the contract owner, centralized party.
    * @param _timestamp to get Tellor data from
    * @return uint of new value and true if it was able to get Tellor data
	*/
	function getTellorValues(uint _timestamp) public returns(uint _value, bool _didGet){
		//We need to get the tellor value within the granularity.  If no Tellor value is available...what then?  Simply put no Value?  
		//No basically, the dispute period for anyValue is within the granularity
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		Tellor _tellorCore = Tellor(tellorUserContract.tellorStorageAddress());
		uint _retrievedTimestamp;
		uint _initialBalance = _tellor.balanceOf(address(this));//Checks the balance of Tellor Tributes on this contract
		//Loops through all the Tellor requestsId's initially(in the constructor) associated with this contract data
		for(uint i = 1; i <= requestIds.length; i++){
			//Get all values for that requestIds' timestamp
			//Check if any is after your given timestamp
			//If yes, return that value. If no, then request that Id
			(_didGet,_value,_retrievedTimestamp) = getFirstVerifiedDataAfter(i,_timestamp);
			if(_didGet){
				uint _newTime = _retrievedTimestamp - _retrievedTimestamp % granularity; //why are we using the mod granularity???
				//provides the average of the requests Ids' associated with this price feed
				uint _newValue =(_value + valuesByTimestamp[_newTime] * requestIdsIncluded[_newTime].length) / (requestIdsIncluded[_newTime].length + 1);
				//Add the new timestamp and value (we don't replace???)
				valuesByTimestamp[_newTime] = _newValue;
				emit TellorValuePlaced(_newTime,_newValue);
				//records the requests Ids included on the price average where all prices came from Tellor requests Ids
				requestIdsIncluded[_newTime].push(i); //how do we make sure it's not called twice?
				//if the value for the newTime does not exist, then push the value, update the isValue to true
				//otherwise if the newTime is under dsipute then update the dispute status to false
				// ??? should the else be an "and"
				if(isValue[_newTime] == false){
							timestamps.push(_newTime);
							isValue[_newTime] = true;
							emit NewValueSet(_newTime,_value);
				}
				else if(disputedValues[_newTime] == true){
					disputedValues[_newTime] = false;
				}
			}
			//otherwise request the ID and split the contracts initial tributes balance to equally tip all 
			//requests Ids associated with this price feed
			else if(_tellor.balanceOf(address(this)) > requestIds.length){
					//Request Id to be mined by adding to it's tip
					_tellorCore.addTip(i, _initialBalance / requestIds.length);
			}
		}
	}

    /**
    * @dev Allows the contract owner(Tellor) to withdraw ETH from this contract
    */
    function withdrawETH() external{
        require(msg.sender == owner);
        address(owner).transfer(address(this).balance);
    }
    

    /**
    * @dev Get the first undisputed value after the timestamp specified. This function is used within the getTellorValues
    * but can be used on its own. 
    * @param _timestamp to search the first undisputed value there after
    */
	function getFirstUndisputedValueAfter(uint _timestamp) public view returns(bool,uint, uint _timestampRetrieved){
		uint _count = timestamps.length;
		if(_count > 0){
				for(uint i = _count;i > 0;i--){
					if(timestamps[i-1] >= _timestamp && disputedValues[timestamps[i-1]] == false){
						_timestampRetrieved = timestamps[i-1];
					}
				}
				if(_timestampRetrieved > 0){
					return(true,getMyValuesByTimestamp(_timestampRetrieved),_timestampRetrieved);
				}
        }
        return(false,0,0);
	}


    /*Getters*/
    /**
    * @dev Getter function for the value based on the timestamp specified
    * @param _timestamp to retreive value from
    */
	function getMyValuesByTimestamp(uint _timestamp) public view returns(uint value){
		return valuesByTimestamp[_timestamp];
	}


    /**
    * @dev Getter function for the number of RequestIds associated with a timestamp, based on the timestamp specified
    * @param _timestamp to retreive number of requestIds
    * @return uint count of number of values for the spedified timestamp
    */
	function getNumberOfValuesPerTimestamp(uint _timestamp) external view returns(uint){
			return requestIdsIncluded[_timestamp].length;
	}


    /**
    * @dev Checks to if a value exists for the specifived timestamp
    * @param _timestamp to verify
    * @return ture if it exists
    */
	function getIsValue(uint _timestamp) public view returns(bool){
		return isValue[_timestamp];
	}


    /**
    * @dev Getter function for latest value available
    * @return latest value available
    */
	function getCurrentValue() external view returns(uint){
	    require(timestamps.length > 0);
		return getMyValuesByTimestamp(timestamps[timestamps.length -1]);
	}

    /**
    * @dev Getter function for the timestamps available
    * @return uint array of timestamps available
    */
	function getTimestamps() external view returns(uint[] memory){
		return timestamps;
	}


    /**
    * @dev Getter function for the requests Ids' from Tellor associated with this price feed
    * @return uint array of requests Ids'
    */
	function getRequestIds() external view returns(uint[] memory){
		return requestIds;
	}


    /**
    * @dev Getter function for the requests Ids' from Tellor associated with this price feed
    * at the specified timestamp. This only gets populated after a dispute is initiated and the 
    * function getTellorValues is ran.
    * @param _timestamp to retreive the requestIds
    * @return uint array of requests Ids' included in the calcluation of the value
    */
	function getRequestIdsIncluded(uint _timestamp) external view returns(uint[] memory){
		return requestIdsIncluded[_timestamp];
	}


    /**
    * @dev Getter function for the number of disputed values 
    * @return uint count of number of values for the spedified timestamp
    */
	function getNumberOfDisputedValues() external view returns(uint){
		return disputedValuesArray.length;
	}


    /**
    * @dev Getter function for all disputed values
    * @return the array with all values under dispute
    */
	function getDisputedValues() external view returns(uint[] memory){
		return disputedValuesArray;
	}


    /**
    * @dev This checks if the value for the specified timestamp is under dispute 
    * @param _timestamp to check if it is under dispute
    * @return true if it is under dispute
    */
	function isDisputed(uint _timestamp) external view returns(bool){
		return disputedValues[_timestamp];
	}


    /**
    * @dev Getter function for the dispute value by index
    * @return the value
    */
	function getDisputedValueByIndex(uint _index) external view returns(uint){
		return disputedValuesArray[_index];
	}

}