pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;


interface CErc20 {
    function underlying() external view returns (address);
}

// verbose configuration of anchored view, transforming
// address to symbols and such
contract SymbolConfiguration {
    /// special cased anchor oracle keys
    address public constant cUsdcAnchorKey = address(1);
    address public constant cUsdtAnchorKey = address(1);
    address public constant cDaiAnchorKey = address(2);

    /// Address of the oracle key (underlying) for cTokens non special keyed tokens
    address public immutable cRepAnchorKey;
    address public immutable cWbtcAnchorKey;
    address public immutable cBatAnchorKey;
    address public immutable cZrxAnchorKey;

    /// Frozen rices for SAI and eth, so no oracle key
    uint public saiAnchorPrice = 5285551943761727;
    uint public ethAnchorPrice = 1e18;

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

    /// @notice Immutable configuration for a cToken
    struct CTokenMetadata {
        address cTokenAddress;
        address anchorOracleKey;
        string openOracleKey;
        uint anchorAdditionalScale;
        uint underlyingPriceAdditionalScale;
    }

    /// The binary representation for token symbols, used for string comparison
    bytes32 constant symbolEth = keccak256(abi.encodePacked("ETH"));
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));
    bytes32 constant symbolSai = keccak256(abi.encodePacked("SAI"));
    bytes32 constant symbolUsdt = keccak256(abi.encodePacked("USDT"));

    ///  Address of the cToken contracts
    address public immutable cEthAddress;
    address public immutable cUsdcAddress;
    address public immutable cDaiAddress;
    address public immutable cRepAddress;
    address public immutable cWbtcAddress;
    address public immutable cBatAddress;
    address public immutable cZrxAddress;
    address public immutable cSaiAddress;
    address public immutable cUsdtAddress;

    /// @param tokens_ The CTokens struct that contains addresses for CToken contracts
    constructor(CTokens memory tokens_) public {
        cEthAddress = tokens_.cEthAddress;
        cUsdcAddress = tokens_.cUsdcAddress;
        cDaiAddress = tokens_.cDaiAddress;
        cRepAddress = tokens_.cRepAddress;
        cWbtcAddress = tokens_.cWbtcAddress;
        cBatAddress = tokens_.cBatAddress;
        cZrxAddress = tokens_.cZrxAddress;
        cSaiAddress = tokens_.cSaiAddress;
        cUsdtAddress = tokens_.cUsdtAddress;

        cRepAnchorKey = CErc20(tokens_.cRepAddress).underlying();
        cWbtcAnchorKey = CErc20(tokens_.cWbtcAddress).underlying();
        cBatAnchorKey = CErc20(tokens_.cBatAddress).underlying();
        cZrxAnchorKey = CErc20(tokens_.cZrxAddress).underlying();
    }

    /**
     * @notice Returns the CTokenMetadata for a symbol
     * @param symbol The symbol to map to cTokenMetadata
     * @return The configuration metadata for the symbol
     */
    function getCTokenConfig(string memory symbol) public view returns (CTokenMetadata memory) {
        address cToken = getCTokenAddress(symbol);
        return getCTokenConfig(cToken);
    }

    /**
     * @notice Returns the CTokenMetadata for an address
     * @param cToken The address to map to cTokenMetadata
     * @return The configuration metadata for the address
     */
    function getCTokenConfig(address cToken) public view returns(CTokenMetadata memory) {
        return CTokenMetadata({
                    openOracleKey: getOpenOracleKey(cToken),
                    anchorOracleKey: getAnchorOracleKey(cToken),
                    anchorAdditionalScale: getAdditionalScaleForAnchorPrice(cToken),
                    underlyingPriceAdditionalScale: getAdditionalScaleForUnderlyingPrice(cToken),
                    cTokenAddress: cToken
                    });
    }

    /**
     * comptroller expects price to have 18 decimals,
     * additionally upscaled by 1e18 - underlyingdecimals
     * base decimals is 1e6, so start by addint twelve
     */
    function getAdditionalScaleForUnderlyingPrice(address cToken) public view returns (uint256) {
        /* 30 - underlying decimals */
        if (cToken == cEthAddress) return 1e12;
        if (cToken == cUsdcAddress) return 1e24;
        if (cToken == cDaiAddress) return 1e12;
        if (cToken == cRepAddress) return 1e12;
        if (cToken == cWbtcAddress) return 1e22;
        if (cToken == cBatAddress) return 1e12;
        if (cToken == cZrxAddress) return 1e12;
        if (cToken == cSaiAddress) return 1e12;
        if (cToken == cUsdtAddress) return 1e24;
        revert("Unknown token address");
    }

    /**
     // what additional padding of decimals is needed to get anchor price to 36 decimals?
     // basically, underlying decimals
     */
    function getAdditionalScaleForAnchorPrice(address cToken) public view returns (uint256) {
        // simply underlying decimals //
        if (cToken == cEthAddress) return 1e18;
        if (cToken == cUsdcAddress) return 1e6;
        if (cToken == cDaiAddress) return 1e18;
        if (cToken == cRepAddress) return 1e18;
        if (cToken == cWbtcAddress) return 1e8;
        if (cToken == cBatAddress) return 1e18;
        if (cToken == cZrxAddress) return 1e18;
        if (cToken == cSaiAddress) return 1e18;
        if (cToken == cUsdtAddress) return 1e6;
        revert("Unknown token address");
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
        if (symbolHash == symbolSai) return cSaiAddress;
        if (symbolHash == symbolUsdt) return cUsdtAddress;
        revert("Unknown token address");
    }

    /**
     * @notice Returns the symbol for cToken address
     * @param cToken The cToken address to map to symbol
     * @return The symbol for the given cToken address
     */
    function getOpenOracleKey(address cToken) public view returns (string memory) {
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

    function getAnchorOracleKey(address cToken) public view returns (address) {
        if (cToken == cEthAddress) return address(0); // unused, as Anchor price is hardcoded
        if (cToken == cSaiAddress) return address(0); // unused, as Anchor price is hardcoded
        if (cToken == cUsdcAddress) return cUsdcAnchorKey;
        if (cToken == cDaiAddress) return cDaiAnchorKey;
        if (cToken == cRepAddress) return cRepAnchorKey;
        if (cToken == cWbtcAddress) return cWbtcAnchorKey;
        if (cToken == cBatAddress) return cBatAnchorKey;
        if (cToken == cZrxAddress) return cZrxAnchorKey;
        if (cToken == cUsdtAddress) return cUsdtAnchorKey;
        revert("Unknown token address");
    }
}

