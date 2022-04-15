// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.8.7;

import { CErc20 } from "./CErc20.sol";

contract UniswapConfig {
    /// @notice The maximum integer possible
    uint256 public constant MAX_INTEGER = type(uint256).max;

    /// @dev Describe how to interpret the fixedPrice in the TokenConfig.
    enum PriceSource {
        FIXED_ETH, /// implies the fixedPrice is a constant multiple of the ETH price (which varies)
        FIXED_USD, /// implies the fixedPrice is a constant multiple of the USD price (which is 1)
        REPORTER   /// implies the price is set by the reporter
    }

    /// @dev Describe how the USD price should be determined for an asset.
    ///  There should be 1 TokenConfig object for each supported asset, passed in the constructor.
    struct TokenConfig {
        address underlying;
        bytes32 symbolHash;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        address reporter;
        uint256 reporterMultiplier;
        bool isUniswapReversed;
    }

    /// @notice The max number of tokens this contract is hardcoded to support
    /// @dev Do not change this variable without updating all the fields throughout the contract.
    uint256 public constant maxTokens = 35;

    /// @notice The number of tokens this contract actually supports
    uint256 public immutable numTokens;

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
    address internal immutable underlying29;
    address internal immutable underlying30;
    address internal immutable underlying31;
    address internal immutable underlying32;
    address internal immutable underlying33;
    address internal immutable underlying34;

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
    bytes32 internal immutable symbolHash29;
    bytes32 internal immutable symbolHash30;
    bytes32 internal immutable symbolHash31;
    bytes32 internal immutable symbolHash32;
    bytes32 internal immutable symbolHash33;
    bytes32 internal immutable symbolHash34;

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
    uint256 internal immutable baseUnit29;
    uint256 internal immutable baseUnit30;
    uint256 internal immutable baseUnit31;
    uint256 internal immutable baseUnit32;
    uint256 internal immutable baseUnit33;
    uint256 internal immutable baseUnit34;

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
    PriceSource internal immutable priceSource29;
    PriceSource internal immutable priceSource30;
    PriceSource internal immutable priceSource31;
    PriceSource internal immutable priceSource32;
    PriceSource internal immutable priceSource33;
    PriceSource internal immutable priceSource34;

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
    uint256 internal immutable fixedPrice29;
    uint256 internal immutable fixedPrice30;
    uint256 internal immutable fixedPrice31;
    uint256 internal immutable fixedPrice32;
    uint256 internal immutable fixedPrice33;
    uint256 internal immutable fixedPrice34;

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
    address internal immutable uniswapMarket29;
    address internal immutable uniswapMarket30;
    address internal immutable uniswapMarket31;
    address internal immutable uniswapMarket32;
    address internal immutable uniswapMarket33;
    address internal immutable uniswapMarket34;

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
    address internal immutable reporter29;
    address internal immutable reporter30;
    address internal immutable reporter31;
    address internal immutable reporter32;
    address internal immutable reporter33;
    address internal immutable reporter34;

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
    uint256 internal immutable reporterMultiplier29;
    uint256 internal immutable reporterMultiplier30;
    uint256 internal immutable reporterMultiplier31;
    uint256 internal immutable reporterMultiplier32;
    uint256 internal immutable reporterMultiplier33;
    uint256 internal immutable reporterMultiplier34;

    // Contract bytecode size optimization:
    // Each bit i stores a bool, corresponding to the ith config.
    uint256 internal immutable isUniswapReversed;

    /**
     * @notice Construct an immutable store of configs into the contract data
     * @param configs The configs for the supported assets
     */
    constructor(TokenConfig[] memory configs) {
        require(configs.length <= maxTokens, "too many configs");
        numTokens = configs.length;

        TokenConfig memory config = get(configs, 0);
        underlying00 = config.underlying;
        symbolHash00 = config.symbolHash;
        baseUnit00 = config.baseUnit;
        priceSource00 = config.priceSource;
        fixedPrice00 = config.fixedPrice;
        uniswapMarket00 = config.uniswapMarket;
        reporter00 = config.reporter;
        reporterMultiplier00 = config.reporterMultiplier;

        config = get(configs, 1);
        underlying01 = config.underlying;
        symbolHash01 = config.symbolHash;
        baseUnit01 = config.baseUnit;
        priceSource01 = config.priceSource;
        fixedPrice01 = config.fixedPrice;
        uniswapMarket01 = config.uniswapMarket;
        reporter01 = config.reporter;
        reporterMultiplier01 = config.reporterMultiplier;

        config = get(configs, 2);
        underlying02 = config.underlying;
        symbolHash02 = config.symbolHash;
        baseUnit02 = config.baseUnit;
        priceSource02 = config.priceSource;
        fixedPrice02 = config.fixedPrice;
        uniswapMarket02 = config.uniswapMarket;
        reporter02 = config.reporter;
        reporterMultiplier02 = config.reporterMultiplier;

        config = get(configs, 3);
        underlying03 = config.underlying;
        symbolHash03 = config.symbolHash;
        baseUnit03 = config.baseUnit;
        priceSource03 = config.priceSource;
        fixedPrice03 = config.fixedPrice;
        uniswapMarket03 = config.uniswapMarket;
        reporter03 = config.reporter;
        reporterMultiplier03 = config.reporterMultiplier;

        config = get(configs, 4);
        underlying04 = config.underlying;
        symbolHash04 = config.symbolHash;
        baseUnit04 = config.baseUnit;
        priceSource04 = config.priceSource;
        fixedPrice04 = config.fixedPrice;
        uniswapMarket04 = config.uniswapMarket;
        reporter04 = config.reporter;
        reporterMultiplier04 = config.reporterMultiplier;

        config = get(configs, 5);
        underlying05 = config.underlying;
        symbolHash05 = config.symbolHash;
        baseUnit05 = config.baseUnit;
        priceSource05 = config.priceSource;
        fixedPrice05 = config.fixedPrice;
        uniswapMarket05 = config.uniswapMarket;
        reporter05 = config.reporter;
        reporterMultiplier05 = config.reporterMultiplier;

        config = get(configs, 6);
        underlying06 = config.underlying;
        symbolHash06 = config.symbolHash;
        baseUnit06 = config.baseUnit;
        priceSource06 = config.priceSource;
        fixedPrice06 = config.fixedPrice;
        uniswapMarket06 = config.uniswapMarket;
        reporter06 = config.reporter;
        reporterMultiplier06 = config.reporterMultiplier;

        config = get(configs, 7);
        underlying07 = config.underlying;
        symbolHash07 = config.symbolHash;
        baseUnit07 = config.baseUnit;
        priceSource07 = config.priceSource;
        fixedPrice07 = config.fixedPrice;
        uniswapMarket07 = config.uniswapMarket;
        reporter07 = config.reporter;
        reporterMultiplier07 = config.reporterMultiplier;

        config = get(configs, 8);
        underlying08 = config.underlying;
        symbolHash08 = config.symbolHash;
        baseUnit08 = config.baseUnit;
        priceSource08 = config.priceSource;
        fixedPrice08 = config.fixedPrice;
        uniswapMarket08 = config.uniswapMarket;
        reporter08 = config.reporter;
        reporterMultiplier08 = config.reporterMultiplier;

        config = get(configs, 9);
        underlying09 = config.underlying;
        symbolHash09 = config.symbolHash;
        baseUnit09 = config.baseUnit;
        priceSource09 = config.priceSource;
        fixedPrice09 = config.fixedPrice;
        uniswapMarket09 = config.uniswapMarket;
        reporter09 = config.reporter;
        reporterMultiplier09 = config.reporterMultiplier;

        config = get(configs, 10);
        underlying10 = config.underlying;
        symbolHash10 = config.symbolHash;
        baseUnit10 = config.baseUnit;
        priceSource10 = config.priceSource;
        fixedPrice10 = config.fixedPrice;
        uniswapMarket10 = config.uniswapMarket;
        reporter10 = config.reporter;
        reporterMultiplier10 = config.reporterMultiplier;

        config = get(configs, 11);
        underlying11 = config.underlying;
        symbolHash11 = config.symbolHash;
        baseUnit11 = config.baseUnit;
        priceSource11 = config.priceSource;
        fixedPrice11 = config.fixedPrice;
        uniswapMarket11 = config.uniswapMarket;
        reporter11 = config.reporter;
        reporterMultiplier11 = config.reporterMultiplier;

        config = get(configs, 12);
        underlying12 = config.underlying;
        symbolHash12 = config.symbolHash;
        baseUnit12 = config.baseUnit;
        priceSource12 = config.priceSource;
        fixedPrice12 = config.fixedPrice;
        uniswapMarket12 = config.uniswapMarket;
        reporter12 = config.reporter;
        reporterMultiplier12 = config.reporterMultiplier;

        config = get(configs, 13);
        underlying13 = config.underlying;
        symbolHash13 = config.symbolHash;
        baseUnit13 = config.baseUnit;
        priceSource13 = config.priceSource;
        fixedPrice13 = config.fixedPrice;
        uniswapMarket13 = config.uniswapMarket;
        reporter13 = config.reporter;
        reporterMultiplier13 = config.reporterMultiplier;

        config = get(configs, 14);
        underlying14 = config.underlying;
        symbolHash14 = config.symbolHash;
        baseUnit14 = config.baseUnit;
        priceSource14 = config.priceSource;
        fixedPrice14 = config.fixedPrice;
        uniswapMarket14 = config.uniswapMarket;
        reporter14 = config.reporter;
        reporterMultiplier14 = config.reporterMultiplier;

        config = get(configs, 15);
        underlying15 = config.underlying;
        symbolHash15 = config.symbolHash;
        baseUnit15 = config.baseUnit;
        priceSource15 = config.priceSource;
        fixedPrice15 = config.fixedPrice;
        uniswapMarket15 = config.uniswapMarket;
        reporter15 = config.reporter;
        reporterMultiplier15 = config.reporterMultiplier;

        config = get(configs, 16);
        underlying16 = config.underlying;
        symbolHash16 = config.symbolHash;
        baseUnit16 = config.baseUnit;
        priceSource16 = config.priceSource;
        fixedPrice16 = config.fixedPrice;
        uniswapMarket16 = config.uniswapMarket;
        reporter16 = config.reporter;
        reporterMultiplier16 = config.reporterMultiplier;

        config = get(configs, 17);
        underlying17 = config.underlying;
        symbolHash17 = config.symbolHash;
        baseUnit17 = config.baseUnit;
        priceSource17 = config.priceSource;
        fixedPrice17 = config.fixedPrice;
        uniswapMarket17 = config.uniswapMarket;
        reporter17 = config.reporter;
        reporterMultiplier17 = config.reporterMultiplier;

        config = get(configs, 18);
        underlying18 = config.underlying;
        symbolHash18 = config.symbolHash;
        baseUnit18 = config.baseUnit;
        priceSource18 = config.priceSource;
        fixedPrice18 = config.fixedPrice;
        uniswapMarket18 = config.uniswapMarket;
        reporter18 = config.reporter;
        reporterMultiplier18 = config.reporterMultiplier;

        config = get(configs, 19);
        underlying19 = config.underlying;
        symbolHash19 = config.symbolHash;
        baseUnit19 = config.baseUnit;
        priceSource19 = config.priceSource;
        fixedPrice19 = config.fixedPrice;
        uniswapMarket19 = config.uniswapMarket;
        reporter19 = config.reporter;
        reporterMultiplier19 = config.reporterMultiplier;

        config = get(configs, 20);
        underlying20 = config.underlying;
        symbolHash20 = config.symbolHash;
        baseUnit20 = config.baseUnit;
        priceSource20 = config.priceSource;
        fixedPrice20 = config.fixedPrice;
        uniswapMarket20 = config.uniswapMarket;
        reporter20 = config.reporter;
        reporterMultiplier20 = config.reporterMultiplier;

        config = get(configs, 21);
        underlying21 = config.underlying;
        symbolHash21 = config.symbolHash;
        baseUnit21 = config.baseUnit;
        priceSource21 = config.priceSource;
        fixedPrice21 = config.fixedPrice;
        uniswapMarket21 = config.uniswapMarket;
        reporter21 = config.reporter;
        reporterMultiplier21 = config.reporterMultiplier;

        config = get(configs, 22);
        underlying22 = config.underlying;
        symbolHash22 = config.symbolHash;
        baseUnit22 = config.baseUnit;
        priceSource22 = config.priceSource;
        fixedPrice22 = config.fixedPrice;
        uniswapMarket22 = config.uniswapMarket;
        reporter22 = config.reporter;
        reporterMultiplier22 = config.reporterMultiplier;

        config = get(configs, 23);
        underlying23 = config.underlying;
        symbolHash23 = config.symbolHash;
        baseUnit23 = config.baseUnit;
        priceSource23 = config.priceSource;
        fixedPrice23 = config.fixedPrice;
        uniswapMarket23 = config.uniswapMarket;
        reporter23 = config.reporter;
        reporterMultiplier23 = config.reporterMultiplier;

        config = get(configs, 24);
        underlying24 = config.underlying;
        symbolHash24 = config.symbolHash;
        baseUnit24 = config.baseUnit;
        priceSource24 = config.priceSource;
        fixedPrice24 = config.fixedPrice;
        uniswapMarket24 = config.uniswapMarket;
        reporter24 = config.reporter;
        reporterMultiplier24 = config.reporterMultiplier;

        config = get(configs, 25);
        underlying25 = config.underlying;
        symbolHash25 = config.symbolHash;
        baseUnit25 = config.baseUnit;
        priceSource25 = config.priceSource;
        fixedPrice25 = config.fixedPrice;
        uniswapMarket25 = config.uniswapMarket;
        reporter25 = config.reporter;
        reporterMultiplier25 = config.reporterMultiplier;

        config = get(configs, 26);
        underlying26 = config.underlying;
        symbolHash26 = config.symbolHash;
        baseUnit26 = config.baseUnit;
        priceSource26 = config.priceSource;
        fixedPrice26 = config.fixedPrice;
        uniswapMarket26 = config.uniswapMarket;
        reporter26 = config.reporter;
        reporterMultiplier26 = config.reporterMultiplier;

        config = get(configs, 27);
        underlying27 = config.underlying;
        symbolHash27 = config.symbolHash;
        baseUnit27 = config.baseUnit;
        priceSource27 = config.priceSource;
        fixedPrice27 = config.fixedPrice;
        uniswapMarket27 = config.uniswapMarket;
        reporter27 = config.reporter;
        reporterMultiplier27 = config.reporterMultiplier;

        config = get(configs, 28);
        underlying28 = config.underlying;
        symbolHash28 = config.symbolHash;
        baseUnit28 = config.baseUnit;
        priceSource28 = config.priceSource;
        fixedPrice28 = config.fixedPrice;
        uniswapMarket28 = config.uniswapMarket;
        reporter28 = config.reporter;
        reporterMultiplier28 = config.reporterMultiplier;

        config = get(configs, 29);
        underlying29 = config.underlying;
        symbolHash29 = config.symbolHash;
        baseUnit29 = config.baseUnit;
        priceSource29 = config.priceSource;
        fixedPrice29 = config.fixedPrice;
        uniswapMarket29 = config.uniswapMarket;
        reporter29 = config.reporter;
        reporterMultiplier29 = config.reporterMultiplier;

        config = get(configs, 30);
        underlying30 = config.underlying;
        symbolHash30 = config.symbolHash;
        baseUnit30 = config.baseUnit;
        priceSource30 = config.priceSource;
        fixedPrice30 = config.fixedPrice;
        uniswapMarket30 = config.uniswapMarket;
        reporter30 = config.reporter;
        reporterMultiplier30 = config.reporterMultiplier;

        config = get(configs, 31);
        underlying31 = config.underlying;
        symbolHash31 = config.symbolHash;
        baseUnit31 = config.baseUnit;
        priceSource31 = config.priceSource;
        fixedPrice31 = config.fixedPrice;
        uniswapMarket31 = config.uniswapMarket;
        reporter31 = config.reporter;
        reporterMultiplier31 = config.reporterMultiplier;

        config = get(configs, 32);
        underlying32 = config.underlying;
        symbolHash32 = config.symbolHash;
        baseUnit32 = config.baseUnit;
        priceSource32 = config.priceSource;
        fixedPrice32 = config.fixedPrice;
        uniswapMarket32 = config.uniswapMarket;
        reporter32 = config.reporter;
        reporterMultiplier32 = config.reporterMultiplier;

        config = get(configs, 33);
        underlying33 = config.underlying;
        symbolHash33 = config.symbolHash;
        baseUnit33 = config.baseUnit;
        priceSource33 = config.priceSource;
        fixedPrice33 = config.fixedPrice;
        uniswapMarket33 = config.uniswapMarket;
        reporter33 = config.reporter;
        reporterMultiplier33 = config.reporterMultiplier;

        config = get(configs, 34);
        underlying34 = config.underlying;
        symbolHash34 = config.symbolHash;
        baseUnit34 = config.baseUnit;
        priceSource34 = config.priceSource;
        fixedPrice34 = config.fixedPrice;
        uniswapMarket34 = config.uniswapMarket;
        reporter34 = config.reporter;
        reporterMultiplier34 = config.reporterMultiplier;

        uint256 isUniswapReversed_;
        uint256 numTokenConfigs = configs.length;
        for (uint256 i = 0; i < numTokenConfigs; i++) {
            config = configs[i];
            if (config.isUniswapReversed) isUniswapReversed_ |= uint256(1) << i;
        }
        isUniswapReversed = isUniswapReversed_;
    }

    function get(TokenConfig[] memory configs, uint256 i) internal pure returns (TokenConfig memory) {
        if (i < configs.length)
            return configs[i];
        return TokenConfig({
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

    function getReporterIndex(address reporter) internal view returns(uint) {
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
        if (reporter == reporter29) return 29;
        if (reporter == reporter30) return 30;
        if (reporter == reporter31) return 31;
        if (reporter == reporter32) return 32;
        if (reporter == reporter33) return 33;
        if (reporter == reporter34) return 34;

        return MAX_INTEGER;
    }

    function getUnderlyingIndex(address underlying) internal view returns (uint) {
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
        if (underlying == underlying29) return 29;
        if (underlying == underlying30) return 30;
        if (underlying == underlying31) return 31;
        if (underlying == underlying32) return 32;
        if (underlying == underlying33) return 33;
        if (underlying == underlying34) return 34;

        return type(uint).max;
    }

    function getSymbolHashIndex(bytes32 symbolHash) internal view returns (uint) {
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
        if (symbolHash == symbolHash29) return 29;
        if (symbolHash == symbolHash30) return 30;
        if (symbolHash == symbolHash31) return 31;
        if (symbolHash == symbolHash32) return 32;
        if (symbolHash == symbolHash33) return 33;
        if (symbolHash == symbolHash34) return 34;

        return type(uint).max;
    }

    /**
     * @notice Get the i-th config, according to the order they were passed in originally
     * @param i The index of the config to get
     * @return The config object
     */
    function getTokenConfig(uint256 i) public view returns (TokenConfig memory) {
        require(i < numTokens, "token config not found");

        address underlying;
        bytes32 symbolHash;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        address reporter;
        uint256 reporterMultiplier;
        if (i == 0) {
            underlying = underlying00;
            symbolHash = symbolHash00;
            baseUnit = baseUnit00;
            priceSource = priceSource00;
            fixedPrice = fixedPrice00;
            uniswapMarket = uniswapMarket00;
            reporter = reporter00;
            reporterMultiplier = reporterMultiplier00;
        } else if (i == 1) {
            underlying = underlying01;
            symbolHash = symbolHash01;
            baseUnit = baseUnit01;
            priceSource = priceSource01;
            fixedPrice = fixedPrice01;
            uniswapMarket = uniswapMarket01;
            reporter = reporter01;
            reporterMultiplier = reporterMultiplier01;
        } else if (i == 2) {
            underlying = underlying02;
            symbolHash = symbolHash02;
            baseUnit = baseUnit02;
            priceSource = priceSource02;
            fixedPrice = fixedPrice02;
            uniswapMarket = uniswapMarket02;
            reporter = reporter02;
            reporterMultiplier = reporterMultiplier02;
        } else if (i == 3) {
            underlying = underlying03;
            symbolHash = symbolHash03;
            baseUnit = baseUnit03;
            priceSource = priceSource03;
            fixedPrice = fixedPrice03;
            uniswapMarket = uniswapMarket03;
            reporter = reporter03;
            reporterMultiplier = reporterMultiplier03;
        } else if (i == 4) {
            underlying = underlying04;
            symbolHash = symbolHash04;
            baseUnit = baseUnit04;
            priceSource = priceSource04;
            fixedPrice = fixedPrice04;
            uniswapMarket = uniswapMarket04;
            reporter = reporter04;
            reporterMultiplier = reporterMultiplier04;
        } else if (i == 5) {
            underlying = underlying05;
            symbolHash = symbolHash05;
            baseUnit = baseUnit05;
            priceSource = priceSource05;
            fixedPrice = fixedPrice05;
            uniswapMarket = uniswapMarket05;
            reporter = reporter05;
            reporterMultiplier = reporterMultiplier05;
        } else if (i == 6) {
            underlying = underlying06;
            symbolHash = symbolHash06;
            baseUnit = baseUnit06;
            priceSource = priceSource06;
            fixedPrice = fixedPrice06;
            uniswapMarket = uniswapMarket06;
            reporter = reporter06;
            reporterMultiplier = reporterMultiplier06;
        } else if (i == 7) {
            underlying = underlying07;
            symbolHash = symbolHash07;
            baseUnit = baseUnit07;
            priceSource = priceSource07;
            fixedPrice = fixedPrice07;
            uniswapMarket = uniswapMarket07;
            reporter = reporter07;
            reporterMultiplier = reporterMultiplier07;
        } else if (i == 8) {
            underlying = underlying08;
            symbolHash = symbolHash08;
            baseUnit = baseUnit08;
            priceSource = priceSource08;
            fixedPrice = fixedPrice08;
            uniswapMarket = uniswapMarket08;
            reporter = reporter08;
            reporterMultiplier = reporterMultiplier08;
        } else if (i == 9) {
            underlying = underlying09;
            symbolHash = symbolHash09;
            baseUnit = baseUnit09;
            priceSource = priceSource09;
            fixedPrice = fixedPrice09;
            uniswapMarket = uniswapMarket09;
            reporter = reporter09;
            reporterMultiplier = reporterMultiplier09;
        } else if (i == 10) {
            underlying = underlying10;
            symbolHash = symbolHash10;
            baseUnit = baseUnit10;
            priceSource = priceSource10;
            fixedPrice = fixedPrice10;
            uniswapMarket = uniswapMarket10;
            reporter = reporter10;
            reporterMultiplier = reporterMultiplier10;
        } else if (i == 11) {
            underlying = underlying11;
            symbolHash = symbolHash11;
            baseUnit = baseUnit11;
            priceSource = priceSource11;
            fixedPrice = fixedPrice11;
            uniswapMarket = uniswapMarket11;
            reporter = reporter11;
            reporterMultiplier = reporterMultiplier11;
        } else if (i == 12) {
            underlying = underlying12;
            symbolHash = symbolHash12;
            baseUnit = baseUnit12;
            priceSource = priceSource12;
            fixedPrice = fixedPrice12;
            uniswapMarket = uniswapMarket12;
            reporter = reporter12;
            reporterMultiplier = reporterMultiplier12;
        } else if (i == 13) {
            underlying = underlying13;
            symbolHash = symbolHash13;
            baseUnit = baseUnit13;
            priceSource = priceSource13;
            fixedPrice = fixedPrice13;
            uniswapMarket = uniswapMarket13;
            reporter = reporter13;
            reporterMultiplier = reporterMultiplier13;
        } else if (i == 14) {
            underlying = underlying14;
            symbolHash = symbolHash14;
            baseUnit = baseUnit14;
            priceSource = priceSource14;
            fixedPrice = fixedPrice14;
            uniswapMarket = uniswapMarket14;
            reporter = reporter14;
            reporterMultiplier = reporterMultiplier14;
        } else if (i == 15) {
            underlying = underlying15;
            symbolHash = symbolHash15;
            baseUnit = baseUnit15;
            priceSource = priceSource15;
            fixedPrice = fixedPrice15;
            uniswapMarket = uniswapMarket15;
            reporter = reporter15;
            reporterMultiplier = reporterMultiplier15;
        } else if (i == 16) {
            underlying = underlying16;
            symbolHash = symbolHash16;
            baseUnit = baseUnit16;
            priceSource = priceSource16;
            fixedPrice = fixedPrice16;
            uniswapMarket = uniswapMarket16;
            reporter = reporter16;
            reporterMultiplier = reporterMultiplier16;
        } else if (i == 17) {
            underlying = underlying17;
            symbolHash = symbolHash17;
            baseUnit = baseUnit17;
            priceSource = priceSource17;
            fixedPrice = fixedPrice17;
            uniswapMarket = uniswapMarket17;
            reporter = reporter17;
            reporterMultiplier = reporterMultiplier17;
        } else if (i == 18) {
            underlying = underlying18;
            symbolHash = symbolHash18;
            baseUnit = baseUnit18;
            priceSource = priceSource18;
            fixedPrice = fixedPrice18;
            uniswapMarket = uniswapMarket18;
            reporter = reporter18;
            reporterMultiplier = reporterMultiplier18;
        } else if (i == 19) {
            underlying = underlying19;
            symbolHash = symbolHash19;
            baseUnit = baseUnit19;
            priceSource = priceSource19;
            fixedPrice = fixedPrice19;
            uniswapMarket = uniswapMarket19;
            reporter = reporter19;
            reporterMultiplier = reporterMultiplier19;
        } else if (i == 20) {
            underlying = underlying20;
            symbolHash = symbolHash20;
            baseUnit = baseUnit20;
            priceSource = priceSource20;
            fixedPrice = fixedPrice20;
            uniswapMarket = uniswapMarket20;
            reporter = reporter20;
            reporterMultiplier = reporterMultiplier20;
        } else if (i == 21) {
            underlying = underlying21;
            symbolHash = symbolHash21;
            baseUnit = baseUnit21;
            priceSource = priceSource21;
            fixedPrice = fixedPrice21;
            uniswapMarket = uniswapMarket21;
            reporter = reporter21;
            reporterMultiplier = reporterMultiplier21;
        } else if (i == 22) {
            underlying = underlying22;
            symbolHash = symbolHash22;
            baseUnit = baseUnit22;
            priceSource = priceSource22;
            fixedPrice = fixedPrice22;
            uniswapMarket = uniswapMarket22;
            reporter = reporter22;
            reporterMultiplier = reporterMultiplier22;
        } else if (i == 23) {
            underlying = underlying23;
            symbolHash = symbolHash23;
            baseUnit = baseUnit23;
            priceSource = priceSource23;
            fixedPrice = fixedPrice23;
            uniswapMarket = uniswapMarket23;
            reporter = reporter23;
            reporterMultiplier = reporterMultiplier23;
        } else if (i == 24) {
            underlying = underlying24;
            symbolHash = symbolHash24;
            baseUnit = baseUnit24;
            priceSource = priceSource24;
            fixedPrice = fixedPrice24;
            uniswapMarket = uniswapMarket24;
            reporter = reporter24;
            reporterMultiplier = reporterMultiplier24;
        } else if (i == 25) {
            underlying = underlying25;
            symbolHash = symbolHash25;
            baseUnit = baseUnit25;
            priceSource = priceSource25;
            fixedPrice = fixedPrice25;
            uniswapMarket = uniswapMarket25;
            reporter = reporter25;
            reporterMultiplier = reporterMultiplier25;
        } else if (i == 26) {
            underlying = underlying26;
            symbolHash = symbolHash26;
            baseUnit = baseUnit26;
            priceSource = priceSource26;
            fixedPrice = fixedPrice26;
            uniswapMarket = uniswapMarket26;
            reporter = reporter26;
            reporterMultiplier = reporterMultiplier26;
        } else if (i == 27) {
            underlying = underlying27;
            symbolHash = symbolHash27;
            baseUnit = baseUnit27;
            priceSource = priceSource27;
            fixedPrice = fixedPrice27;
            uniswapMarket = uniswapMarket27;
            reporter = reporter27;
            reporterMultiplier = reporterMultiplier27;
        } else if (i == 28) {
            underlying = underlying28;
            symbolHash = symbolHash28;
            baseUnit = baseUnit28;
            priceSource = priceSource28;
            fixedPrice = fixedPrice28;
            uniswapMarket = uniswapMarket28;
            reporter = reporter28;
            reporterMultiplier = reporterMultiplier28;
        } else if (i == 29) {
            underlying = underlying29;
            symbolHash = symbolHash29;
            baseUnit = baseUnit29;
            priceSource = priceSource29;
            fixedPrice = fixedPrice29;
            uniswapMarket = uniswapMarket29;
            reporter = reporter29;
            reporterMultiplier = reporterMultiplier29;
        } else if (i == 30) {
            underlying = underlying30;
            symbolHash = symbolHash30;
            baseUnit = baseUnit30;
            priceSource = priceSource30;
            fixedPrice = fixedPrice30;
            uniswapMarket = uniswapMarket30;
            reporter = reporter30;
            reporterMultiplier = reporterMultiplier30;
        } else if (i == 31) {
            underlying = underlying31;
            symbolHash = symbolHash31;
            baseUnit = baseUnit31;
            priceSource = priceSource31;
            fixedPrice = fixedPrice31;
            uniswapMarket = uniswapMarket31;
            reporter = reporter31;
            reporterMultiplier = reporterMultiplier31;
        } else if (i == 32) {
            underlying = underlying32;
            symbolHash = symbolHash32;
            baseUnit = baseUnit32;
            priceSource = priceSource32;
            fixedPrice = fixedPrice32;
            uniswapMarket = uniswapMarket32;
            reporter = reporter32;
            reporterMultiplier = reporterMultiplier32;
        } else if (i == 33) {
            underlying = underlying33;
            symbolHash = symbolHash33;
            baseUnit = baseUnit33;
            priceSource = priceSource33;
            fixedPrice = fixedPrice33;
            uniswapMarket = uniswapMarket33;
            reporter = reporter33;
            reporterMultiplier = reporterMultiplier33;
        } else if (i == 34) {
            underlying = underlying34;
            symbolHash = symbolHash34;
            baseUnit = baseUnit34;
            priceSource = priceSource34;
            fixedPrice = fixedPrice34;
            uniswapMarket = uniswapMarket34;
            reporter = reporter34;
            reporterMultiplier = reporterMultiplier34;
        }

        return TokenConfig({
            underlying: underlying,
            symbolHash: symbolHash,
            baseUnit: baseUnit,
            priceSource: priceSource,
            fixedPrice: fixedPrice,
            uniswapMarket: uniswapMarket,
            reporter: reporter,
            reporterMultiplier: reporterMultiplier,
            isUniswapReversed:
                ((isUniswapReversed >> i) & uint256(1)) == 1
        });
    }

    /**
     * @notice Get the config for symbol
     * @param symbol The symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbol(string memory symbol) public view returns (TokenConfig memory) {
        return getTokenConfigBySymbolHash(keccak256(abi.encodePacked(symbol)));
    }

    /**
     * @notice Get the config for the reporter
     * @param reporter The address of the reporter of the config to get
     * @return The config object
     */
    function getTokenConfigByReporter(address reporter) public view returns (TokenConfig memory) {
        return getTokenConfig(getReporterIndex(reporter));
    }

    /**
     * @notice Get the config for the symbolHash
     * @param symbolHash The keccack256 of the symbol of the config to get
     * @return The config object
     */
    function getTokenConfigBySymbolHash(bytes32 symbolHash) public view returns (TokenConfig memory) {
        return getTokenConfig(getSymbolHashIndex(symbolHash));
    }

    /**
     * @notice Get the config for an underlying asset
     * @param underlying The address of the underlying asset of the config to get
     * @return The config object
     */
    function getTokenConfigByUnderlying(address underlying) public view returns (TokenConfig memory) {
        return getTokenConfig(getUnderlyingIndex(underlying));
    }
}
