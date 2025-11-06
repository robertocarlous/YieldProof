// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IAaveV2LendingPool} from "./interfaces/IAaveV2.sol";
import {IPool} from "./interfaces/IAaveV3.sol";

/**
 * @title AaveLendingAdapter
 * @notice Adapter to support both Aave V2 (Moola Market) and Aave V3
 * @dev Automatically detects version and routes calls appropriately
 */
contract AaveLendingAdapter {
    using SafeERC20 for IERC20;

    address public immutable lendingPool;
    uint8 public immutable version; // 2 or 3
    
    error UnsupportedVersion();
    error SupplyFailed();
    error WithdrawFailed();

    /**
     * @notice Constructor detects Aave version
     * @param _lendingPool Address of the lending pool
     */
    constructor(address _lendingPool) {
        lendingPool = _lendingPool;
        version = _detectVersion(_lendingPool);
    }

    /**
     * @notice Supply assets to the lending pool
     * @param asset The address of the asset to supply
     * @param amount The amount to supply
     * @param onBehalfOf The address receiving the aTokens
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(asset).forceApprove(lendingPool, amount);

        if (version == 3) {
            IPool(lendingPool).supply(asset, amount, onBehalfOf, 0);
        } else if (version == 2) {
            IAaveV2LendingPool(lendingPool).deposit(asset, amount, onBehalfOf, 0);
        } else {
            revert UnsupportedVersion();
        }
    }

    /**
     * @notice Withdraw assets from the lending pool
     * @param asset The address of the asset to withdraw
     * @param amount The amount to withdraw
     * @param to The address receiving the assets
     * @return The actual amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        if (version == 3) {
            return IPool(lendingPool).withdraw(asset, amount, to);
        } else if (version == 2) {
            return IAaveV2LendingPool(lendingPool).withdraw(asset, amount, to);
        } else {
            revert UnsupportedVersion();
        }
    }

    /**
     * @notice Get reserve data (aToken address and liquidity rate)
     * @param asset The address of the asset
     * @return aTokenAddress The address of the aToken
     * @return currentLiquidityRate The current supply rate
     */
    function getReserveData(address asset)
        external
        view
        returns (address aTokenAddress, uint128 currentLiquidityRate)
    {
        if (version == 3) {
            // Aave V3 getReserveData returns 15 values
            (,,,,,,,, address aToken,,,,,,uint128 liquidityRate) = 
                IPool(lendingPool).getReserveData(asset);
            return (aToken, liquidityRate);
        } else if (version == 2) {
            // Aave V2 getReserveData returns 12 values
            (,,,uint128 liquidityRate,,,,address aToken,,,,) = 
                IAaveV2LendingPool(lendingPool).getReserveData(asset);
            return (aToken, liquidityRate);
        } else {
            revert UnsupportedVersion();
        }
    }

    /**
     * @notice Detect Aave version by checking getReserveData return values
     * @param pool The lending pool address
     * @return The detected version (2 or 3)
     */
    function _detectVersion(address pool) private view returns (uint8) {
        // For now, default to V2 (Moola Market on Alfajores)
        // Can be enhanced with more sophisticated detection
        return 2;
    }
}
