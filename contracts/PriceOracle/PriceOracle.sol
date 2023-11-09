// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.7;

import { Ownable } from "../Ownable.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { FullMath } from "../Uniswap/UniswapLib.sol";

contract PriceOracle is Ownable {

    /// @dev Configuration used to return the USD price for the associated cToken asset and base unit needed for formatting
    /// There should be 1 TokenConfig object for each supported asset, passed in the constructor.
    struct TokenConfig {
        // Number of smallest units of measurement in a single whole unit. (e.g. 1e18 for ETH)
        uint256 baseUnit;
        // Address of the Compound Token
        address cToken;
        // Address of the feed used to retrieve the asset's price
        address priceFeed;
    }

    /// @dev Mapping of cToken address to TokenConfig used to maintain the supported assets
    mapping (address => TokenConfig) tokenConfigs;

    /// @notice The event emitted when a new asset is added to the mapping
    /// @param cToken cToken address that the config was added for
    /// @param baseUnit Number of smallest units of measurement in a single whole unit for the underlying cToken asset.
    /// @param priceFeed Address of the feed used to retrieve the asset's price
    event PriceOracleAssetAdded(address indexed cToken, uint256 baseUnit, address priceFeed);

    /// @notice The event emitted when the price feed for an existing config is updated
    /// @param cToken cToken address that the config was added for
    /// @param oldPriceFeed The existing price feed address configured in the token config
    /// @param newPriceFeed The new price feed address the token config is being updated to
    event PriceOracleAssetPriceFeedUpdated(address indexed cToken, address oldPriceFeed, address newPriceFeed);

    /// @notice The event emitted when an asset is removed to the mapping
    /// @param cToken cToken address that the config was removed for
    /// @param baseUnit Number of smallest units of measurement in a single whole unit set in the removed config.
    /// @param priceFeed Address price feed set in the removed config
    event PriceOracleAssetRemoved(address indexed cToken, uint256 baseUnit, address priceFeed);

    /// @notice The max decimals value allowed for price feed
    uint8 internal constant MAX_DECIMALS = 72;

    /// @notice The number of digits the price is scaled to before adjusted by the base units
    uint8 internal constant PRICE_SCALE = 36;

    /// @notice cToken address for config not provided
    error MissingCTokenAddress();

    /// @notice BaseUnit is missing or set to value 0
    error InvalidBaseUnit();

    /// @notice Price feed missing or duplicated
    /// @param priceFeed Price feed address provided
    error InvalidPriceFeed(address priceFeed);

    /// @notice Config already exists
    /// @param cToken cToken address provided
    error DuplicateConfig(address cToken);

    /// @notice Config does not exist in the mapping
    /// @param cToken cToken address provided
    error ConfigNotFound(address cToken);

    /// @notice Decimals retrieved from the price feed is too large to use for formatting
    /// @param decimals Decimals retrieve from the price feed
    error DecimalsTooLarge(uint8 decimals);

    /// @notice Price returned by the feed is negative
    /// @param price Price returned from the price feed
    error NegativePrice(int256 price);

    /// @notice Same price feed as the existing one was provided when updating the price feed config
    /// @param cToken cToken address that the price feed update is for
    /// @param existingPriceFeed Price feed address set in the existing config
    /// @param newPriceFeed Price feed address provided to update to
    error UnchangedPriceFeed(address cToken, address existingPriceFeed, address newPriceFeed);

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
            if (tokenConfigs[config.cToken].cToken != address(0)) revert DuplicateConfig(config.cToken);
            tokenConfigs[config.cToken] = config;
        }
    }

    /**
     * @notice Get the underlying price of a cToken, in the format expected by the Comptroller.
     * @dev Comptroller needs prices in the format: ${raw price} * 1e(36-decimals) / baseUnit
     *      'baseUnit' is the number of smallest units of measurement in a single whole unit.
     *      'decimals' is a value supplied by the price feed that represent the number of decimals the price feed reports with.
     *      For example, the baseUnit of ETH is 1e18 and its price feed provides 8 decimal places
     *      We must scale the price such as: ${raw price} * 1e(36 - 8) / 1e18.
     * @param cToken The cToken address for price retrieval
     * @return Price denominated in USD for the given cToken address, in the format expected by the Comptroller.
     */
    function getUnderlyingPrice(address cToken)
        external
        view
        returns (uint256)
    {
        TokenConfig memory config = tokenConfigs[cToken];
        if (config.cToken == address(0)) revert ConfigNotFound(cToken);
        // Initialize the aggregator to read the price from
        AggregatorV3Interface priceFeed = AggregatorV3Interface(config.priceFeed);
        // Retrieve decimals from feed for formatting
        uint8 decimals = priceFeed.decimals();
        // Fail safe check since this is an unrealistic scenario. The number of digits that the int256 answer can have naturally limits decimals
        // but this protects against an erroneous uint8 values
        if (decimals > MAX_DECIMALS) revert DecimalsTooLarge(decimals);
        // Retrieve price from feed
        (
            /* uint80 roundID */,
            int256 answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        if (answer < 0) revert NegativePrice(answer);
        uint256 price = uint256(answer);

        // Number of decimals determines whether the price needs to be multiplied or divided for scaling
        // Handle the 2 scenarios separately to ensure a non-fractional scale value
        if (decimals <= PRICE_SCALE) {
            // Decimals is always >=0 so the scale max value is 1e36 here and not at risk of overflowing
            uint256 scale = 10 ** (PRICE_SCALE - decimals);
            return FullMath.mulDiv(price, scale, config.baseUnit);
        } else {
            // Decimals is capped at 72 by earlier validation so scale max value is 1e36 here and not at risk of overflowing
            uint256 scale = 10 ** (decimals - PRICE_SCALE);
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
        if (config.cToken == address(0)) revert ConfigNotFound(cToken);
        return config;
    }

    /**
     * @notice Adds a new token config to enable the contract to provide prices for a new asset
     * @param config Token config struct that contains the info for a new asset configuration
     */
    function addConfig(TokenConfig calldata config) external onlyOwner {
        validateTokenConfig(config);
        TokenConfig memory existingConfig = tokenConfigs[config.cToken];
        // Check if duplicate configs were submitted for the same cToken
        if (existingConfig.cToken != address(0)) revert DuplicateConfig(existingConfig.cToken);

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
        if (config.cToken == address(0)) revert ConfigNotFound(cToken);
        // Validate price feed
        if (priceFeed == address(0)) revert InvalidPriceFeed(priceFeed);
        // Check if existing price feed is the same as the new one sent
        if (config.priceFeed == priceFeed) revert UnchangedPriceFeed(cToken, config.priceFeed, priceFeed);

        address existingPriceFeed = config.priceFeed;
        config.priceFeed = priceFeed;
        emit PriceOracleAssetPriceFeedUpdated(cToken, existingPriceFeed, priceFeed);
    }

    /**
     * @notice Removes a token config to no longer support the asset
     * @param cToken The cToken address that the token config should be removed for
     */
    function removeConfig(address cToken) external onlyOwner {
        TokenConfig memory config = tokenConfigs[cToken];
        // Check if config exists for cToken
        if (config.cToken == address(0)) revert ConfigNotFound(cToken);

        delete tokenConfigs[cToken];
        emit PriceOracleAssetRemoved(cToken, config.baseUnit, config.priceFeed);
    }

    /**
     * @notice Validates a token config
     * @dev All fields are required
     * @param config TokenConfig struct that needs to be validated
     */
    function validateTokenConfig(TokenConfig memory config) internal pure {
        if (config.cToken == address(0)) revert MissingCTokenAddress();
        // Dual check of field being present and being non-zero
        if (config.baseUnit == 0) revert InvalidBaseUnit();
        if (config.priceFeed == address(0)) revert InvalidPriceFeed(config.priceFeed);
    }
}
