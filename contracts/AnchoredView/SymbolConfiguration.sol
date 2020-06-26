pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;


interface CErc20 {
    function underlying() external view returns (address);
}

contract CToken {
    string public symbol;
    uint8 public decimals;
}

contract Comptroller {
    CToken[] public allMarkets;
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
        uint fixedETHPrice;
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
    address public immutable cUsdtAddress;
    address public immutable cSaiAddress;
    address public immutable cDaiAddress;
    address public immutable cRepAddress;
    address public immutable cWbtcAddress;
    address public immutable cBatAddress;
    address public immutable cZrxAddress;

    // Address of the cToken underlying's ETH Uniswap Market
    // doesnt include fixed price assets: cSAI, cUSDT, and cUSDC
    address public immutable cEthUniswapMarket;
    address public immutable cDaiUniswapMarket;
    address public immutable cRepUniswapMarket;
    address public immutable cWbtcUniswapMarket;
    address public immutable cBatUniswapMarket;
    address public immutable cZrxUniswapMarket;

    constructor(Comptroller comptroller) public {
        CToken[] memory cTokens = comptroller.allMarkets();
        for(uint i = 0; i < cTokens.length; i ++){
            CToken cToken = cTokens[i];
            string memory symbol = cToken.symbol();
            bytes32 symbolHash = keccak256(abi.encodePacked(symbol));

            address cTokenAddr = address(cToken);

            if (symbolHash == symbolEth) {
                cEthAddress = address(cToken);
                cEthUniswapMarket = address(2);// placeholder, todo: possibly pass in "anchorETHMarket" as param? how else do we find find the USDC-WETH market?

            } else if (symbolHash == symbolUsdc) {
                cUsdcAddress = cTokenAddr;

            } else if (symbolHash == symbolUsdt) {
                cUsdtAddress = cTokenAddr;

            } else if (symbolHash == symbolSai) {
                cSaiAddress = cTokenAddr;

            } else if (symbolHash == symbolDai) {
                cDaiAddress = cTokenAddr;
                cDaiUniswapMarket = getUniswapMarket(CErc20(cToken).underlying());

            } else if (symbolHash == symbolRep) {
                cRepAddress = cTokenAddr;
                cRepUniswapMarket = getUniswapMarket(CErc20(cToken).underlying());

            } else if (symbolHash == symbolWbtc) {
                cWbtcAddress = cTokenAddr;
                cWbtcUniswapMarket = getUniswapMarket(CErc20(cToken).underlying());

            } else if (symbolHash == symbolBat) {
                cBatAddress = cBatAddress;
                cBatUniswapMarket = getUniswapMarket(CErc20(cToken).underlying());

            } else if (symbolHash == symbolZrx) {
                cUsdcAddress = cZrxAddress;
                cZrxUniswapMarket = getUniswapMarket(CErc20(cToken).underlying());
            }

        }
    }

    // TODO: figure out. probably ping Uniswap router to ask for the WETH address, and possibly then use UniswapLibs.getPair(token, WETH) or similar
    function getUniswapMarket(CToken token) public view returns (address) {
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
                uniswapMarket: cEthUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cUsdcAddress) {
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: 1e6, // TODO: make these dynamic as w uniswapMarket to avoid user errors.
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedETHPrice: 0
            });
        }

        if (cToken == cUsdtAddress){
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: 1e6,
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedETHPrice: 0
            });
        }

        if (cToken == cSaiAddress){
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: 1e18,
                priceSource: PriceSource.FIXED_ETH,
                fixedReporterPrice: 0,
                fixedETHPrice: saiAnchorPrice
            });
        }

        if (cToken == cDaiAddress) {
            return CTokenMetadata({
                uniswapMarket: cDaiUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cRepAddress) {
            return CTokenMetadata({
                uniswapMarket: cRepUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cWbtcAddress) {
            return CTokenMetadata({
                uniswapMarket: cWbtcUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cBatAddress) {
            return CTokenMetadata({
                uniswapMarket: cBatUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cZrxAddress){
            return CTokenMetadata({
                uniswapMarket: cZrxUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        require(false, "Token not found");
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
