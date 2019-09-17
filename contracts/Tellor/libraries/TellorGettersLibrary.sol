pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./TellorStorage.sol";
import "./Utilities.sol";

/**
* @title Tellor Getters Library
* @dev This is the getter library for all variables in the Tellor Tributes system. TellorGetters references this 
* libary for the getters logic
*/
library TellorGettersLibrary{
    using SafeMath for uint256;

    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true

    /*Functions*/

    //The next two functions are onlyOwner functions.  For Tellor to be truly decentralized, we will need to transfer the Deity to the 0 address.
    //Only needs to be in library
    /**
    * @dev This function allows us to set a new Deity (or remove it) 
    * @param _newDeity address of the new Deity of the tellor system 
    */
    function changeDeity(TellorStorage.TellorStorageStruct storage self, address _newDeity) internal{
        require(self.addressVars[keccak256("_deity")] == msg.sender);
        self.addressVars[keccak256("_deity")] =_newDeity;
    }


    //Only needs to be in library
    /**
    * @dev This function allows the deity to upgrade the Tellor System
    * @param _tellorContract address of new updated TellorCore contract
    */
    function changeTellorContract(TellorStorage.TellorStorageStruct storage self,address _tellorContract) internal{
        require(self.addressVars[keccak256("_deity")] == msg.sender);
        self.addressVars[keccak256("tellorContract")]= _tellorContract;
        emit NewTellorAddress(_tellorContract);
    }


    /*Tellor Getters*/

    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(TellorStorage.TellorStorageStruct storage self, bytes32 _challenge,address _miner) internal view returns(bool){
        return self.minersByChallenge[_challenge][_miner];
    }
    

    /**
    * @dev Checks if an address voted in a dispute
    * @param _disputeId to look up
    * @param _address of voting party to look up
    * @return bool of whether or not party voted
    */
    function didVote(TellorStorage.TellorStorageStruct storage self,uint _disputeId, address _address) internal view returns(bool){
        return self.disputesById[_disputeId].voted[_address];
    }


    /**
    * @dev allows Tellor to read data from the addressVars mapping
    * @param _data is the keccak256("variable_name") of the variable that is being accessed. 
    * These are examples of how the variables are saved within other functions:
    * addressVars[keccak256("_owner")]
    * addressVars[keccak256("tellorContract")]
    */
    function getAddressVars(TellorStorage.TellorStorageStruct storage self, bytes32 _data) view internal returns(address){
        return self.addressVars[_data];
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
    function getAllDisputeVars(TellorStorage.TellorStorageStruct storage self,uint _disputeId) internal view returns(bytes32, bool, bool, bool, address, address, address,uint[9] memory, int){
        TellorStorage.Dispute storage disp = self.disputesById[_disputeId];
        return(disp.hash,disp.executed, disp.disputeVotePassed, disp.isPropFork, disp.reportedMiner, disp.reportingParty,disp.proposedForkAddress,[disp.disputeUintVars[keccak256("requestId")], disp.disputeUintVars[keccak256("timestamp")], disp.disputeUintVars[keccak256("value")], disp.disputeUintVars[keccak256("minExecutionDate")], disp.disputeUintVars[keccak256("numberOfVotes")], disp.disputeUintVars[keccak256("blockNumber")], disp.disputeUintVars[keccak256("minerSlot")], disp.disputeUintVars[keccak256("quorum")],disp.disputeUintVars[keccak256("fee")]],disp.tally);
    }


    /**
    * @dev Getter function for variables for the requestId being currently mined(currentRequestId)
    * @return current challenge, curretnRequestId, level of difficulty, api/query string, and granularity(number of decimals requested), total tip for the request 
    */
    function getCurrentVariables(TellorStorage.TellorStorageStruct storage self) internal view returns(bytes32, uint, uint,string memory,uint,uint){    
        return (self.currentChallenge,self.uintVars[keccak256("currentRequestId")],self.uintVars[keccak256("difficulty")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].queryString,self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("granularity")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("totalTip")]);
    }


    /**
    * @dev Checks if a given hash of miner,requestId has been disputed
    * @param _hash is the sha256(abi.encodePacked(_miners[2],_requestId));
    * @return uint disputeId
    */
    function getDisputeIdByDisputeHash(TellorStorage.TellorStorageStruct storage self,bytes32 _hash) internal view returns(uint){
        return  self.disputeIdByDisputeHash[_hash];
    }


    /**
    * @dev Checks for uint variables in the disputeUintVars mapping based on the disuputeId
    * @param _disputeId is the dispute id;
    * @param _data the variable to pull from the mapping. _data = keccak256("variable_name") where variable_name is 
    * the variables/strings used to save the data in the mapping. The variables names are  
    * commented out under the disputeUintVars under the Dispute struct
    * @return uint value for the bytes32 data submitted
    */
    function getDisputeUintVars(TellorStorage.TellorStorageStruct storage self,uint _disputeId,bytes32 _data) internal view returns(uint){
        return self.disputesById[_disputeId].disputeUintVars[_data];
    }

    
    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    * @return true if the is a timestamp for the lastNewValue
    */
    function getLastNewValue(TellorStorage.TellorStorageStruct storage self) internal view returns(uint,bool){
        return (retrieveData(self,self.requestIdByTimestamp[self.uintVars[keccak256("timeOfLastNewValue")]], self.uintVars[keccak256("timeOfLastNewValue")]),true);
    }


    /**
    * @dev Gets the a value for the latest timestamp available
    * @param _requestId being requested
    * @return value for timestamp of last proof of work submited and if true if it exist or 0 and false if it doesn't
    */
    function getLastNewValueById(TellorStorage.TellorStorageStruct storage self,uint _requestId) internal view returns(uint,bool){
        TellorStorage.Request storage _request = self.requestDetails[_requestId]; 
        if(_request.requestTimestamps.length > 0){
            return (retrieveData(self,_requestId,_request.requestTimestamps[_request.requestTimestamps.length - 1]),true);
        }
        else{
            return (0,false);
        }
    }


    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(TellorStorage.TellorStorageStruct storage self,uint _requestId, uint _timestamp) internal view returns(uint){
        return self.requestDetails[_requestId].minedBlockNum[_timestamp];
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up miners for
    * @return the 5 miners' addresses
    */
    function getMinersByRequestIdAndTimestamp(TellorStorage.TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(address[5] memory){
        return self.requestDetails[_requestId].minersByValue[_timestamp];
    }


    /**
    * @dev Get the name of the token
    * @return string of the token name
    */
    function getName(TellorStorage.TellorStorageStruct storage self) internal pure returns(string memory){
        return "Tellor Tributes";
    }


    /**
    * @dev Counts the number of values that have been submited for the request 
    * if called for the currentRequest being mined it can tell you how many miners have submitted a value for that
    * request so far
    * @param _requestId the requestId to look up
    * @return uint count of the number of values received for the requestId
    */
    function getNewValueCountbyRequestId(TellorStorage.TellorStorageStruct storage self, uint _requestId) internal view returns(uint){
        return self.requestDetails[_requestId].requestTimestamps.length;
    }


    /**
    * @dev Getter function for the specified requestQ index
    * @param _index to look up in the requestQ array
    * @return uint of reqeuestId
    */
    function getRequestIdByRequestQIndex(TellorStorage.TellorStorageStruct storage self, uint _index) internal view returns(uint){
        require(_index <= 50);
        return self.requestIdByRequestQIndex[_index];
    }


    /**
    * @dev Getter function for requestId based on timestamp 
    * @param _timestamp to check requestId
    * @return uint of reqeuestId
    */
    function getRequestIdByTimestamp(TellorStorage.TellorStorageStruct storage self, uint _timestamp) internal view returns(uint){    
        return self.requestIdByTimestamp[_timestamp];
    }


    /**
    * @dev Getter function for requestId based on the qeuaryHash
    * @param _queryHash hash(of string api and granularity) to check if a request already exists
    * @return uint requestId
    */
    function getRequestIdByQueryHash(TellorStorage.TellorStorageStruct storage self, bytes32 _queryHash) internal view returns(uint){    
        return self.requestIdByQueryHash[_queryHash];
    }


    /**
    * @dev Getter function for the requestQ array
    * @return the requestQ arrray
    */
    function getRequestQ(TellorStorage.TellorStorageStruct storage self) view internal returns(uint[51] memory){
        return self.requestQ;
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
    function getRequestUintVars(TellorStorage.TellorStorageStruct storage self,uint _requestId,bytes32 _data) internal view returns(uint){
        return self.requestDetails[_requestId].apiUintVars[_data];
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
    function getRequestVars(TellorStorage.TellorStorageStruct storage self,uint _requestId) internal view returns(string memory,string memory, bytes32,uint, uint, uint) {
        TellorStorage.Request storage _request = self.requestDetails[_requestId]; 
        return (_request.queryString,_request.dataSymbol,_request.queryHash, _request.apiUintVars[keccak256("granularity")],_request.apiUintVars[keccak256("requestQPosition")],_request.apiUintVars[keccak256("totalTip")]);
    }


    /**
    * @dev This function allows users to retireve all information about a staker
    * @param _staker address of staker inquiring about
    * @return uint current state of staker
    * @return uint startDate of staking
    */
    function getStakerInfo(TellorStorage.TellorStorageStruct storage self,address _staker) internal view returns(uint,uint){
        return (self.stakerDetails[_staker].currentStatus,self.stakerDetails[_staker].startDate);
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    * @return address[5] array of 5 addresses ofminers that mined the requestId
    */
    function getSubmissionsByTimestamp(TellorStorage.TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(uint[5] memory){
        return self.requestDetails[_requestId].valuesByTimestamp[_timestamp];
    }

    /**
    * @dev Get the symbol of the token
    * @return string of the token symbol
    */
    function getSymbol(TellorStorage.TellorStorageStruct storage self) internal pure returns(string memory){
        return "TT";
    } 


    /**
    * @dev Gets the timestamp for the value based on their index
    * @param _requestID is the requestId to look up
    * @param _index is the value index to look up
    * @return uint timestamp
    */
    function getTimestampbyRequestIDandIndex(TellorStorage.TellorStorageStruct storage self,uint _requestID, uint _index) internal view returns(uint){
        return self.requestDetails[_requestID].requestTimestamps[_index];
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
    function getUintVar(TellorStorage.TellorStorageStruct storage self,bytes32 _data) view internal returns(uint){
        return self.uintVars[_data];
    }


    /**
    * @dev Getter function for next requestId on queue/request with highest payout at time the function is called
    * @return onDeck/info on request with highest payout-- RequestId, Totaltips, and API query string
    */
    function getVariablesOnDeck(TellorStorage.TellorStorageStruct storage self) internal view returns(uint, uint,string memory){ 
        uint newRequestId = getTopRequestID(self);
        return (newRequestId,self.requestDetails[newRequestId].apiUintVars[keccak256("totalTip")],self.requestDetails[newRequestId].queryString);
    }


    /**
    * @dev Getter function for the request with highest payout. This function is used within the getVariablesOnDeck function
    * @return uint _requestId of request with highest payout at the time the function is called
    */
    function getTopRequestID(TellorStorage.TellorStorageStruct storage self) internal view returns(uint _requestId){
            uint _max;
            uint _index;
            (_max,_index) = Utilities.getMax(self.requestQ);
             _requestId = self.requestIdByRequestQIndex[_index];
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up miners for
    * @return bool true if requestId/timestamp is under dispute
    */
    function isInDispute(TellorStorage.TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(bool){
        return self.requestDetails[_requestId].inDispute[_timestamp];
    }


    /**
    * @dev Retreive value from oracle based on requestId/timestamp
    * @param _requestId being requested
    * @param _timestamp to retreive data/value from
    * @return uint value for requestId/timestamp submitted
    */
    function retrieveData(TellorStorage.TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns (uint) {
        return self.requestDetails[_requestId].finalValues[_timestamp];
    }


    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return uint total supply
    */
    function totalSupply(TellorStorage.TellorStorageStruct storage self) internal view returns (uint) {
       return self.uintVars[keccak256("total_supply")];
    }

}
