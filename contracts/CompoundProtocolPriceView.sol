pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./AnchoredPriceView.sol";

interface CompoundProtocolPriceViewI {
    function isPriceOracle() external pure returns (bool);

    function getUnderlyingPrice(address cToken) external view returns (uint256);
}

contract CompoundProtocolPriceView is AnchoredPriceView, CompoundProtocolPriceViewI {

    /**
     * @param data_ Address of the Oracle Data contract
     * @param source_ The reporter address whose price will be used if it matches the anchor
     * @param anchor_ The PriceOracleProxy that will be used to verify source price, or serve prices not given by the source
     * @param anchorToleranceMantissa_ The tolerance allowed between the anchor and median. A tolerance of 10e16 means a new median that is 10% off from the anchor will still be saved
     * @param tokens_ The CTokens struct that contains addresses for CToken contracts
     */
    constructor(OpenOraclePriceData data_,
                address source_,
                address anchor_,
                uint anchorToleranceMantissa_,
                CTokens memory tokens_) public AnchoredPriceView(data_, source_, anchor_, anchorToleranceMantissa_, tokens_) {
    }

    /**
     * @notice Flags that this contract is meant to be compatible with Compound v2 PriceOracle interface.
     * @return true, this contract is meant to be used as Compound v2 PriceOracle interface.
     */
    function isPriceOracle() external pure override returns (bool) {
        return true;
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view override returns (uint256) {
        uint256 priceSixDecimals;

        if(cToken == cUsdcAddress || cToken == cUsdtAddress) {
            priceSixDecimals = oneDollar;
        } else if (cToken == cWbtcAddress || cToken == cEthAddress) {
            priceSixDecimals = _prices[getOracleKey(cToken)];
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = anchor.getUnderlyingPrice(cToken);
            // usdPerEth - 6 decimals
            // ethPerStandardErc20 - 18 decimals
            // divide by 1e18 to drop down to 6 decimals
            priceSixDecimals = mul(usdPerEth, ethPerToken) / 1e18;
        }

        // comptroller expects price to have 18 decimals,
        // and additionally upscaled by 1e18 - underlyingdecimals
        // base decimals is 1e6, so start by addint twelve
        uint256 additionalScale;
        if ( cToken == cUsdcAddress || cToken == cUsdtAddress )  {
            additionalScale = 1e24;
        } else if ( cToken == cWbtcAddress )  {
            additionalScale = 1e22;
        } else {
            additionalScale = 1e12;
        }

        return mul(priceSixDecimals, additionalScale);
    }

    /**
     * @notice Returns the symbol for cToken address
     * @param cToken The cToken address to map to symbol
     * @return The symbol for the given cToken address
     */
    function getOracleKey(address cToken) public view returns (string memory) {
        if (cToken == cEthAddress) return "ETH";
        if (cToken == cUsdcAddress) return "USDC";
        if (cToken == cDaiAddress) return "DAI";
        if (cToken == cRepAddress) return "REP";
        if (cToken == cWbtcAddress) return "BTC";
        if (cToken == cBatAddress) return "BAT";
        if (cToken == cZrxAddress) return "ZRX";
        if (cToken == cSaiAddress) return "SAI";
        if (cToken == cUsdtAddress) return "USDT";
        revert("Unknown token address");
    }

}