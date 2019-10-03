pragma solidity ^0.5.0;

contract OpenOracleOnChainImplementation{

    struct Datum {
        uint64 timestamp;
        uint64 value;
    }

    mapping(string => uint64) public currentTime;
    mapping(string => mapping(uint64 => Datum)) public priceData;

	 //_didGet,_value,_timestampRetrieved
	function getCurrentValue(string memory _symbol) public returns(bool _didGet,uint64 _value,uint64 _time){
		(_value,_time) = getValue(_symbol,currentTime[_symbol]);
		if(_time > 0){
			_didGet = true;
		}
	} //_didGet,_value,_timestampRetrieved

	function setValue(string calldata _symbol, uint64 _time, uint64 _value) external{
			priceData[_symbol][_time] = Datum({
				value: _value,
				timestamp: _time
            });
            if(_time > currentTime[_symbol]){
            	currentTime[_symbol] = _time;
            }
	}

	function getValue(string memory _symbol, uint64 _timestamp)public view returns(uint64,uint64){
		Datum storage thisVal = priceData[_symbol][_timestamp];
		return (thisVal.value,thisVal.timestamp);
	}
}