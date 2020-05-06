/* pragma solidity ^0.6.6; */


/* contract PriceOracle  { */


/*     uint public constant numBlocksPerPeriod = 240; // approximately 1 hour: 60 seconds/minute * 60 minutes/hour * 1 block/15 seconds */

/*     struct Anchor { */
/*         // floor(block.number / numBlocksPerPeriod) + 1 */
/*         uint period; */

/*         // Price in ETH, scaled by 10**18 */
/*         uint priceMantissa; */
/*     } */

/*     /\** */
/*       * @dev anchors by asset */
/*       *\/ */
/*     mapping(address => Anchor) public anchors; */

/*     function setPriceInternal(address asset, uint requestedPriceMantissa) internal returns (uint) { */
/*         // re-used for intermediate errors */
/*         Error err; */
/*         SetPriceLocalVars memory localVars; */
/*         // We add 1 for currentPeriod so that it can never be zero and there's no ambiguity about an unset value. */
/*         // (It can be a problem in tests with low block numbers.) */
/*         localVars.currentPeriod = (block.number / numBlocksPerPeriod) + 1; */
/*         localVars.pendingAnchorMantissa = pendingAnchors[asset]; */
/*         localVars.price = Exp({mantissa : requestedPriceMantissa}); */

/*         if (localVars.pendingAnchorMantissa != 0) { */
/*             // let's explicitly set to 0 rather than relying on default of declaration */
/*             localVars.anchorPeriod = 0; */
/*             localVars.anchorPrice = Exp({mantissa : localVars.pendingAnchorMantissa}); */

/*             // Verify movement is within max swing of pending anchor (currently: 10%) */
/*             (err, localVars.swing) = calculateSwing(localVars.anchorPrice, localVars.price); */
/*             if (err != Error.NO_ERROR) { */
/*                 return failOracleWithDetails(asset, OracleError.FAILED_TO_SET_PRICE, OracleFailureInfo.SET_PRICE_CALCULATE_SWING, uint(err)); */
/*             } */

/*             // Fail when swing > maxSwing */
/*             if (greaterThanExp(localVars.swing, maxSwing)) { */
/*                 return failOracleWithDetails(asset, OracleError.FAILED_TO_SET_PRICE, OracleFailureInfo.SET_PRICE_MAX_SWING_CHECK, localVars.swing.mantissa); */
/*             } */
/*         } else { */
/*             localVars.anchorPeriod = anchors[asset].period; */
/*             localVars.anchorPrice = Exp({mantissa : anchors[asset].priceMantissa}); */

/*             if (localVars.anchorPeriod != 0) { */
/*                 (err, localVars.priceCapped, localVars.price) = capToMax(localVars.anchorPrice, localVars.price); */
/*                 if (err != Error.NO_ERROR) { */
/*                     return failOracleWithDetails(asset, OracleError.FAILED_TO_SET_PRICE, OracleFailureInfo.SET_PRICE_CAP_TO_MAX, uint(err)); */
/*                 } */
/*                 if (localVars.priceCapped) { */
/*                     // save for use in log */
/*                     localVars.cappingAnchorPriceMantissa = localVars.anchorPrice.mantissa; */
/*                 } */
/*             } else { */
/*                 // Setting first price. Accept as is (already assigned above from requestedPriceMantissa) and use as anchor */
/*                 localVars.anchorPrice = Exp({mantissa : requestedPriceMantissa}); */
/*             } */
/*         } */

/*         // Fail if anchorPrice or price is zero. */
/*         // zero anchor represents an unexpected situation likely due to a problem in this contract */
/*         // zero price is more likely as the result of bad input from the caller of this function */
/*         if (isZeroExp(localVars.anchorPrice)) { */
/*             // If we get here price could also be zero, but it does not seem worthwhile to distinguish the 3rd case */
/*             return failOracle(asset, OracleError.FAILED_TO_SET_PRICE, OracleFailureInfo.SET_PRICE_NO_ANCHOR_PRICE_OR_INITIAL_PRICE_ZERO); */
/*         } */

/*         if (isZeroExp(localVars.price)) { */
/*             return failOracle(asset, OracleError.FAILED_TO_SET_PRICE, OracleFailureInfo.SET_PRICE_ZERO_PRICE); */
/*         } */

/*         // BEGIN SIDE EFFECTS */

/*         // Set pendingAnchor = Nothing */
/*         // Pending anchor is only used once. */
/*         if (pendingAnchors[asset] != 0) { */
/*             pendingAnchors[asset] = 0; */
/*         } */

/*         // If currentPeriod > anchorPeriod: */
/*         //  Set anchors[asset] = (currentPeriod, price) */
/*         //  The new anchor is if we're in a new period or we had a pending anchor, then we become the new anchor */
/*         if (localVars.currentPeriod > localVars.anchorPeriod) { */
/*             anchors[asset] = Anchor({period : localVars.currentPeriod, priceMantissa : localVars.price.mantissa}); */
/*         } */

/*         uint previousPrice = _assetPrices[asset].mantissa; */

/*         setPriceStorageInternal(asset, localVars.price.mantissa); */

/*         emit PricePosted(asset, previousPrice, requestedPriceMantissa, localVars.price.mantissa); */

/*         if (localVars.priceCapped) { */
/*             // We have set a capped price. Log it so we can detect the situation and investigate. */
/*             emit CappedPricePosted(asset, requestedPriceMantissa, localVars.cappingAnchorPriceMantissa, localVars.price.mantissa); */
/*         } */

/*         return uint(OracleError.NO_ERROR); */
/*     } */
/* } */
