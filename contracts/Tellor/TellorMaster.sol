pragma solidity ^0.5.0;

import "./TellorGetters.sol";

/**
* @title Tellor Master
* @dev This is the Master contract with all tellor getter functions and delegate call to Tellor. 
* The logic for the functions on this contract is saved on the TellorGettersLibrary, TellorTransfer, 
* TellorGettersLibrary, and TellorStake
*/
contract TellorMaster is TellorGetters{
    
    event NewTellorAddress(address _newTellor);

    /**
    * @dev The constructor sets the original `tellorStorageOwner` of the contract to the sender
    * account, the tellor contract to the Tellor master address and owner to the Tellor master owner address 
    * @param _tellorContract is the address for the tellor contract
    */
    constructor (address _tellorContract)  public{
        tellor.init();
        tellor.addressVars[keccak256("_owner")] = msg.sender;
        tellor.addressVars[keccak256("_deity")] = msg.sender;
        tellor.addressVars[keccak256("tellorContract")]= _tellorContract;
        emit NewTellorAddress(_tellorContract);
    }
    

    /**
    * @dev Gets the 5 miners who mined the value for the specified requestId/_timestamp 
    * @dev Only needs to be in library
    * @param _newDeity the new Deity in the contract
    */

    function changeDeity(address _newDeity) external{
        tellor.changeDeity(_newDeity);
    }


    /**
    * @dev  allows for the deity to make fast upgrades.  Deity should be 0 address if decentralized
    * @param _tellorContract the address of the new Tellor Contract
    */
    function changeTellorContract(address _tellorContract) external{
        tellor.changeTellorContract(_tellorContract);
    }
  

    /**
    * @dev This is the fallback function that allows contracts to call the tellor contract at the address stored
    */
    function () external payable {
        address addr = tellor.addressVars[keccak256("tellorContract")];
        bytes memory _calldata = msg.data;
        assembly {
            let result := delegatecall(not(0), addr, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}