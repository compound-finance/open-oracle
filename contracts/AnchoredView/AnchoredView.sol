pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./SymbolConfiguration.sol";
import "../OpenOraclePriceData.sol";

interface CErc20 {
    function underlying() external view returns (address);
}

interface AnchorOracle {
    function numBlocksPerPeriod() external view returns (uint); // approximately 1 hour: 60 seconds/minute * 60 minutes/hour * 1 block/15 seconds

    function assetPrices(address asset) external view returns (uint);


    /* struct Anchor { */
    /*     // floor(block.number / numBlocksPerPeriod) + 1 */
    /*     uint period; */

    /*     // Price in ETH, scaled by 10**18 */
    /*     uint priceMantissa; */
    /* } */
    function anchors(address asset) external view returns (uint, uint);
}


/**
 * @notice Price feed conforming to Price Oracle Proxy interface.
 * @dev Use a single open oracle reporter and anchored to and falling back to the Compound v2 oracle system.
 * @author Compound Labs, Inc.
 */
contract AnchoredView is SymbolConfiguration {
    /// @notice The mapping of posted by source prices per symbol
    mapping(string => uint256) public _prices;

    /// @notice circuit breaker for using anchor price oracle directly
    bool public breaker;

    /// @notice circuit breaker for using source price without anchor
    bool public anchored = true;

    /// @notice the Open Oracle Reporter price source
    address public immutable source;

    /// @notice the anchor oracle ( Compouni Oracle V1 )
    AnchorOracle public immutable anchor;

    /// @notice the Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint256 immutable lowerBoundAnchorRatio;

    /// @notice standard amount for the Dollar
    uint256 constant oneDollar = 1e6;

    /// @notice The event emitted when the median price is updated
    event PriceUpdated(string symbol, uint256 price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint256 source, uint256 anchor);

    /// @notice The event emitted when source invalidates itself
    event SourceInvalidated(address source);

    /// @notice The event emitted when the anchor is cut for staleness
    event AnchorCut(address anchor);

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
                CTokens memory tokens_) SymbolConfiguration(tokens_) public {
        source = source_;
        anchor = AnchorOracle(anchor_);
        priceData = data_;

        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        _prices["USDC"] = oneDollar;
        _prices["USDT"] = oneDollar;
    }

    /**
     * @notice Post open oracle source prices, and recalculate stored price by comparing to anchor
     * @dev We let anyone pay to post anything, but only prices from configured source will be stored in the view
     * @param messages The messages to post to the oracle
     * @param signatures The signatures for the corresponding messages
     * @param symbols The symbols to compare to anchor for authoritative reading
     */
    function postPrices(bytes[] calldata messages, bytes[] calldata signatures, string[] calldata symbols) external {
        require(messages.length == signatures.length, "messages and signatures must be 1:1");

        // Save the prices
        for (uint i = 0; i < messages.length; i++) {
            priceData.put(messages[i], signatures[i]);
        }

        // load usdc for using in loop to convert anchor prices to dollars
        uint256 usdcPrice = readAnchor(cUsdcAddress);

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            string memory symbol = symbols[i];
            address tokenAddress = getCTokenAddress(symbol);
            uint256 sourcePrice = priceData.getPrice(source, symbol);
            uint256 anchorPrice = getAnchorInUsd(tokenAddress, usdcPrice);

            if (anchorPrice == 0 || tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress) {
                emit PriceGuarded(symbol, sourcePrice, anchorPrice);
            } else {
                uint256 anchorRatioMantissa = mul(sourcePrice, 100e16) / anchorPrice;
                // Only update the view's price if the source price is within a bound
                if (anchorRatioMantissa <= upperBoundAnchorRatio && anchorRatioMantissa >= lowerBoundAnchorRatio) {
                    // only update and emit event if value changes
                    if (_prices[symbol] != sourcePrice) {
                        _prices[symbol] = sourcePrice;
                        emit PriceUpdated(symbol, sourcePrice);
                    }
                } else if (!anchored) {
                    _prices[symbol] = sourcePrice;
                    emit PriceUpdated(symbol, sourcePrice);
                } else {
                    emit PriceGuarded(symbol, sourcePrice, anchorPrice);
                }
            }
        }
    }
    /**
     * @notice Returns price denominated in USD, with 6 decimals
     * @dev If price was posted by source, return it. Otherwise, return anchor price converted through source ETH price.
     */
    function prices(string calldata symbol) external view returns (uint256) {
        uint256 price = _prices[symbol];

        if (price != 0) {
            return price;
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = readAnchor(getCTokenAddress(symbol));

            // ethPerToken has 18 decimals since the usdt, usdc, wbtc tokens hit
            // usdPerEth has 6 decimals
            // scaling by 1e18 and dividing leaves 1e6, as desired
            return mul(usdPerEth, 1e18) / ethPerToken;
        }
    }

    /**
     * @dev fetch price in eth from proxy and convert to usd price using anchor usdc price.
     * @dev Anchor usdc price has 30 decimals, and anchor general price has 18 decimals, so multiplying 1e18 by 1e18 and dividing by 1e30 yields 1e6
     */
    function getAnchorInUsd(address tokenAddress, uint256 usdcPrice) public view returns (uint256) {
        // TODO: can get rid of trhis if handle decimals more elegantly
        if ( tokenAddress == cUsdcAddress || tokenAddress == cUsdtAddress )  {
            // hard code to 1 dollar
            return oneDollar;
        }

        uint priceInEth = readAnchor(tokenAddress);
        uint additionalScale;
        if ( tokenAddress == cWbtcAddress ){
            // wbtc proxy price is scaled 1e(36 - 8) = 1e28, so we need 8 more to get to 36
            additionalScale = 1e8;
        } else {
            // all other tokens are scaled 1e18, so we need 18 more to get to 36
            additionalScale = 1e18;
        }

        // usdcPrice has 30 decimals, so final result has 6
        return mul(priceInEth, additionalScale) / usdcPrice;
    }

    /**
     * @notice Implements the method of the PriceOracle interface of Compound v2 and returns returns the Eth price for an asset.
     * @dev converts from 1e6 decimals of Open Oracle to 1e(36 - underlyingDecimals) of PriceOracleProxy
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) external view returns (uint256) {
        if (breaker == true) {
            return readAnchor(cToken);
        }

        uint256 usdPerToken = _prices[getOracleKey(cToken)];

        if ( usdPerToken == 0 ) {
            return readAnchor(cToken);
        } else {
            uint256 usdPerEth = _prices["ETH"];
            uint256 ethPerToken = mul(usdPerToken, 1e6) / usdPerEth;
            uint256 additionalScale = getAdditionalScale(cToken);

            return mul(ethPerToken, additionalScale);
        }
    }

    /**
     * @notice Get the underlying price of a listed cToken asset
     * @param cTokenAddress The cToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18)
     */
    function readAnchor(address cTokenAddress) public view returns (uint) {
        if (cTokenAddress == cEthAddress) {
            // ether always worth 1
            return 1e18;
        }

        if (cTokenAddress == cUsdcAddress || cTokenAddress == cUsdtAddress) {
            return anchor.assetPrices(usdcOracleKey);
        }

        if (cTokenAddress == cDaiAddress) {
            return anchor.assetPrices(daiOracleKey);
        }

        if (cTokenAddress == cSaiAddress) {
            return saiPrice;
        }

        // otherwise just read from v1 oracle
        address underlying = CErc20(cTokenAddress).underlying();
        return anchor.assetPrices(underlying);
    }

    /// @notice invalidate the source, and fall back to using anchor directly in all cases
    function invalidate(bytes memory message, bytes memory signature) public {
        (string memory decoded_message, ) = abi.decode(message, (string, address));
        require(keccak256(abi.encodePacked(decoded_message)) == keccak256(abi.encodePacked("rotate")), "invalid message must be 'rotate'");
        require(priceData.source(message, signature) == source, "invalidation message must come from the reporter");

        breaker = true;
        emit SourceInvalidated(source);
    }

    /// @notice invalidate the anchor, and fall back to using source without anchor

    /// @dev determine if anchor is stale by checking when usdc was last updated
    // @dev all anchor prices are converted through usdc price, so if it is stale they are all stale
    function cutAnchor() public {
        (uint latestUsdcAnchorPeriod,) = anchor.anchors(usdcOracleKey);

        uint usdcAnchorBlockNumber = mul(latestUsdcAnchorPeriod, anchor.numBlocksPerPeriod());
        uint blocksSinceUpdate = block.number - usdcAnchorBlockNumber;

        // one day in 15 second blocks without an update
        if (blocksSinceUpdate > 5760) {
            anchored = false;
            emit AnchorCut(address(anchor));
        }
    }


    // @notice overflow proof multiplication
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "multiplication overflow");

        return c;
    }
}
