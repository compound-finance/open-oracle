// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

interface CErc20 {
    function underlying() external view returns (address);
}

contract UniswapConfig {
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
    uint public constant maxTokens = 35;

    /// @notice The number of tokens this contract actually supports
    uint public immutable numTokens;

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

    // Contract bytecode size optimisation:
    // Each bit i stores a bool, corresponding to the ith config.
    uint64 internal immutable isUniswapReversed;

    /**
     * @notice Construct an immutable store of configs into the contract data
     * @param configs The configs for the supported assets
     */
    constructor(TokenConfig[] memory configs) {
        require(configs.length <= maxTokens, "too many configs");
        numTokens = configs.length;

        underlying00 = get(configs, 0).underlying;
        underlying01 = get(configs, 1).underlying;
        underlying02 = get(configs, 2).underlying;
        underlying03 = get(configs, 3).underlying;
        underlying04 = get(configs, 4).underlying;
        underlying05 = get(configs, 5).underlying;
        underlying06 = get(configs, 6).underlying;
        underlying07 = get(configs, 7).underlying;
        underlying08 = get(configs, 8).underlying;
        underlying09 = get(configs, 9).underlying;
        underlying10 = get(configs, 10).underlying;
        underlying11 = get(configs, 11).underlying;
        underlying12 = get(configs, 12).underlying;
        underlying13 = get(configs, 13).underlying;
        underlying14 = get(configs, 14).underlying;
        underlying15 = get(configs, 15).underlying;
        underlying16 = get(configs, 16).underlying;
        underlying17 = get(configs, 17).underlying;
        underlying18 = get(configs, 18).underlying;
        underlying19 = get(configs, 19).underlying;
        underlying20 = get(configs, 20).underlying;
        underlying21 = get(configs, 21).underlying;
        underlying22 = get(configs, 22).underlying;
        underlying23 = get(configs, 23).underlying;
        underlying24 = get(configs, 24).underlying;
        underlying25 = get(configs, 25).underlying;
        underlying26 = get(configs, 26).underlying;
        underlying27 = get(configs, 27).underlying;
        underlying28 = get(configs, 28).underlying;
        underlying29 = get(configs, 29).underlying;
        underlying30 = get(configs, 30).underlying;
        underlying31 = get(configs, 31).underlying;
        underlying32 = get(configs, 32).underlying;
        underlying33 = get(configs, 33).underlying;
        underlying34 = get(configs, 34).underlying;

        symbolHash00 = get(configs, 0).symbolHash;
        symbolHash01 = get(configs, 1).symbolHash;
        symbolHash02 = get(configs, 2).symbolHash;
        symbolHash03 = get(configs, 3).symbolHash;
        symbolHash04 = get(configs, 4).symbolHash;
        symbolHash05 = get(configs, 5).symbolHash;
        symbolHash06 = get(configs, 6).symbolHash;
        symbolHash07 = get(configs, 7).symbolHash;
        symbolHash08 = get(configs, 8).symbolHash;
        symbolHash09 = get(configs, 9).symbolHash;
        symbolHash10 = get(configs, 10).symbolHash;
        symbolHash11 = get(configs, 11).symbolHash;
        symbolHash12 = get(configs, 12).symbolHash;
        symbolHash13 = get(configs, 13).symbolHash;
        symbolHash14 = get(configs, 14).symbolHash;
        symbolHash15 = get(configs, 15).symbolHash;
        symbolHash16 = get(configs, 16).symbolHash;
        symbolHash17 = get(configs, 17).symbolHash;
        symbolHash18 = get(configs, 18).symbolHash;
        symbolHash19 = get(configs, 19).symbolHash;
        symbolHash20 = get(configs, 20).symbolHash;
        symbolHash21 = get(configs, 21).symbolHash;
        symbolHash22 = get(configs, 22).symbolHash;
        symbolHash23 = get(configs, 23).symbolHash;
        symbolHash24 = get(configs, 24).symbolHash;
        symbolHash25 = get(configs, 25).symbolHash;
        symbolHash26 = get(configs, 26).symbolHash;
        symbolHash27 = get(configs, 27).symbolHash;
        symbolHash28 = get(configs, 28).symbolHash;
        symbolHash29 = get(configs, 29).symbolHash;
        symbolHash30 = get(configs, 30).symbolHash;
        symbolHash31 = get(configs, 31).symbolHash;
        symbolHash32 = get(configs, 32).symbolHash;
        symbolHash33 = get(configs, 33).symbolHash;
        symbolHash34 = get(configs, 34).symbolHash;

        baseUnit00 = get(configs, 0).baseUnit;
        baseUnit01 = get(configs, 1).baseUnit;
        baseUnit02 = get(configs, 2).baseUnit;
        baseUnit03 = get(configs, 3).baseUnit;
        baseUnit04 = get(configs, 4).baseUnit;
        baseUnit05 = get(configs, 5).baseUnit;
        baseUnit06 = get(configs, 6).baseUnit;
        baseUnit07 = get(configs, 7).baseUnit;
        baseUnit08 = get(configs, 8).baseUnit;
        baseUnit09 = get(configs, 9).baseUnit;
        baseUnit10 = get(configs, 10).baseUnit;
        baseUnit11 = get(configs, 11).baseUnit;
        baseUnit12 = get(configs, 12).baseUnit;
        baseUnit13 = get(configs, 13).baseUnit;
        baseUnit14 = get(configs, 14).baseUnit;
        baseUnit15 = get(configs, 15).baseUnit;
        baseUnit16 = get(configs, 16).baseUnit;
        baseUnit17 = get(configs, 17).baseUnit;
        baseUnit18 = get(configs, 18).baseUnit;
        baseUnit19 = get(configs, 19).baseUnit;
        baseUnit20 = get(configs, 20).baseUnit;
        baseUnit21 = get(configs, 21).baseUnit;
        baseUnit22 = get(configs, 22).baseUnit;
        baseUnit23 = get(configs, 23).baseUnit;
        baseUnit24 = get(configs, 24).baseUnit;
        baseUnit25 = get(configs, 25).baseUnit;
        baseUnit26 = get(configs, 26).baseUnit;
        baseUnit27 = get(configs, 27).baseUnit;
        baseUnit28 = get(configs, 28).baseUnit;
        baseUnit29 = get(configs, 29).baseUnit;
        baseUnit30 = get(configs, 30).baseUnit;
        baseUnit31 = get(configs, 31).baseUnit;
        baseUnit32 = get(configs, 32).baseUnit;
        baseUnit33 = get(configs, 33).baseUnit;
        baseUnit34 = get(configs, 34).baseUnit;

        priceSource00 = get(configs, 0).priceSource;
        priceSource01 = get(configs, 1).priceSource;
        priceSource02 = get(configs, 2).priceSource;
        priceSource03 = get(configs, 3).priceSource;
        priceSource04 = get(configs, 4).priceSource;
        priceSource05 = get(configs, 5).priceSource;
        priceSource06 = get(configs, 6).priceSource;
        priceSource07 = get(configs, 7).priceSource;
        priceSource08 = get(configs, 8).priceSource;
        priceSource09 = get(configs, 9).priceSource;
        priceSource10 = get(configs, 10).priceSource;
        priceSource11 = get(configs, 11).priceSource;
        priceSource12 = get(configs, 12).priceSource;
        priceSource13 = get(configs, 13).priceSource;
        priceSource14 = get(configs, 14).priceSource;
        priceSource15 = get(configs, 15).priceSource;
        priceSource16 = get(configs, 16).priceSource;
        priceSource17 = get(configs, 17).priceSource;
        priceSource18 = get(configs, 18).priceSource;
        priceSource19 = get(configs, 19).priceSource;
        priceSource20 = get(configs, 20).priceSource;
        priceSource21 = get(configs, 21).priceSource;
        priceSource22 = get(configs, 22).priceSource;
        priceSource23 = get(configs, 23).priceSource;
        priceSource24 = get(configs, 24).priceSource;
        priceSource25 = get(configs, 25).priceSource;
        priceSource26 = get(configs, 26).priceSource;
        priceSource27 = get(configs, 27).priceSource;
        priceSource28 = get(configs, 28).priceSource;
        priceSource29 = get(configs, 29).priceSource;
        priceSource30 = get(configs, 30).priceSource;
        priceSource31 = get(configs, 31).priceSource;
        priceSource32 = get(configs, 32).priceSource;
        priceSource33 = get(configs, 33).priceSource;
        priceSource34 = get(configs, 34).priceSource;

        fixedPrice00 = get(configs, 0).fixedPrice;
        fixedPrice01 = get(configs, 1).fixedPrice;
        fixedPrice02 = get(configs, 2).fixedPrice;
        fixedPrice03 = get(configs, 3).fixedPrice;
        fixedPrice04 = get(configs, 4).fixedPrice;
        fixedPrice05 = get(configs, 5).fixedPrice;
        fixedPrice06 = get(configs, 6).fixedPrice;
        fixedPrice07 = get(configs, 7).fixedPrice;
        fixedPrice08 = get(configs, 8).fixedPrice;
        fixedPrice09 = get(configs, 9).fixedPrice;
        fixedPrice10 = get(configs, 10).fixedPrice;
        fixedPrice11 = get(configs, 11).fixedPrice;
        fixedPrice12 = get(configs, 12).fixedPrice;
        fixedPrice13 = get(configs, 13).fixedPrice;
        fixedPrice14 = get(configs, 14).fixedPrice;
        fixedPrice15 = get(configs, 15).fixedPrice;
        fixedPrice16 = get(configs, 16).fixedPrice;
        fixedPrice17 = get(configs, 17).fixedPrice;
        fixedPrice18 = get(configs, 18).fixedPrice;
        fixedPrice19 = get(configs, 19).fixedPrice;
        fixedPrice20 = get(configs, 20).fixedPrice;
        fixedPrice21 = get(configs, 21).fixedPrice;
        fixedPrice22 = get(configs, 22).fixedPrice;
        fixedPrice23 = get(configs, 23).fixedPrice;
        fixedPrice24 = get(configs, 24).fixedPrice;
        fixedPrice25 = get(configs, 25).fixedPrice;
        fixedPrice26 = get(configs, 26).fixedPrice;
        fixedPrice27 = get(configs, 27).fixedPrice;
        fixedPrice28 = get(configs, 28).fixedPrice;
        fixedPrice29 = get(configs, 29).fixedPrice;
        fixedPrice30 = get(configs, 30).fixedPrice;
        fixedPrice31 = get(configs, 31).fixedPrice;
        fixedPrice32 = get(configs, 32).fixedPrice;
        fixedPrice33 = get(configs, 33).fixedPrice;
        fixedPrice34 = get(configs, 34).fixedPrice;

        uniswapMarket00 = get(configs, 0).uniswapMarket;
        uniswapMarket01 = get(configs, 1).uniswapMarket;
        uniswapMarket02 = get(configs, 2).uniswapMarket;
        uniswapMarket03 = get(configs, 3).uniswapMarket;
        uniswapMarket04 = get(configs, 4).uniswapMarket;
        uniswapMarket05 = get(configs, 5).uniswapMarket;
        uniswapMarket06 = get(configs, 6).uniswapMarket;
        uniswapMarket07 = get(configs, 7).uniswapMarket;
        uniswapMarket08 = get(configs, 8).uniswapMarket;
        uniswapMarket09 = get(configs, 9).uniswapMarket;
        uniswapMarket10 = get(configs, 10).uniswapMarket;
        uniswapMarket11 = get(configs, 11).uniswapMarket;
        uniswapMarket12 = get(configs, 12).uniswapMarket;
        uniswapMarket13 = get(configs, 13).uniswapMarket;
        uniswapMarket14 = get(configs, 14).uniswapMarket;
        uniswapMarket15 = get(configs, 15).uniswapMarket;
        uniswapMarket16 = get(configs, 16).uniswapMarket;
        uniswapMarket17 = get(configs, 17).uniswapMarket;
        uniswapMarket18 = get(configs, 18).uniswapMarket;
        uniswapMarket19 = get(configs, 19).uniswapMarket;
        uniswapMarket20 = get(configs, 20).uniswapMarket;
        uniswapMarket21 = get(configs, 21).uniswapMarket;
        uniswapMarket22 = get(configs, 22).uniswapMarket;
        uniswapMarket23 = get(configs, 23).uniswapMarket;
        uniswapMarket24 = get(configs, 24).uniswapMarket;
        uniswapMarket25 = get(configs, 25).uniswapMarket;
        uniswapMarket26 = get(configs, 26).uniswapMarket;
        uniswapMarket27 = get(configs, 27).uniswapMarket;
        uniswapMarket28 = get(configs, 28).uniswapMarket;
        uniswapMarket29 = get(configs, 29).uniswapMarket;
        uniswapMarket30 = get(configs, 30).uniswapMarket;
        uniswapMarket31 = get(configs, 31).uniswapMarket;
        uniswapMarket32 = get(configs, 32).uniswapMarket;
        uniswapMarket33 = get(configs, 33).uniswapMarket;
        uniswapMarket34 = get(configs, 34).uniswapMarket;

        reporter00 = get(configs, 0).reporter;
        reporter01 = get(configs, 1).reporter;
        reporter02 = get(configs, 2).reporter;
        reporter03 = get(configs, 3).reporter;
        reporter04 = get(configs, 4).reporter;
        reporter05 = get(configs, 5).reporter;
        reporter06 = get(configs, 6).reporter;
        reporter07 = get(configs, 7).reporter;
        reporter08 = get(configs, 8).reporter;
        reporter09 = get(configs, 9).reporter;
        reporter10 = get(configs, 10).reporter;
        reporter11 = get(configs, 11).reporter;
        reporter12 = get(configs, 12).reporter;
        reporter13 = get(configs, 13).reporter;
        reporter14 = get(configs, 14).reporter;
        reporter15 = get(configs, 15).reporter;
        reporter16 = get(configs, 16).reporter;
        reporter17 = get(configs, 17).reporter;
        reporter18 = get(configs, 18).reporter;
        reporter19 = get(configs, 19).reporter;
        reporter20 = get(configs, 20).reporter;
        reporter21 = get(configs, 21).reporter;
        reporter22 = get(configs, 22).reporter;
        reporter23 = get(configs, 23).reporter;
        reporter24 = get(configs, 24).reporter;
        reporter25 = get(configs, 25).reporter;
        reporter26 = get(configs, 26).reporter;
        reporter27 = get(configs, 27).reporter;
        reporter28 = get(configs, 28).reporter;
        reporter29 = get(configs, 29).reporter;
        reporter30 = get(configs, 30).reporter;
        reporter31 = get(configs, 31).reporter;
        reporter32 = get(configs, 32).reporter;
        reporter33 = get(configs, 33).reporter;
        reporter34 = get(configs, 34).reporter;

        reporterMultiplier00 = get(configs, 0).reporterMultiplier;
        reporterMultiplier01 = get(configs, 1).reporterMultiplier;
        reporterMultiplier02 = get(configs, 2).reporterMultiplier;
        reporterMultiplier03 = get(configs, 3).reporterMultiplier;
        reporterMultiplier04 = get(configs, 4).reporterMultiplier;
        reporterMultiplier05 = get(configs, 5).reporterMultiplier;
        reporterMultiplier06 = get(configs, 6).reporterMultiplier;
        reporterMultiplier07 = get(configs, 7).reporterMultiplier;
        reporterMultiplier08 = get(configs, 8).reporterMultiplier;
        reporterMultiplier09 = get(configs, 9).reporterMultiplier;
        reporterMultiplier10 = get(configs, 10).reporterMultiplier;
        reporterMultiplier11 = get(configs, 11).reporterMultiplier;
        reporterMultiplier12 = get(configs, 12).reporterMultiplier;
        reporterMultiplier13 = get(configs, 13).reporterMultiplier;
        reporterMultiplier14 = get(configs, 14).reporterMultiplier;
        reporterMultiplier15 = get(configs, 15).reporterMultiplier;
        reporterMultiplier16 = get(configs, 16).reporterMultiplier;
        reporterMultiplier17 = get(configs, 17).reporterMultiplier;
        reporterMultiplier18 = get(configs, 18).reporterMultiplier;
        reporterMultiplier19 = get(configs, 19).reporterMultiplier;
        reporterMultiplier20 = get(configs, 20).reporterMultiplier;
        reporterMultiplier21 = get(configs, 21).reporterMultiplier;
        reporterMultiplier22 = get(configs, 22).reporterMultiplier;
        reporterMultiplier23 = get(configs, 23).reporterMultiplier;
        reporterMultiplier24 = get(configs, 24).reporterMultiplier;
        reporterMultiplier25 = get(configs, 25).reporterMultiplier;
        reporterMultiplier26 = get(configs, 26).reporterMultiplier;
        reporterMultiplier27 = get(configs, 27).reporterMultiplier;
        reporterMultiplier28 = get(configs, 28).reporterMultiplier;
        reporterMultiplier29 = get(configs, 29).reporterMultiplier;
        reporterMultiplier30 = get(configs, 30).reporterMultiplier;
        reporterMultiplier31 = get(configs, 31).reporterMultiplier;
        reporterMultiplier32 = get(configs, 32).reporterMultiplier;
        reporterMultiplier33 = get(configs, 33).reporterMultiplier;
        reporterMultiplier34 = get(configs, 34).reporterMultiplier;

        TokenConfig memory config;
        uint64 isUniswapReversed_ = 0;
        for (uint i = 0; i < configs.length; i++) {
            config = configs[i];
            isUniswapReversed_ |=
                uint64(config.isUniswapReversed ? 1 : 0) << uint64(i);
        }
        isUniswapReversed = isUniswapReversed_;
    }

    function get(TokenConfig[] memory configs, uint i) internal pure returns (TokenConfig memory) {
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

        return type(uint).max;
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
    function getTokenConfig(uint i) public view returns (TokenConfig memory) {
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
