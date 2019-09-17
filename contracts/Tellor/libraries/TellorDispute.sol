pragma solidity ^0.5.0;

import "./TellorStorage.sol";
import "./TellorTransfer.sol";
//import "./SafeMath.sol";

/**
* @title Tellor Dispute
* @dev Contais the methods related to disputes. Tellor.sol references this library for function's logic.
*/


library TellorDispute {
    using SafeMath for uint256;
    using SafeMath for int256;

    event NewDispute(uint indexed _disputeId, uint indexed _requestId, uint _timestamp, address _miner);//emitted when a new dispute is initialized
    event Voted(uint indexed _disputeID, bool _position, address indexed _voter);//emitted when a new vote happens
    event DisputeVoteTallied(uint indexed _disputeID, int _result,address indexed _reportedMiner,address _reportingParty, bool _active);//emitted upon dispute tally
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true

    /*Functions*/
    
    /**
    * @dev Helps initialize a dispute by assigning it a disputeId
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the
    * invalidated value information to POS voting
    * @param _requestId being disputed
    * @param _timestamp being disputed
    * @param _minerIndex the index of the miner that submitted the value being disputed. Since each official value
    * requires 5 miners to submit a value.
    */
    function beginDispute(TellorStorage.TellorStorageStruct storage self,uint _requestId, uint _timestamp,uint _minerIndex) public {
        TellorStorage.Request storage _request = self.requestDetails[_requestId];
        //require that no more than a day( (24 hours * 60 minutes)/10minutes=144 blocks) has gone by since the value was "mined"
        require(now - _timestamp<= 1 days);
        require(_request.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);
        
        //_miner is the miner being disputed. For every mined value 5 miners are saved in an array and the _minerIndex
        //provided by the party initiating the dispute
        address _miner = _request.minersByValue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(abi.encodePacked(_miner,_requestId,_timestamp));
        
        //Ensures that a dispute is not already open for the that miner, requestId and timestamp
        require(self.disputeIdByDisputeHash[_hash] == 0);
        TellorTransfer.doTransfer(self, msg.sender,address(this), self.uintVars[keccak256("disputeFee")]);
        
        //Increase the dispute count by 1
        self.uintVars[keccak256("disputeCount")] =  self.uintVars[keccak256("disputeCount")] + 1;
        
        //Sets the new disputeCount as the disputeId
        uint disputeId = self.uintVars[keccak256("disputeCount")];
        
        //maps the dispute hash to the disputeId
        self.disputeIdByDisputeHash[_hash] = disputeId;
        //maps the dispute to the Dispute struct
        self.disputesById[disputeId] = TellorStorage.Dispute({
            hash:_hash,
            isPropFork: false,
            reportedMiner: _miner,
            reportingParty: msg.sender,
            proposedForkAddress:address(0),
            executed: false,
            disputeVotePassed: false,
            tally: 0
            });
        
        //Saves all the dispute variables for the disputeId
        self.disputesById[disputeId].disputeUintVars[keccak256("requestId")] = _requestId;
        self.disputesById[disputeId].disputeUintVars[keccak256("timestamp")] = _timestamp;
        self.disputesById[disputeId].disputeUintVars[keccak256("value")] = _request.valuesByTimestamp[_timestamp][_minerIndex];
        self.disputesById[disputeId].disputeUintVars[keccak256("minExecutionDate")] = now + 7 days;
        self.disputesById[disputeId].disputeUintVars[keccak256("blockNumber")] = block.number;
        self.disputesById[disputeId].disputeUintVars[keccak256("minerSlot")] = _minerIndex;
        self.disputesById[disputeId].disputeUintVars[keccak256("fee")]  = self.uintVars[keccak256("disputeFee")];
        
        //Values are sorted as they come in and the official value is the median of the first five
        //So the "official value" miner is always minerIndex==2. If the official value is being 
        //disputed, it sets its status to inDispute(currentStatus = 3) so that users are made aware it is under dispute
        if(_minerIndex == 2){
            self.requestDetails[_requestId].inDispute[_timestamp] = true;
        }
        self.stakerDetails[_miner].currentStatus = 3;
        emit NewDispute(disputeId,_requestId,_timestamp,_miner);
    }


    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(TellorStorage.TellorStorageStruct storage self, uint _disputeId, bool _supportsDispute) public {
        TellorStorage.Dispute storage disp = self.disputesById[_disputeId];
        
        //Get the voteWeight or the balance of the user at the time/blockNumber the disupte began
        uint voteWeight = TellorTransfer.balanceOfAt(self,msg.sender,disp.disputeUintVars[keccak256("blockNumber")]);
        
        //Require that the msg.sender has not voted
        require(disp.voted[msg.sender] != true);
        
        //Requre that the user had a balance >0 at time/blockNumber the disupte began
        require(voteWeight > 0);
        
        //ensures miners that are under dispute cannot vote
        require(self.stakerDetails[msg.sender].currentStatus != 3);
        
        //Update user voting status to true
        disp.voted[msg.sender] = true;
        
        //Update the number of votes for the dispute
        disp.disputeUintVars[keccak256("numberOfVotes")] += 1;
        
        //Update the quorum by adding the voteWeight
        disp.disputeUintVars[keccak256("quorum")] += voteWeight; 
        
        //If the user supports the dispute increase the tally for the dispute by the voteWeight
        //otherwise decrease it
        if (_supportsDispute) {
            disp.tally = disp.tally.add(int(voteWeight));
        } else {
            disp.tally = disp.tally.sub(int(voteWeight));
        }
        
        //Let the network know the user has voted on the dispute and their casted vote
        emit Voted(_disputeId,_supportsDispute,msg.sender);
    }


    /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(TellorStorage.TellorStorageStruct storage self, uint _disputeId) public {
        TellorStorage.Dispute storage disp = self.disputesById[_disputeId];
        TellorStorage.Request storage _request = self.requestDetails[disp.disputeUintVars[keccak256("requestId")]];

        //Ensure this has not already been executed/tallied
        require(disp.executed == false);

        //Ensure the time for voting has elapsed
        require(now > disp.disputeUintVars[keccak256("minExecutionDate")]);  

        //If the vote is not a proposed fork 
        if (disp.isPropFork== false){
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[disp.reportedMiner];  
            //If the vote for disputing a value is succesful(disp.tally >0) then unstake the reported 
            // miner and transfer the stakeAmount and dispute fee to the reporting party 
            if (disp.tally > 0 ) { 

                //Changing the currentStatus and startDate unstakes the reported miner and allows for the
                //transfer of the stakeAmount
                stakes.currentStatus = 0;
                stakes.startDate = now -(now % 86400);

                //Decreases the stakerCount since the miner's stake is being slashed
                self.uintVars[keccak256("stakerCount")]--;
                updateDisputeFee(self);

                //Transfers the StakeAmount from the reporded miner to the reporting party
                TellorTransfer.doTransfer(self, disp.reportedMiner,disp.reportingParty, self.uintVars[keccak256("stakeAmount")]);
                
                //Returns the dispute fee to the reportingParty
                TellorTransfer.doTransfer(self, address(this),disp.reportingParty,disp.disputeUintVars[keccak256("fee")]);
                
                //Set the dispute state to passed/true
                disp.disputeVotePassed = true;

                //If the dispute was succeful(miner found guilty) then update the timestamp value to zero
                //so that users don't use this datapoint
                if(_request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] == true){
                    _request.finalValues[disp.disputeUintVars[keccak256("timestamp")]] = 0;
                }

            //If the vote for disputing a value is unsuccesful then update the miner status from being on 
            //dispute(currentStatus=3) to staked(currentStatus =1) and tranfer the dispute fee to the miner
            } else {
                //Update the miner's current status to staked(currentStatus = 1)
                stakes.currentStatus = 1;              
                //tranfer the dispute fee to the miner
                TellorTransfer.doTransfer(self,address(this),disp.reportedMiner,disp.disputeUintVars[keccak256("fee")]);
                if(_request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] == true){
                    _request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] = false;
                }
            }
        //If the vote is for a proposed fork require a 20% quorum before excecuting the update to the new tellor contract address
        } else {
            if(disp.tally > 0 ){
                require(disp.disputeUintVars[keccak256("quorum")] >  (self.uintVars[keccak256("total_supply")] * 20 / 100));
                self.addressVars[keccak256("tellorContract")] = disp.proposedForkAddress;
                disp.disputeVotePassed = true;
                emit NewTellorAddress(disp.proposedForkAddress);
            }
        }
        
        //update the dispute status to executed
        disp.executed = true;
        emit DisputeVoteTallied(_disputeId,disp.tally,disp.reportedMiner,disp.reportingParty,disp.disputeVotePassed);
    }


    /**
    * @dev Allows for a fork to be proposed
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function proposeFork(TellorStorage.TellorStorageStruct storage self, address _propNewTellorAddress) public {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewTellorAddress));
        require(self.disputeIdByDisputeHash[_hash] == 0);
        TellorTransfer.doTransfer(self, msg.sender,address(this), self.uintVars[keccak256("disputeFee")]);//This is the fork fee
        self.uintVars[keccak256("disputeCount")]++;
        uint disputeId = self.uintVars[keccak256("disputeCount")];
        self.disputeIdByDisputeHash[_hash] = disputeId;
        self.disputesById[disputeId] = TellorStorage.Dispute({
            hash: _hash,
            isPropFork: true,
            reportedMiner: msg.sender, 
            reportingParty: msg.sender, 
            proposedForkAddress: _propNewTellorAddress,
            executed: false,
            disputeVotePassed: false,
            tally: 0
            }); 
        self.disputesById[disputeId].disputeUintVars[keccak256("blockNumber")] = block.number;
        self.disputesById[disputeId].disputeUintVars[keccak256("fee")]  = self.uintVars[keccak256("disputeFee")];
        self.disputesById[disputeId].disputeUintVars[keccak256("minExecutionDate")] = now + 7 days;
    }
    

    /**
    * @dev this function allows the dispute fee to fluctuate based on the number of miners on the system.
    * The floor for the fee is 15e18.
    */
    function updateDisputeFee(TellorStorage.TellorStorageStruct storage self) public {
            //if the number of staked miners divided by the target count of staked miners is less than 1
            if(self.uintVars[keccak256("stakerCount")]*1000/self.uintVars[keccak256("targetMiners")] < 1000){
                //Set the dispute fee at stakeAmt * (1- stakerCount/targetMiners)
                //or at the its minimum of 15e18 
                self.uintVars[keccak256("disputeFee")] = SafeMath.max(15e18,self.uintVars[keccak256("stakeAmount")].mul(1000 - self.uintVars[keccak256("stakerCount")]*1000/self.uintVars[keccak256("targetMiners")])/1000);
            }
            else{
                //otherwise set the dispute fee at 15e18 (the floor/minimum fee allowed)
                self.uintVars[keccak256("disputeFee")] = 15e18;
            }
    }
}
