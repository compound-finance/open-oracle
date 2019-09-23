pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./OpenOracleView.sol";
import "./OpenOracleOnChainInterface.sol";

/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPriceWithOnchainData is OpenOracleView {
    /**
     * @notice The event emitted when a price is written to storage
     */
    event Price(string symbol, uint64 price);
    address[] onChainSources;
    /**
     * @notice The mapping of medianized prices per symbol
     */
    mapping(string => uint64) public prices;

    constructor(OpenOraclePriceData data_, address[] memory sources_,address[] memory onChainSources_) public OpenOracleView(data_, sources_) {
        onChainSources = onChainSources_;
    }

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only sources count for prices.
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Post the messages, whatever they are
        for (uint i = 0; i < messages.length; i++) {
            OpenOraclePriceData(address(data)).put(messages[i], signatures[i]);
        }

        // Recalculate the asset prices for the symbols to update
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];

            // Calculate the median price, write to storage, and emit an event
            uint64 price = medianPrice(symbol, sources);
            prices[symbol] = price;
            emit Price(symbol, price);
        }
    }

    /**
     * @notice Calculates the median price over any set of sources
     * @param symbol The symbol to calculate the median price of
     * @param sources_ The sources to use when calculating the median price
     * @return median The median price over the set of sources
     */
    function medianPrice(string memory symbol, address[] memory sources_) public returns (uint64 median) {
        require(sources_.length > 0, "sources list must not be empty");
        uint N = sources_.length;
        uint64[] memory postedPrices = new uint64[](N);
        for (uint i = 0; i < N; i++) {
            postedPrices[i] = OpenOraclePriceData(address(data)).getPrice(sources_[i], symbol);
            //should you add check that timestamp is within a certain period?
        }

        bool _didGet;
        uint _retrievedValue;
        uint _timestampRetrieved;
        uint64[] memory result = new uint64[](onChainSources.length);
        uint tookCount = 0;
        for(uint i=0; i< onChainSources.length; i++){
            (_didGet,_retrievedValue,_timestampRetrieved) = OpenOracleOnChainInterface(address(onChainSources[i])).getCurrentValue(symbol);    
            if(_didGet && _timestampRetrieved > now - 1 days){//or a different threshold (or none like Compound)
                result[tookCount] = uint64(_retrievedValue);
                tookCount++;
            }         
        }
        uint64[] memory allPrices = new uint64[](N + tookCount);
        for (uint i=0; i < (N + tookCount); i++) {
            if(i<N){
                allPrices[i] = postedPrices[i];
            }
            else{
                allPrices[i] = result[i-N];
            }
        }
        uint64[] memory sortedPrices = sort(allPrices);
        return allPrices[N / 2];
    }

    /**
     * @notice Helper to sort an array of uints
     * @param array Array of integers to sort
     * @return The sorted array of integers
     */
    function sort(uint64[] memory array) private pure returns (uint64[] memory) {
        uint N = array.length;
        for (uint i = 0; i < N; i++) {
            for (uint j = i + 1; j < N; j++) {
                if (array[i] > array[j]) {
                    uint64 tmp = array[i];
                    array[i] = array[j];
                    array[j] = tmp;
                }
            }
        }
        return array;
    }
}