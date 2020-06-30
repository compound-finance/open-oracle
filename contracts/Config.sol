pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

interface CErc20 {
    function underlying() external view returns (address);
}

contract Config {
    struct TokenConfig {
        address cToken;
        address underlying;
        bytes32 symbolHash;
        uint256 baseUnit;
    }

    uint public immutable numTokens;


    address internal immutable cToken00;
    address internal immutable underlying00;
    bytes32 internal immutable symbolHash00;
    uint internal immutable baseUnit00;
    address internal immutable cToken01;
    address internal immutable underlying01;
    bytes32 internal immutable symbolHash01;
    uint internal immutable baseUnit01;
    address internal immutable cToken02;
    address internal immutable underlying02;
    bytes32 internal immutable symbolHash02;
    uint internal immutable baseUnit02;
    address internal immutable cToken03;
    address internal immutable underlying03;
    bytes32 internal immutable symbolHash03;
    uint internal immutable baseUnit03;
    address internal immutable cToken04;
    address internal immutable underlying04;
    bytes32 internal immutable symbolHash04;
    uint internal immutable baseUnit04;
    address internal immutable cToken05;
    address internal immutable underlying05;
    bytes32 internal immutable symbolHash05;
    uint internal immutable baseUnit05;
    address internal immutable cToken06;
    address internal immutable underlying06;
    bytes32 internal immutable symbolHash06;
    uint internal immutable baseUnit06;
    address internal immutable cToken07;
    address internal immutable underlying07;
    bytes32 internal immutable symbolHash07;
    uint internal immutable baseUnit07;
    address internal immutable cToken08;
    address internal immutable underlying08;
    bytes32 internal immutable symbolHash08;
    uint internal immutable baseUnit08;
    address internal immutable cToken09;
    address internal immutable underlying09;
    bytes32 internal immutable symbolHash09;
    uint internal immutable baseUnit09;
    address internal immutable cToken10;
    address internal immutable underlying10;
    bytes32 internal immutable symbolHash10;
    uint internal immutable baseUnit10;
    address internal immutable cToken11;
    address internal immutable underlying11;
    bytes32 internal immutable symbolHash11;
    uint internal immutable baseUnit11;
    address internal immutable cToken12;
    address internal immutable underlying12;
    bytes32 internal immutable symbolHash12;
    uint internal immutable baseUnit12;
    address internal immutable cToken13;
    address internal immutable underlying13;
    bytes32 internal immutable symbolHash13;
    uint internal immutable baseUnit13;
    address internal immutable cToken14;
    address internal immutable underlying14;
    bytes32 internal immutable symbolHash14;
    uint internal immutable baseUnit14;
    address internal immutable cToken15;
    address internal immutable underlying15;
    bytes32 internal immutable symbolHash15;
    uint internal immutable baseUnit15;
    address internal immutable cToken16;
    address internal immutable underlying16;
    bytes32 internal immutable symbolHash16;
    uint internal immutable baseUnit16;
    address internal immutable cToken17;
    address internal immutable underlying17;
    bytes32 internal immutable symbolHash17;
    uint internal immutable baseUnit17;
    address internal immutable cToken18;
    address internal immutable underlying18;
    bytes32 internal immutable symbolHash18;
    uint internal immutable baseUnit18;
    address internal immutable cToken19;
    address internal immutable underlying19;
    bytes32 internal immutable symbolHash19;
    uint internal immutable baseUnit19;
    address internal immutable cToken20;
    address internal immutable underlying20;
    bytes32 internal immutable symbolHash20;
    uint internal immutable baseUnit20;
    address internal immutable cToken21;
    address internal immutable underlying21;
    bytes32 internal immutable symbolHash21;
    uint internal immutable baseUnit21;
    address internal immutable cToken22;
    address internal immutable underlying22;
    bytes32 internal immutable symbolHash22;
    uint internal immutable baseUnit22;
    address internal immutable cToken23;
    address internal immutable underlying23;
    bytes32 internal immutable symbolHash23;
    uint internal immutable baseUnit23;
    address internal immutable cToken24;
    address internal immutable underlying24;
    bytes32 internal immutable symbolHash24;
    uint internal immutable baseUnit24;
    address internal immutable cToken25;
    address internal immutable underlying25;
    bytes32 internal immutable symbolHash25;
    uint internal immutable baseUnit25;
    address internal immutable cToken26;
    address internal immutable underlying26;
    bytes32 internal immutable symbolHash26;
    uint internal immutable baseUnit26;
    address internal immutable cToken27;
    address internal immutable underlying27;
    bytes32 internal immutable symbolHash27;
    uint internal immutable baseUnit27;
    address internal immutable cToken28;
    address internal immutable underlying28;
    bytes32 internal immutable symbolHash28;
    uint internal immutable baseUnit28;
    address internal immutable cToken29;
    address internal immutable underlying29;
    bytes32 internal immutable symbolHash29;
    uint internal immutable baseUnit29;
    address internal immutable cToken30;
    address internal immutable underlying30;
    bytes32 internal immutable symbolHash30;
    uint internal immutable baseUnit30;
    // XXX etc, 1 for each field

    constructor(TokenConfig[] memory configs) public {
        require(configs.length <= 30, "too many configs");
        numTokens = configs.length;

        // 
        cToken00 = get(configs, 0).cToken;
        underlying00 = get(configs, 0).underlying;
        symbolHash00 = get(configs, 0).symbolHash;
        baseUnit00 = get(configs, 0).baseUnit;

        cToken01 = get(configs, 0).cToken;
        underlying01 = get(configs, 0).underlying;
        symbolHash01 = get(configs, 0).symbolHash;
        baseUnit01 = get(configs, 0).baseUnit;

        cToken02 = get(configs, 0).cToken;
        underlying02 = get(configs, 0).underlying;
        symbolHash02 = get(configs, 0).symbolHash;
        baseUnit02 = get(configs, 0).baseUnit;

        cToken03 = get(configs, 0).cToken;
        underlying03 = get(configs, 0).underlying;
        symbolHash03 = get(configs, 0).symbolHash;
        baseUnit03 = get(configs, 0).baseUnit;

        cToken04 = get(configs, 0).cToken;
        underlying04 = get(configs, 0).underlying;
        symbolHash04 = get(configs, 0).symbolHash;
        baseUnit04 = get(configs, 0).baseUnit;

        cToken05 = get(configs, 0).cToken;
        underlying05 = get(configs, 0).underlying;
        symbolHash05 = get(configs, 0).symbolHash;
        baseUnit05 = get(configs, 0).baseUnit;

        cToken06 = get(configs, 0).cToken;
        underlying06 = get(configs, 0).underlying;
        symbolHash06 = get(configs, 0).symbolHash;
        baseUnit06 = get(configs, 0).baseUnit;

        cToken07 = get(configs, 0).cToken;
        underlying07 = get(configs, 0).underlying;
        symbolHash07 = get(configs, 0).symbolHash;
        baseUnit07 = get(configs, 0).baseUnit;

        cToken08 = get(configs, 0).cToken;
        underlying08 = get(configs, 0).underlying;
        symbolHash08 = get(configs, 0).symbolHash;
        baseUnit08 = get(configs, 0).baseUnit;

        cToken09 = get(configs, 0).cToken;
        underlying09 = get(configs, 0).underlying;
        symbolHash09 = get(configs, 0).symbolHash;
        baseUnit09 = get(configs, 0).baseUnit;

        cToken10 = get(configs, 0).cToken;
        underlying10 = get(configs, 0).underlying;
        symbolHash10 = get(configs, 0).symbolHash;
        baseUnit10 = get(configs, 0).baseUnit;

        cToken11 = get(configs, 0).cToken;
        underlying11 = get(configs, 0).underlying;
        symbolHash11 = get(configs, 0).symbolHash;
        baseUnit11 = get(configs, 0).baseUnit;

        cToken12 = get(configs, 0).cToken;
        underlying12 = get(configs, 0).underlying;
        symbolHash12 = get(configs, 0).symbolHash;
        baseUnit12 = get(configs, 0).baseUnit;

        cToken13 = get(configs, 0).cToken;
        underlying13 = get(configs, 0).underlying;
        symbolHash13 = get(configs, 0).symbolHash;
        baseUnit13 = get(configs, 0).baseUnit;

        cToken14 = get(configs, 0).cToken;
        underlying14 = get(configs, 0).underlying;
        symbolHash14 = get(configs, 0).symbolHash;
        baseUnit14 = get(configs, 0).baseUnit;

        cToken15 = get(configs, 0).cToken;
        underlying15 = get(configs, 0).underlying;
        symbolHash15 = get(configs, 0).symbolHash;
        baseUnit15 = get(configs, 0).baseUnit;

        cToken16 = get(configs, 0).cToken;
        underlying16 = get(configs, 0).underlying;
        symbolHash16 = get(configs, 0).symbolHash;
        baseUnit16 = get(configs, 0).baseUnit;

        cToken17 = get(configs, 0).cToken;
        underlying17 = get(configs, 0).underlying;
        symbolHash17 = get(configs, 0).symbolHash;
        baseUnit17 = get(configs, 0).baseUnit;

        cToken18 = get(configs, 0).cToken;
        underlying18 = get(configs, 0).underlying;
        symbolHash18 = get(configs, 0).symbolHash;
        baseUnit18 = get(configs, 0).baseUnit;

        cToken19 = get(configs, 0).cToken;
        underlying19 = get(configs, 0).underlying;
        symbolHash19 = get(configs, 0).symbolHash;
        baseUnit19 = get(configs, 0).baseUnit;

        cToken20 = get(configs, 0).cToken;
        underlying20 = get(configs, 0).underlying;
        symbolHash20 = get(configs, 0).symbolHash;
        baseUnit20 = get(configs, 0).baseUnit;

        cToken21 = get(configs, 0).cToken;
        underlying21 = get(configs, 0).underlying;
        symbolHash21 = get(configs, 0).symbolHash;
        baseUnit21 = get(configs, 0).baseUnit;

        cToken22 = get(configs, 0).cToken;
        underlying22 = get(configs, 0).underlying;
        symbolHash22 = get(configs, 0).symbolHash;
        baseUnit22 = get(configs, 0).baseUnit;

        cToken23 = get(configs, 0).cToken;
        underlying23 = get(configs, 0).underlying;
        symbolHash23 = get(configs, 0).symbolHash;
        baseUnit23 = get(configs, 0).baseUnit;

        cToken24 = get(configs, 0).cToken;
        underlying24 = get(configs, 0).underlying;
        symbolHash24 = get(configs, 0).symbolHash;
        baseUnit24 = get(configs, 0).baseUnit;

        cToken25 = get(configs, 0).cToken;
        underlying25 = get(configs, 0).underlying;
        symbolHash25 = get(configs, 0).symbolHash;
        baseUnit25 = get(configs, 0).baseUnit;

        cToken26 = get(configs, 0).cToken;
        underlying26 = get(configs, 0).underlying;
        symbolHash26 = get(configs, 0).symbolHash;
        baseUnit26 = get(configs, 0).baseUnit;

        cToken27 = get(configs, 0).cToken;
        underlying27 = get(configs, 0).underlying;
        symbolHash27 = get(configs, 0).symbolHash;
        baseUnit27 = get(configs, 0).baseUnit;

        cToken28 = get(configs, 0).cToken;
        underlying28 = get(configs, 0).underlying;
        symbolHash28 = get(configs, 0).symbolHash;
        baseUnit28 = get(configs, 0).baseUnit;

        cToken29 = get(configs, 0).cToken;
        underlying29 = get(configs, 0).underlying;
        symbolHash29 = get(configs, 0).symbolHash;
        baseUnit29 = get(configs, 0).baseUnit;

        cToken30 = get(configs, 0).cToken;
        underlying30 = get(configs, 0).underlying;
        symbolHash30 = get(configs, 0).symbolHash;
        baseUnit30 = get(configs, 0).baseUnit;
    }

    function get(TokenConfig[] memory configs, uint i) internal pure returns (TokenConfig memory) {
        if (i < configs.length)
            return configs[i];
        return TokenConfig({
            cToken: address(0),
            underlying: address(0),
            symbolHash: bytes32(0),
            baseUnit: uint256(0)
        });
    }

    function getCToken(uint i) internal view returns (address) {
        // 
        if (i == 0) return cToken00;
        if (i == 1) return cToken01;
        if (i == 2) return cToken02;
        if (i == 3) return cToken03;
        if (i == 4) return cToken04;
        if (i == 5) return cToken05;
        if (i == 6) return cToken06;
        if (i == 7) return cToken07;
        if (i == 8) return cToken08;
        if (i == 9) return cToken09;
        if (i == 10) return cToken10;
        if (i == 11) return cToken11;
        if (i == 12) return cToken12;
        if (i == 13) return cToken13;
        if (i == 14) return cToken14;
        if (i == 15) return cToken15;
        if (i == 16) return cToken16;
        if (i == 17) return cToken17;
        if (i == 18) return cToken18;
        if (i == 19) return cToken19;
        if (i == 20) return cToken20;
        if (i == 21) return cToken21;
        if (i == 22) return cToken22;
        if (i == 23) return cToken23;
        if (i == 24) return cToken24;
        if (i == 25) return cToken25;
        if (i == 26) return cToken26;
        if (i == 27) return cToken27;
        if (i == 28) return cToken28;
        if (i == 29) return cToken29;
        if (i == 30) return cToken30;

        revert("lookup index too large");
    }

    function getCTokenIndex(address cToken) public view returns (uint) {
        // 
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
        if (cToken == cToken30) return 30;

        return uint(-1);
    }

    function getUnderlying(uint i) internal view returns (address) {
        // 
        if (i == 0) return underlying00;
        if (i == 1) return underlying01;
        if (i == 2) return underlying02;
        if (i == 3) return underlying03;
        if (i == 4) return underlying04;
        if (i == 5) return underlying05;
        if (i == 6) return underlying06;
        if (i == 7) return underlying07;
        if (i == 8) return underlying08;
        if (i == 9) return underlying09;
        if (i == 10) return underlying10;
        if (i == 11) return underlying11;
        if (i == 12) return underlying12;
        if (i == 13) return underlying13;
        if (i == 14) return underlying14;
        if (i == 15) return underlying15;
        if (i == 16) return underlying16;
        if (i == 17) return underlying17;
        if (i == 18) return underlying18;
        if (i == 19) return underlying19;
        if (i == 20) return underlying20;
        if (i == 21) return underlying21;
        if (i == 22) return underlying22;
        if (i == 23) return underlying23;
        if (i == 24) return underlying24;
        if (i == 25) return underlying25;
        if (i == 26) return underlying26;
        if (i == 27) return underlying27;
        if (i == 28) return underlying28;
        if (i == 29) return underlying29;
        if (i == 30) return underlying30;

        revert("lookup index too large");
    }

    function getUnderlyingIndex(address underlying) internal view returns (uint) {
        // 
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

        return uint(-1);
    }

    function getSymbolHash(uint i) internal view returns (bytes32) {
        // 
        if (i == 0) return symbolHash00;
        if (i == 1) return symbolHash01;
        if (i == 2) return symbolHash02;
        if (i == 3) return symbolHash03;
        if (i == 4) return symbolHash04;
        if (i == 5) return symbolHash05;
        if (i == 6) return symbolHash06;
        if (i == 7) return symbolHash07;
        if (i == 8) return symbolHash08;
        if (i == 9) return symbolHash09;
        if (i == 10) return symbolHash10;
        if (i == 11) return symbolHash11;
        if (i == 12) return symbolHash12;
        if (i == 13) return symbolHash13;
        if (i == 14) return symbolHash14;
        if (i == 15) return symbolHash15;
        if (i == 16) return symbolHash16;
        if (i == 17) return symbolHash17;
        if (i == 18) return symbolHash18;
        if (i == 19) return symbolHash19;
        if (i == 20) return symbolHash20;
        if (i == 21) return symbolHash21;
        if (i == 22) return symbolHash22;
        if (i == 23) return symbolHash23;
        if (i == 24) return symbolHash24;
        if (i == 25) return symbolHash25;
        if (i == 26) return symbolHash26;
        if (i == 27) return symbolHash27;
        if (i == 28) return symbolHash28;
        if (i == 29) return symbolHash29;
        if (i == 30) return symbolHash30;

        revert("lookup index too large");
    }

    function getSymbolHashIndex(bytes32 symbol) internal view returns (uint) {
        // 
        if (symbol == symbolHash00) return 0;
        if (symbol == symbolHash01) return 1;
        if (symbol == symbolHash02) return 2;
        if (symbol == symbolHash03) return 3;
        if (symbol == symbolHash04) return 4;
        if (symbol == symbolHash05) return 5;
        if (symbol == symbolHash06) return 6;
        if (symbol == symbolHash07) return 7;
        if (symbol == symbolHash08) return 8;
        if (symbol == symbolHash09) return 9;
        if (symbol == symbolHash10) return 10;
        if (symbol == symbolHash11) return 11;
        if (symbol == symbolHash12) return 12;
        if (symbol == symbolHash13) return 13;
        if (symbol == symbolHash14) return 14;
        if (symbol == symbolHash15) return 15;
        if (symbol == symbolHash16) return 16;
        if (symbol == symbolHash17) return 17;
        if (symbol == symbolHash18) return 18;
        if (symbol == symbolHash19) return 19;
        if (symbol == symbolHash20) return 20;
        if (symbol == symbolHash21) return 21;
        if (symbol == symbolHash22) return 22;
        if (symbol == symbolHash23) return 23;
        if (symbol == symbolHash24) return 24;
        if (symbol == symbolHash25) return 25;
        if (symbol == symbolHash26) return 26;
        if (symbol == symbolHash27) return 27;
        if (symbol == symbolHash28) return 28;
        if (symbol == symbolHash29) return 29;
        if (symbol == symbolHash30) return 30;

        return uint(-1);
    }

    function getBaseUnit(uint i) internal view returns (uint) {
        // 
        if (i == 0) return baseUnit00;
        if (i == 1) return baseUnit01;
        if (i == 2) return baseUnit02;
        if (i == 3) return baseUnit03;
        if (i == 4) return baseUnit04;
        if (i == 5) return baseUnit05;
        if (i == 6) return baseUnit06;
        if (i == 7) return baseUnit07;
        if (i == 8) return baseUnit08;
        if (i == 9) return baseUnit09;
        if (i == 10) return baseUnit10;
        if (i == 11) return baseUnit11;
        if (i == 12) return baseUnit12;
        if (i == 13) return baseUnit13;
        if (i == 14) return baseUnit14;
        if (i == 15) return baseUnit15;
        if (i == 16) return baseUnit16;
        if (i == 17) return baseUnit17;
        if (i == 18) return baseUnit18;
        if (i == 19) return baseUnit19;
        if (i == 20) return baseUnit20;
        if (i == 21) return baseUnit21;
        if (i == 22) return baseUnit22;
        if (i == 23) return baseUnit23;
        if (i == 24) return baseUnit24;
        if (i == 25) return baseUnit25;
        if (i == 26) return baseUnit26;
        if (i == 27) return baseUnit27;
        if (i == 28) return baseUnit28;
        if (i == 29) return baseUnit29;
        if (i == 30) return baseUnit30;

        revert("lookup index too large");
    }

    function getTokenConfig(uint i) public view returns (TokenConfig memory) {
        require(i < numTokens, "token config not found");

        return TokenConfig({
            cToken: getCToken(i),
            underlying: getUnderlying(i),
            symbolHash: getSymbolHash(i),
            baseUnit: getBaseUnit(i)
        });
    }

    function getTokenConfigBySymbol(string memory symbol) public view returns (TokenConfig memory) {
        bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
        uint index = getSymbolHashIndex(symbolHash);
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

        address underlying = CErc20(cToken).underlying();
        index = getUnderlyingIndex(underlying);
        if (index != uint(-1)) {
            return getTokenConfig(index);
        }

        revert("token config not found");
    }
}