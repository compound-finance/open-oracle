methods {
getUpperThreshold() returns uint256 envfree
getLowerThreshold() returns uint256 envfree
getPriceData(address,uint256) returns uint64 envfree
priceHarness(uint256) returns uint256 envfree
newObservationTimestamp(bytes32) returns uint256 envfree
oldObservationTimestamp(bytes32) returns uint256 envfree
anchorPeriod() returns uint256 envfree
getSymbolHash(uint256) returns bytes32 envfree
getSymbolKeccakHash(uint256) returns bytes32 envfree
reporter() returns address envfree
getEthHash() returns bytes32 envfree
reporterInvalidated() returns bool envfree
getSymbolBaseUnit(uint256) returns uint256 envfree
getSymbolPriceSource(uint256) returns uint256 envfree
getSymbolHashIndexHarness(bytes32) returns uint256 envfree
}

/*
The percentage tolerance that the reporter price may deviate from the uniswap anchor price should
be bounded. Specifically, anchorPrice*10^18/reporterPrice >= sinvoke getLowerThreshold() && anchorPrice*10^18/reporterPrice <= sinvoke getUpperThreshold().
NOTE: 2000000000000000000 == 2*10^18; 1000000000000000000 == 10^18
 */
invariant anchorThresholds() sinvoke getUpperThreshold() >= sinvoke getLowerThreshold() && sinvoke getLowerThreshold() > 0
                        && ((sinvoke getUpperThreshold() >= 2000000000000000000 && sinvoke getLowerThreshold() == 1) ||  
						(sinvoke getUpperThreshold() < 2000000000000000000 && sinvoke getLowerThreshold() <= 1000000000000000000))
/*
The new and old Uniswap cumulative anchor prices stored ("observed") by the system are at least anchorPeriod apart. This invariant is maintained in all system's states except the initialization state. The system is in an initialization state during the first anchorPeriod. In this state, the new and old cumulative anchor prices are equal. This invariant entails that once the sysem is no longer in initialization state, the TWAP is computed over a time interval at least anchorPrice.
*/
invariant consistentObservationsTimeStamps(bytes32 symbolHash) sinvoke oldObservationTimestamp(symbolHash) == sinvoke newObservationTimestamp(symbolHash) || 
                    sinvoke newObservationTimestamp(symbolHash) >= sinvoke oldObservationTimestamp(symbolHash) + sinvoke anchorPeriod() {
            preserved pokeWindowValuesHarness(env e, uint256 symbolIndex) {
				require symbolHash == sinvoke getSymbolHash(symbolIndex) && (sinvoke newObservationTimestamp(symbolHash) >= sinvoke oldObservationTimestamp(symbolHash) + sinvoke anchorPeriod() || sinvoke oldObservationTimestamp(symbolHash) == sinvoke newObservationTimestamp(symbolHash)) && e.block.timestamp >= sinvoke newObservationTimestamp(symbolHash);
				//In addition to the original invariant, assume that now does not come before the new //observation;
				//otherwise, we may get an underflow in pokeWindowValues, and as a result, oldTimeStamp > newTimeStamp (violating the invariant).
			} 
    }

/*
Assuming the system is in initialization state, after anchorPeriod the system reaches a state where the new and old Uniswap cumulative anchor prices stored ("observed") by the system are at least anchorPeriod apart.
*/
rule observationTimeStampsInitizializedEndPeriod(uint256 symbolIndex, uint256 oldTimestamp, uint256 newTimestamp, uint256 currtimestamp, uint256 anchorPeriodTime) {
    env e;
    
	bytes32 symbolHash = sinvoke getSymbolHash(symbolIndex);
	
    require currtimestamp == e.block.timestamp ; 
    require oldTimestamp == sinvoke oldObservationTimestamp(symbolHash);
    require newTimestamp == sinvoke newObservationTimestamp(symbolHash);
    require anchorPeriodTime == sinvoke anchorPeriod();
    
	//Assume initialization state
    require oldTimestamp == newTimestamp;
    
	//Require that the first anchor period has elapsed.
    require currtimestamp >= newTimestamp + anchorPeriodTime;
    
	//Require that anchorPeriod is properly initialized to a non-zero value.
    require anchorPeriodTime > 0; 
    
    //Invoke UniswapAnchoredView.pokeWindowValues
    invoke pokeWindowValuesHarness(e,symbolIndex);
    assert !lastReverted => sinvoke newObservationTimestamp(symbolHash) >= sinvoke oldObservationTimestamp(symbolHash) + sinvoke anchorPeriod(); 
}

