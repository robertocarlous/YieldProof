// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAaveV3
 * @notice Comprehensive Aave V3 Protocol interfaces for Celo
 * @dev Full interface definitions for Pool, AToken, and related contracts
 */

/**
 * @title IPoolAddressesProvider
 * @notice Main registry of addresses for Aave V3
 */
interface IPoolAddressesProvider {
    function getPool() external view returns (address);
    function getPriceOracle() external view returns (address);
    function getACLManager() external view returns (address);
}

/**
 * @title IPool
 * @notice Main Aave V3 Pool interface with comprehensive functionality
 */
interface IPool {
    /**
     * @notice Supply assets to Aave to earn interest
     * @param asset The address of the underlying asset to supply
     * @param amount The amount to be supplied
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode Code used to register the integrator originating the operation
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    /**
     * @notice Withdraw assets from Aave
     * @param asset The address of the underlying asset to withdraw
     * @param amount The amount to be withdrawn (use type(uint256).max for full balance)
     * @param to The address that will receive the underlying asset
     * @return The final amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    /**
     * @notice Get user account data across all reserves
     * @param user The address of the user
     * @return totalCollateralBase Total collateral in base currency
     * @return totalDebtBase Total debt in base currency
     * @return availableBorrowsBase Available borrows in base currency
     * @return currentLiquidationThreshold Current liquidation threshold
     * @return ltv Loan to value
     * @return healthFactor Current health factor
     */
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );

    /**
     * @notice Get reserve data for a specific asset
     * @param asset The address of the underlying asset
     * @return configuration Reserve configuration
     * @return liquidityIndex Liquidity index
     * @return currentLiquidityRate Current liquidity rate
     * @return variableBorrowIndex Variable borrow index
     * @return currentVariableBorrowRate Current variable borrow rate
     * @return currentStableBorrowRate Current stable borrow rate
     * @return lastUpdateTimestamp Last update timestamp
     * @return id Reserve id
     * @return aTokenAddress aToken address
     * @return stableDebtTokenAddress Stable debt token address
     * @return variableDebtTokenAddress Variable debt token address
     * @return interestRateStrategyAddress Interest rate strategy address
     * @return accruedToTreasury Accrued to treasury
     * @return unbacked Unbacked amount
     * @return isolationModeTotalDebt Isolation mode total debt
     */
    function getReserveData(address asset)
        external
        view
        returns (
            uint256 configuration,
            uint128 liquidityIndex,
            uint128 currentLiquidityRate,
            uint128 variableBorrowIndex,
            uint128 currentVariableBorrowRate,
            uint128 currentStableBorrowRate,
            uint40 lastUpdateTimestamp,
            uint16 id,
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress,
            address interestRateStrategyAddress,
            uint128 accruedToTreasury,
            uint128 unbacked,
            uint128 isolationModeTotalDebt
        );

    /**
     * @notice Get normalized income for a reserve
     * @param asset The address of the underlying asset
     * @return The reserve's normalized income
     */
    function getReserveNormalizedIncome(address asset)
        external
        view
        returns (uint256);
}

/**
 * @title IAToken
 * @notice Aave interest-bearing token interface (ERC-4626 compatible)
 */
interface IAToken {
    /**
     * @notice Returns the address of the underlying asset
     * @return The address of the underlying asset
     */
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);

    /**
     * @notice Returns the scaled balance of the user
     * @param user The address of the user
     * @return The scaled balance of the user
     */
    function scaledBalanceOf(address user) external view returns (uint256);

    /**
     * @notice Returns the scaled total supply
     * @return The scaled total supply
     */
    function scaledTotalSupply() external view returns (uint256);

    /**
     * @notice Returns the balance of the user
     * @param user The address of the user
     * @return The balance of the user
     */
    function balanceOf(address user) external view returns (uint256);

    /**
     * @notice Returns the total supply
     * @return The total supply
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Transfers aTokens
     * @param to The recipient
     * @param amount The amount to transfer
     * @return True if successful
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @notice Approves spender
     * @param spender The spender
     * @param amount The amount to approve
     * @return True if successful
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @notice Returns the allowance
     * @param owner The owner
     * @param spender The spender
     * @return The allowance
     */
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title IRewardsController
 * @notice Interface for Aave V3 rewards controller
 */
interface IRewardsController {
    /**
     * @notice Claims all rewards for a user
     * @param assets The list of assets to claim rewards from
     * @param amount The amount of rewards to claim
     * @param to The address to send the rewards to
     * @param reward The reward token address
     * @return The amount of rewards claimed
     */
    function claimRewards(
        address[] calldata assets,
        uint256 amount,
        address to,
        address reward
    ) external returns (uint256);

    /**
     * @notice Get user rewards
     * @param assets The list of assets
     * @param user The user address
     * @param reward The reward token address
     * @return The amount of unclaimed rewards
     */
    function getUserRewards(
        address[] calldata assets,
        address user,
        address reward
    ) external view returns (uint256);
}

/**
 * @title IPriceOracle
 * @notice Interface for Aave V3 price oracle
 */
interface IPriceOracle {
    /**
     * @notice Get asset price in base currency
     * @param asset The asset address
     * @return The price in base currency
     */
    function getAssetPrice(address asset) external view returns (uint256);
}
