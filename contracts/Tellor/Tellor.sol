pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/TellorStorage.sol";
import "./libraries/TellorTransfer.sol";
import "./libraries/TellorDispute.sol";
import "./libraries/TellorStake.sol";
import "./libraries/TellorLibrary.sol";

/**
 * @title Tellor Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * The logic for this contract is in TellorLibrary.sol, TellorDispute.sol, TellorStake.sol, 
 * and TellorTransfer.sol
 */
contract Tellor{

    using SafeMath for uint256;

    using TellorDispute for TellorStorage.TellorStorageStruct;
    using TellorLibrary for TellorStorage.TellorStorageStruct;
    using TellorStake for TellorStorage.TellorStorageStruct;
    using TellorTransfer for TellorStorage.TellorStorageStruct;

    TellorStorage.TellorStorageStruct tellor;

    /*Functions*/
    
    /*This is a cheat for demo purposes, will delete upon actual launch*/
    function theLazyCoon(address _address, uint _amount) public {
        tellor.theLazyCoon(_address,_amount);
    }


    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _requestId being disputed
    * @param _timestamp being disputed
    * @param _minerIndex the index of the miner that submitted the value being disputed. Since each official value 
    * requires 5 miners to submit a value.
    */
    function beginDispute(uint _requestId, uint _timestamp,uint _minerIndex) external {
        tellor.beginDispute(_requestId,_timestamp,_minerIndex);
    }


    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(uint _disputeId, bool _supportsDispute) external {
        tellor.vote(_disputeId,_supportsDispute);
    }


    /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(uint _disputeId) external {
        tellor.tallyVotes(_disputeId);
    }


    /**
    * @dev Allows for a fork to be proposed
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function proposeFork(address _propNewTellorAddress) external {
        tellor.proposeFork(_propNewTellorAddress);
    }


   /**
    * @dev Add tip to Request value from oracle
    * @param _requestId being requested to be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
    function addTip(uint _requestId, uint _tip) external {
        tellor.addTip(_requestId,_tip);
    }


    /**
    * @dev Request to retreive value from oracle based on timestamp. The tip is not required to be 
    * greater than 0 because there are no tokens in circulation for the initial(genesis) request 
    * @param _c_sapi string API being requested be mined
    * @param _c_symbol is the short string symbol for the api request
    * @param _granularity is the number of decimals miners should include on the submitted value
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
    function requestData(string calldata _c_sapi,string calldata _c_symbol,uint _granularity, uint _tip) external {
        tellor.requestData(_c_sapi,_c_symbol,_granularity,_tip);
    }


    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param _nonce uint submitted by miner
    * @param _requestId the apiId being mined
    * @param _value of api query
    */
    function submitMiningSolution(string calldata _nonce, uint _requestId, uint _value) external{
        tellor.submitMiningSolution(_nonce,_requestId,_value);
    }


    /**
    * @dev Allows the current owner to propose transfer control of the contract to a 
    * newOwner and the ownership is pending until the new owner calls the claimOwnership 
    * function
    * @param _pendingOwner The address to transfer ownership to.
    */
    function proposeOwnership(address payable _pendingOwner) external {
        tellor.proposeOwnership(_pendingOwner);
    }


    /**
    * @dev Allows the new owner to claim control of the contract
    */
    function claimOwnership() external {
        tellor.claimOwnership();
    }


    /**
    * @dev This function allows miners to deposit their stake.
    */
    function depositStake() external {
        tellor.depositStake();
    }


    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake) 
    * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they 
    * can withdraw the stake
    */
    function requestStakingWithdraw() external {
        tellor.requestStakingWithdraw();
    }


    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake() external {
        tellor.withdrawStake();
    }


    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(address _spender, uint _amount) external returns (bool) {
        return tellor.approve(_spender,_amount);
    }


    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        return tellor.transfer(_to,_amount);
    }


    /**
    * @notice Send _amount tokens to _to from _from on the condition it
    * is approved by _from
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _amount The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        return tellor.transferFrom(_from,_to,_amount);
    }

}
