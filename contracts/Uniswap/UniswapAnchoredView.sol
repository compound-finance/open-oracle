pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "./UniswapLib.sol";
import "../AnchoredView/AnchoredView.sol";

contract UniswapLaggingWindowOracle is AnchoredView {
    using FixedPoint for *;

    struct Observation {
        uint timestamp;
        uint acc;
    }

    // Period for comparing new and old observations
    uint public constant PERIOD = 30 minutes;

    // mapping from pair address to an old observation
    mapping(address => Observation) public oldObservations;
    // mapping from pair address to an new observation
    mapping(address => Observation) public newObservations;

    event ObservationsUpdated(address indexed pair, uint price, uint timeElapsed);
    event UniswapWindowUpdate(address indexed uniswapMarket, uint oldTimestamp, uint newTimestamp, uint oldPrice, uint newPrice);

    constructor(
        OpenOraclePriceData data_,
        address reporter_,
        uint anchorToleranceMantissa_,
        address[] memory underlyings,
        CToken[] memory cTokens
        ) AnchoredView(data_, reporter_, anchorToleranceMantissa_, underlyings, cTokens) public {

    }

    function getAnchorPrice(CTokenMetadata memory tokenConfig, uint ethPrice) internal override returns (uint) {
        (uint nowCumulativePrice, uint oldCumulativePrice, uint oldTimestamp) = pokeWindowValues(tokenConfig);
        uint timeElapsed = block.timestamp - oldTimestamp;
        // TODO Figure our MATH  
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(uint224((nowCumulativePrice - oldCumulativePrice) / timeElapsed));

        // Super ugly here 
        return mul(priceAverage.mul(1e18).decode144(), ethPrice) / 1e18;
    }

    // Get current cumulative price.
    // Update new and old observations of lagging window if period elapsed.
    function pokeWindowValues(CTokenMetadata memory config) public returns (uint, uint, uint) {
        address uniswapMarket = config.uniswapMarket;
        uint currentCumulativePrice = getCurrentCumulativePrice(config);

        Observation storage newObservation = newObservations[uniswapMarket];
        Observation storage oldObservation = oldObservations[uniswapMarket];

        // Update new and old observations if elapsed time is bigger or equal to PERIOD
        uint timeElapsed = block.timestamp - newObservation.timestamp;
        if (timeElapsed >= PERIOD) {
            emit UniswapWindowUpdate(config.uniswapMarket, oldObservation.timestamp, newObservation.timestamp, oldObservation.acc, newObservation.acc);
            oldObservation.timestamp = newObservation.timestamp;
            oldObservation.acc = newObservation.acc;

            newObservation.timestamp = block.timestamp;
            newObservation.acc = currentCumulativePrice;
        }
        return (currentCumulativePrice, oldObservation.acc, oldObservation.timestamp);
    }

    function getCurrentCumulativePrice(CTokenMetadata memory config) internal view returns (uint) {
        (uint price0Cumulative, uint price1Cumulative,) = UniswapV2OracleLibrary.currentCumulativePrices(config.uniswapMarket);
        // TODO add isReversedMarket
        if (true) {
        // if (config.isReversedMarket) {
            return mul(price0Cumulative, 1e18) / config.baseUnit;
        } else {
            return mul(price1Cumulative, config.baseUnit) / 1e18;
        }
    }
}
