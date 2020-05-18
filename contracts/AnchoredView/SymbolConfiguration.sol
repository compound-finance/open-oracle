pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;


interface CErc20 {
    function underlying() external view returns (address);
}

contract SymbolConfiguration {
    /// special cased anchor oracle keys
    address public constant cUsdcAnchorKey = address(1);
    address public constant cUsdtAnchorKey = address(1);
    address public constant cDaiAnchorKey = address(2);

    /// @notice standard amount for the Dollar
    uint constant oneDollar = 1e6;

    // Address of the oracle key (underlying) for cTokens non special keyed tokens
    address public immutable cRepAnchorKey;
    address public immutable cWbtcAnchorKey;
    address public immutable cBatAnchorKey;
    address public immutable cZrxAnchorKey;

    // Frozen prices for SAI and eth, so no oracle key
    uint public constant saiAnchorPrice = 5285551943761727;
    uint public constant ethAnchorPrice = 1e18;

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

    enum PriceSource {ANCHOR, FIXED_USD, REPORTER}
    enum AnchorSource {ANCHOR, FIXED_USD, FIXED_ETH}

    /// @notice Immutable configuration for a cToken
    struct CTokenMetadata {
        address cTokenAddress;
        address anchorOracleKey;
        string openOracleKey;
        uint baseUnit;
        PriceSource priceSource;
        AnchorSource anchorSource;
        uint fixedAnchorPrice;
        uint fixedReporterPrice;
    }

    // The binary representation for token symbols, used for string comparison
    bytes32 constant symbolEth = keccak256(abi.encodePacked("ETH"));
    bytes32 constant symbolUsdc = keccak256(abi.encodePacked("USDC"));
    bytes32 constant symbolDai = keccak256(abi.encodePacked("DAI"));
    bytes32 constant symbolRep = keccak256(abi.encodePacked("REP"));
    bytes32 constant symbolWbtc = keccak256(abi.encodePacked("BTC"));
    bytes32 constant symbolBat = keccak256(abi.encodePacked("BAT"));
    bytes32 constant symbolZrx = keccak256(abi.encodePacked("ZRX"));
    bytes32 constant symbolSai = keccak256(abi.encodePacked("SAI"));
    bytes32 constant symbolUsdt = keccak256(abi.encodePacked("USDT"));

    //  Address of the cToken contracts
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
        if (cToken == cEthAddress) {
            return CTokenMetadata({
                        openOracleKey: "ETH",
                        anchorOracleKey: address(0),
                        baseUnit: 1e18,
                        cTokenAddress: cEthAddress,
                        priceSource: PriceSource.REPORTER,
                        anchorSource: AnchorSource.FIXED_ETH,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 1e18
                        });
        }

        if (cToken == cUsdcAddress) {
            return CTokenMetadata({
                        openOracleKey: "USDC",
                        anchorOracleKey: cUsdcAnchorKey,
                        baseUnit: 1e6,
                        cTokenAddress: cUsdcAddress,
                        priceSource: PriceSource.FIXED_USD,
                        anchorSource: AnchorSource.FIXED_USD,
                        fixedReporterPrice: oneDollar,
                        fixedAnchorPrice: oneDollar
                        });
        }

        if (cToken == cDaiAddress) {
            return CTokenMetadata({
                        openOracleKey: "DAI",
                        anchorOracleKey: cDaiAnchorKey,
                        baseUnit: 1e18,
                        cTokenAddress: cDaiAddress,
                        priceSource: PriceSource.ANCHOR,
                        anchorSource: AnchorSource.ANCHOR,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 0
                        });
        }

        if (cToken == cRepAddress) {
            return CTokenMetadata({
                        openOracleKey: "REP",
                        anchorOracleKey: cRepAnchorKey,
                        baseUnit: 1e18,
                        cTokenAddress: cRepAddress,
                        priceSource: PriceSource.ANCHOR,
                        anchorSource: AnchorSource.ANCHOR,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 0
                        });
        }

        if (cToken == cWbtcAddress) {
            return CTokenMetadata({
                        openOracleKey: "BTC",
                        anchorOracleKey: cWbtcAnchorKey,
                        baseUnit: 1e8,
                        cTokenAddress: cWbtcAddress,
                        priceSource: PriceSource.REPORTER,
                        anchorSource: AnchorSource.ANCHOR,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 0
                        });
        }

        if (cToken == cBatAddress) {
            return CTokenMetadata({
                        openOracleKey: "BAT",
                        anchorOracleKey: cBatAnchorKey,
                        baseUnit: 1e18,
                        cTokenAddress: cBatAddress,
                        priceSource: PriceSource.ANCHOR,
                        anchorSource: AnchorSource.ANCHOR,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 0
                        });
        }

        if (cToken == cZrxAddress){
            return CTokenMetadata({
                        openOracleKey: "ZRX",
                        anchorOracleKey: cZrxAnchorKey,
                        baseUnit: 1e18,
                        cTokenAddress: cZrxAddress,
                        priceSource: PriceSource.ANCHOR,
                        anchorSource: AnchorSource.ANCHOR,
                        fixedReporterPrice: 0,
                        fixedAnchorPrice: 0
                        });
        }

        if (cToken == cSaiAddress){
            return CTokenMetadata({
                        openOracleKey: "SAI",
                        anchorOracleKey: address(0),
                        baseUnit: 1e18,
                        cTokenAddress: cSaiAddress,
                        priceSource: PriceSource.ANCHOR,
                        anchorSource: AnchorSource.FIXED_ETH,
                        fixedAnchorPrice: saiAnchorPrice,
                        fixedReporterPrice: 0
                        });
        }

        if (cToken == cUsdtAddress){
            return CTokenMetadata({
                        openOracleKey: "USDT",
                        anchorOracleKey: cUsdtAnchorKey,
                        baseUnit: 1e6,
                        cTokenAddress: cUsdtAddress,
                        priceSource: PriceSource.FIXED_USD,
                        anchorSource: AnchorSource.FIXED_USD,
                        fixedReporterPrice: oneDollar,
                        fixedAnchorPrice: oneDollar
                        });
        }

        return CTokenMetadata({
                    openOracleKey: "UNCONFIGURED",
                    anchorOracleKey: address(0),
                    baseUnit: 0,
                    cTokenAddress: address(0),
                    priceSource: PriceSource.FIXED_USD,
                    anchorSource: AnchorSource.FIXED_USD,
                    fixedReporterPrice: 0,
                    fixedAnchorPrice: 0
                    });
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
        return address(0);
    }
}

