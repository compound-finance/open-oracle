pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./UniswapContracts.sol";

/**
 * @notice 
 * @dev 
 * @dev
 * @author
 */
contract UniswapOracle {
    using FixedPoint for *;

     /// @notice The CToken contracts addresses
    struct Tokens {
        address wethAddress;
        address usdcAddress;
        address daiAddress;
        address repAddress;
        address wbtcAddress;
        address batAddress;
        address zrxAddress;
        // address cSaiAddress;
        // address cUsdtAddress;
    }

    //  Address of the Token contracts
    address public immutable wethAddress;
    address public immutable usdcAddress;
    address public immutable daiAddress;
    address public immutable repAddress;
    address public immutable wbtcAddress;
    address public immutable batAddress;
    address public immutable zrxAddress;
    // address public immutable saiAddress;
    // address public immutable usdtAddress;
    
    // The binary representation for token symbols, used for string comparison
    bytes32 constant symbolWeth = keccak256(abi.encodePacked("ETH"));
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));
   // bytes32 constant symbolUsdt = keccak256(abi.encodePacked("USDT"));

    struct TokenPriceData {
        IUniswapV2Pair pair;
        uint price0CumulativeLast;
        uint price1CumulativeLast;
        uint32 blockTimestampLast;
        uint112 price0Average;
        uint112 price1Average;
    }

    mapping (address => TokenPriceData) pairPrices;
    address public immutable factory;

    uint public constant PERIOD = 30 minutes;

    constructor(address factory_, Tokens memory tokens_) public { 
        factory = factory_;

        wethAddress = tokens_.wethAddress;
        usdcAddress = tokens_.usdcAddress;
        daiAddress = tokens_.daiAddress;
        repAddress = tokens_.repAddress;
        wbtcAddress = tokens_.wbtcAddress;
        batAddress = tokens_.batAddress;
        zrxAddress = tokens_.zrxAddress;

        // Init all supported token pairs 
        initTokenPair(factory_, tokens_.daiAddress, tokens_.wethAddress);
        initTokenPair(factory_, tokens_.repAddress, tokens_.wethAddress);
        initTokenPair(factory_, tokens_.batAddress, tokens_.wethAddress);
        initTokenPair(factory_, tokens_.zrxAddress, tokens_.wethAddress);
        initTokenPair(factory_, tokens_.wbtcAddress, tokens_.wethAddress);
    }

    function initTokenPair(address factory_, address token, address wethAddress_) internal {
        IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory_, token, wethAddress_));

        uint112 reserve0;
        uint112 reserve1;
        uint32 blockTimestampLast;
        (reserve0, reserve1, blockTimestampLast) = pair.getReserves();
        require(reserve0 != 0 && reserve1 != 0, 'UniswapOracle: NO_RESERVES'); // ensure that there's liquidity in the pair

        pairPrices[token].pair = pair;
        pairPrices[token].price0CumulativeLast = pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
        pairPrices[token].price1CumulativeLast = pair.price1CumulativeLast();  // fetch the current accumulated price value (0 / 1)
        pairPrices[token].blockTimestampLast = blockTimestampLast;
    }

    function update(string calldata symbol) external {
        address token = getTokenAddress(symbol);
        (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(address(pairPrices[token].pair));
        uint32 timeElapsed = blockTimestamp - pairPrices[token].blockTimestampLast; // overflow is desired

        // ensure that at least one full period has passed since the last update
        require(timeElapsed >= PERIOD, 'UniswapOracle: PERIOD_NOT_ELAPSED');

        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        pairPrices[token].price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - pairPrices[token].price0CumulativeLast) / timeElapsed)).decode();
        pairPrices[token].price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - pairPrices[token].price1CumulativeLast) / timeElapsed)).decode();

        pairPrices[token].price0CumulativeLast = price0Cumulative;
        pairPrices[token].price1CumulativeLast = price1Cumulative;
        pairPrices[token].blockTimestampLast = blockTimestamp;
    }

    // note this will always return 0 before update has been called successfully for the first time.
    // TODO return price in USD
    function getPrice(string calldata symbol) external view returns (uint price0Average, uint price1Average) {
        address token = getTokenAddress(symbol);
        return (pairPrices[token].price0Average, pairPrices[token].price1Average);
    }


    /**
     * @notice Returns the token address for symbol
     * @param symbol The symbol to map to token address
     * @return The token address for the given symbol
     */
    function getTokenAddress(string memory symbol) public view returns (address) {
        bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
        if (symbolHash == symbolWeth) return wethAddress;
        if (symbolHash == symbolUsdc) return usdcAddress;
        if (symbolHash == symbolDai) return daiAddress;
        if (symbolHash == symbolRep) return repAddress;
        if (symbolHash == symbolWbtc) return wbtcAddress;
        if (symbolHash == symbolBat) return batAddress;
        if (symbolHash == symbolZrx) return zrxAddress;
        // if (symbolHash == symbolSai) return saiAddress;
        // if (symbolHash == symbolUsdt) return usdtAddress;
        return address(0);
    }

}
