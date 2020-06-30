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

    uint internal immutable baseUnit00;
    uint internal immutable baseUnit01;
    uint internal immutable baseUnit02;
    uint internal immutable baseUnit03;
    uint internal immutable baseUnit04;
    uint internal immutable baseUnit05;
    uint internal immutable baseUnit06;
    uint internal immutable baseUnit07;
    uint internal immutable baseUnit08;
    uint internal immutable baseUnit09;
    uint internal immutable baseUnit10;
    uint internal immutable baseUnit11;
    uint internal immutable baseUnit12;
    uint internal immutable baseUnit13;
    uint internal immutable baseUnit14;
    uint internal immutable baseUnit15;
    uint internal immutable baseUnit16;
    uint internal immutable baseUnit17;
    uint internal immutable baseUnit18;
    uint internal immutable baseUnit19;
    uint internal immutable baseUnit20;
    uint internal immutable baseUnit21;
    uint internal immutable baseUnit22;
    uint internal immutable baseUnit23;
    uint internal immutable baseUnit24;
    uint internal immutable baseUnit25;
    uint internal immutable baseUnit26;
    uint internal immutable baseUnit27;
    uint internal immutable baseUnit28;
    uint internal immutable baseUnit29;

    // XXX etc, 1 for each field

    constructor(TokenConfig[] memory configs) public {
        require(configs.length <= maxTokens, "too many configs");
        numTokens = configs.length;

        cToken00 = get(configs, 0).cToken;
        cToken01 = get(configs, 1).cToken;
        cToken02 = get(configs, 2).cToken;
        cToken03 = get(configs, 3).cToken;
        cToken04 = get(configs, 4).cToken;
        cToken05 = get(configs, 5).cToken;
        cToken06 = get(configs, 6).cToken;
        cToken07 = get(configs, 7).cToken;
        cToken08 = get(configs, 8).cToken;
        cToken09 = get(configs, 9).cToken;
        cToken10 = get(configs, 10).cToken;
        cToken11 = get(configs, 11).cToken;
        cToken12 = get(configs, 12).cToken;
        cToken13 = get(configs, 13).cToken;
        cToken14 = get(configs, 14).cToken;
        cToken15 = get(configs, 15).cToken;
        cToken16 = get(configs, 16).cToken;
        cToken17 = get(configs, 17).cToken;
        cToken18 = get(configs, 18).cToken;
        cToken19 = get(configs, 19).cToken;
        cToken20 = get(configs, 20).cToken;
        cToken21 = get(configs, 21).cToken;
        cToken22 = get(configs, 22).cToken;
        cToken23 = get(configs, 23).cToken;
        cToken24 = get(configs, 24).cToken;
        cToken25 = get(configs, 25).cToken;
        cToken26 = get(configs, 26).cToken;
        cToken27 = get(configs, 27).cToken;
        cToken28 = get(configs, 28).cToken;
        cToken29 = get(configs, 29).cToken;

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

    function getTokenConfig(uint i) public view returns (TokenConfig memory) {
        require(i < numTokens, "token config not found");

        if (i == 0) return TokenConfig({cToken: cToken00, underlying: underlying00, symbolHash: symbolHash00, baseUnit: baseUnit00});
        if (i == 1) return TokenConfig({cToken: cToken01, underlying: underlying01, symbolHash: symbolHash01, baseUnit: baseUnit01});
        if (i == 2) return TokenConfig({cToken: cToken02, underlying: underlying02, symbolHash: symbolHash02, baseUnit: baseUnit02});
        if (i == 3) return TokenConfig({cToken: cToken03, underlying: underlying03, symbolHash: symbolHash03, baseUnit: baseUnit03});
        if (i == 4) return TokenConfig({cToken: cToken04, underlying: underlying04, symbolHash: symbolHash04, baseUnit: baseUnit04});
        if (i == 5) return TokenConfig({cToken: cToken05, underlying: underlying05, symbolHash: symbolHash05, baseUnit: baseUnit05});
        if (i == 6) return TokenConfig({cToken: cToken06, underlying: underlying06, symbolHash: symbolHash06, baseUnit: baseUnit06});
        if (i == 7) return TokenConfig({cToken: cToken07, underlying: underlying07, symbolHash: symbolHash07, baseUnit: baseUnit07});
        if (i == 8) return TokenConfig({cToken: cToken08, underlying: underlying08, symbolHash: symbolHash08, baseUnit: baseUnit08});
        if (i == 9) return TokenConfig({cToken: cToken09, underlying: underlying09, symbolHash: symbolHash09, baseUnit: baseUnit09});

        if (i == 10) return TokenConfig({cToken: cToken10, underlying: underlying10, symbolHash: symbolHash10, baseUnit: baseUnit10});
        if (i == 11) return TokenConfig({cToken: cToken11, underlying: underlying11, symbolHash: symbolHash11, baseUnit: baseUnit11});
        if (i == 12) return TokenConfig({cToken: cToken12, underlying: underlying12, symbolHash: symbolHash12, baseUnit: baseUnit12});
        if (i == 13) return TokenConfig({cToken: cToken13, underlying: underlying13, symbolHash: symbolHash13, baseUnit: baseUnit13});
        if (i == 14) return TokenConfig({cToken: cToken14, underlying: underlying14, symbolHash: symbolHash14, baseUnit: baseUnit14});
        if (i == 15) return TokenConfig({cToken: cToken15, underlying: underlying15, symbolHash: symbolHash15, baseUnit: baseUnit15});
        if (i == 16) return TokenConfig({cToken: cToken16, underlying: underlying16, symbolHash: symbolHash16, baseUnit: baseUnit16});
        if (i == 17) return TokenConfig({cToken: cToken17, underlying: underlying17, symbolHash: symbolHash17, baseUnit: baseUnit17});
        if (i == 18) return TokenConfig({cToken: cToken18, underlying: underlying18, symbolHash: symbolHash18, baseUnit: baseUnit18});
        if (i == 19) return TokenConfig({cToken: cToken19, underlying: underlying19, symbolHash: symbolHash19, baseUnit: baseUnit19});

        if (i == 20) return TokenConfig({cToken: cToken20, underlying: underlying20, symbolHash: symbolHash20, baseUnit: baseUnit20});
        if (i == 21) return TokenConfig({cToken: cToken21, underlying: underlying21, symbolHash: symbolHash21, baseUnit: baseUnit21});
        if (i == 22) return TokenConfig({cToken: cToken22, underlying: underlying22, symbolHash: symbolHash22, baseUnit: baseUnit22});
        if (i == 23) return TokenConfig({cToken: cToken23, underlying: underlying23, symbolHash: symbolHash23, baseUnit: baseUnit23});
        if (i == 24) return TokenConfig({cToken: cToken24, underlying: underlying24, symbolHash: symbolHash24, baseUnit: baseUnit24});
        if (i == 25) return TokenConfig({cToken: cToken25, underlying: underlying25, symbolHash: symbolHash25, baseUnit: baseUnit25});
        if (i == 26) return TokenConfig({cToken: cToken26, underlying: underlying26, symbolHash: symbolHash26, baseUnit: baseUnit26});
        if (i == 27) return TokenConfig({cToken: cToken27, underlying: underlying27, symbolHash: symbolHash27, baseUnit: baseUnit27});
        if (i == 28) return TokenConfig({cToken: cToken28, underlying: underlying28, symbolHash: symbolHash28, baseUnit: baseUnit28});
        if (i == 29) return TokenConfig({cToken: cToken29, underlying: underlying29, symbolHash: symbolHash29, baseUnit: baseUnit29});
    }

    function getTokenConfigBySymbol(string memory symbol) public view returns (TokenConfig memory) {
        bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
        for (uint i = 0; i < numTokens; i++) {
            TokenConfig memory config = getTokenConfig(i);
            if (symbolHash == config.symbolHash) {
                return config;
            }
        }

        revert("token config not found");
    }

    function getTokenConfigByCToken(address cToken) public view returns (TokenConfig memory) {
        for (uint i = 0; i < numTokens; i++) {
            TokenConfig memory config = getTokenConfig(i);
            if (cToken == config.cToken) {
                return config;
            }
        }

        address underlying = CErc20(cToken).underlying();
        for (uint i = 0; i < numTokens; i++) {
            TokenConfig memory config = getTokenConfig(i);
            if (underlying == config.underlying) {
                return config;
            }
        }

        revert("token config not found");
    }

    function doNothingWithSymbol(string memory symbol) public view returns (string memory) {
        return symbol;
    }
}