// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.8.7;

import {CErc20} from "./CErc20.sol";

contract UniswapConfig {
    /// @notice The maximum integer possible
    uint256 public constant MAX_INTEGER = type(uint256).max;

    /// @dev Describe how to interpret the fixedPrice in the TokenConfig.
    enum PriceSource {
        FIXED_ETH, /// implies the fixedPrice is a constant multiple of the ETH price (which varies)
        FIXED_USD, /// implies the fixedPrice is a constant multiple of the USD price (which is 1)
        REPORTER /// implies the price is set by the reporter
    }

    /// @dev Describe how the USD price should be determined for an asset.
    ///  There should be 1 TokenConfig object for each supported asset, passed in the constructor.
    struct TokenConfig {
        // The address of the Compound Token
        address cToken;
        // The address of the underlying market token. For this `LINK` market configuration, this would be the address of the `LINK` token.
        address underlying;
        // The bytes32 hash of the underlying symbol.
        bytes32 symbolHash;
        // The number of smallest units of measurement in a single whole unit.
        uint256 baseUnit;
        // Where price is coming from.  Refer to README for more information
        PriceSource priceSource;
        // The fixed price multiple of either ETH or USD, depending on the `priceSource`. If `priceSource` is `reporter`, this is unused.
        uint256 fixedPrice;
        // The address of the pool being used as the anchor for this market.
        address uniswapMarket;
        // The address of the `ValidatorProxy` acting as the reporter
        address reporter;
        // Prices reported by a `ValidatorProxy` must be transformed to 6 decimals for the UAV.  This is the multiplier to convert the reported price to 6dp
        uint256 reporterMultiplier;
        // True if the pair on Uniswap is defined as ETH / X
        bool isUniswapReversed;
    }

    /// @notice The max number of tokens this contract is hardcoded to support
    /// @dev Do not change this variable without updating all the fields throughout the contract.
    uint256 public constant MAX_TOKENS = 29;

    /// @notice The number of tokens this contract actually supports
    uint256 public immutable numTokens;

    address internal immutable cToken00;
    address internal immutable cToken01;
    address internal immutable cToken02;
    address internal immutable cToken03;
    address internal immutable cToken04;
    address internal immutable cToken05;
    address internal immutable cToken06;
    address internal immutable cToken07;
    address internal immutable cToken08;
    address internal immutable cToken09;
    address internal immutable cToken10;
    address internal immutable cToken11;
    address internal immutable cToken12;
    address internal immutable cToken13;
    address internal immutable cToken14;
    address internal immutable cToken15;
    address internal immutable cToken16;
    address internal immutable cToken17;
    address internal immutable cToken18;
    address internal immutable cToken19;
    address internal immutable cToken20;
    address internal immutable cToken21;
    address internal immutable cToken22;
    address internal immutable cToken23;
    address internal immutable cToken24;
    address internal immutable cToken25;
    address internal immutable cToken26;
    address internal immutable cToken27;
    address internal immutable cToken28;

    address internal immutable underlying00;
    address internal immutable underlying01;
    address internal immutable underlying02;
    address internal immutable underlying03;
    address internal immutable underlying04;
    address internal immutable underlying05;
    address internal immutable underlying06;
    address internal immutable underlying07;
    address internal immutable underlying08;
    address internal immutable underlying09;
    address internal immutable underlying10;
    address internal immutable underlying11;
    address internal immutable underlying12;
    address internal immutable underlying13;
    address internal immutable underlying14;
    address internal immutable underlying15;
    address internal immutable underlying16;
    address internal immutable underlying17;
    address internal immutable underlying18;
    address internal immutable underlying19;
    address internal immutable underlying20;
    address internal immutable underlying21;
    address internal immutable underlying22;
    address internal immutable underlying23;
    address internal immutable underlying24;
    address internal immutable underlying25;
    address internal immutable underlying26;
    address internal immutable underlying27;
    address internal immutable underlying28;

    bytes32 internal immutable symbolHash00;
    bytes32 internal immutable symbolHash01;
    bytes32 internal immutable symbolHash02;
    bytes32 internal immutable symbolHash03;
    bytes32 internal immutable symbolHash04;
    bytes32 internal immutable symbolHash05;
    bytes32 internal immutable symbolHash06;
    bytes32 internal immutable symbolHash07;
    bytes32 internal immutable symbolHash08;
    bytes32 internal immutable symbolHash09;
    bytes32 internal immutable symbolHash10;
    bytes32 internal immutable symbolHash11;
    bytes32 internal immutable symbolHash12;
    bytes32 internal immutable symbolHash13;
    bytes32 internal immutable symbolHash14;
    bytes32 internal immutable symbolHash15;
    bytes32 internal immutable symbolHash16;
    bytes32 internal immutable symbolHash17;
    bytes32 internal immutable symbolHash18;
    bytes32 internal immutable symbolHash19;
    bytes32 internal immutable symbolHash20;
    bytes32 internal immutable symbolHash21;
    bytes32 internal immutable symbolHash22;
    bytes32 internal immutable symbolHash23;
    bytes32 internal immutable symbolHash24;
    bytes32 internal immutable symbolHash25;
    bytes32 internal immutable symbolHash26;
    bytes32 internal immutable symbolHash27;
    bytes32 internal immutable symbolHash28;

    uint256 internal immutable baseUnit00;
    uint256 internal immutable baseUnit01;
    uint256 internal immutable baseUnit02;
    uint256 internal immutable baseUnit03;
    uint256 internal immutable baseUnit04;
    uint256 internal immutable baseUnit05;
    uint256 internal immutable baseUnit06;
    uint256 internal immutable baseUnit07;
    uint256 internal immutable baseUnit08;
    uint256 internal immutable baseUnit09;
    uint256 internal immutable baseUnit10;
    uint256 internal immutable baseUnit11;
    uint256 internal immutable baseUnit12;
    uint256 internal immutable baseUnit13;
    uint256 internal immutable baseUnit14;
    uint256 internal immutable baseUnit15;
    uint256 internal immutable baseUnit16;
    uint256 internal immutable baseUnit17;
    uint256 internal immutable baseUnit18;
    uint256 internal immutable baseUnit19;
    uint256 internal immutable baseUnit20;
    uint256 internal immutable baseUnit21;
    uint256 internal immutable baseUnit22;
    uint256 internal immutable baseUnit23;
    uint256 internal immutable baseUnit24;
    uint256 internal immutable baseUnit25;
    uint256 internal immutable baseUnit26;
    uint256 internal immutable baseUnit27;
    uint256 internal immutable baseUnit28;

    PriceSource internal immutable priceSource00;
    PriceSource internal immutable priceSource01;
    PriceSource internal immutable priceSource02;
    PriceSource internal immutable priceSource03;
    PriceSource internal immutable priceSource04;
    PriceSource internal immutable priceSource05;
    PriceSource internal immutable priceSource06;
    PriceSource internal immutable priceSource07;
    PriceSource internal immutable priceSource08;
    PriceSource internal immutable priceSource09;
    PriceSource internal immutable priceSource10;
    PriceSource internal immutable priceSource11;
    PriceSource internal immutable priceSource12;
    PriceSource internal immutable priceSource13;
    PriceSource internal immutable priceSource14;
    PriceSource internal immutable priceSource15;
    PriceSource internal immutable priceSource16;
    PriceSource internal immutable priceSource17;
    PriceSource internal immutable priceSource18;
    PriceSource internal immutable priceSource19;
    PriceSource internal immutable priceSource20;
    PriceSource internal immutable priceSource21;
    PriceSource internal immutable priceSource22;
    PriceSource internal immutable priceSource23;
    PriceSource internal immutable priceSource24;
    PriceSource internal immutable priceSource25;
    PriceSource internal immutable priceSource26;
    PriceSource internal immutable priceSource27;
    PriceSource internal immutable priceSource28;

    uint256 internal immutable fixedPrice00;
    uint256 internal immutable fixedPrice01;
    uint256 internal immutable fixedPrice02;
    uint256 internal immutable fixedPrice03;
    uint256 internal immutable fixedPrice04;
    uint256 internal immutable fixedPrice05;
    uint256 internal immutable fixedPrice06;
    uint256 internal immutable fixedPrice07;
    uint256 internal immutable fixedPrice08;
    uint256 internal immutable fixedPrice09;
    uint256 internal immutable fixedPrice10;
    uint256 internal immutable fixedPrice11;
    uint256 internal immutable fixedPrice12;
    uint256 internal immutable fixedPrice13;
    uint256 internal immutable fixedPrice14;
    uint256 internal immutable fixedPrice15;
    uint256 internal immutable fixedPrice16;
    uint256 internal immutable fixedPrice17;
    uint256 internal immutable fixedPrice18;
    uint256 internal immutable fixedPrice19;
    uint256 internal immutable fixedPrice20;
    uint256 internal immutable fixedPrice21;
    uint256 internal immutable fixedPrice22;
    uint256 internal immutable fixedPrice23;
    uint256 internal immutable fixedPrice24;
    uint256 internal immutable fixedPrice25;
    uint256 internal immutable fixedPrice26;
    uint256 internal immutable fixedPrice27;
    uint256 internal immutable fixedPrice28;

    address internal immutable uniswapMarket00;
    address internal immutable uniswapMarket01;
    address internal immutable uniswapMarket02;
    address internal immutable uniswapMarket03;
    address internal immutable uniswapMarket04;
    address internal immutable uniswapMarket05;
    address internal immutable uniswapMarket06;
    address internal immutable uniswapMarket07;
    address internal immutable uniswapMarket08;
    address internal immutable uniswapMarket09;
    address internal immutable uniswapMarket10;
    address internal immutable uniswapMarket11;
    address internal immutable uniswapMarket12;
    address internal immutable uniswapMarket13;
    address internal immutable uniswapMarket14;
    address internal immutable uniswapMarket15;
    address internal immutable uniswapMarket16;
    address internal immutable uniswapMarket17;
    address internal immutable uniswapMarket18;
    address internal immutable uniswapMarket19;
    address internal immutable uniswapMarket20;
    address internal immutable uniswapMarket21;
    address internal immutable uniswapMarket22;
    address internal immutable uniswapMarket23;
    address internal immutable uniswapMarket24;
    address internal immutable uniswapMarket25;
    address internal immutable uniswapMarket26;
    address internal immutable uniswapMarket27;
    address internal immutable uniswapMarket28;

    address internal immutable reporter00;
    address internal immutable reporter01;
    address internal immutable reporter02;
    address internal immutable reporter03;
    address internal immutable reporter04;
    address internal immutable reporter05;
    address internal immutable reporter06;
    address internal immutable reporter07;
    address internal immutable reporter08;
    address internal immutable reporter09;
    address internal immutable reporter10;
    address internal immutable reporter11;
    address internal immutable reporter12;
    address internal immutable reporter13;
    address internal immutable reporter14;
    address internal immutable reporter15;
    address internal immutable reporter16;
    address internal immutable reporter17;
    address internal immutable reporter18;
    address internal immutable reporter19;
    address internal immutable reporter20;
    address internal immutable reporter21;
    address internal immutable reporter22;
    address internal immutable reporter23;
    address internal immutable reporter24;
    address internal immutable reporter25;
    address internal immutable reporter26;
    address internal immutable reporter27;
    address internal immutable reporter28;

    uint256 internal immutable reporterMultiplier00;
    uint256 internal immutable reporterMultiplier01;
    uint256 internal immutable reporterMultiplier02;
    uint256 internal immutable reporterMultiplier03;
    uint256 internal immutable reporterMultiplier04;
    uint256 internal immutable reporterMultiplier05;
    uint256 internal immutable reporterMultiplier06;
    uint256 internal immutable reporterMultiplier07;
    uint256 internal immutable reporterMultiplier08;
    uint256 internal immutable reporterMultiplier09;
    uint256 internal immutable reporterMultiplier10;
    uint256 internal immutable reporterMultiplier11;
    uint256 internal immutable reporterMultiplier12;
    uint256 internal immutable reporterMultiplier13;
    uint256 internal immutable reporterMultiplier14;
    uint256 internal immutable reporterMultiplier15;
    uint256 internal immutable reporterMultiplier16;
    uint256 internal immutable reporterMultiplier17;
    uint256 internal immutable reporterMultiplier18;
    uint256 internal immutable reporterMultiplier19;
    uint256 internal immutable reporterMultiplier20;
    uint256 internal immutable reporterMultiplier21;
    uint256 internal immutable reporterMultiplier22;
    uint256 internal immutable reporterMultiplier23;
    uint256 internal immutable reporterMultiplier24;
    uint256 internal immutable reporterMultiplier25;
    uint256 internal immutable reporterMultiplier26;
    uint256 internal immutable reporterMultiplier27;
    uint256 internal immutable reporterMultiplier28;

    // Contract bytecode size optimization:
    // Each bit i stores a bool, corresponding to the ith config.
    uint256 internal immutable isUniswapReversed;

    /**
     * @notice Construct an immutable store of configs into the contract data
     * @param configs The configs for the supported assets
     */
    constructor(TokenConfig[] memory configs) {
        require(configs.length <= MAX_TOKENS, "Too many");
        numTokens = configs.length;

        TokenConfig memory config = get(configs, 0);
        cToken00 = config.cToken;
        underlying00 = config.underlying;
        symbolHash00 = config.symbolHash;
        baseUnit00 = config.baseUnit;
        priceSource00 = config.priceSource;
        fixedPrice00 = config.fixedPrice;
        uniswapMarket00 = config.uniswapMarket;
        reporter00 = config.reporter;
        reporterMultiplier00 = config.reporterMultiplier;

        config = get(configs, 1);
        cToken01 = config.cToken;
        underlying01 = config.underlying;
        symbolHash01 = config.symbolHash;
        baseUnit01 = config.baseUnit;
        priceSource01 = config.priceSource;
        fixedPrice01 = config.fixedPrice;
        uniswapMarket01 = config.uniswapMarket;
        reporter01 = config.reporter;
        reporterMultiplier01 = config.reporterMultiplier;

        config = get(configs, 2);
        cToken02 = config.cToken;
        underlying02 = config.underlying;
        symbolHash02 = config.symbolHash;
        baseUnit02 = config.baseUnit;
        priceSource02 = config.priceSource;
        fixedPrice02 = config.fixedPrice;
        uniswapMarket02 = config.uniswapMarket;
        reporter02 = config.reporter;
        reporterMultiplier02 = config.reporterMultiplier;

        config = get(configs, 3);
        cToken03 = config.cToken;
        underlying03 = config.underlying;
        symbolHash03 = config.symbolHash;
        baseUnit03 = config.baseUnit;
        priceSource03 = config.priceSource;
        fixedPrice03 = config.fixedPrice;
        uniswapMarket03 = config.uniswapMarket;
        reporter03 = config.reporter;
        reporterMultiplier03 = config.reporterMultiplier;

        config = get(configs, 4);
        cToken04 = config.cToken;
        underlying04 = config.underlying;
        symbolHash04 = config.symbolHash;
        baseUnit04 = config.baseUnit;
        priceSource04 = config.priceSource;
        fixedPrice04 = config.fixedPrice;
        uniswapMarket04 = config.uniswapMarket;
        reporter04 = config.reporter;
        reporterMultiplier04 = config.reporterMultiplier;

        config = get(configs, 5);
        cToken05 = config.cToken;
        underlying05 = config.underlying;
        symbolHash05 = config.symbolHash;
        baseUnit05 = config.baseUnit;
        priceSource05 = config.priceSource;
        fixedPrice05 = config.fixedPrice;
        uniswapMarket05 = config.uniswapMarket;
        reporter05 = config.reporter;
        reporterMultiplier05 = config.reporterMultiplier;

        config = get(configs, 6);
        cToken06 = config.cToken;
        underlying06 = config.underlying;
        symbolHash06 = config.symbolHash;
        baseUnit06 = config.baseUnit;
        priceSource06 = config.priceSource;
        fixedPrice06 = config.fixedPrice;
        uniswapMarket06 = config.uniswapMarket;
        reporter06 = config.reporter;
        reporterMultiplier06 = config.reporterMultiplier;

        config = get(configs, 7);
        cToken07 = config.cToken;
        underlying07 = config.underlying;
        symbolHash07 = config.symbolHash;
        baseUnit07 = config.baseUnit;
        priceSource07 = config.priceSource;
        fixedPrice07 = config.fixedPrice;
        uniswapMarket07 = config.uniswapMarket;
        reporter07 = config.reporter;
        reporterMultiplier07 = config.reporterMultiplier;

        config = get(configs, 8);
        cToken08 = config.cToken;
        underlying08 = config.underlying;
        symbolHash08 = config.symbolHash;
        baseUnit08 = config.baseUnit;
        priceSource08 = config.priceSource;
        fixedPrice08 = config.fixedPrice;
        uniswapMarket08 = config.uniswapMarket;
        reporter08 = config.reporter;
        reporterMultiplier08 = config.reporterMultiplier;

        config = get(configs, 9);
        cToken09 = config.cToken;
        underlying09 = config.underlying;
        symbolHash09 = config.symbolHash;
        baseUnit09 = config.baseUnit;
        priceSource09 = config.priceSource;
        fixedPrice09 = config.fixedPrice;
        uniswapMarket09 = config.uniswapMarket;
        reporter09 = config.reporter;
        reporterMultiplier09 = config.reporterMultiplier;

        config = get(configs, 10);
        cToken10 = config.cToken;
        underlying10 = config.underlying;
        symbolHash10 = config.symbolHash;
        baseUnit10 = config.baseUnit;
        priceSource10 = config.priceSource;
        fixedPrice10 = config.fixedPrice;
        uniswapMarket10 = config.uniswapMarket;
        reporter10 = config.reporter;
        reporterMultiplier10 = config.reporterMultiplier;

        config = get(configs, 11);
        cToken11 = config.cToken;
        underlying11 = config.underlying;
        symbolHash11 = config.symbolHash;
        baseUnit11 = config.baseUnit;
        priceSource11 = config.priceSource;
        fixedPrice11 = config.fixedPrice;
        uniswapMarket11 = config.uniswapMarket;
        reporter11 = config.reporter;
        reporterMultiplier11 = config.reporterMultiplier;

        config = get(configs, 12);
        cToken12 = config.cToken;
        underlying12 = config.underlying;
        symbolHash12 = config.symbolHash;
        baseUnit12 = config.baseUnit;
        priceSource12 = config.priceSource;
        fixedPrice12 = config.fixedPrice;
        uniswapMarket12 = config.uniswapMarket;
        reporter12 = config.reporter;
        reporterMultiplier12 = config.reporterMultiplier;

        config = get(configs, 13);
        cToken13 = config.cToken;
        underlying13 = config.underlying;
        symbolHash13 = config.symbolHash;
        baseUnit13 = config.baseUnit;
        priceSource13 = config.priceSource;
        fixedPrice13 = config.fixedPrice;
        uniswapMarket13 = config.uniswapMarket;
        reporter13 = config.reporter;
        reporterMultiplier13 = config.reporterMultiplier;

        config = get(configs, 14);
        cToken14 = config.cToken;
        underlying14 = config.underlying;
        symbolHash14 = config.symbolHash;
        baseUnit14 = config.baseUnit;
        priceSource14 = config.priceSource;
        fixedPrice14 = config.fixedPrice;
        uniswapMarket14 = config.uniswapMarket;
        reporter14 = config.reporter;
        reporterMultiplier14 = config.reporterMultiplier;

        config = get(configs, 15);
        cToken15 = config.cToken;
        underlying15 = config.underlying;
        symbolHash15 = config.symbolHash;
        baseUnit15 = config.baseUnit;
        priceSource15 = config.priceSource;
        fixedPrice15 = config.fixedPrice;
        uniswapMarket15 = config.uniswapMarket;
        reporter15 = config.reporter;
        reporterMultiplier15 = config.reporterMultiplier;

        config = get(configs, 16);
        cToken16 = config.cToken;
        underlying16 = config.underlying;
        symbolHash16 = config.symbolHash;
        baseUnit16 = config.baseUnit;
        priceSource16 = config.priceSource;
        fixedPrice16 = config.fixedPrice;
        uniswapMarket16 = config.uniswapMarket;
        reporter16 = config.reporter;
        reporterMultiplier16 = config.reporterMultiplier;

        config = get(configs, 17);
        cToken17 = config.cToken;
        underlying17 = config.underlying;
        symbolHash17 = config.symbolHash;
        baseUnit17 = config.baseUnit;
        priceSource17 = config.priceSource;
        fixedPrice17 = config.fixedPrice;
        uniswapMarket17 = config.uniswapMarket;
        reporter17 = config.reporter;
        reporterMultiplier17 = config.reporterMultiplier;

        config = get(configs, 18);
        cToken18 = config.cToken;
        underlying18 = config.underlying;
        symbolHash18 = config.symbolHash;
        baseUnit18 = config.baseUnit;
        priceSource18 = config.priceSource;
        fixedPrice18 = config.fixedPrice;
        uniswapMarket18 = config.uniswapMarket;
        reporter18 = config.reporter;
        reporterMultiplier18 = config.reporterMultiplier;

        config = get(configs, 19);
        cToken19 = config.cToken;
        underlying19 = config.underlying;
        symbolHash19 = config.symbolHash;
        baseUnit19 = config.baseUnit;
        priceSource19 = config.priceSource;
        fixedPrice19 = config.fixedPrice;
        uniswapMarket19 = config.uniswapMarket;
        reporter19 = config.reporter;
        reporterMultiplier19 = config.reporterMultiplier;

        config = get(configs, 20);
        cToken20 = config.cToken;
        underlying20 = config.underlying;
        symbolHash20 = config.symbolHash;
        baseUnit20 = config.baseUnit;
        priceSource20 = config.priceSource;
        fixedPrice20 = config.fixedPrice;
        uniswapMarket20 = config.uniswapMarket;
        reporter20 = config.reporter;
        reporterMultiplier20 = config.reporterMultiplier;

        config = get(configs, 21);
        cToken21 = config.cToken;
        underlying21 = config.underlying;
        symbolHash21 = config.symbolHash;
        baseUnit21 = config.baseUnit;
        priceSource21 = config.priceSource;
        fixedPrice21 = config.fixedPrice;
        uniswapMarket21 = config.uniswapMarket;
        reporter21 = config.reporter;
        reporterMultiplier21 = config.reporterMultiplier;

        config = get(configs, 22);
        cToken22 = config.cToken;
        underlying22 = config.underlying;
        symbolHash22 = config.symbolHash;
        baseUnit22 = config.baseUnit;
        priceSource22 = config.priceSource;
        fixedPrice22 = config.fixedPrice;
        uniswapMarket22 = config.uniswapMarket;
        reporter22 = config.reporter;
        reporterMultiplier22 = config.reporterMultiplier;

        config = get(configs, 23);
        cToken23 = config.cToken;
        underlying23 = config.underlying;
        symbolHash23 = config.symbolHash;
        baseUnit23 = config.baseUnit;
        priceSource23 = config.priceSource;
        fixedPrice23 = config.fixedPrice;
        uniswapMarket23 = config.uniswapMarket;
        reporter23 = config.reporter;
        reporterMultiplier23 = config.reporterMultiplier;

        config = get(configs, 24);
        cToken24 = config.cToken;
        underlying24 = config.underlying;
        symbolHash24 = config.symbolHash;
        baseUnit24 = config.baseUnit;
        priceSource24 = config.priceSource;
        fixedPrice24 = config.fixedPrice;
        uniswapMarket24 = config.uniswapMarket;
        reporter24 = config.reporter;
        reporterMultiplier24 = config.reporterMultiplier;

        config = get(configs, 25);
        cToken25 = config.cToken;
        underlying25 = config.underlying;
        symbolHash25 = config.symbolHash;
        baseUnit25 = config.baseUnit;
        priceSource25 = config.priceSource;
        fixedPrice25 = config.fixedPrice;
        uniswapMarket25 = config.uniswapMarket;
        reporter25 = config.reporter;
        reporterMultiplier25 = config.reporterMultiplier;

        config = get(configs, 26);
        cToken26 = config.cToken;
        underlying26 = config.underlying;
        symbolHash26 = config.symbolHash;
        baseUnit26 = config.baseUnit;
        priceSource26 = config.priceSource;
        fixedPrice26 = config.fixedPrice;
        uniswapMarket26 = config.uniswapMarket;
        reporter26 = config.reporter;
        reporterMultiplier26 = config.reporterMultiplier;

        config = get(configs, 27);
        cToken27 = config.cToken;
        underlying27 = config.underlying;
        symbolHash27 = config.symbolHash;
        baseUnit27 = config.baseUnit;
        priceSource27 = config.priceSource;
        fixedPrice27 = config.fixedPrice;
        uniswapMarket27 = config.uniswapMarket;
        reporter27 = config.reporter;
        reporterMultiplier27 = config.reporterMultiplier;

        config = get(configs, 28);
        cToken28 = config.cToken;
        underlying28 = config.underlying;
        symbolHash28 = config.symbolHash;
        baseUnit28 = config.baseUnit;
        priceSource28 = config.priceSource;
        fixedPrice28 = config.fixedPrice;
        uniswapMarket28 = config.uniswapMarket;
        reporter28 = config.reporter;
        reporterMultiplier28 = config.reporterMultiplier;

        uint256 isUniswapReversed_;
        uint256 numTokenConfigs = configs.length;
        for (uint256 i = 0; i < numTokenConfigs; i++) {
            config = configs[i];
            if (config.isUniswapReversed) isUniswapReversed_ |= uint256(1) << i;
        }
        isUniswapReversed = isUniswapReversed_;
    }

    function get(TokenConfig[] memory configs, uint256 i)
        internal
        pure
        returns (TokenConfig memory)
    {
        if (i < configs.length) return configs[i];
        return
            TokenConfig({
                cToken: address(0),
                underlying: address(0),
                symbolHash: bytes32(0),
                baseUnit: uint256(0),
                priceSource: PriceSource(0),
                fixedPrice: uint256(0),
                uniswapMarket: address(0),
                reporter: address(0),
                reporterMultiplier: uint256(0),
                isUniswapReversed: false
            });
    }

    function getReporterIndex(address reporter)
        internal
        view
        returns (uint256)
    {
        if (reporter == reporter00) return 0;
        if (reporter == reporter01) return 1;
        if (reporter == reporter02) return 2;
        if (reporter == reporter03) return 3;
        if (reporter == reporter04) return 4;
        if (reporter == reporter05) return 5;
        if (reporter == reporter06) return 6;
        if (reporter == reporter07) return 7;
        if (reporter == reporter08) return 8;
        if (reporter == reporter09) return 9;
        if (reporter == reporter10) return 10;
        if (reporter == reporter11) return 11;
        if (reporter == reporter12) return 12;
        if (reporter == reporter13) return 13;
        if (reporter == reporter14) return 14;
        if (reporter == reporter15) return 15;
        if (reporter == reporter16) return 16;
        if (reporter == reporter17) return 17;
        if (reporter == reporter18) return 18;
        if (reporter == reporter19) return 19;
        if (reporter == reporter20) return 20;
        if (reporter == reporter21) return 21;
        if (reporter == reporter22) return 22;
        if (reporter == reporter23) return 23;
        if (reporter == reporter24) return 24;
        if (reporter == reporter25) return 25;
        if (reporter == reporter26) return 26;
        if (reporter == reporter27) return 27;
        if (reporter == reporter28) return 28;

        return MAX_INTEGER;
    }

    function getUnderlyingIndex(address underlying)
        internal
        view
        returns (uint256)
    {
        if (underlying == underlying00) return 0;
        if (underlying == underlying01) return 1;
        if (underlying == underlying02) return 2;
        if (underlying == underlying03) return 3;
        if (underlying == underlying04) return 4;
        if (underlying == underlying05) return 5;
        if (underlying == underlying06) return 6;
        if (underlying == underlying07) return 7;
        if (underlying == underlying08) return 8;
        if (underlying == underlying09) return 9;
        if (underlying == underlying10) return 10;
        if (underlying == underlying11) return 11;
        if (underlying == underlying12) return 12;
        if (underlying == underlying13) return 13;
        if (underlying == underlying14) return 14;
        if (underlying == underlying15) return 15;
        if (underlying == underlying16) return 16;
        if (underlying == underlying17) return 17;
        if (underlying == underlying18) return 18;
        if (underlying == underlying19) return 19;
        if (underlying == underlying20) return 20;
        if (underlying == underlying21) return 21;
        if (underlying == underlying22) return 22;
        if (underlying == underlying23) return 23;
        if (underlying == underlying24) return 24;
        if (underlying == underlying25) return 25;
        if (underlying == underlying26) return 26;
        if (underlying == underlying27) return 27;
        if (underlying == underlying28) return 28;

        return MAX_INTEGER;
    }

    function getSymbolHashIndex(bytes32 symbolHash)
        internal
        view
        returns (uint256)
    {
        if (symbolHash == symbolHash00) return 0;
        if (symbolHash == symbolHash01) return 1;
        if (symbolHash == symbolHash02) return 2;
        if (symbolHash == symbolHash03) return 3;
        if (symbolHash == symbolHash04) return 4;
        if (symbolHash == symbolHash05) return 5;
        if (symbolHash == symbolHash06) return 6;
        if (symbolHash == symbolHash07) return 7;
        if (symbolHash == symbolHash08) return 8;
        if (symbolHash == symbolHash09) return 9;
        if (symbolHash == symbolHash10) return 10;
        if (symbolHash == symbolHash11) return 11;
        if (symbolHash == symbolHash12) return 12;
        if (symbolHash == symbolHash13) return 13;
        if (symbolHash == symbolHash14) return 14;
        if (symbolHash == symbolHash15) return 15;
        if (symbolHash == symbolHash16) return 16;
        if (symbolHash == symbolHash17) return 17;
        if (symbolHash == symbolHash18) return 18;
        if (symbolHash == symbolHash19) return 19;
        if (symbolHash == symbolHash20) return 20;
        if (symbolHash == symbolHash21) return 21;
        if (symbolHash == symbolHash22) return 22;
        if (symbolHash == symbolHash23) return 23;
        if (symbolHash == symbolHash24) return 24;
        if (symbolHash == symbolHash25) return 25;
        if (symbolHash == symbolHash26) return 26;
        if (symbolHash == symbolHash27) return 27;
        if (symbolHash == symbolHash28) return 28;

        return MAX_INTEGER;
    }

    function getCTokenIndex(address cToken) internal view returns (uint256) {
        if (cToken == cToken00) return 0;
        if (cToken == cToken01) return 1;
        if (cToken == cToken02) return 2;
        if (cToken == cToken03) return 3;
        if (cToken == cToken04) return 4;
        if (cToken == cToken05) return 5;
        if (cToken == cToken06) return 6;
        if (cToken == cToken07) return 7;
        if (cToken == cToken08) return 8;
        if (cToken == cToken09) return 9;
        if (cToken == cToken10) return 10;
        if (cToken == cToken11) return 11;
        if (cToken == cToken12) return 12;
        if (cToken == cToken13) return 13;
        if (cToken == cToken14) return 14;
        if (cToken == cToken15) return 15;
        if (cToken == cToken16) return 16;
        if (cToken == cToken17) return 17;
        if (cToken == cToken18) return 18;
        if (cToken == cToken19) return 19;
        if (cToken == cToken20) return 20;
        if (cToken == cToken21) return 21;
        if (cToken == cToken22) return 22;
        if (cToken == cToken23) return 23;
        if (cToken == cToken24) return 24;
        if (cToken == cToken25) return 25;
        if (cToken == cToken26) return 26;
        if (cToken == cToken27) return 27;
        if (cToken == cToken28) return 28;

        return MAX_INTEGER;
    }

    /**
     * @notice Get the i-th config, according to the order they were passed in originally
     * @param i The index of the config to get
     * @return The config object
     */
    function getTokenConfig(uint256 i)
        public
        view
        returns (TokenConfig memory)
    {
        require(i < numTokens, "Not found");

        address cToken;
        address underlying;
        bytes32 symbolHash;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        address reporter;
        uint256 reporterMultiplier;
        if (i == 0) {
            cToken = cToken00;
            underlying = underlying00;
            symbolHash = symbolHash00;
            baseUnit = baseUnit00;
            priceSource = priceSource00;
            fixedPrice = fixedPrice00;
            uniswapMarket = uniswapMarket00;
            reporter = reporter00;
            reporterMultiplier = reporterMultiplier00;
        } else if (i == 1) {
            cToken = cToken01;
            underlying = underlying01;
            symbolHash = symbolHash01;
            baseUnit = baseUnit01;
            priceSource = priceSource01;
            fixedPrice = fixedPrice01;
            uniswapMarket = uniswapMarket01;
            reporter = reporter01;
            reporterMultiplier = reporterMultiplier01;
        } else if (i == 2) {
            cToken = cToken02;
            underlying = underlying02;
            symbolHash = symbolHash02;
            baseUnit = baseUnit02;
            priceSource = priceSource02;
            fixedPrice = fixedPrice02;
            uniswapMarket = uniswapMarket02;
            reporter = reporter02;
            reporterMultiplier = reporterMultiplier02;
        } else if (i == 3) {
            cToken = cToken03;
            underlying = underlying03;
            symbolHash = symbolHash03;
            baseUnit = baseUnit03;
            priceSource = priceSource03;
            fixedPrice = fixedPrice03;
            uniswapMarket = uniswapMarket03;
            reporter = reporter03;
            reporterMultiplier = reporterMultiplier03;
        } else if (i == 4) {
            cToken = cToken04;
            underlying = underlying04;
            symbolHash = symbolHash04;
            baseUnit = baseUnit04;
            priceSource = priceSource04;
            fixedPrice = fixedPrice04;
            uniswapMarket = uniswapMarket04;
            reporter = reporter04;
            reporterMultiplier = reporterMultiplier04;
        } else if (i == 5) {
            cToken = cToken05;
            underlying = underlying05;
            symbolHash = symbolHash05;
            baseUnit = baseUnit05;
            priceSource = priceSource05;
            fixedPrice = fixedPrice05;
            uniswapMarket = uniswapMarket05;
            reporter = reporter05;
            reporterMultiplier = reporterMultiplier05;
        } else if (i == 6) {
            cToken = cToken06;
            underlying = underlying06;
            symbolHash = symbolHash06;
            baseUnit = baseUnit06;
            priceSource = priceSource06;
            fixedPrice = fixedPrice06;
            uniswapMarket = uniswapMarket06;
            reporter = reporter06;
            reporterMultiplier = reporterMultiplier06;
        } else if (i == 7) {
            cToken = cToken07;
            underlying = underlying07;
            symbolHash = symbolHash07;
            baseUnit = baseUnit07;
            priceSource = priceSource07;
            fixedPrice = fixedPrice07;
            uniswapMarket = uniswapMarket07;
            reporter = reporter07;
            reporterMultiplier = reporterMultiplier07;
        } else if (i == 8) {
            cToken = cToken08;
            underlying = underlying08;
            symbolHash = symbolHash08;
            baseUnit = baseUnit08;
            priceSource = priceSource08;
            fixedPrice = fixedPrice08;
            uniswapMarket = uniswapMarket08;
            reporter = reporter08;
            reporterMultiplier = reporterMultiplier08;
        } else if (i == 9) {
            cToken = cToken09;
            underlying = underlying09;
            symbolHash = symbolHash09;
            baseUnit = baseUnit09;
            priceSource = priceSource09;
            fixedPrice = fixedPrice09;
            uniswapMarket = uniswapMarket09;
            reporter = reporter09;
            reporterMultiplier = reporterMultiplier09;
        } else if (i == 10) {
            cToken = cToken10;
            underlying = underlying10;
            symbolHash = symbolHash10;
            baseUnit = baseUnit10;
            priceSource = priceSource10;
            fixedPrice = fixedPrice10;
            uniswapMarket = uniswapMarket10;
            reporter = reporter10;
            reporterMultiplier = reporterMultiplier10;
        } else if (i == 11) {
            cToken = cToken11;
            underlying = underlying11;
            symbolHash = symbolHash11;
            baseUnit = baseUnit11;
            priceSource = priceSource11;
            fixedPrice = fixedPrice11;
            uniswapMarket = uniswapMarket11;
            reporter = reporter11;
            reporterMultiplier = reporterMultiplier11;
        } else if (i == 12) {
            cToken = cToken12;
            underlying = underlying12;
            symbolHash = symbolHash12;
            baseUnit = baseUnit12;
            priceSource = priceSource12;
            fixedPrice = fixedPrice12;
            uniswapMarket = uniswapMarket12;
            reporter = reporter12;
            reporterMultiplier = reporterMultiplier12;
        } else if (i == 13) {
            cToken = cToken13;
            underlying = underlying13;
            symbolHash = symbolHash13;
            baseUnit = baseUnit13;
            priceSource = priceSource13;
            fixedPrice = fixedPrice13;
            uniswapMarket = uniswapMarket13;
            reporter = reporter13;
            reporterMultiplier = reporterMultiplier13;
        } else if (i == 14) {
            cToken = cToken14;
            underlying = underlying14;
            symbolHash = symbolHash14;
            baseUnit = baseUnit14;
            priceSource = priceSource14;
            fixedPrice = fixedPrice14;
            uniswapMarket = uniswapMarket14;
            reporter = reporter14;
            reporterMultiplier = reporterMultiplier14;
        } else if (i == 15) {
            cToken = cToken15;
            underlying = underlying15;
            symbolHash = symbolHash15;
            baseUnit = baseUnit15;
            priceSource = priceSource15;
            fixedPrice = fixedPrice15;
            uniswapMarket = uniswapMarket15;
            reporter = reporter15;
            reporterMultiplier = reporterMultiplier15;
        } else if (i == 16) {
            cToken = cToken16;
            underlying = underlying16;
            symbolHash = symbolHash16;
            baseUnit = baseUnit16;
            priceSource = priceSource16;
            fixedPrice = fixedPrice16;
            uniswapMarket = uniswapMarket16;
            reporter = reporter16;
            reporterMultiplier = reporterMultiplier16;
        } else if (i == 17) {
            cToken = cToken17;
            underlying = underlying17;
            symbolHash = symbolHash17;
            baseUnit = baseUnit17;
            priceSource = priceSource17;
            fixedPrice = fixedPrice17;
            uniswapMarket = uniswapMarket17;
            reporter = reporter17;
            reporterMultiplier = reporterMultiplier17;
        } else if (i == 18) {
            cToken = cToken18;
            underlying = underlying18;
            symbolHash = symbolHash18;
            baseUnit = baseUnit18;
            priceSource = priceSource18;
            fixedPrice = fixedPrice18;
            uniswapMarket = uniswapMarket18;
            reporter = reporter18;
            reporterMultiplier = reporterMultiplier18;
        } else if (i == 19) {
            cToken = cToken19;
            underlying = underlying19;
            symbolHash = symbolHash19;
            baseUnit = baseUnit19;
            priceSource = priceSource19;
            fixedPrice = fixedPrice19;
            uniswapMarket = uniswapMarket19;
            reporter = reporter19;
            reporterMultiplier = reporterMultiplier19;
        } else if (i == 20) {
            cToken = cToken20;
            underlying = underlying20;
            symbolHash = symbolHash20;
            baseUnit = baseUnit20;
            priceSource = priceSource20;
            fixedPrice = fixedPrice20;
            uniswapMarket = uniswapMarket20;
            reporter = reporter20;
            reporterMultiplier = reporterMultiplier20;
        } else if (i == 21) {
            cToken = cToken21;
            underlying = underlying21;
            symbolHash = symbolHash21;
            baseUnit = baseUnit21;
            priceSource = priceSource21;
            fixedPrice = fixedPrice21;
            uniswapMarket = uniswapMarket21;
            reporter = reporter21;
            reporterMultiplier = reporterMultiplier21;
        } else if (i == 22) {
            cToken = cToken22;
            underlying = underlying22;
            symbolHash = symbolHash22;
            baseUnit = baseUnit22;
            priceSource = priceSource22;
            fixedPrice = fixedPrice22;
            uniswapMarket = uniswapMarket22;
            reporter = reporter22;
            reporterMultiplier = reporterMultiplier22;
        } else if (i == 23) {
            cToken = cToken23;
            underlying = underlying23;
            symbolHash = symbolHash23;
            baseUnit = baseUnit23;
            priceSource = priceSource23;
            fixedPrice = fixedPrice23;
            uniswapMarket = uniswapMarket23;
            reporter = reporter23;
            reporterMultiplier = reporterMultiplier23;
        } else if (i == 24) {
            cToken = cToken24;
            underlying = underlying24;
            symbolHash = symbolHash24;
            baseUnit = baseUnit24;
            priceSource = priceSource24;
            fixedPrice = fixedPrice24;
            uniswapMarket = uniswapMarket24;
            reporter = reporter24;
            reporterMultiplier = reporterMultiplier24;
        } else if (i == 25) {
            cToken = cToken25;
            underlying = underlying25;
            symbolHash = symbolHash25;
            baseUnit = baseUnit25;
            priceSource = priceSource25;
            fixedPrice = fixedPrice25;
            uniswapMarket = uniswapMarket25;
            reporter = reporter25;
            reporterMultiplier = reporterMultiplier25;
        } else if (i == 26) {
            cToken = cToken26;
            underlying = underlying26;
            symbolHash = symbolHash26;
            baseUnit = baseUnit26;
            priceSource = priceSource26;
            fixedPrice = fixedPrice26;
            uniswapMarket = uniswapMarket26;
            reporter = reporter26;
            reporterMultiplier = reporterMultiplier26;
        } else if (i == 27) {
            cToken = cToken27;
            underlying = underlying27;
            symbolHash = symbolHash27;
            baseUnit = baseUnit27;
            priceSource = priceSource27;
            fixedPrice = fixedPrice27;
            uniswapMarket = uniswapMarket27;
            reporter = reporter27;
            reporterMultiplier = reporterMultiplier27;
        } else if (i == 28) {
            cToken = cToken28;
            underlying = underlying28;
            symbolHash = symbolHash28;
            baseUnit = baseUnit28;
            priceSource = priceSource28;
            fixedPrice = fixedPrice28;
            uniswapMarket = uniswapMarket28;
            reporter = reporter28;
            reporterMultiplier = reporterMultiplier28;
        }
        return
            TokenConfig({
                cToken: cToken,
                underlying: underlying,
                symbolHash: symbolHash,
                baseUnit: baseUnit,
                priceSource: priceSource,
                fixedPrice: fixedPrice,
                uniswapMarket: uniswapMarket,
                reporter: reporter,
                reporterMultiplier: reporterMultiplier,
                isUniswapReversed: ((isUniswapReversed >> i) & uint256(1)) == 1
            });
    }

    /**
     * @notice Get the config for symbol
     * @param symbol The symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbol(string calldata symbol)
        public
        view
        returns (TokenConfig memory)
    {
        return getTokenConfigBySymbolHash(keccak256(bytes(symbol)));
    }

    /**
     * @notice Get the config for the reporter
     * @param reporter The address of the reporter of the config to get
     * @return The config object
     */
    function getTokenConfigByReporter(address reporter)
        public
        view
        returns (TokenConfig memory)
    {
        return getTokenConfig(getReporterIndex(reporter));
    }

    /**
     * @notice Get the config for the symbolHash
     * @param symbolHash The keccack256 of the symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbolHash(bytes32 symbolHash)
        public
        view
        returns (TokenConfig memory)
    {
        return getTokenConfig(getSymbolHashIndex(symbolHash));
    }

    /**
     * @notice Get the config for the cToken
     * @dev If a config for the cToken is not found, falls back to searching for the underlying.
     * @param cToken The address of the cToken of the config to get
     * @return The config object
     */
    function getTokenConfigByCToken(address cToken)
        public
        view
        returns (TokenConfig memory)
    {
        uint256 index = getCTokenIndex(cToken);
        return getTokenConfig(index);
    }

    /**
     * @notice Get the config for an underlying asset
     * @dev The underlying address of ETH is the zero address
     * @param underlying The address of the underlying asset of the config to get
     * @return The config object
     */
    function getTokenConfigByUnderlying(address underlying)
        public
        view
        returns (TokenConfig memory)
    {
        return getTokenConfig(getUnderlyingIndex(underlying));
    }
}
