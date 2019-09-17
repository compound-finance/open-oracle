pragma solidity ^0.5.0;

//Slightly modified SafeMath library - includes a min and max function, removes useless div function
library SafeMath {

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

  function add(int256 a, int256 b) internal pure returns (int256 c) {
    if(b > 0){
      c = a + b;
      assert(c >= a);
    }
    else{
      c = a + b;
      assert(c <= a);
    }

  }

  function max(uint a, uint b) internal pure returns (uint256) {
    return a > b ? a : b;
  }

  function max(int256 a, int256 b) internal pure returns (uint256) {
    return a > b ? uint(a) : uint(b);
  }

  function min(uint a, uint b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
  
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function sub(int256 a, int256 b) internal pure returns (int256 c) {
    if(b > 0){
      c = a - b;
      assert(c <= a);
    }
    else{
      c = a - b;
      assert(c >= a);
    }

  }

}
