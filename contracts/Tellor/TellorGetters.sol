pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/TellorStorage.sol";
import "./libraries/TellorTransfer.sol";
import "./libraries/TellorGettersLibrary.sol";
import "./libraries/TellorStake.sol";

/**
* @title Tellor Getters
* @dev Oracle contract with all tellor getter functions. The logic for the functions on this contract 
* is saved on the TellorGettersLibrary, TellorTransfer, TellorGettersLibrary, and TellorStake
*/
contract TellorGetters{
    using SafeMath for uint256;

    using TellorTransfer for TellorStorage.TellorStorageStruct;
    using TellorGettersLibrary for TellorStorage.TellorStorageStruct;
    using TellorStake for TellorStorage.TellorStorageStruct;

    TellorStorage.TellorStorageStruct tellor;
    
    /**
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(address _user, address _spender) external view returns (uint) {
       return tellor.allowance(_user,_spender);
    }

    /**
    * @dev This function returns whether or not a given user is allowed to trade a given amount  
    * @param _user address
    * @param _amount uint of amount
    * @return true if the user is alloed to trade the amount specified
    */
    function allowedToTrade(address _user,uint _amount) external view returns(bool){
        return tellor.allowedToTrade(_user,_amount);
    }

    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(address _user) external view returns (uint) { 
        return tellor.balanceOf(_user);
    }

    /**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber
    */
    function balanceOfAt(address _user, uint _blockNumber) external view returns (uint) {
        return tellor.balanceOfAt(_user,_blockNumber);
    }

    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(bytes32 _challenge, address _miner) external view returns(bool){
        return tellor.didMine(_challenge,_miner);
    }


    /**
    * @dev Checks if an address voted in a given dispute
    * @param _disputeId to look up
    * @param _address to look up
    * @return bool of whether or not party voted
    */
    function didVote(uint _disputeId, address _address) external view returns(bool){
        return tellor.didVote(_disputeId,_address);
    }


    /**
    * @dev allows Tellor to read data from the addressVars mapping
    * @param _data is the keccak256("variable_name") of the variable that is being accessed. 
    * These are examples of how the variables are saved within other functions:
    * addressVars[keccak256("_owner")]
    * addressVars[keccak256("tellorContract")]
    */
    function getAddressVars(bytes32 _data) view external returns(address){
        return tellor.getAddressVars(_data);
    }


    /**
    * @dev Gets all dispute variables
    * @param _disputeId to look up
    * @return bytes32 hash of dispute 
    * @return bool executed where true if it has been voted on
    * @return bool disputeVotePassed
    * @return bool isPropFork true if the dispute is a proposed fork
    * @return address of reportedMiner
    * @return address of reportingParty
    * @return address of proposedForkAddress
    * @return uint of requestId
    * @return uint of timestamp
    * @return uint of value
    * @return uint of minExecutionDate
    * @return uint of numberOfVotes
    * @return uint of blocknumber
    * @return uint of minerSlot
    * @return uint of quorum
    * @return uint of fee
    * @return int count of the current tally
    */
    function getAllDisputeVars(uint _disputeId) public view returns(bytes32, bool, bool, bool, address, address, address,uint[9] memory, int){
        return tellor.getAllDisputeVars(_disputeId);
    }
    

    /**
    * @dev Getter function for variables for the requestId being currently mined(currentRequestId)
    * @return current challenge, curretnRequestId, level of difficulty, api/query string, and granularity(number of decimals requested), total tip for the request 
    */
    function getCurrentVariables() external view returns(bytes32, uint, uint,string memory,uint,uint){    
        return tellor.getCurrentVariables();
    }

    /**
    * @dev Checks if a given hash of miner,requestId has been disputed
    * @param _hash is the sha256(abi.encodePacked(_miners[2],_requestId));
    * @return uint disputeId
    */
    function getDisputeIdByDisputeHash(bytes32 _hash) external view returns(uint){
        return  tellor.getDisputeIdByDisputeHash(_hash);
    }
    

    /**
    * @dev Checks for uint variables in the disputeUintVars mapping based on the disuputeId
    * @param _disputeId is the dispute id;
    * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is 
    * the variables/strings used to save the data in the mapping. The variables names are  
    * commented out under the disputeUintVars under the Dispute struct
    * @return uint value for the bytes32 data submitted
    */
    function getDisputeUintVars(uint _disputeId,bytes32 _data) external view returns(uint){
        return tellor.getDisputeUintVars(_disputeId,_data);
    }


    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    * @return true if the is a timestamp for the lastNewValue
    */
    function getLastNewValue() external view returns(uint,bool){
        return tellor.getLastNewValue();
    }


    /**
    * @dev Gets the a value for the latest timestamp available
    * @param _requestId being requested
    * @return value for timestamp of last proof of work submited and if true if it exist or 0 and false if it doesn't
    */
    function getLastNewValueById(uint _requestId) external view returns(uint,bool){
        return tellor.getLastNewValueById(_requestId);
    }
        

    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(uint _requestId, uint _timestamp) external view returns(uint){
        return tellor.getMinedBlockNum(_requestId,_timestamp);
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up miners for
    * @return the 5 miners' addresses
    */
    function getMinersByRequestIdAndTimestamp(uint _requestId, uint _timestamp) external view returns(address[5] memory){
        return tellor.getMinersByRequestIdAndTimestamp(_requestId,_timestamp);
    }


    /**
    * @dev Get the name of the token
    * return string of the token name
    */
    function getName() external view returns(string memory){
        return tellor.getName();
    }


    /**
    * @dev Counts the number of values that have been submited for the request 
    * if called for the currentRequest being mined it can tell you how many miners have submitted a value for that
    * request so far
    * @param _requestId the requestId to look up
    * @return uint count of the number of values received for the requestId
    */
    function getNewValueCountbyRequestId(uint _requestId) external view returns(uint){
        return tellor.getNewValueCountbyRequestId(_requestId);
    }


    /**
    * @dev Getter function for the specified requestQ index
    * @param _index to look up in the requestQ array
    * @return uint of reqeuestId
    */
    function getRequestIdByRequestQIndex(uint _index) external view returns(uint){
        return tellor.getRequestIdByRequestQIndex(_index);
    }


    /**
    * @dev Getter function for requestId based on timestamp 
    * @param _timestamp to check requestId
    * @return uint of reqeuestId
    */
    function getRequestIdByTimestamp(uint _timestamp) external view returns(uint){    
        return tellor.getRequestIdByTimestamp(_timestamp);
    }

    /**
    * @dev Getter function for requestId based on the queryHash
    * @param _request is the hash(of string api and granularity) to check if a request already exists
    * @return uint requestId
    */
    function getRequestIdByQueryHash(bytes32 _request) external view returns(uint){    
        return tellor.getRequestIdByQueryHash(_request);
    }


    /**
    * @dev Getter function for the requestQ array
    * @return the requestQ arrray
    */
    function getRequestQ() view public returns(uint[51] memory){
        return tellor.getRequestQ();
    }


    /**
    * @dev Allowes access to the uint variables saved in the apiUintVars under the requestDetails struct
    * for the requestId specified
    * @param _requestId to look up
    * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is 
    * the variables/strings used to save the data in the mapping. The variables names are  
    * commented out under the apiUintVars under the requestDetails struct
    * @return uint value of the apiUintVars specified in _data for the requestId specified
    */
    function getRequestUintVars(uint _requestId,bytes32 _data) external view returns(uint){
        return tellor.getRequestUintVars(_requestId,_data);
    }


    /**
    * @dev Gets the API struct variables that are not mappings
    * @param _requestId to look up
    * @return string of api to query
    * @return string of symbol of api to query
    * @return bytes32 hash of string
    * @return bytes32 of the granularity(decimal places) requested
    * @return uint of index in requestQ array
    * @return uint of current payout/tip for this requestId
    */
    function getRequestVars(uint _requestId) external view returns(string memory, string memory,bytes32,uint, uint, uint) {
        return tellor.getRequestVars(_requestId);
    }


    /**
    * @dev This function allows users to retireve all information about a staker
    * @param _staker address of staker inquiring about
    * @return uint current state of staker
    * @return uint startDate of staking
    */
    function getStakerInfo(address _staker) external view returns(uint,uint){
        return tellor.getStakerInfo(_staker);
    }
    
    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    * @return address[5] array of 5 addresses ofminers that mined the requestId
    */    
    function getSubmissionsByTimestamp(uint _requestId, uint _timestamp) external view returns(uint[5] memory){
        return tellor.getSubmissionsByTimestamp(_requestId,_timestamp);
    }

    /**
    * @dev Get the symbol of the token
    * return string of the token symbol
    */
    function getSymbol() external view returns(string memory){
        return tellor.getSymbol();
    } 

    /**
    * @dev Gets the timestamp for the value based on their index
    * @param _requestID is the requestId to look up
    * @param _index is the value index to look up
    * @return uint timestamp
    */
    function getTimestampbyRequestIDandIndex(uint _requestID, uint _index) external view returns(uint){
        return tellor.getTimestampbyRequestIDandIndex(_requestID,_index);
    }


    /**
    * @dev Getter for the variables saved under the TellorStorageStruct uintVars variable
    * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is 
    * the variables/strings used to save the data in the mapping. The variables names are  
    * commented out under the uintVars under the TellorStorageStruct struct
    * This is an example of how data is saved into the mapping within other functions: 
    * self.uintVars[keccak256("stakerCount")]
    * @return uint of specified variable  
    */ 
    function getUintVar(bytes32 _data) view public returns(uint){
        return tellor.getUintVar(_data);
    }


    /**
    * @dev Getter function for next requestId on queue/request with highest payout at time the function is called
    * @return onDeck/info on request with highest payout-- RequestId, Totaltips, and API query string
    */
    function getVariablesOnDeck() external view returns(uint, uint,string memory){    
        return tellor.getVariablesOnDeck();
    }

    
    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up miners for
    * @return bool true if requestId/timestamp is under dispute
    */
    function isInDispute(uint _requestId, uint _timestamp) external view returns(bool){
        return tellor.isInDispute(_requestId,_timestamp);
    }
    

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _requestId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(uint _requestId, uint _timestamp) external view returns (uint) {
        return tellor.retrieveData(_requestId,_timestamp);
    }


    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return uint total supply
    */
    function totalSupply() external view returns (uint) {
       return tellor.totalSupply();
    }


}