/*
Assuming the system is in a state after initialization, the new and old Uniswap cumulative anchor prices stored ("observed") by the system are at least anchorPeriod apart.
*/
rule observationTimeStampsOnPokeAfterInit(uint256 symbolIndex, uint256 oldTimestamp, uint256 newTimestamp, uint256 currtimestamp, uint anchorPeriodTime) {
    env e;
	bytes32 symbolHash = sinvoke getSymbolHash(symbolIndex);
    
    require currtimestamp == e.block.timestamp ; 
    require oldTimestamp == sinvoke oldObservationTimestamp(symbolHash);
    require newTimestamp == sinvoke newObservationTimestamp(symbolHash);
    require anchorPeriodTime == sinvoke anchorPeriod();
    
    //Require that the block numbers are realistic (namely, now does not come before the new observation);
	//otherwise, this rule is violated due to a possible subtraction underflow in pokeWindowValues
    //(see line 255 in UniswapAnchoredView: uint timeElapsed = block.timestamp - newObservation.timestamp;)
	require currtimestamp >= newTimestamp;
	
    // require that we start with a valid state
    require anchorPeriodTime > 0; 
    
	//require that the state is after the initialization state 
    require newTimestamp >= oldTimestamp + anchorPeriodTime;

    // perform a pokeWindowValues
    invoke pokeWindowValuesHarness(e,symbolIndex);
    assert !lastReverted => currtimestamp >= sinvoke oldObservationTimestamp(symbolHash) + anchorPeriodTime; 
}

/*
With the same Open Oracle Price Data, and once a symbol’s price is posted, its price should remain unchanged.
This property does not hold when the reporter is invalidated, as the price changes to the anchor price on every post.
Currently, this rule is disabled due to performance issues of the tool.
*/
//@Disable "performance issues"
// rule priceIdempotent(uint256 symbolIndex, bytes32 symbolKeccakHash, uint256 beforePrice, uint256 price1, uint256 price2, uint256 ethPrice) {
    // env e1;
	// env e2;
	
	// //Require that the reporter is not invalidated.
    // require !sinvoke reporterInvalidated();

    // //Require that symbolIndex has a valid priceSource enum value (either 0,1, or 2).
	// require sinvoke getSymbolPriceSource(symbolIndex) < 3;
	
	// //Require that symbolKeccakHash uniquely maps to symbolIndex.
	// /*NOTE:
	// 1. This assumption also entails that both getTokenConfig(symbolIndex) and getTokenConfigBySymbolHash(symbolKeccakHash) do not revert.
	// 2. This assumption ensures that getTokenConfig(symbolIndex) == getTokenConfigBySymbolHash(symbolKeccakHash), hence
	   // priceHarness(symbolIndex) and postPrice(*,symbolIndex,*) respectively return and change the price of the same symbol.
	// */
	// require symbolKeccakHash == sinvoke getSymbolKeccakHash(symbolIndex) && symbolKeccakHash == sinvoke getSymbolHash(symbolIndex);
	// require symbolIndex == sinvoke getSymbolHashIndexHarness(symbolKeccakHash);
	
	// //The symbol's price before posting its price.
	// require beforePrice == sinvoke priceHarness(symbolIndex);

	// //Post the symbol's price.
	// sinvoke postPrice(e1,symbolIndex,ethPrice);
    // require price1 == sinvoke priceHarness(symbolIndex);
	// require beforePrice != price1;
	
	// //Repost the symbol's price, without preceding calls to priceData.put.
    // sinvoke postPrice(e2,symbolIndex,ethPrice);
    // require price2 == sinvoke priceHarness(symbolIndex);
	
	// //Expect that the post operation is idempotent.
    // assert price1 == price2;
// }

