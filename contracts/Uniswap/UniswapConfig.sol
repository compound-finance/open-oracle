// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

interface CErc20 {
    function underlying() external view returns (address);
}

contract UniswapConfig {
    enum PriceSource {FIXED_ETH, FIXED_USD, REPORTER}
    struct TokenConfigInput {
        string symbol;
        address cToken;
        address underlying;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        bool isUniswapReversed;
    }
    struct TokenConfig {
        bytes32 symbolWord;
        address cToken;
        address underlying;
        uint256 baseUnit;
        PriceSource priceSource;
        uint256 fixedPrice;
        address uniswapMarket;
        bool isUniswapReversed;
    }

    uint public constant maxTokens = 30;
    uint public immutable numTokens;

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
    address internal immutable cToken29;

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

    bytes32 internal immutable symbolWord00;
    bytes32 internal immutable symbolWord01;
    bytes32 internal immutable symbolWord02;
    bytes32 internal immutable symbolWord03;
    bytes32 internal immutable symbolWord04;
    bytes32 internal immutable symbolWord05;
    bytes32 internal immutable symbolWord06;
    bytes32 internal immutable symbolWord07;
    bytes32 internal immutable symbolWord08;
    bytes32 internal immutable symbolWord09;
    bytes32 internal immutable symbolWord10;
    bytes32 internal immutable symbolWord11;
    bytes32 internal immutable symbolWord12;
    bytes32 internal immutable symbolWord13;
    bytes32 internal immutable symbolWord14;
    bytes32 internal immutable symbolWord15;
    bytes32 internal immutable symbolWord16;
    bytes32 internal immutable symbolWord17;
    bytes32 internal immutable symbolWord18;
    bytes32 internal immutable symbolWord19;
    bytes32 internal immutable symbolWord20;
    bytes32 internal immutable symbolWord21;
    bytes32 internal immutable symbolWord22;
    bytes32 internal immutable symbolWord23;
    bytes32 internal immutable symbolWord24;
    bytes32 internal immutable symbolWord25;
    bytes32 internal immutable symbolWord26;
    bytes32 internal immutable symbolWord27;
    bytes32 internal immutable symbolWord28;
    bytes32 internal immutable symbolWord29;

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

    bool internal immutable isUniswapReversed00;
    bool internal immutable isUniswapReversed01;
    bool internal immutable isUniswapReversed02;
    bool internal immutable isUniswapReversed03;
    bool internal immutable isUniswapReversed04;
    bool internal immutable isUniswapReversed05;
    bool internal immutable isUniswapReversed06;
    bool internal immutable isUniswapReversed07;
    bool internal immutable isUniswapReversed08;
    bool internal immutable isUniswapReversed09;
    bool internal immutable isUniswapReversed10;
    bool internal immutable isUniswapReversed11;
    bool internal immutable isUniswapReversed12;
    bool internal immutable isUniswapReversed13;
    bool internal immutable isUniswapReversed14;
    bool internal immutable isUniswapReversed15;
    bool internal immutable isUniswapReversed16;
    bool internal immutable isUniswapReversed17;
    bool internal immutable isUniswapReversed18;
    bool internal immutable isUniswapReversed19;
    bool internal immutable isUniswapReversed20;
    bool internal immutable isUniswapReversed21;
    bool internal immutable isUniswapReversed22;
    bool internal immutable isUniswapReversed23;
    bool internal immutable isUniswapReversed24;
    bool internal immutable isUniswapReversed25;
    bool internal immutable isUniswapReversed26;
    bool internal immutable isUniswapReversed27;
    bool internal immutable isUniswapReversed28;
    bool internal immutable isUniswapReversed29;

    constructor(TokenConfigInput[] memory inputs) public {
        require(inputs.length <= maxTokens, "too many config inputs");
        numTokens = inputs.length;

        cToken00 = get(inputs, 0).cToken;
        cToken01 = get(inputs, 1).cToken;
        cToken02 = get(inputs, 2).cToken;
        cToken03 = get(inputs, 3).cToken;
        cToken04 = get(inputs, 4).cToken;
        cToken05 = get(inputs, 5).cToken;
        cToken06 = get(inputs, 6).cToken;
        cToken07 = get(inputs, 7).cToken;
        cToken08 = get(inputs, 8).cToken;
        cToken09 = get(inputs, 9).cToken;
        cToken10 = get(inputs, 10).cToken;
        cToken11 = get(inputs, 11).cToken;
        cToken12 = get(inputs, 12).cToken;
        cToken13 = get(inputs, 13).cToken;
        cToken14 = get(inputs, 14).cToken;
        cToken15 = get(inputs, 15).cToken;
        cToken16 = get(inputs, 16).cToken;
        cToken17 = get(inputs, 17).cToken;
        cToken18 = get(inputs, 18).cToken;
        cToken19 = get(inputs, 19).cToken;
        cToken20 = get(inputs, 20).cToken;
        cToken21 = get(inputs, 21).cToken;
        cToken22 = get(inputs, 22).cToken;
        cToken23 = get(inputs, 23).cToken;
        cToken24 = get(inputs, 24).cToken;
        cToken25 = get(inputs, 25).cToken;
        cToken26 = get(inputs, 26).cToken;
        cToken27 = get(inputs, 27).cToken;
        cToken28 = get(inputs, 28).cToken;
        cToken29 = get(inputs, 29).cToken;

        underlying00 = get(inputs, 0).underlying;
        underlying01 = get(inputs, 1).underlying;
        underlying02 = get(inputs, 2).underlying;
        underlying03 = get(inputs, 3).underlying;
        underlying04 = get(inputs, 4).underlying;
        underlying05 = get(inputs, 5).underlying;
        underlying06 = get(inputs, 6).underlying;
        underlying07 = get(inputs, 7).underlying;
        underlying08 = get(inputs, 8).underlying;
        underlying09 = get(inputs, 9).underlying;
        underlying10 = get(inputs, 10).underlying;
        underlying11 = get(inputs, 11).underlying;
        underlying12 = get(inputs, 12).underlying;
        underlying13 = get(inputs, 13).underlying;
        underlying14 = get(inputs, 14).underlying;
        underlying15 = get(inputs, 15).underlying;
        underlying16 = get(inputs, 16).underlying;
        underlying17 = get(inputs, 17).underlying;
        underlying18 = get(inputs, 18).underlying;
        underlying19 = get(inputs, 19).underlying;
        underlying20 = get(inputs, 20).underlying;
        underlying21 = get(inputs, 21).underlying;
        underlying22 = get(inputs, 22).underlying;
        underlying23 = get(inputs, 23).underlying;
        underlying24 = get(inputs, 24).underlying;
        underlying25 = get(inputs, 25).underlying;
        underlying26 = get(inputs, 26).underlying;
        underlying27 = get(inputs, 27).underlying;
        underlying28 = get(inputs, 28).underlying;
        underlying29 = get(inputs, 29).underlying;

        symbolWord00 = symbolToWord(get(inputs, 0).symbol);
        symbolWord01 = symbolToWord(get(inputs, 1).symbol);
        symbolWord02 = symbolToWord(get(inputs, 2).symbol);
        symbolWord03 = symbolToWord(get(inputs, 3).symbol);
        symbolWord04 = symbolToWord(get(inputs, 4).symbol);
        symbolWord05 = symbolToWord(get(inputs, 5).symbol);
        symbolWord06 = symbolToWord(get(inputs, 6).symbol);
        symbolWord07 = symbolToWord(get(inputs, 7).symbol);
        symbolWord08 = symbolToWord(get(inputs, 8).symbol);
        symbolWord09 = symbolToWord(get(inputs, 9).symbol);
        symbolWord10 = symbolToWord(get(inputs, 10).symbol);
        symbolWord11 = symbolToWord(get(inputs, 11).symbol);
        symbolWord12 = symbolToWord(get(inputs, 12).symbol);
        symbolWord13 = symbolToWord(get(inputs, 13).symbol);
        symbolWord14 = symbolToWord(get(inputs, 14).symbol);
        symbolWord15 = symbolToWord(get(inputs, 15).symbol);
        symbolWord16 = symbolToWord(get(inputs, 16).symbol);
        symbolWord17 = symbolToWord(get(inputs, 17).symbol);
        symbolWord18 = symbolToWord(get(inputs, 18).symbol);
        symbolWord19 = symbolToWord(get(inputs, 19).symbol);
        symbolWord20 = symbolToWord(get(inputs, 20).symbol);
        symbolWord21 = symbolToWord(get(inputs, 21).symbol);
        symbolWord22 = symbolToWord(get(inputs, 22).symbol);
        symbolWord23 = symbolToWord(get(inputs, 23).symbol);
        symbolWord24 = symbolToWord(get(inputs, 24).symbol);
        symbolWord25 = symbolToWord(get(inputs, 25).symbol);
        symbolWord26 = symbolToWord(get(inputs, 26).symbol);
        symbolWord27 = symbolToWord(get(inputs, 27).symbol);
        symbolWord28 = symbolToWord(get(inputs, 28).symbol);
        symbolWord29 = symbolToWord(get(inputs, 29).symbol);

        baseUnit00 = get(inputs, 0).baseUnit;
        baseUnit01 = get(inputs, 1).baseUnit;
        baseUnit02 = get(inputs, 2).baseUnit;
        baseUnit03 = get(inputs, 3).baseUnit;
        baseUnit04 = get(inputs, 4).baseUnit;
        baseUnit05 = get(inputs, 5).baseUnit;
        baseUnit06 = get(inputs, 6).baseUnit;
        baseUnit07 = get(inputs, 7).baseUnit;
        baseUnit08 = get(inputs, 8).baseUnit;
        baseUnit09 = get(inputs, 9).baseUnit;
        baseUnit10 = get(inputs, 10).baseUnit;
        baseUnit11 = get(inputs, 11).baseUnit;
        baseUnit12 = get(inputs, 12).baseUnit;
        baseUnit13 = get(inputs, 13).baseUnit;
        baseUnit14 = get(inputs, 14).baseUnit;
        baseUnit15 = get(inputs, 15).baseUnit;
        baseUnit16 = get(inputs, 16).baseUnit;
        baseUnit17 = get(inputs, 17).baseUnit;
        baseUnit18 = get(inputs, 18).baseUnit;
        baseUnit19 = get(inputs, 19).baseUnit;
        baseUnit20 = get(inputs, 20).baseUnit;
        baseUnit21 = get(inputs, 21).baseUnit;
        baseUnit22 = get(inputs, 22).baseUnit;
        baseUnit23 = get(inputs, 23).baseUnit;
        baseUnit24 = get(inputs, 24).baseUnit;
        baseUnit25 = get(inputs, 25).baseUnit;
        baseUnit26 = get(inputs, 26).baseUnit;
        baseUnit27 = get(inputs, 27).baseUnit;
        baseUnit28 = get(inputs, 28).baseUnit;
        baseUnit29 = get(inputs, 29).baseUnit;

        priceSource00 = get(inputs, 0).priceSource;
        priceSource01 = get(inputs, 1).priceSource;
        priceSource02 = get(inputs, 2).priceSource;
        priceSource03 = get(inputs, 3).priceSource;
        priceSource04 = get(inputs, 4).priceSource;
        priceSource05 = get(inputs, 5).priceSource;
        priceSource06 = get(inputs, 6).priceSource;
        priceSource07 = get(inputs, 7).priceSource;
        priceSource08 = get(inputs, 8).priceSource;
        priceSource09 = get(inputs, 9).priceSource;
        priceSource10 = get(inputs, 10).priceSource;
        priceSource11 = get(inputs, 11).priceSource;
        priceSource12 = get(inputs, 12).priceSource;
        priceSource13 = get(inputs, 13).priceSource;
        priceSource14 = get(inputs, 14).priceSource;
        priceSource15 = get(inputs, 15).priceSource;
        priceSource16 = get(inputs, 16).priceSource;
        priceSource17 = get(inputs, 17).priceSource;
        priceSource18 = get(inputs, 18).priceSource;
        priceSource19 = get(inputs, 19).priceSource;
        priceSource20 = get(inputs, 20).priceSource;
        priceSource21 = get(inputs, 21).priceSource;
        priceSource22 = get(inputs, 22).priceSource;
        priceSource23 = get(inputs, 23).priceSource;
        priceSource24 = get(inputs, 24).priceSource;
        priceSource25 = get(inputs, 25).priceSource;
        priceSource26 = get(inputs, 26).priceSource;
        priceSource27 = get(inputs, 27).priceSource;
        priceSource28 = get(inputs, 28).priceSource;
        priceSource29 = get(inputs, 29).priceSource;

        fixedPrice00 = get(inputs, 0).fixedPrice;
        fixedPrice01 = get(inputs, 1).fixedPrice;
        fixedPrice02 = get(inputs, 2).fixedPrice;
        fixedPrice03 = get(inputs, 3).fixedPrice;
        fixedPrice04 = get(inputs, 4).fixedPrice;
        fixedPrice05 = get(inputs, 5).fixedPrice;
        fixedPrice06 = get(inputs, 6).fixedPrice;
        fixedPrice07 = get(inputs, 7).fixedPrice;
        fixedPrice08 = get(inputs, 8).fixedPrice;
        fixedPrice09 = get(inputs, 9).fixedPrice;
        fixedPrice10 = get(inputs, 10).fixedPrice;
        fixedPrice11 = get(inputs, 11).fixedPrice;
        fixedPrice12 = get(inputs, 12).fixedPrice;
        fixedPrice13 = get(inputs, 13).fixedPrice;
        fixedPrice14 = get(inputs, 14).fixedPrice;
        fixedPrice15 = get(inputs, 15).fixedPrice;
        fixedPrice16 = get(inputs, 16).fixedPrice;
        fixedPrice17 = get(inputs, 17).fixedPrice;
        fixedPrice18 = get(inputs, 18).fixedPrice;
        fixedPrice19 = get(inputs, 19).fixedPrice;
        fixedPrice20 = get(inputs, 20).fixedPrice;
        fixedPrice21 = get(inputs, 21).fixedPrice;
        fixedPrice22 = get(inputs, 22).fixedPrice;
        fixedPrice23 = get(inputs, 23).fixedPrice;
        fixedPrice24 = get(inputs, 24).fixedPrice;
        fixedPrice25 = get(inputs, 25).fixedPrice;
        fixedPrice26 = get(inputs, 26).fixedPrice;
        fixedPrice27 = get(inputs, 27).fixedPrice;
        fixedPrice28 = get(inputs, 28).fixedPrice;
        fixedPrice29 = get(inputs, 29).fixedPrice;

        uniswapMarket00 = get(inputs, 0).uniswapMarket;
        uniswapMarket01 = get(inputs, 1).uniswapMarket;
        uniswapMarket02 = get(inputs, 2).uniswapMarket;
        uniswapMarket03 = get(inputs, 3).uniswapMarket;
        uniswapMarket04 = get(inputs, 4).uniswapMarket;
        uniswapMarket05 = get(inputs, 5).uniswapMarket;
        uniswapMarket06 = get(inputs, 6).uniswapMarket;
        uniswapMarket07 = get(inputs, 7).uniswapMarket;
        uniswapMarket08 = get(inputs, 8).uniswapMarket;
        uniswapMarket09 = get(inputs, 9).uniswapMarket;
        uniswapMarket10 = get(inputs, 10).uniswapMarket;
        uniswapMarket11 = get(inputs, 11).uniswapMarket;
        uniswapMarket12 = get(inputs, 12).uniswapMarket;
        uniswapMarket13 = get(inputs, 13).uniswapMarket;
        uniswapMarket14 = get(inputs, 14).uniswapMarket;
        uniswapMarket15 = get(inputs, 15).uniswapMarket;
        uniswapMarket16 = get(inputs, 16).uniswapMarket;
        uniswapMarket17 = get(inputs, 17).uniswapMarket;
        uniswapMarket18 = get(inputs, 18).uniswapMarket;
        uniswapMarket19 = get(inputs, 19).uniswapMarket;
        uniswapMarket20 = get(inputs, 20).uniswapMarket;
        uniswapMarket21 = get(inputs, 21).uniswapMarket;
        uniswapMarket22 = get(inputs, 22).uniswapMarket;
        uniswapMarket23 = get(inputs, 23).uniswapMarket;
        uniswapMarket24 = get(inputs, 24).uniswapMarket;
        uniswapMarket25 = get(inputs, 25).uniswapMarket;
        uniswapMarket26 = get(inputs, 26).uniswapMarket;
        uniswapMarket27 = get(inputs, 27).uniswapMarket;
        uniswapMarket28 = get(inputs, 28).uniswapMarket;
        uniswapMarket29 = get(inputs, 29).uniswapMarket;

        isUniswapReversed00 = get(inputs, 0).isUniswapReversed;
        isUniswapReversed01 = get(inputs, 1).isUniswapReversed;
        isUniswapReversed02 = get(inputs, 2).isUniswapReversed;
        isUniswapReversed03 = get(inputs, 3).isUniswapReversed;
        isUniswapReversed04 = get(inputs, 4).isUniswapReversed;
        isUniswapReversed05 = get(inputs, 5).isUniswapReversed;
        isUniswapReversed06 = get(inputs, 6).isUniswapReversed;
        isUniswapReversed07 = get(inputs, 7).isUniswapReversed;
        isUniswapReversed08 = get(inputs, 8).isUniswapReversed;
        isUniswapReversed09 = get(inputs, 9).isUniswapReversed;
        isUniswapReversed10 = get(inputs, 10).isUniswapReversed;
        isUniswapReversed11 = get(inputs, 11).isUniswapReversed;
        isUniswapReversed12 = get(inputs, 12).isUniswapReversed;
        isUniswapReversed13 = get(inputs, 13).isUniswapReversed;
        isUniswapReversed14 = get(inputs, 14).isUniswapReversed;
        isUniswapReversed15 = get(inputs, 15).isUniswapReversed;
        isUniswapReversed16 = get(inputs, 16).isUniswapReversed;
        isUniswapReversed17 = get(inputs, 17).isUniswapReversed;
        isUniswapReversed18 = get(inputs, 18).isUniswapReversed;
        isUniswapReversed19 = get(inputs, 19).isUniswapReversed;
        isUniswapReversed20 = get(inputs, 20).isUniswapReversed;
        isUniswapReversed21 = get(inputs, 21).isUniswapReversed;
        isUniswapReversed22 = get(inputs, 22).isUniswapReversed;
        isUniswapReversed23 = get(inputs, 23).isUniswapReversed;
        isUniswapReversed24 = get(inputs, 24).isUniswapReversed;
        isUniswapReversed25 = get(inputs, 25).isUniswapReversed;
        isUniswapReversed26 = get(inputs, 26).isUniswapReversed;
        isUniswapReversed27 = get(inputs, 27).isUniswapReversed;
        isUniswapReversed28 = get(inputs, 28).isUniswapReversed;
        isUniswapReversed29 = get(inputs, 29).isUniswapReversed;
    }

    function get(TokenConfigInput[] memory inputs, uint i) internal pure returns (TokenConfigInput memory) {
        if (i < inputs.length)
            return inputs[i];
        return TokenConfigInput({
            symbol: "",
            cToken: address(0),
            underlying: address(0),
            baseUnit: uint256(0),
            priceSource: PriceSource(0),
            fixedPrice: uint256(0),
            uniswapMarket: address(0),
            isUniswapReversed: false
        });
    }

    function getCTokenIndex(address cToken) internal view returns (uint) {
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
        if (cToken == cToken29) return 29;

        return uint(-1);
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

        return uint(-1);
    }

    function getSymbolWordIndex(bytes32 symbolWord) internal view returns (uint) {
        if (symbolWord == symbolWord00) return 0;
        if (symbolWord == symbolWord01) return 1;
        if (symbolWord == symbolWord02) return 2;
        if (symbolWord == symbolWord03) return 3;
        if (symbolWord == symbolWord04) return 4;
        if (symbolWord == symbolWord05) return 5;
        if (symbolWord == symbolWord06) return 6;
        if (symbolWord == symbolWord07) return 7;
        if (symbolWord == symbolWord08) return 8;
        if (symbolWord == symbolWord09) return 9;
        if (symbolWord == symbolWord10) return 10;
        if (symbolWord == symbolWord11) return 11;
        if (symbolWord == symbolWord12) return 12;
        if (symbolWord == symbolWord13) return 13;
        if (symbolWord == symbolWord14) return 14;
        if (symbolWord == symbolWord15) return 15;
        if (symbolWord == symbolWord16) return 16;
        if (symbolWord == symbolWord17) return 17;
        if (symbolWord == symbolWord18) return 18;
        if (symbolWord == symbolWord19) return 19;
        if (symbolWord == symbolWord20) return 20;
        if (symbolWord == symbolWord21) return 21;
        if (symbolWord == symbolWord22) return 22;
        if (symbolWord == symbolWord23) return 23;
        if (symbolWord == symbolWord24) return 24;
        if (symbolWord == symbolWord25) return 25;
        if (symbolWord == symbolWord26) return 26;
        if (symbolWord == symbolWord27) return 27;
        if (symbolWord == symbolWord28) return 28;
        if (symbolWord == symbolWord29) return 29;

        return uint(-1);
    }

    function getTokenConfig(uint i) public view returns (TokenConfig memory) {
        require(i < numTokens, "token config not found");

        if (i == 0) return TokenConfig({cToken: cToken00, underlying: underlying00, symbolWord: symbolWord00, baseUnit: baseUnit00, priceSource: priceSource00, fixedPrice: fixedPrice00, uniswapMarket: uniswapMarket00, isUniswapReversed: isUniswapReversed00});
        if (i == 1) return TokenConfig({cToken: cToken01, underlying: underlying01, symbolWord: symbolWord01, baseUnit: baseUnit01, priceSource: priceSource01, fixedPrice: fixedPrice01, uniswapMarket: uniswapMarket01, isUniswapReversed: isUniswapReversed01});
        if (i == 2) return TokenConfig({cToken: cToken02, underlying: underlying02, symbolWord: symbolWord02, baseUnit: baseUnit02, priceSource: priceSource02, fixedPrice: fixedPrice02, uniswapMarket: uniswapMarket02, isUniswapReversed: isUniswapReversed02});
        if (i == 3) return TokenConfig({cToken: cToken03, underlying: underlying03, symbolWord: symbolWord03, baseUnit: baseUnit03, priceSource: priceSource03, fixedPrice: fixedPrice03, uniswapMarket: uniswapMarket03, isUniswapReversed: isUniswapReversed03});
        if (i == 4) return TokenConfig({cToken: cToken04, underlying: underlying04, symbolWord: symbolWord04, baseUnit: baseUnit04, priceSource: priceSource04, fixedPrice: fixedPrice04, uniswapMarket: uniswapMarket04, isUniswapReversed: isUniswapReversed04});
        if (i == 5) return TokenConfig({cToken: cToken05, underlying: underlying05, symbolWord: symbolWord05, baseUnit: baseUnit05, priceSource: priceSource05, fixedPrice: fixedPrice05, uniswapMarket: uniswapMarket05, isUniswapReversed: isUniswapReversed05});
        if (i == 6) return TokenConfig({cToken: cToken06, underlying: underlying06, symbolWord: symbolWord06, baseUnit: baseUnit06, priceSource: priceSource06, fixedPrice: fixedPrice06, uniswapMarket: uniswapMarket06, isUniswapReversed: isUniswapReversed06});
        if (i == 7) return TokenConfig({cToken: cToken07, underlying: underlying07, symbolWord: symbolWord07, baseUnit: baseUnit07, priceSource: priceSource07, fixedPrice: fixedPrice07, uniswapMarket: uniswapMarket07, isUniswapReversed: isUniswapReversed07});
        if (i == 8) return TokenConfig({cToken: cToken08, underlying: underlying08, symbolWord: symbolWord08, baseUnit: baseUnit08, priceSource: priceSource08, fixedPrice: fixedPrice08, uniswapMarket: uniswapMarket08, isUniswapReversed: isUniswapReversed08});
        if (i == 9) return TokenConfig({cToken: cToken09, underlying: underlying09, symbolWord: symbolWord09, baseUnit: baseUnit09, priceSource: priceSource09, fixedPrice: fixedPrice09, uniswapMarket: uniswapMarket09, isUniswapReversed: isUniswapReversed09});

        if (i == 10) return TokenConfig({cToken: cToken10, underlying: underlying10, symbolWord: symbolWord10, baseUnit: baseUnit10, priceSource: priceSource10, fixedPrice: fixedPrice10, uniswapMarket: uniswapMarket10, isUniswapReversed: isUniswapReversed10});
        if (i == 11) return TokenConfig({cToken: cToken11, underlying: underlying11, symbolWord: symbolWord11, baseUnit: baseUnit11, priceSource: priceSource11, fixedPrice: fixedPrice11, uniswapMarket: uniswapMarket11, isUniswapReversed: isUniswapReversed11});
        if (i == 12) return TokenConfig({cToken: cToken12, underlying: underlying12, symbolWord: symbolWord12, baseUnit: baseUnit12, priceSource: priceSource12, fixedPrice: fixedPrice12, uniswapMarket: uniswapMarket12, isUniswapReversed: isUniswapReversed12});
        if (i == 13) return TokenConfig({cToken: cToken13, underlying: underlying13, symbolWord: symbolWord13, baseUnit: baseUnit13, priceSource: priceSource13, fixedPrice: fixedPrice13, uniswapMarket: uniswapMarket13, isUniswapReversed: isUniswapReversed13});
        if (i == 14) return TokenConfig({cToken: cToken14, underlying: underlying14, symbolWord: symbolWord14, baseUnit: baseUnit14, priceSource: priceSource14, fixedPrice: fixedPrice14, uniswapMarket: uniswapMarket14, isUniswapReversed: isUniswapReversed14});
        if (i == 15) return TokenConfig({cToken: cToken15, underlying: underlying15, symbolWord: symbolWord15, baseUnit: baseUnit15, priceSource: priceSource15, fixedPrice: fixedPrice15, uniswapMarket: uniswapMarket15, isUniswapReversed: isUniswapReversed15});
        if (i == 16) return TokenConfig({cToken: cToken16, underlying: underlying16, symbolWord: symbolWord16, baseUnit: baseUnit16, priceSource: priceSource16, fixedPrice: fixedPrice16, uniswapMarket: uniswapMarket16, isUniswapReversed: isUniswapReversed16});
        if (i == 17) return TokenConfig({cToken: cToken17, underlying: underlying17, symbolWord: symbolWord17, baseUnit: baseUnit17, priceSource: priceSource17, fixedPrice: fixedPrice17, uniswapMarket: uniswapMarket17, isUniswapReversed: isUniswapReversed17});
        if (i == 18) return TokenConfig({cToken: cToken18, underlying: underlying18, symbolWord: symbolWord18, baseUnit: baseUnit18, priceSource: priceSource18, fixedPrice: fixedPrice18, uniswapMarket: uniswapMarket18, isUniswapReversed: isUniswapReversed18});
        if (i == 19) return TokenConfig({cToken: cToken19, underlying: underlying19, symbolWord: symbolWord19, baseUnit: baseUnit19, priceSource: priceSource19, fixedPrice: fixedPrice19, uniswapMarket: uniswapMarket19, isUniswapReversed: isUniswapReversed19});

        if (i == 20) return TokenConfig({cToken: cToken20, underlying: underlying20, symbolWord: symbolWord20, baseUnit: baseUnit20, priceSource: priceSource20, fixedPrice: fixedPrice20, uniswapMarket: uniswapMarket20, isUniswapReversed: isUniswapReversed20});
        if (i == 21) return TokenConfig({cToken: cToken21, underlying: underlying21, symbolWord: symbolWord21, baseUnit: baseUnit21, priceSource: priceSource21, fixedPrice: fixedPrice21, uniswapMarket: uniswapMarket21, isUniswapReversed: isUniswapReversed21});
        if (i == 22) return TokenConfig({cToken: cToken22, underlying: underlying22, symbolWord: symbolWord22, baseUnit: baseUnit22, priceSource: priceSource22, fixedPrice: fixedPrice22, uniswapMarket: uniswapMarket22, isUniswapReversed: isUniswapReversed22});
        if (i == 23) return TokenConfig({cToken: cToken23, underlying: underlying23, symbolWord: symbolWord23, baseUnit: baseUnit23, priceSource: priceSource23, fixedPrice: fixedPrice23, uniswapMarket: uniswapMarket23, isUniswapReversed: isUniswapReversed23});
        if (i == 24) return TokenConfig({cToken: cToken24, underlying: underlying24, symbolWord: symbolWord24, baseUnit: baseUnit24, priceSource: priceSource24, fixedPrice: fixedPrice24, uniswapMarket: uniswapMarket24, isUniswapReversed: isUniswapReversed24});
        if (i == 25) return TokenConfig({cToken: cToken25, underlying: underlying25, symbolWord: symbolWord25, baseUnit: baseUnit25, priceSource: priceSource25, fixedPrice: fixedPrice25, uniswapMarket: uniswapMarket25, isUniswapReversed: isUniswapReversed25});
        if (i == 26) return TokenConfig({cToken: cToken26, underlying: underlying26, symbolWord: symbolWord26, baseUnit: baseUnit26, priceSource: priceSource26, fixedPrice: fixedPrice26, uniswapMarket: uniswapMarket26, isUniswapReversed: isUniswapReversed26});
        if (i == 27) return TokenConfig({cToken: cToken27, underlying: underlying27, symbolWord: symbolWord27, baseUnit: baseUnit27, priceSource: priceSource27, fixedPrice: fixedPrice27, uniswapMarket: uniswapMarket27, isUniswapReversed: isUniswapReversed27});
        if (i == 28) return TokenConfig({cToken: cToken28, underlying: underlying28, symbolWord: symbolWord28, baseUnit: baseUnit28, priceSource: priceSource28, fixedPrice: fixedPrice28, uniswapMarket: uniswapMarket28, isUniswapReversed: isUniswapReversed28});
        if (i == 29) return TokenConfig({cToken: cToken29, underlying: underlying29, symbolWord: symbolWord29, baseUnit: baseUnit29, priceSource: priceSource29, fixedPrice: fixedPrice29, uniswapMarket: uniswapMarket29, isUniswapReversed: isUniswapReversed29});
    }

    function getTokenConfigBySymbol(string memory symbol) public view returns (TokenConfig memory) {
        return getTokenConfigBySymbolWord(symbolToWord(symbol));
    }

    function getTokenConfigBySymbolWord(bytes32 symbolWord) public view returns (TokenConfig memory) {
        uint index = getSymbolWordIndex(symbolWord);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        revert("token config not found");
    }

    function getTokenConfigByCToken(address cToken) public view returns (TokenConfig memory) {
        uint index = getCTokenIndex(cToken);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        return getTokenConfigByUnderlying(CErc20(cToken).underlying());
    }

    function getTokenConfigByUnderlying(address underlying) public view returns (TokenConfig memory) {
        uint index = getUnderlyingIndex(underlying);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        revert("token config not found");
    }

    function symbolToWord(string memory symbol) internal pure returns (bytes32 symbolWord) {
        require(bytes(symbol).length <= 32, "symbol too long");
        assembly { symbolWord := mload(add(symbol, 32)) }
    }
}