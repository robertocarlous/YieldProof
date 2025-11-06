// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAaveV3Enhanced
 * @notice Enhanced Aave V3 interfaces with full production features
 * @dev Includes scaled balance calculations, liquidity index, and rewards
 */

/**
 * @title IPool
 * @notice Main Aave V3 Pool interface
 */
interface IPool {
    /**
     * @notice Supply assets to earn interest
     * @param asset The address of the underlying asset to supply
     * @param amount The amount to be supplied
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode Code used to register the integrator
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
     * @notice Get reserve normalized income (liquidity index)
     * @param asset The address of the underlying asset
     * @return The reserve's normalized income (liquidity index in ray units 1e27)
     */
    function getReserveNormalizedIncome(address asset)
        external
        view
        returns (uint256);

    /**
     * @notice Get reserve data for a specific asset
     * @param asset The address of the underlying asset
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
}

/**
 * @title IAToken
 * @notice Aave interest-bearing token interface with scaled balance support
 * @dev aTokens automatically accrue interest through rebasing mechanism
 */
interface IAToken {
    /**
     * @notice Returns the address of the underlying asset
     * @return The address of the underlying asset
     */
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);

    /**
     * @notice Returns the scaled balance of the user
     * @dev Scaled balance = balance / liquidity index
     * @dev This is the actual stored balance, constant unless deposits/withdrawals occur
     * @param user The address of the user
     * @return The scaled balance of the user
     */
    function scaledBalanceOf(address user) external view returns (uint256);

    /**
     * @notice Returns the scaled total supply
     * @dev Scaled total supply = total supply / liquidity index
     * @return The scaled total supply
     */
    function scaledTotalSupply() external view returns (uint256);

    /**
     * @notice Returns the balance of the user (includes accrued interest)
     * @dev Balance = scaledBalance * liquidity index
     * @dev This grows over time as interest accrues
     * @param user The address of the user
     * @return The balance of the user
     */
    function balanceOf(address user) external view returns (uint256);

    /**
     * @notice Returns the total supply (includes accrued interest)
     * @dev Total supply = scaledTotalSupply * liquidity index
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

    /**
     * @notice Get the pool address
     * @return The pool address
     */
    function POOL() external view returns (address);
}

/**
 * @title IRewardsController
 * @notice Interface for Aave V3 rewards controller
 * @dev Handles distribution of AAVE tokens and other incentives
 */
interface IRewardsController {
    /**
     * @notice Claims all rewards for a user
     * @param assets The list of assets to claim rewards from (aTokens)
     * @param amount The amount of rewards to claim (use type(uint256).max for all)
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
     * @notice Claims all rewards to self
     * @param assets The list of assets to claim rewards from
     * @param to The address to send rewards to
     * @return rewardsList List of reward token addresses
     * @return claimedAmounts List of claimed amounts per reward token
     */
    function claimAllRewards(
        address[] calldata assets,
        address to
    ) external returns (address[] memory rewardsList, uint256[] memory claimedAmounts);

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

    /**
     * @notice Get all user rewards
     * @param assets The list of assets
     * @param user The user address
     * @return rewardsList List of reward token addresses
     * @return unclaimedAmounts List of unclaimed amounts per reward token
     */
    function getAllUserRewards(
        address[] calldata assets,
        address user
    ) external view returns (address[] memory rewardsList, uint256[] memory unclaimedAmounts);
}

/**
 * @title IAaveProtocolDataProvider
 * @notice Interface for querying Aave protocol data
 */
interface IAaveProtocolDataProvider {
    /**
     * @notice Get reserve token addresses
     * @param asset The underlying asset address
     * @return aTokenAddress The aToken address
     * @return stableDebtTokenAddress The stable debt token address
     * @return variableDebtTokenAddress The variable debt token address
     */
    function getReserveTokensAddresses(address asset)
        external
        view
        returns (
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress
        );

    /**
     * @notice Get user reserve data
     * @param asset The underlying asset address
     * @param user The user address
     * @return currentATokenBalance The current aToken balance
     * @return currentStableDebt The current stable debt
     * @return currentVariableDebt The current variable debt
     * @return principalStableDebt The principal stable debt
     * @return scaledVariableDebt The scaled variable debt
     * @return stableBorrowRate The stable borrow rate
     * @return liquidityRate The liquidity rate
     * @return stableRateLastUpdated Stable rate last updated timestamp
     * @return usageAsCollateralEnabled Whether the asset is used as collateral
     */
    function getUserReserveData(address asset, address user)
        external
        view
        returns (
            uint256 currentATokenBalance,
            uint256 currentStableDebt,
            uint256 currentVariableDebt,
            uint256 principalStableDebt,
            uint256 scaledVariableDebt,
            uint256 stableBorrowRate,
            uint256 liquidityRate,
            uint40 stableRateLastUpdated,
            bool usageAsCollateralEnabled
        );

    /**
     * @notice Get reserve configuration data
     * @param asset The underlying asset address
     * @return decimals The decimals of the asset
     * @return ltv The loan to value
     * @return liquidationThreshold The liquidation threshold
     * @return liquidationBonus The liquidation bonus
     * @return reserveFactor The reserve factor
     * @return usageAsCollateralEnabled Whether the asset can be used as collateral
     * @return borrowingEnabled Whether borrowing is enabled
     * @return stableBorrowRateEnabled Whether stable borrow rate is enabled
     * @return isActive Whether the reserve is active
     * @return isFrozen Whether the reserve is frozen
     */
    function getReserveConfigurationData(address asset)
        external
        view
        returns (
            uint256 decimals,
            uint256 ltv,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 reserveFactor,
            bool usageAsCollateralEnabled,
            bool borrowingEnabled,
            bool stableBorrowRateEnabled,
            bool isActive,
            bool isFrozen
        );
}

/**
 * @title IPriceOracle
 * @notice Interface for Aave V3 price oracle
 */
interface IPriceOracle {
    /**
     * @notice Get asset price in base currency
     * @param asset The asset address
     * @return The price in base currency (8 decimals)
     */
    function getAssetPrice(address asset) external view returns (uint256);
}
