pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../OpenOraclePriceData.sol";
import "./UniswapConfig.sol";
import "./UniswapLib.sol";

struct Observation {
    uint timestamp;
    uint acc;
}

contract UniswapAnchoredView is UniswapConfig {
    using FixedPoint for *;

    /// @notice The Open Oracle Price Data contract
    OpenOraclePriceData public immutable priceData;

    /// @notice the Open Oracle Reporter price reporter
    address public immutable reporter;

    /// @notice The highest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint public immutable upperBoundAnchorRatio;

    /// @notice The lowest ratio of the new median price to the anchor price that will still trigger the median price to be updated
    uint public immutable lowerBoundAnchorRatio;

    /// @notice The minimum amount of time required for the old Uniswap price accumulator to be replaced
    uint public immutable anchorPeriod;

    /// @notice Official prices by symbol hash
    mapping(bytes32 => uint) public prices;

    /// @notice Circuit breaker for using anchor price oracle directly, ignoring reporter
    bool public reporterInvalidated;

    /// @notice The old observation for each uniswap market
    mapping(address => Observation) public oldObservations;
    /// @notice The new observation for each uniswap market
    mapping(address => Observation) public newObservations;

    /// @notice The event emitted when the stored price is updated
    event PriceUpdated(string symbol, uint price);

    /// @notice The event emitted when new prices are posted but the stored price is not updated due to the anchor
    event PriceGuarded(string symbol, uint reporter, uint anchor);

    /// @notice The event emitted when reporter invalidates itself
    event ReporterInvalidated(address reporter);

    /// @notice The event emitted when the uniswap window changes
    event UniswapWindowUpdate(address indexed uniswapMarket, uint oldTimestamp, uint newTimestamp, uint oldPrice, uint newPrice);

    /**
     * @notice XXX
     */
    constructor(OpenOraclePriceData priceData_,
                address reporter_,
                uint anchorToleranceMantissa_,
                uint anchorPeriod_,
                TokenConfig[] memory configs) UniswapConfig(configs) public {
        priceData = priceData_;
        reporter = reporter_;
        anchorPeriod = anchorPeriod_;

        require(anchorToleranceMantissa_ < 100e16, "Anchor Tolerance is too high");
        upperBoundAnchorRatio = 100e16 + anchorToleranceMantissa_;
        lowerBoundAnchorRatio = 100e16 - anchorToleranceMantissa_;

        for (uint i = 0; i < configs.length; i++) {
            TokenConfig memory config = configs[i];
            address uniswapMarket = config.uniswapMarket;
            uint cumulativePrice = currentCumulativePrice(config);
            oldObservations[uniswapMarket].timestamp = block.timestamp;
            newObservations[uniswapMarket].timestamp = block.timestamp;
            oldObservations[uniswapMarket].acc = cumulativePrice;
            newObservations[uniswapMarket].acc = cumulativePrice;
        }
    }

    /**
     * @notice Get the official price for a symbol
     * @param symbol The symbol to fetch the price of
     * @return Price denominated in USD, with 6 decimals
     */
    function price(string memory symbol) public view returns (uint) {
        TokenConfig memory config = getTokenConfigBySymbol(symbol);
        return priceInternal(config);
    }

    function priceInternal(TokenConfig memory config) internal view returns (uint) {
        if (config.priceSource == PriceSource.REPORTER) return prices[config.symbolHash];
        if (config.priceSource == PriceSource.FIXED_USD) return config.fixedPrice;
        if (config.priceSource == PriceSource.FIXED_ETH) {
            uint usdPerEth = prices[keccak256(abi.encodePacked("ETH"))]; // XXX: ethHash and rotateHash constants?
            require(usdPerEth > 0, "eth price not set, cannot convert eth to dollars");
            return mul(usdPerEth, config.fixedPrice) / config.baseUnit;
        }
    }

    /**
     * @notice Get the underlying price of a cToken
     * @dev Implements the PriceOracle interface for Compound v2.
     * @param cToken The cToken address for price retrieval
     * @return The price for the given cToken address
     */
    function getUnderlyingPrice(address cToken) public view returns (uint) {
        TokenConfig memory config = getTokenConfigByCToken(cToken);
        return priceInternal(config);
    }

    /**
     * @notice Post open oracle reporter prices, and recalculate stored price by comparing to anchor
     * @dev We let anyone pay to post anything, but only prices from configured reporter will be stored in the view.
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

        uint ethPrice = fetchAnchorPrice(getTokenConfigBySymbol("ETH"), 1e6);

        // Try to update the view storage
        for (uint i = 0; i < symbols.length; i++) {
            TokenConfig memory config = getTokenConfigBySymbol(symbols[i]);
            string memory symbol = symbols[i];
            bytes32 symbolHash = keccak256(abi.encodePacked(symbol));
            if (source(messages[i], signatures[i]) != reporter) continue;

            uint reporterPrice = priceData.getPrice(reporter, symbol);
            uint anchorPrice = fetchAnchorPrice(config, ethPrice);

            uint anchorRatio = mul(anchorPrice, 100e16) / reporterPrice;
            bool withinAnchor = anchorRatio <= upperBoundAnchorRatio && anchorRatio >= lowerBoundAnchorRatio;

            if (reporterInvalidated == true) {
                if (prices[symbolHash] == anchorPrice) {
                    prices[symbolHash] = anchorPrice;
                }
            } else if (withinAnchor) {
                if (prices[symbolHash] != reporterPrice) {
                    prices[symbolHash] = reporterPrice;
                    emit PriceUpdated(symbol, reporterPrice);
                }
            } else {
                emit PriceGuarded(symbol, reporterPrice, anchorPrice);
            }
        }
    }

    /**
     * @dev Fetches the token/eth price accumulator for a config, with same decimals as the token.
     */
    function currentCumulativePrice(TokenConfig memory config) internal view returns (uint) {
        (uint price0Cumulative, uint price1Cumulative,) = UniswapV2OracleLibrary.currentCumulativePrices(config.uniswapMarket);
        if (config.isUniswapReversed) {
            return mul(price0Cumulative, 1e18 / config.baseUnit);
        } else {
            return mul(price1Cumulative, config.baseUnit / 1e18);
        }
    }

    /**
     * @dev Fetches the current anchor price, updating uniswap accumulators as necessary.
     */
    function fetchAnchorPrice(TokenConfig memory config, uint ethPrice) internal returns (uint) {
        (uint nowCumulativePrice, uint oldCumulativePrice, uint oldTimestamp) = pokeWindowValues(config);
        uint timeElapsed = block.timestamp - oldTimestamp;

        // XXX event

        // XXX Figure out MATH here
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((nowCumulativePrice - oldCumulativePrice) / timeElapsed));
        return mul(priceAverage.mul(1e18).decode144(), ethPrice) / 1e18;
    }

    /**
     * @dev Get time-weighted average prices for a token at the current timestamp.
     *  Update new and old observations of lagging window if period elapsed.
     */
    function pokeWindowValues(TokenConfig memory config) internal returns (uint, uint, uint) {
        address uniswapMarket = config.uniswapMarket;
        uint cumulativePrice = currentCumulativePrice(config);

        Observation storage newObservation = newObservations[uniswapMarket];
        Observation storage oldObservation = oldObservations[uniswapMarket];

        // Update new and old observations if elapsed time is bigger or equal to anchor period
        uint timeElapsed = block.timestamp - newObservation.timestamp;
        if (timeElapsed >= anchorPeriod) {
            emit UniswapWindowUpdate(config.uniswapMarket, oldObservation.timestamp, newObservation.timestamp, oldObservation.acc, newObservation.acc);
            oldObservation.timestamp = newObservation.timestamp;
            oldObservation.acc = newObservation.acc;

            newObservation.timestamp = block.timestamp;
            newObservation.acc = cumulativePrice;
        }
        return (cumulativePrice, oldObservation.acc, oldObservation.timestamp);
    }

    /**
     * @notice Invalidate the reporter, and fall back to using anchor directly in all cases
     * @dev Only the reporter may sign a message which allows it to invalidate itself.
     *  To be used in cases of emergency, if the reporter thinks their key may be compromised.
     * @param message The data that was presumably signed
     * @param signature The fingerprint of the data + private key
     */
    function invalidateReporter(bytes calldata message, bytes calldata signature) external {
        (string memory decoded_message, ) = abi.decode(message, (string, address));
        require(keccak256(abi.encodePacked(decoded_message)) == keccak256(abi.encodePacked("rotate")), "invalid message must be 'rotate'");
        require(source(message, signature) == reporter, "invalidation message must come from the reporter");
        reporterInvalidated = true;
        emit ReporterInvalidated(reporter);
    }

    /**
     * @notice Recovers the source address which signed a message
     * @dev Comparing to a claimed address would add nothing,
     *  as the caller could simply perform the recover and claim that address.
     * @param message The data that was presumably signed
     * @param signature The fingerprint of the data + private key
     * @return The source address which signed the message, presumably
     */
    function source(bytes memory message, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = abi.decode(signature, (bytes32, bytes32, uint8));
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(message)));
        return ecrecover(hash, v, r, s);
    }

    /// @dev Overflow proof multiplication
    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) return 0;
        uint c = a * b;
        require(c / a == b, "multiplication overflow");
        return c;
    }
}
