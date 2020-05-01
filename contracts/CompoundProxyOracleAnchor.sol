pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

interface Anchor {
    function getPrice(string calldata) external view returns (uint256);
}

interface ProxyPriceOracleI {
     function getUnderlyingPrice(address) external view returns (uint256);
}

/**
 * @notice Price feed conforming to Price Oracle Proxy interface and
 * using a single open oracle reporter, anchored to and falling back to
 * the Compound v2 oracle system.
 * @author Compound Labs, Inc.
 */
contract CompoundProxyOracleAnchor is Anchor {
    /// @notice standard amount for the Dollar
    uint256 constant oneDollar = 1e6;

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
    bytes32 constant symbolSai = keccak256(abi.encodePacked("SAI"));

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

    /// @notice The reporter address whose prices checked against the median for safety
    ProxyPriceOracleI immutable proxy;

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

     /**
     * @param proxy_ The Compound protocol proxy oracle address
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(address proxy_, CTokens memory tokens_) public {
        proxy = ProxyPriceOracleI(proxy_);

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
     * @dev fetch price in eth from proxy and convert to usd price using anchor usdc price.
     * @dev Anchor usdc price has 30 decimals, and anchor general price has 18 decimals, so multiplying 1e18 by 1e18 and dividing by 1e30 yields 1e6
     */
    function getPrice(string calldata symbol) external view override returns (uint256) {
        address tokenAddress = getCTokenAddress(symbol);
        if (tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress)  {
            // hard code to 1 dollar
            return oneDollar;
        }

        uint priceInEth = proxy.getUnderlyingPrice(tokenAddress);
        uint additionalScale;
        if (tokenAddress == cWbtcAddress){
            // wbtc proxy price is scaled 1e(36 - 8) = 1e28, so we need 8 more to get to 36
            additionalScale = 1e8;
        } else {
            // all other tokens are scaled 1e18, so we need 18 more to get to 36
            additionalScale = 1e18;
        }

        // load usdc for using in loop to convert anchor prices to dollars
        uint256 usdcPrice = proxy.getUnderlyingPrice(cUsdcAddress);

        // usdcPrice has 30 decimals, so final result has 6
        return mul(priceInEth, additionalScale) / usdcPrice;
    }

    /**
     * @dev forward price from proxy to anchor, specific for Compound anchor
     */
    function getUnderlyingPrice(address cToken) public view returns (uint256) {
        return proxy.getUnderlyingPrice(cToken);
    }

    // function getUnderlyingPricePerSymbol(string memory symbol) {
    //     return proxy.getUnderlyingPrice(getCTokenAddress(symbol));
    // }

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
        if (symbolHash == symbolSai) return cSaiAddress;
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
     * comptroller expects price to have 18 decimals,
     * additionally upscaled by 1e18 - underlyingdecimals
     * base decimals is 1e6, so start by addint twelve
     */
    function getAdditionalScale(address cToken) public view returns (uint256) {
        // total scale 1e30
        if (cToken == cUsdcAddress) return 1e24;
        if (cToken == cUsdtAddress) return 1e24;
        // total scale 1e28
        if (cToken == cWbtcAddress) return 1e22;
        // total scale 1e18
        if (cToken == cEthAddress) return 1e12;
        revert("Requested additional scale for token served by proxy");
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }

}