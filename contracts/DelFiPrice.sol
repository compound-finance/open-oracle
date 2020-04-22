pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./OpenOraclePriceData.sol";
import "./OpenOracleView.sol";

interface AnchorPriceOracle {
     function getUnderlyingPrice(address) external view returns (uint256);
}


/**
 * @notice The DelFi Price Feed View
 * @author Compound Labs, Inc.
 */
contract DelFiPrice is OpenOracleView {
    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint64 price);

    /// @notice The event emitted when new prices are posted but the median price is not updated due to the anchor
    event PriceGuarded(string symbol, uint64 median, uint64 anchor);

    /// @notice The CToken contracts addresses
    struct CTokens {
        address cEthAddress;
        address cUsdcAddress;
        address cDaiAddress;
        address cRepAddress;
        address cWbtcAddress; 
        address cBatAddress; 
        address cZrxAddress;
        address cSaiAddress;
        address cUsdtAddress;
    }

    /// @notice The reporter address whose prices checked against the median for safety
    AnchorPriceOracle immutable anchor;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 lowerBoundAnchorRatio;

    /// @notice The mapping of medianized prices per symbol
    mapping(string => uint64) public prices;

    /// @notice The binary representation for 'ETH' symbol , used for string comparison
    bytes32 constant symbolEth = keccak256(abi.encodePacked("ETH"));

    /// @notice The binary representation for 'USDC' symbol, used for string comparison
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));

    /// @notice The binary representation for 'DAI' symbol, used for string comparison
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));

    /// @notice The binary representation for 'REP' symbol, used for string comparison
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));

    /// @notice The binary representation for 'BTC' symbol, used for string comparison
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));

    /// @notice The binary representation for 'BAT' symbol, used for string comparison
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));

    /// @notice The binary representation for 'ZRX' symbol, used for string comparison
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));

    /// @notice The binary representation for 'SAI' symbol, used for string comparison
    bytes32 constant symbolUsdt = keccak256(abi.encodePacked("USDT"));

    /// @notice Address of the cEther contract
    address public immutable cEthAddress;

    /// @notice Address of the cUSDC contract
    address public immutable cUsdcAddress;

    /// @notice Address of the cDAI contract
    address public immutable cDaiAddress;

    /// @notice Address of the cREP contract
    address public immutable cRepAddress;

    /// @notice Address of the cWBTC contract
    address public immutable cWbtcAddress;

    /// @notice Address of the cBAT contract
    address public immutable cBatAddress;

    /// @notice Address of the cZRX contract
    address public immutable cZrxAddress;

    /// @notice Address of the cSAI contract
    address public immutable cSaiAddress;

    /// @notice Address of the cUsdt contract
    address public immutable cUsdtAddress;

    /**
     * @param data_ Address of the Oracle Data contract
     * @param sources_ The reporter addresses whose prices will be used to calculate the median
     * @param anchor_ The reporter address whose prices checked against the median for safety
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_, 
                address[] memory sources_,
                address anchor_,
                uint anchorToleranceMantissa_,
                CTokens memory tokens_) public OpenOracleView(data_, sources_) {
        anchor = AnchorPriceOracle(anchor_);
        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        prices["USDC"] = 1e6;
        prices["USDT"] = 1e6;

        cEthAddress = tokens_.cEthAddress;
        cUsdcAddress = tokens_.cUsdcAddress;
        cDaiAddress = tokens_.cDaiAddress;
        cRepAddress = tokens_.cRepAddress;
        cWbtcAddress = tokens_.cWbtcAddress;
        cBatAddress = tokens_.cBatAddress;
        cZrxAddress = tokens_.cZrxAddress;
        cSaiAddress = tokens_.cSaiAddress;
        cUsdtAddress = tokens_.cUsdtAddress;
    }

    /**
     * @notice Primary entry point to post and recalculate prices
     * @dev We let anyone pay to post anything, but only sources count for prices
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            OpenOraclePriceData(address(data)).put(messages[i], signatures[i]);
        }

        // load usdc for using in loop to convert anchor prices to dollars
        uint256 usdcPrice = anchor.getUnderlyingPrice(cUsdcAddress);

        // Try to update the median
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            uint64 medianPrice = medianPrice(symbol, sources);
            uint64 anchorPrice = getAnchorPrice(symbol, usdcPrice);
            if (anchorPrice == 0) {
                emit PriceGuarded(symbol, medianPrice, anchorPrice);
            } else {
                uint256 anchorRatioMantissa = uint256(medianPrice) * 100e16 / anchorPrice;
                // Only update the view's price if the median of the sources is within a bound, and it is a new median
                if (anchorRatioMantissa <= upperBoundAnchorRatio && anchorRatioMantissa >= lowerBoundAnchorRatio) {
                    // only update and emit event if the median price is new, otherwise do nothing
                    if (prices[symbol] != medianPrice) {
                        prices[symbol] = medianPrice;
                        emit PriceUpdated(symbol, medianPrice);
                    }
                } else {
                    emit PriceGuarded(symbol, medianPrice, anchorPrice);
                }
            }
        }
    }

    /**
     * @notice Flags that this contract is meant to be compatible with Compound v2 PriceOracle interface.
     * @return true, this contract is meant to be used by Compound v2 PriceOracle interface.
     */
    function isPriceOracle() external pure returns (bool) {
        return true;
    }

    // fetchs price in eth from proxy and converts to usd price using anchor usdc price
    // anchor usdc price has 30 decimals, and anchor general price has 18 decimals,
    // so multiplying by 1e18 and by 1e30 yields 1e6
    function getAnchorPrice(string memory symbol, uint256 usdcPrice) public  returns (uint64) {
        address tokenAddress = getCTokenAddress(symbol);

        if ( tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress )  {
            // hard code to 1 dollar
            return 1e6;
        }

        uint priceInEth = anchor.getUnderlyingPrice(tokenAddress);
        uint additionalScale;
        if ( tokenAddress == cWbtcAddress ){
            // wbtc proxy price is scaled 1e(36 - 8) = 1e28, so we need 8 more to get to 36
            additionalScale = 1e8;
        } else {
            // all other tokens are scaled 1e18, so we need 18 more to get to 36
            additionalScale = 1e18;
        }
        return uint64(priceInEth * additionalScale / usdcPrice);
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view returns (uint256) {
        uint256 priceSixDecimals;

        if(cToken == cSaiAddress) {
            uint256 usdPerEth = prices["ETH"];
            uint256 ethPerSai = anchor.getUnderlyingPrice(cSaiAddress);
            // usdPerEth - 6 decimals
            // ethPerSai - 18 decimals
            // divide by 1e18 to drop down to 6
            /* priceSixDecimals = usdPerEth * ethPerSai ; */
            priceSixDecimals = usdPerEth * ethPerSai / 1e18;
        } else {
            priceSixDecimals = prices[getOracleKey(cToken)];
        }

        // comptroller expects price to have 18 decimals,
        // and additionally upscaled by 1e18 - underlyingdecimals
        // base decimals is 1e6, so start by addint twelve
        uint256 additionalScale;
        if ( cToken == cUsdcAddress || cToken == cUsdtAddress )  {
            additionalScale = 1e24;
        } else if ( cToken == cWbtcAddress )  {
            additionalScale = 1e22;
        } else {
            additionalScale = 1e12;
        }

        return priceSixDecimals * additionalScale;
    }

    /**
     * @notice Calculates the median price over any set of sources
     * @param symbol The symbol to calculate the median price of
     * @param sources_ The sources to use when calculating the median price
     * @return median The median price over the set of sources
     */
    function medianPrice(string memory symbol, address[] memory sources_) public view returns (uint64 median) {
        require(sources_.length > 0, "sources list must not be empty");

        uint N = sources_.length;
        uint64[] memory postedPrices = new uint64[](N);
        for (uint i = 0; i < N; i++) {
            postedPrices[i] = OpenOraclePriceData(address(data)).getPrice(sources_[i], symbol);
        }

        uint64[] memory sortedPrices = sort(postedPrices);
        // if N is even, get the left and right medians and average them
        if (N % 2 == 0) {
            uint64 left = sortedPrices[(N / 2) - 1];
            uint64 right = sortedPrices[N / 2];
            uint128 sum = uint128(left) + uint128(right);
            return uint64(sum / 2);
        } else {
            // if N is odd, just return the median
            return sortedPrices[N / 2];
        }
    }

    /**
     * @notice Returns the cToken address for symbol
     * @param symbol The symbol to map to cToken address
     * @return The cToken address for the given symbol
     */
    function getCTokenAddress(string memory symbol) public view returns (address) {
        bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
        if (symbolHash == symbolEth) return cEthAddress;
        if (symbolHash == symbolUsdc) return cUsdcAddress;
        if (symbolHash == symbolDai) return cDaiAddress;
        if (symbolHash == symbolRep) return cRepAddress;
        if (symbolHash == symbolWbtc) return cWbtcAddress;
        if (symbolHash == symbolBat) return cBatAddress;
        if (symbolHash == symbolZrx) return cZrxAddress;
        if (symbolHash == symbolUsdt) return cUsdtAddress;
        revert("Unknown token symbol");
    }

    /**
     * @notice Returns the symbol for cToken address
     * @param cToken The cToken address to map to symbol
     * @return The symbol for the given cToken address
     */
    function getOracleKey(address cToken) public view returns (string memory) {
        if (cToken == cEthAddress) return "ETH";
        if (cToken == cUsdcAddress) return "USDC";
        if (cToken == cDaiAddress) return "DAI";
        if (cToken == cRepAddress) return "REP";
        if (cToken == cWbtcAddress) return "BTC";
        if (cToken == cBatAddress) return "BAT";
        if (cToken == cZrxAddress) return "ZRX";
        if (cToken == cSaiAddress) return "SAI";
        if (cToken == cUsdtAddress) return "USDT";
        revert("Unknown token address");
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
