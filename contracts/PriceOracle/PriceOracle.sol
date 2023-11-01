// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.7;

import { Ownable } from "../Ownable.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { FullMath } from "../Uniswap/UniswapLib.sol";

contract PriceOracle is Ownable {

    /// @dev Configuration used to return the USD price for the associated cToken asset and base unit needed for formatting
    /// There should be 1 TokenConfig object for each supported asset, passed in the constructor.
    struct TokenConfig {
        // The address of the Compound Token
        address cToken;
        // The number of smallest units of measurement in a single whole unit. (e.g. 1e18 for ETH)
        uint256 baseUnit;
        // Address of the feed used to retrieve the asset's price
        address priceFeed;
    }

    /// @dev Mapping of cToken address to TokenConfig used to maintain the supported assets
    mapping (address => TokenConfig) tokenConfigs;

    /// @notice The event emitted when a new asset is added to the mapping
    event PriceOracleAssetAdded(address indexed cToken, uint256 baseUnit, address priceFeed);

    /// @notice The event emitted when the price feed for an existing config is updated
    event PriceOracleAssetPriceFeedUpdated(address indexed cToken, address oldPriceFeed, address newPriceFeed);

    /// @notice The event emitted when an asset is removed to the mapping
    event PriceOracleAssetRemoved(address indexed cToken, uint256 baseUnit, address priceFeed);

    /**
     * @notice Construct a Price Oracle contract for a set of token configurations
     * @param configs The token configurations that define which price feed and base unit to use for each asset
     */
    constructor(TokenConfig[] memory configs) {
        // Populate token config mapping 
        for (uint i = 0; i < configs.length; i++) {
            TokenConfig memory config = configs[i];
            validateTokenConfig(config);
            // Check if duplicate configs were submitted for the same cToken
            require(tokenConfigs[config.cToken].cToken == address(0), "Duplicate config for cToken found");
            tokenConfigs[config.cToken] = config;
        }
    }

    /**
     * @notice Get the underlying price of a cToken, in the format expected by the Comptroller.
     * @dev Implements the PriceOracle interface for Compound v2.
     * @param cToken The cToken address for price retrieval
     * @return Price denominated in USD for the given cToken address, in the format expected by the Comptroller.
     */
    function getUnderlyingPrice(address cToken)
        external
        view
        returns (uint256)
    {
        TokenConfig memory config = tokenConfigs[cToken];
        require(config.cToken != address(0), "Config not found for cToken");
        // Initialize the aggregator to read the price from
        AggregatorV3Interface priceFeed = AggregatorV3Interface(config.priceFeed);
        // Retrieve decimals from feed for formatting
        uint8 decimals = priceFeed.decimals();
        // Fail safe check since this is an unrealistic scenario. The number of digits that the int256 answer can have naturally limits decimals
        // but this protects against an erroneous uint8 values
        require(decimals <= 72, "Decimals is too large to properly use in formatting the price");
        // Retrieve price from feed
        (
            /* uint80 roundID */,
            int256 answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        require(answer >= 0, "Price cannot be negative");
        uint256 price = uint256(answer);

        // Comptroller needs prices in the format: ${raw price} * 1e36 / baseUnit
        // The baseUnit of an asset is the amount of the smallest denomination of that asset per whole.
        // The decimals represent the number of decimals the price feed answer reports with. Supplied by the price feed.
        // For example, the baseUnit of ETH is 1e18 and its price feed provides 8 decimal places
        // We must scale the price by 1e(36 - decimals) / baseUnit

        // Number of decimals determines whether the price needs to be multiplied or divided for scaling
        // Handle the 2 scenarios separately to ensure a non-fractional scale value
        if (decimals <= 36) {
            // Decimals is always >=0 so the scale max value is 1e36 here and not at risk of overflowing
            uint256 scale = 10 ** (36 - decimals);
            return FullMath.mulDiv(price, scale, config.baseUnit);
        } else {
            // Decimals is capped at 72 by earlier validation so scale max value is 1e36 here and not at risk of overflowing
            uint256 scale = 10 ** (decimals - 36);
            // Divide price by scale and base unit separately
            // Multiplying scale and base unit before dividing price could result in an overflow
            uint256 scaledPrice = FullMath.mulDiv(price, 1, scale);
            return FullMath.mulDiv(scaledPrice, 1, config.baseUnit);
        }
    }

    /**
     * @notice Retrieves the token config for a particular cToken address
     * @param cToken The cToken address that the token config should be returned for
     */
    function getConfig(address cToken) external view returns (TokenConfig memory) {
        TokenConfig memory config = tokenConfigs[cToken];
        // Check if config exists for cToken
        require(config.cToken != address(0), "Config for cToken does not exist");
        return config;
    }

    /**
     * @notice Adds a new token config to enable the contract to provide prices for a new asset
     * @param config Token config struct that contains the info for a new asset configuration
     */
    function addConfig(TokenConfig calldata config) external onlyOwner {
        // Check if duplicate configs were submitted for the same cToken
        require(tokenConfigs[config.cToken].cToken == address(0), "Config for cToken already exists");
        validateTokenConfig(config);

        tokenConfigs[config.cToken] = config;
        emit PriceOracleAssetAdded(config.cToken, config.baseUnit, config.priceFeed);
    }

    /**
     * @notice Updates the price feed in the token config for a particular cToken
     * @param cToken The cToken address that the config needs to be updated for
     * @param priceFeed The address of the new price feed the config needs to be updated to
     */
    function updateConfigPriceFeed(address cToken, address priceFeed) external onlyOwner {
        TokenConfig storage config = tokenConfigs[cToken];
        // Check if config exists for cToken
        require(config.cToken != address(0), "Config does not exist for cToken");
        // Validate price feed
        require(priceFeed != address(0), "Invalid new price feed address");
        require(config.priceFeed != priceFeed, "Price feed address same as the existing one");

        emit PriceOracleAssetPriceFeedUpdated(cToken, config.priceFeed, priceFeed);
        config.priceFeed = priceFeed;
    }

    /**
     * @notice Removes a token config to no longer support the asset
     * @param cToken The cToken address that the token config should be removed for
     */
    function removeConfig(address cToken) external onlyOwner {
        TokenConfig memory config = tokenConfigs[cToken];
        // Check if config exists for cToken
        require(config.cToken != address(0), "Config for cToken does not exist");

        delete tokenConfigs[cToken];
        emit PriceOracleAssetRemoved(cToken, config.baseUnit, config.priceFeed);
    }

    /**
     * @notice Validates a token config
     * @dev All fields are required
     * @param config TokenConfig struct that needs to be validated
     */
    function validateTokenConfig(TokenConfig memory config) internal pure {
        require(config.cToken != address(0), "Config missing cToken address");
        // Dual check of field being present and being non-zero
        require(config.baseUnit != 0, "Config either missing base unit or set to 0");
        require(config.priceFeed != address(0), "Config missing price feed address");
    }
}