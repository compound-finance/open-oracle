pragma solidity ^0.5.0;

import "./TellorStorage.sol";
import "./TellorTransfer.sol";
import "./TellorDispute.sol";

/**
* itle Tellor Dispute
* @dev Contais the methods related to miners staking and unstaking. Tellor.sol 
* references this library for function's logic.
*/

library TellorStake {
    event NewStake(address indexed _sender);//Emits upon new staker
    event StakeWithdrawn(address indexed _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender);//Emits when a staker begins the 7 day withdraw period

    /*Functions*/
    
    /**
    * @dev This function stakes the five initial miners, sets the supply and all the constant variables.
    * This function is called by the constructor function on TellorMaster.sol
    */
    function init(TellorStorage.TellorStorageStruct storage self) public{
        require(self.uintVars[keccak256("decimals")] == 0);
        //Give this contract 6000 Tellor Tributes so that it can stake the initial 6 miners
        TellorTransfer.updateBalanceAtNow(self.balances[address(this)], 2**256-1 - 6000e18);

        // //the initial 5 miner addresses are specfied below
        // //changed payable[5] to 6
        address payable[6] memory _initalMiners = [address(0xE037EC8EC9ec423826750853899394dE7F024fee),
        address(0xcdd8FA31AF8475574B8909F135d510579a8087d3),
        address(0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891),
        address(0x230570cD052f40E14C14a81038c6f3aa685d712B),
        address(0x3233afA02644CCd048587F8ba6e99b3C00A34DcC),
        address(0xe010aC6e0248790e08F42d5F697160DEDf97E024)];
        //Stake each of the 5 miners specified above
        for(uint i=0;i<6;i++){//6th miner to allow for dispute
            //Miner balance is set at 1000e18 at the block that this function is ran
            TellorTransfer.updateBalanceAtNow(self.balances[_initalMiners[i]],1000e18);

            newStake(self, _initalMiners[i]);
        }

        //update the total suppply
        self.uintVars[keccak256("total_supply")] += 6000e18;//6th miner to allow for dispute
        //set Constants
        self.uintVars[keccak256("decimals")] = 18;
        self.uintVars[keccak256("targetMiners")] = 200;
        self.uintVars[keccak256("stakeAmount")] = 1000e18;
        self.uintVars[keccak256("disputeFee")] = 970e18;
        self.uintVars[keccak256("timeTarget")]= 600;
        self.uintVars[keccak256("timeOfLastNewValue")] = now - now  % self.uintVars[keccak256("timeTarget")];
        self.uintVars[keccak256("difficulty")] = 1;
    }


    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake)
    * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they
    * can withdraw the deposit
    */
    function requestStakingWithdraw(TellorStorage.TellorStorageStruct storage self) public {
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require that the miner is staked
        require(stakes.currentStatus == 1);

        //Change the miner staked to locked to be withdrawStake
        stakes.currentStatus = 2;

        //Change the startDate to now since the lock up period begins now
        //and the miner can only withdraw 7 days later from now(check the withdraw function)
        stakes.startDate = now -(now % 86400);

        //Reduce the staker count
        self.uintVars[keccak256("stakerCount")] -= 1;
        TellorDispute.updateDisputeFee(self);
        emit StakeWithdrawRequested(msg.sender);
    }


    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake(TellorStorage.TellorStorageStruct storage self) public {
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require the staker has locked for withdraw(currentStatus ==2) and that 7 days have 
        //passed by since they locked for withdraw
        require(now - (now % 86400) - stakes.startDate >= 7 days);
        require(stakes.currentStatus == 2);
        stakes.currentStatus = 0;
        emit StakeWithdrawn(msg.sender);
    }


    /**
    * @dev This function allows miners to deposit their stake.
    */
    function depositStake(TellorStorage.TellorStorageStruct storage self) public {
      newStake(self, msg.sender);
      //self adjusting disputeFee
      TellorDispute.updateDisputeFee(self);
    }

    /**
    * @dev This function is used by the init function to succesfully stake the initial 5 miners.
    * The function updates their status/state and status start date so they are locked it so they can't withdraw
    * and updates the number of stakers in the system.
    */
    function newStake(TellorStorage.TellorStorageStruct storage self, address staker) internal {
        require(TellorTransfer.balanceOf(self,staker) >= self.uintVars[keccak256("stakeAmount")]);
        //Ensure they can only stake if they are not currrently staked or if their stake time frame has ended
        //and they are currently locked for witdhraw
        require(self.stakerDetails[staker].currentStatus == 0 || self.stakerDetails[staker].currentStatus == 2);
        self.uintVars[keccak256("stakerCount")] += 1;
        self.stakerDetails[staker] = TellorStorage.StakeInfo({
            currentStatus: 1,
            //this resets their stake start date to today
            startDate: now - (now % 86400)
        });
        emit NewStake(staker);
    }
}
