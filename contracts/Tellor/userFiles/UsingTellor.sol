pragma solidity ^0.5.0;

import '../Tellor.sol';
import '../TellorMaster.sol';
import './UserContract.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract UsingTellor{
	UserContract tellorUserContract;
	address payable public owner;
	
	event OwnershipTransferred(address _previousOwner,address _newOwner);

    /*Constructor*/
    /**
    * @dev This function sents the owner and userContract address
    * @param _userContract is the UserContract.sol address
    */
    constructor(address _userContract)public {
    	tellorUserContract = UserContract(_userContract);
    	owner = msg.sender;
    }


    /*Functions*/
    /**
    * @dev Allows the user to get the latest value for the requestId specified
    * @param _requestId is the requestId to look up the value for
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp
    */
	function getCurrentValue(uint _requestId) public view returns(bool ifRetrieve, uint value, uint _timestampRetrieved) {
        return tellorUserContract.getCurrentValue(_requestId);
    }


	//How can we make this one more efficient?
	/**
    * @dev Allows the user to get the first verified value for the requestId after the specified timestamp
    * @param _requestId is the requestId to look up the value for
    * @param _timestamp after which to search for first verified value
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp, the timestamp after
    * which it searched for the first verified value
    */
	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) public view returns(bool,uint,uint _timestampRetrieved) {
        return tellorUserContract.getFirstVerifiedDataAfter(_requestId,_timestamp);
	}
	

	/**
    * @dev Allows the user to get the first value for the requestId after the specified timestamp
    * @param _requestId is the requestId to look up the value for
    * @param _timestamp after which to search for first verified value
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp
    */
	function getAnyDataAfter(uint _requestId, uint _timestamp) public view returns(bool _ifRetrieve, uint _value, uint _timestampRetrieved){
        return tellorUserContract.getAnyDataAfter(_requestId,_timestamp);
	}


    /**
    * @dev Allows the user to submit a request for data to the oracle using Tributes
    * Allowing this prevents us from increasing spread too high (since if we set the price too hight
	* users will just go to an exchange and get tokens from there)
    * @param _request string API being requested to be mined
    * @param _symbol is the short string symbol for the api request
    * @param _granularity is the number of decimals miners should include on the submitted value
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
	function requestData(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) external{
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
		if(_tip > 0){
			require(_tellor.transferFrom(msg.sender,address(this),_tip));
		}
		_tellor.requestData(_request,_symbol,_granularity,_tip);
	}


    /**
    * @dev Allows the user to submit a request for data to the oracle using ETH
    * @param _request string API being requested to be mined
    * @param _symbol is the short string symbol for the api request
    * @param _granularity is the number of decimals miners should include on the submitted value
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
	function requestDataWithEther(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) payable external{
		tellorUserContract.requestDataWithEther.value(msg.value)(_request,_symbol,_granularity,_tip);
	}


    /** 
    * @dev Allows the user to tip miners for the specified request using Tributes
    * @param _requestId to tip
    * @param _tip amount
    */
	function addTip(uint _requestId, uint _tip) public {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
		require(_tellor.transferFrom(msg.sender,address(this),_tip));
		_tellor.addTip(_requestId,_tip);
	}


    /**
    * @dev Allows user to add tip with Ether by sending the ETH to the userContract and exchanging it for Tributes
    * at the price specified by the userContract owner.
    * @param _requestId to tip
    * @param _tip amount
    */
	function addTipWithEther(uint _requestId, uint _tip) public payable {
		UserContract(tellorUserContract).addTipWithEther.value(msg.value)(_requestId,_tip);
	}


    /**
    * @dev allows owner to set the user contract address
    * @param _userContract address
    */
	function setUserContract(address _userContract) public {
		require(msg.sender == owner);//who should this be?
		tellorUserContract = UserContract(_userContract);
	}


    /**
    * @dev allows owner to transfer ownership
    * @param _newOwner address
    */
	function transferOwnership(address payable _newOwner) external {
            require(msg.sender == owner);
            emit OwnershipTransferred(owner, _newOwner);
            owner = _newOwner;
    }
}


