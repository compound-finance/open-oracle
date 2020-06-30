pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

contract CToken {
    string public symbol;
}

contract Erc20 {
    function baseUnit() external view returns (uint);
}

contract CErc20 {
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

    //  Address of the underlying tokens
    address public immutable ethAddress = 0xe;

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

    address public immutable usdcBaseUnit;
    address public immutable usdtBaseUnit;
    address public immutable saiBaseUnit;
    address public immutable daiBaseUnit;
    address public immutable repBaseUnit;
    address public immutable wbtcBaseUnit;
    address public immutable batBaseUnit;
    address public immutable zrxBaseUnit;

    function stringHash(string memory src) public view returns (bytes32) {
        return keccak256(abi.encodePacked(src));
    }

    constructor(address[] memory underlyings, CToken[] memory cTokens) public {
        for(uint i = 0; i < underlyings.length; i ++){
            address cToken = address(cTokens[i]);
            Erc20 underlying = underlyings[i];

            if (underlyings[i] == ethAddress) {
                ethUniswapMarket = getUniswapMarket(ethAddress);
                cEthAddress = cToken;
                continue;
            }

            uint baseUnit = underlying.baseUnit();
            string memory symbol = underlying.symbol();
            bytes32 symbolHash = stringHash(symbol);

            if (symbolHash == symbolUsdc) {
                usdcBaseUnit = baseUnit;
                cUsdcAddress = cToken;
            } else if (symbolHash == symbolUsdt) {
                usdtBaseUnit = baseUnit;
                cUsdtAddress = cToken;
            } else if (symbolHash == symbolSai) {
                saiBaseUnit = baseUnit;
                cSaiAddress = cToken;
            } else {
                address market = getUniswapMarket(underlying);

                if (symbolHash == symbolDai) {
                    daiBaseUnit = baseUnit;
                    daiUniswapMarket = market;
                    cDaiAddress = cToken;

                } else if (symbolHash == symbolRep) {
                    repBaseUnit = baseUnit;
                    repUniswapMarket = market;
                    cRepAddress = cToken;

                } else if (symbolHash == symbolWbtc) {
                    wbtcBaseUnit = baseUnit;
                    wbtcUniswapMarket = market;
                    cWbtcAddress = cToken;

                } else if (symbolHash == symbolBat) {
                    batBaseUnit = baseUnit;
                    batUniswapMarket = market;
                    cBatAddress = cToken;

                } else if (symbolHash == symbolZrx) {
                    zrxBaseUnit = baseUnit;
                    zrxUniswapMarket = market;
                    cZrxAddress = cToken;
                }
                revert("invalid underlying given");
            }
        }
    }
    // todo: possibly pass in "anchorETHMarket" as param? how else do we find find the USDC-WETH market?
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
                uniswapMarket: ethUniswapMarket,
                baseUnit: 1e18,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cUsdcAddress) {
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: usdcBaseUnit,
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedETHPrice: 0
            });
        }

        if (cToken == cUsdtAddress){
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: usdtBaseUnit,
                priceSource: PriceSource.FIXED_USD,
                fixedReporterPrice: oneDollar,
                fixedETHPrice: 0
            });
        }

        if (cToken == cSaiAddress){
            return CTokenMetadata({
                uniswapMarket: address(0),
                baseUnit: saiBaseUnit,
                priceSource: PriceSource.FIXED_ETH,
                fixedReporterPrice: 0,
                fixedETHPrice: saiAnchorPrice
            });
        }

        if (cToken == cDaiAddress) {
            return CTokenMetadata({
                uniswapMarket: daiUniswapMarket,
                baseUnit: daiBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cRepAddress) {
            return CTokenMetadata({
                uniswapMarket: repUniswapMarket,
                baseUnit: repBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cWbtcAddress) {
            return CTokenMetadata({
                uniswapMarket: wbtcUniswapMarket,
                baseUnit: wbtcBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cBatAddress) {
            return CTokenMetadata({
                uniswapMarket: batUniswapMarket,
                baseUnit: batBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
            });
        }

        if (cToken == cZrxAddress){
            return CTokenMetadata({
                uniswapMarket: zrxUniswapMarket,
                baseUnit: zrxBaseUnit,
                priceSource: PriceSource.REPORTER,
                fixedReporterPrice: 0,
                fixedETHPrice: 0
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
