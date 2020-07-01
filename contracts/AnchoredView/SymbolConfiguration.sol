pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

contract CToken {
    string public symbol;
}

interface Erc20 {
    function baseUnit() external view returns (uint);
    function symbol() external view returns (string memory);
}

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

    // Frozen prices for SAI and eth, so no oracle key
    uint public constant saiAnchorPrice = 5285551943761727;
    uint public constant ethAnchorPrice = 1e18;

    enum PriceSource {FIXED_ETH, FIXED_USD, REPORTER}

    /// @notice Immutable configuration for a cToken
    struct CTokenMetadata {
        address uniswapMarket;
        uint baseUnit;
        PriceSource priceSource;
        uint fixedReporterPrice;
        uint fixedEthPrice;
        string symbol;
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

    //  Address of the underlying tokens
    address public constant ethAddress = address(1);

    //  Address of the cToken contracts
    address public immutable cEthAddress;
    address public immutable cUsdcAddress;
    address public immutable cUsdtAddress;
    address public immutable cSaiAddress;
    address public immutable cDaiAddress;
    address public immutable cRepAddress;
    address public immutable cWbtcAddress;
    address public immutable cBatAddress;
    address public immutable cZrxAddress;

    // Address of the cToken underlying's ETH Uniswap Market
    // doesnt include fixed price assets: cSAI, cUSDT, and cUSDC
    address public immutable ethUniswapMarket;
    address public immutable daiUniswapMarket;
    address public immutable repUniswapMarket;
    address public immutable wbtcUniswapMarket;
    address public immutable batUniswapMarket;
    address public immutable zrxUniswapMarket;

    uint public immutable usdcBaseUnit;
    uint public immutable usdtBaseUnit;
    uint public immutable saiBaseUnit;
    uint public immutable daiBaseUnit;
    uint public immutable repBaseUnit;
    uint public immutable wbtcBaseUnit;
    uint public immutable batBaseUnit;
    uint public immutable zrxBaseUnit;

    function stringHash(string memory src) public view returns (bytes32) {
        return keccak256(abi.encodePacked(src));
    }

    constructor(address[] memory underlyings, CToken[] memory cTokens) public {
        require(underlyings.length >= cTokens.length, "Need at least as many underlying tokens as cTokens");

        ethUniswapMarket = address(0);
        cEthAddress = address(0);

        usdcBaseUnit = 0;
        cUsdcAddress = address(0);

        usdtBaseUnit = 0;
        cUsdtAddress = address(0);

        saiBaseUnit = 0;
        cSaiAddress = address(0);

        daiBaseUnit =  0;
        daiUniswapMarket = address(0);
        cDaiAddress = address(0);

        repBaseUnit = 0;
        repUniswapMarket = address(0);
        cRepAddress = address(0);

        wbtcBaseUnit = 0;
        wbtcUniswapMarket = address(0);
        cWbtcAddress = address(0);

        batBaseUnit = 0;
        batUniswapMarket = address(0);
        cBatAddress = address(0);

        zrxBaseUnit = 0;
        zrxUniswapMarket = address(0);
        cZrxAddress = address(0);
    }
    // todo: possibly pass in "anchorETHMarket" as param? how else do we find find the USDC-WETH market?
    // TODO: figure out. probably ping Uniswap router to ask for the WETH address, and possibly then use UniswapLibs.getPair(token, WETH) or similar
    function getUniswapMarket(address token) public view returns (address) {
        return address(1);
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
                symbol: "ETH",
                uniswapMarket: ethUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        if (cToken == cUsdcAddress) {
            return CTokenMetadata({
                symbol: "USDC",
                uniswapMarket: address(0),
                baseUnit: usdcBaseUnit,
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedEthPrice: 0
            });
        }

        if (cToken == cUsdtAddress){
            return CTokenMetadata({
                symbol: "USDT",
                uniswapMarket: address(0),
                baseUnit: usdtBaseUnit,
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedEthPrice: 0
            });
        }

        if (cToken == cSaiAddress){
            return CTokenMetadata({
                symbol: "SAI",
                uniswapMarket: address(0),
                baseUnit: saiBaseUnit,
                priceSource: PriceSource.FIXED_ETH,
                fixedReporterPrice: 0,
                fixedEthPrice: saiAnchorPrice
            });
        }

        if (cToken == cDaiAddress) {
            return CTokenMetadata({
                symbol: "DAI",
                uniswapMarket: daiUniswapMarket,
                baseUnit: daiBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        if (cToken == cRepAddress) {
            return CTokenMetadata({
                symbol: "REP",
                uniswapMarket: repUniswapMarket,
                baseUnit: repBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        if (cToken == cWbtcAddress) {
            return CTokenMetadata({
                symbol: "WBTC",
                uniswapMarket: wbtcUniswapMarket,
                baseUnit: wbtcBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        if (cToken == cBatAddress) {
            return CTokenMetadata({
                symbol: "BAT",
                uniswapMarket: batUniswapMarket,
                baseUnit: batBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        if (cToken == cZrxAddress){
            return CTokenMetadata({
                symbol: "ZRX",
                uniswapMarket: zrxUniswapMarket,
                baseUnit: zrxBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedEthPrice: 0
            });
        }

        revert("Token not found");
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