/*
When posting a price for a symbol, the prices of other symbols do not change. The only
exception is the Ether (eth) price, which influences Ether denominated symbols’ prices.
Currently, this rule is disabled due to performance issues of the tool.
*/
//@Disable "performance issues"
/* rule noChangeToOtherSymbols(uint256 symbolIndex,bytes32 symbolKeccakHash, uint256 ethSymbolIndex, bytes32 ethHash, address source, uint64 timestamp, uint64 value, 
                uint256 otherSymbolIndex, bytes32 otherSymbolKeccakHash, uint256 ethPrice) {
    env e;
    require sinvoke getEthHash() == ethHash;
	require ethSymbolIndex == sinvoke getSymbolHashIndexHarness(ethHash) && ethSymbolIndex < 3;
	require ethHash == sinvoke getSymbolHash(ethSymbolIndex) && ethHash == sinvoke getSymbolKeccakHash(ethSymbolIndex);
	
	//Require that symbol!=ETH.
	//NOTE: otherwise, if otherSymbol is FIXED_ETH (thus eth denominated), its price may change
	require symbolIndex != otherSymbolIndex && symbolIndex != ethSymbolIndex && symbolIndex < 3 && otherSymbolIndex < 3;
	require symbolKeccakHash == sinvoke getSymbolKeccakHash(symbolIndex) && symbolKeccakHash == sinvoke getSymbolHash(symbolIndex);
	require otherSymbolKeccakHash == sinvoke getSymbolKeccakHash(otherSymbolIndex) && otherSymbolKeccakHash == sinvoke getSymbolHash(otherSymbolIndex);
	require symbolKeccakHash != otherSymbolKeccakHash && symbolKeccakHash != ethHash;
	
	require symbolIndex == sinvoke getSymbolHashIndexHarness(symbolKeccakHash);
	require otherSymbolIndex == sinvoke getSymbolHashIndexHarness(otherSymbolKeccakHash);
	
	uint256 otherSymbolPriceBefore = sinvoke priceHarness(otherSymbolIndex);

	sinvoke harnessPut(e, source, timestamp, symbolIndex, value);
    sinvoke postPrice(e,symbolIndex,ethPrice);

    uint256 otherSymbolPriceAfter = sinvoke priceHarness(otherSymbolIndex);
    assert otherSymbolPriceBefore == otherSymbolPriceAfter, "otherSymbol price changed";
} */

/*
This rule specifies sufficient assumptions under which the function UniswapAnchoredView.postPriceInternal does not revert.
Currently, this rule is disabled due to performance issues of the tool.
*/
//@Disable "performance issues"
/* rule postPriceRevertCharacterisrtics(uint256 symbolIndex, uint256 ethPrice, uint256 newTimeStamp, uint256 oldTimeStamp) {
	env e;
	address reporter_ = sinvoke reporter();
	
	//Avoid reverts due to functions being non-payable 
    require e.msg.value==0;
    
	bytes32 symbolHash = sinvoke getSymbolKeccakHash(symbolIndex);
	
	//Require that symbolIndex has valid config struct (in particular, getTokenConfig(symbolIndex) does not revert):
	//Require that the symbol's config struct is initialized with a valid symbolHash
	require symbolHash == sinvoke getSymbolHash(symbolIndex);
	//Require that the symbol's config struct is initialized with a valid priceSource enum value (either 0,1, or 2)
	require sinvoke getSymbolPriceSource(symbolIndex) < 3;
	
	require symbolIndex == sinvoke getSymbolHashIndexHarness(symbolHash);
	//NOTE: this entails that getSymbolHashIndex(symbolHash) != -1
	
	//Require that priceData has a getPrice method
	sinvoke getPriceData(reporter_, symbolIndex); 
	
	//Require config.baseUnit > 0 to avoid division by zero
	require sinvoke getSymbolBaseUnit(symbolIndex) > 0; 
    
	require newTimeStamp == sinvoke newObservationTimestamp(symbolHash);
	require oldTimeStamp == sinvoke oldObservationTimestamp(symbolHash);
    
	//Assume invariant of consistent observation timestamps
    requireInvariant consistentObservationsTimeStamps(symbolHash);
	
	//Assume that now does not come before the new observation
	//otherwise, we may get an underflow, and as a result, oldTimeStamp > newTimeStamp
	require e.block.timestamp >= newTimeStamp;
	
	//Assume that if in initialization state, now must come after either observations
	//to avoid a revert due to the require statement in fetchAnchorPrice
    require (oldTimeStamp == newTimeStamp) => (e.block.timestamp > oldTimeStamp);
    //Assume that anchorPeriod > 0 to avoid timeElaped of zero (i.e., division by zero in fetchAnchorPrice)
    require sinvoke anchorPeriod() > 0;
    //require sinvoke getTokenConfigHash(s) != sinvoke getEthHash(); //just to take the path we want
    invoke postPrice(e,symbolIndex,ethPrice);
    assert !lastReverted; //we are expect to fail on mul overflow in fetchAnchorPrice
} */
