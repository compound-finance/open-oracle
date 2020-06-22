pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "./UniswapLib.sol";


contract UniswapLaggingWindowOracle {
    using FixedPoint for *;
    using SafeMath for uint;

    struct Observation {
        uint timestamp;
        uint price0Cumulative;
        uint price1Cumulative;
    }

    // Period for comparing new and old observations
    uint public constant PERIOD = 30 minutes;

    // mapping from pair address to an old observation
    mapping(address => Observation) public oldObservations;
    // mapping from pair address to an new observation
    mapping(address => Observation) public newObservations;

    event ObservationsUpdated(address indexed pair, uint price0Cumulative, uint price1Cumulative, uint timeElapsed);

    // Get TWAP prices per pair at the current timestamp. 
    // Update new and old observations of lagging window if period elapsed.
    function poke(address pair) external returns (uint price0Average, uint price1Average) {
        Observation storage newObservation = oldObservations[pair];
        Observation storage oldObservation = newObservations[pair];

        (uint price0Cumulative, uint price1Cumulative,) = UniswapV2OracleLibrary.currentCumulativePrices(pair);
        uint timeElapsed = block.timestamp - newObservation.timestamp;

        // Update new and old observations if elapsed time is bigger or equal to PERIOD
        if (timeElapsed >= PERIOD) {
            // Update old observation
            // oldObservation = newObservation;
            oldObservation.timestamp = newObservation.timestamp;
            oldObservation.price0Cumulative = newObservation.price0Cumulative;
            oldObservation.price1Cumulative = newObservation.price1Cumulative;

            // Update new observation
            newObservation.timestamp = block.timestamp;
            newObservation.price0Cumulative = price0Cumulative;
            newObservation.price1Cumulative = price1Cumulative;
            
            emit ObservationsUpdated(pair, price0Cumulative, price1Cumulative, timeElapsed);
        } 

        price0Average = computeTWAP(oldObservation.price0Cumulative, price0Cumulative, timeElapsed);
        price1Average = computeTWAP(oldObservation.price1Cumulative, price1Cumulative, timeElapsed);
    }

    // given the cumulative prices of the start and end of a period, and the length of the period, 
    // compute the average price 
    function computeTWAP(
        uint priceCumulativeStart, 
        uint priceCumulativeEnd,
        uint timeElapsed
    ) private pure returns (uint amountOut) {
        // overflow is desired.
        FixedPoint.uq112x112 memory priceAverage = FixedPoint.uq112x112(
            uint224((priceCumulativeEnd - priceCumulativeStart) / timeElapsed)
        );
        amountOut = priceAverage.mul(1e18).decode144();
    }
}