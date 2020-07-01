pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "./UniswapLib.sol";
import "../AnchoredView/AnchoredView.sol";

contract UniswapLaggingWindowOracle is AnchoredView {
    using FixedPoint for *;

    struct Observation {
        uint timestamp;
        uint price;
    }

    // Period for comparing new and old observations
    uint public constant PERIOD = 30 minutes;

    // mapping from pair address to an old observation
    mapping(address => Observation) public oldObservations;
    // mapping from pair address to an new observation
    mapping(address => Observation) public newObservations;

    event ObservationsUpdated(address indexed pair, uint price, uint timeElapsed);

    constructor(
        OpenOraclePriceData data_,
        address reporter_,
        uint anchorToleranceMantissa_,
        address[] memory underlyings,
        CToken[] memory cTokens
        ) AnchoredView(data_, reporter_, anchorToleranceMantissa_, underlyings, cTokens) public {

    }

    function getAnchorLastTimestamp(CTokenMetadata memory tokenConfig) internal view override returns (uint) {
        return newObservations[tokenConfig.uniswapMarket].timestamp;
    }

    function getAnchorPrice(CTokenMetadata memory tokenConfig, uint ethPerUsdc) internal view override returns (uint) {
        (Observation memory newObservation, Observation memory oldObservation) = pokeWindowValues(tokenConfig);
        uint timeElapsed = newObservation.timestamp - oldObservation.timestamp;
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(
            uint224((newObservation.price - oldObservation.price) / timeElapsed)
        );

        // XXX over lapping number libs, eek
        return mul(priceAverage.mul(1e18).decode144(), ethPerUsdc) / 1e18;
    }

    // Get TWAP prices per pair at the current timestamp.
    // Update new and old observations of lagging window if period elapsed.
    function pokeWindowValues(CTokenMetadata memory tokenConfig) public returns (Observation memory, Observation memory) {
        address uniswapMarket = tokenConfig.uniswapMarket;
        uint currentCumulativePrice = getCurrentCumulativePrice(tokenConfig);

        Observation storage newObservation = newObservations[uniswapMarket];
        Observation storage oldObservation = oldObservations[uniswapMarket];

        // Update new and old observations if elapsed time is bigger or equal to PERIOD
        uint timeElapsed = block.timestamp - newObservation.timestamp;
        if (timeElapsed >= PERIOD) {

            oldObservation.timestamp = newObservation.timestamp;
            oldObservation.price = newObservation.price;

            newObservation.timestamp = block.timestamp;
            newObservation.price = currentCumulativePrice;

            emit ObservationsUpdated(uniswapMarket, currentCumulativePrice, timeElapsed);
        }
        return (newObservation, oldObservation);
    }

    function getCurrentCumulativePrice(CTokenMetadata memory tokenConfig) internal returns (uint) {
        (uint price0Cumulative, uint price1Cumulative,) = UniswapV2OracleLibrary.currentCumulativePrices(tokenConfig.uniswapMarket);
        // TODO: write
        // if (config.isReversedMarket) {
        // } else {
        // }
        return 1;
    }
}
