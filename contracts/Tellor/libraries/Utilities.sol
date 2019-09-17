pragma solidity ^0.5.0;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library Utilities{

    /**
    * @dev Returns the minimum value in an array.
    */
    function getMax(uint[51] memory data) internal pure returns(uint256 max,uint256 maxIndex) {
        max = data[1];
        maxIndex;
        for(uint i=1;i < data.length;i++){
            if(data[i] > max){
                max = data[i];
                maxIndex = i;
                }
        }
    }

    /**
    * @dev Returns the minimum value in an array.
    */
    function getMin(uint[51] memory data) internal pure returns(uint256 min,uint256 minIndex) {
        minIndex = data.length - 1;
        min = data[minIndex];
        for(uint i = data.length-1;i > 0;i--) {
            if(data[i] < min) {
                min = data[i];
                minIndex = i;
            }
        }
  }




  // /// @dev Returns the minimum value and position in an array.
  // //@note IT IGNORES THE 0 INDEX
  //   function getMin(uint[51] memory arr) internal pure returns (uint256 min, uint256 minIndex) {
  //     assembly {
  //         minIndex := 50
  //         min := mload(add(arr, mul(minIndex , 0x20)))
  //         for {let i := 49 } gt(i,0) { i := sub(i, 1) } {
  //             let item := mload(add(arr, mul(i, 0x20)))
  //             if lt(item,min){
  //                 min := item
  //                 minIndex := i
  //             }
  //         }
  //     }
  //   }


  
  // function getMax(uint256[51] memory arr) internal pure returns (uint256 max, uint256 maxIndex) {
  //     assembly {
  //         for { let i := 0 } lt(i,51) { i := add(i, 1) } {
  //             let item := mload(add(arr, mul(i, 0x20)))
  //             if lt(max, item) {
  //                 max := item
  //                 maxIndex := i
  //             }
  //         }
  //     }
  //   }





  }
