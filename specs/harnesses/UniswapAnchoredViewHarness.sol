pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../../contracts/Uniswap/UniswapAnchoredView.sol";
import "./OpenOraclePriceDataHarness.sol";

contract UniswapAnchoredViewHarness is UniswapAnchoredView {
    
    constructor(OpenOraclePriceData priceData_,
                address reporter_,
                uint anchorToleranceMantissa_,
                uint anchorPeriod_,
                TokenConfig[] memory configs)  public
                UniswapAnchoredView(priceData_, reporter_,  anchorToleranceMantissa_, anchorPeriod_, configs){
    }
    
    /*
    CERTORA:
        Overrding postPrices due to performance issues of the tool when checking the invariant consistentObservationsTimeStamps.
        As a result, we have to make postPrices virtual.
        NOTE: we do check the invariant for postPriceInternal, using the harness function postPrice.
    */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) override external {}
    
    /*
    CERTORA:
        This function replaces the constructor of UniswapAnchoredView and it is used to verify the invariants written in the specification.
        NOTE: Any change to the constructor code should be reflected in this function as well in order to keep the verification results correct.
    */
    function init_state(uint anchorToleranceMantissa_, address cToken_, address underlying_, bytes32 symbolHash_, uint256 baseUnit_, PriceSource priceSource_,
     uint256 fixedPrice_, address uniswapMarket_, bool isUniswapReversed_) public {
        require(upperBoundAnchorRatio == (anchorToleranceMantissa_ > uint(-1) - 100e16 ? uint(-1) : 100e16 + anchorToleranceMantissa_));
        require(lowerBoundAnchorRatio == (anchorToleranceMantissa_ < 100e16 ? 100e16 - anchorToleranceMantissa_ : 1));
        /*
        CERTORA:
            The code below should "mimic" the iteration performed in the constructor over the TokenConfigs array.
            Each symbolHash may belong to a config (in the configs array) whose price source is either the reporter or some other source.
            In the former case, both oldObservations[symbolHash] and newObservations[symbolHash] are initialized in the constructor
            in the same way as in the code below. In the latter case, oldObservations[symbolHash] and newObservations[symbolHash]
            are initialized to the default value (0x0). This also holds for every symbolHash that does not belong to any config. 
        */
        TokenConfig memory config = TokenConfig({
            cToken: cToken_,
            underlying: underlying_,
            symbolHash: symbolHash_,
            baseUnit: baseUnit_,
            priceSource: priceSource_,
            fixedPrice: fixedPrice_,
            uniswapMarket: uniswapMarket_,
            isUniswapReversed: isUniswapReversed_
        });
        address uniswapMarket = config.uniswapMarket;
        if (config.priceSource == PriceSource.REPORTER) {
            require(uniswapMarket != address(0), "reported prices must have an anchor");
            bytes32 symbolHash = config.symbolHash;
            uint cumulativePrice = currentCumulativePrice(config);
            oldObservations[symbolHash].timestamp = block.timestamp;
            newObservations[symbolHash].timestamp = block.timestamp;
            oldObservations[symbolHash].acc = cumulativePrice;
            newObservations[symbolHash].acc = cumulativePrice;
            } else {
                require(uniswapMarket == address(0), "only reported prices utilize an anchor");
            }
    }

    function getUpperThreshold() public returns (uint) { return upperBoundAnchorRatio; }
    function getLowerThreshold() public returns (uint) { return lowerBoundAnchorRatio; }
    function newObservationTimestamp(bytes32 sym) public returns (uint) { return newObservations[sym].timestamp; }
    function oldObservationTimestamp(bytes32 sym) public returns (uint) { return oldObservations[sym].timestamp; }
    
    string symStr;
    function getEthHash() public returns (bytes32) {
        /*
        CERTORA:
            Added the first line below to bypass (disable) the eager evaluation of keccak256(abi.encodePacked("ETH")), performed
            as part of the verification condition generation. As this eager evaluation was not performed in case of other references to ethHash,
            the equality of getEthHash() and ethHash was not asserted by the verification condition. That led to spurious counter-examples.
        */
        keccak256(abi.encodePacked(symStr));

        return ethHash;
    }
	
    function priceHarness(uint symbolIndex) public view returns (uint) {
        TokenConfig memory config = getTokenConfig(symbolIndex);
        return priceInternal(config);
    }

    function pokeWindowValuesHarness(uint symbolIndex) public returns (uint, uint, uint) {
        TokenConfig memory config = getTokenConfig(symbolIndex); 
        return pokeWindowValues(config);
    }

    mapping (uint => string) public indexToSymbol;
    function symbolOfIndex(uint index) public returns (string memory) {
        /* CERTORA:
            To enable the verification condition to model that two strings are equal iff their (keccak) hashes are equal,
            we require that all symbol strings are of length at most 32 bytes (one word).
        */
        require(bytes(indexToSymbol[index]).length <= 32); 
        return indexToSymbol[index];
    }

    function postPrice(uint symbolIndex, uint ethPrice) external { //corresponds to postPriceInternal(string, uint)
        postPriceInternal(symbolOfIndex(symbolIndex), ethPrice);
    }

    function getSymbolHash(uint symbolIndex) public returns (bytes32) {
        TokenConfig memory config = getTokenConfig(symbolIndex);
        return config.symbolHash;
    }

    function getSymbolKeccakHash(uint symbolIndex) public returns (bytes32) {
        return keccak256(abi.encodePacked(symbolOfIndex(symbolIndex)));
    }
	
    /*
    CERTORA:
        Added this function here rather than in OpenOraclePriceDataHarness because OpenOraclePriceData.getPrice is external;
        otherwise, we would have to change it to be public.
    */
    function getPriceData(address source, uint symbolIndex) public returns (uint64) { 
        return priceData.getPrice(source, symbolOfIndex(symbolIndex)); 
    }
    
    function harnessPut(address source, uint64 timestamp, uint symbolIndex, uint64 value) external {  
        OpenOraclePriceDataHarness(address(priceData)).invokePutInternal(source, timestamp, symbolOfIndex(symbolIndex), value);
    }

    mapping (address => mapping (uint => mapping (bool => uint))) public uniswapHarness; 
    function currentCumulativePrice(TokenConfig memory config) internal view override returns (uint) {
        return uniswapHarness[config.uniswapMarket][block.timestamp][config.isUniswapReversed];
    }

    function getCTokenIndex(address cToken) internal override view returns (uint) {
        if (cToken == cToken00) return 0;
        if (cToken == cToken01) return 1;
        if (cToken == cToken02) return 2;

        return uint(-1);
    }

    function getUnderlyingIndex(address underlying) internal override view returns (uint) {
        if (underlying == underlying00) return 0;
        if (underlying == underlying01) return 1;
        if (underlying == underlying02) return 2;

        return uint(-1);
    }

    function getSymbolHashIndex(bytes32 symbolHash) internal override view returns (uint) {
        if (symbolHash == symbolHash00) return 0;
        if (symbolHash == symbolHash01) return 1;
        if (symbolHash == symbolHash02) return 2;

        return uint(-1);
    }

    /*
    CERTORA:
        Added this fuction to keep getSymbolHashIndex (bytes32) internal.
    */
    function getSymbolHashIndexHarness(bytes32 symbolHash) external view returns (uint) {
        return getSymbolHashIndex(symbolHash);
    }

    function getTokenConfig(uint i) public override view returns (TokenConfig memory) {
        require(i < 3, "token config not found");
        
        if (i == 0) return TokenConfig({cToken: cToken00, underlying: underlying00, symbolHash: symbolHash00, baseUnit: baseUnit00, priceSource: priceSource00, fixedPrice: fixedPrice00, uniswapMarket: uniswapMarket00, isUniswapReversed: isUniswapReversed00});
        if (i == 1) return TokenConfig({cToken: cToken01, underlying: underlying01, symbolHash: symbolHash01, baseUnit: baseUnit01, priceSource: priceSource01, fixedPrice: fixedPrice01, uniswapMarket: uniswapMarket01, isUniswapReversed: isUniswapReversed01});
        if (i == 2) return TokenConfig({cToken: cToken02, underlying: underlying02, symbolHash: symbolHash02, baseUnit: baseUnit02, priceSource: priceSource02, fixedPrice: fixedPrice02, uniswapMarket: uniswapMarket02, isUniswapReversed: isUniswapReversed02});
    }

    function getSymbolPriceSource(uint symbolIndex) public view returns (uint) {
        require(symbolIndex < 3);
        if(symbolIndex==0) return uint256(priceSource00);
        if(symbolIndex==1) return uint256(priceSource01);
        if(symbolIndex==2) return uint256(priceSource01);
    }

    function getSymbolBaseUnit(uint symbolIndex) public  view  returns (uint) {
        TokenConfig memory config = getTokenConfig(symbolIndex);
        return config.baseUnit;
    }

    mapping (uint => uint) public ethPrice;
    function fetchEthPrice() internal override returns (uint) {
        return ethPrice[block.timestamp];
    }
}