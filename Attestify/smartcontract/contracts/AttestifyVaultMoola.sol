// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IAaveV2LendingPool} from "./interfaces/IAaveV2.sol";

/**
 * @title AttestifyVaultMoola
 * @notice ERC-4626 compliant vault for Moola Market (Aave V2) on Celo Alfajores
 * @dev Simplified version optimized for testnet deployment with full functionality
 */
contract AttestifyVaultMoola is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    /* ========== STATE VARIABLES ========== */

    IAaveV2LendingPool public immutable LENDING_POOL;
    address public aToken;
    address public treasury;
    uint256 public reserveRatio; // Basis points
    uint256 public performanceFee; // Basis points

    /* ========== CONSTANTS ========== */

    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DEFAULT_RESERVE_RATIO = 1000; // 10%
    uint256 private constant DEFAULT_PERFORMANCE_FEE = 1000; // 10%

    /* ========== ERRORS ========== */

    error InvalidAmount();
    error InvalidAddress();
    error MoolaOperationFailed();
    error InsufficientBalance();

    /* ========== EVENTS ========== */

    event Supplied(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldHarvested(uint256 amount, uint256 fee);
    event ReserveRatioUpdated(uint256 newRatio);
    event PerformanceFeeUpdated(uint256 newFee);

    /**
     * @notice Constructor
     * @param _asset The underlying asset (cUSD)
     * @param _name Vault token name
     * @param _symbol Vault token symbol
     * @param _lendingPool Moola Market LendingPool address
     * @param _treasury Treasury address for fees
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _lendingPool,
        address _treasury
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        if (_lendingPool == address(0) || _treasury == address(0)) {
            revert InvalidAddress();
        }

        LENDING_POOL = IAaveV2LendingPool(_lendingPool);
        treasury = _treasury;
        reserveRatio = DEFAULT_RESERVE_RATIO;
        performanceFee = DEFAULT_PERFORMANCE_FEE;
    }

    /**
     * @notice Initialize aToken address (call after deployment)
     */
    function initializeAToken() external onlyOwner {
        if (aToken != address(0)) revert InvalidAddress();
        
        (,,,,,,,address aTokenAddress,,,,) = LENDING_POOL.getReserveData(address(asset()));
        
        if (aTokenAddress == address(0)) {
            revert MoolaOperationFailed();
        }
        
        aToken = aTokenAddress;
    }

    /* ========== ERC4626 OVERRIDES ========== */

    /**
     * @notice Total assets under management
     */
    function totalAssets() public view override returns (uint256) {
        uint256 aTokenBalance = aToken != address(0) ? IERC20(aToken).balanceOf(address(this)) : 0;
        return aTokenBalance + IERC20(asset()).balanceOf(address(this));
    }

    /**
     * @notice Deposit assets and receive vault shares
     */
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();
        
        shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);
        
        // Supply to Moola
        _supplyToMoola(assets);
        
        emit Supplied(receiver, assets);
    }

    /**
     * @notice Withdraw assets by burning vault shares
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();
        
        shares = previewWithdraw(assets);
        
        // Withdraw from Moola if needed
        uint256 balance = IERC20(asset()).balanceOf(address(this));
        if (balance < assets) {
            _withdrawFromMoola(assets - balance);
        }
        
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        
        emit Withdrawn(receiver, assets);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @notice Supply assets to Moola Market
     */
    function _supplyToMoola(uint256 amount) internal {
        uint256 reserve = (amount * reserveRatio) / BASIS_POINTS;
        uint256 toSupply = amount - reserve;
        
        if (toSupply > 0) {
            IERC20(asset()).forceApprove(address(LENDING_POOL), toSupply);
            LENDING_POOL.deposit(address(asset()), toSupply, address(this), 0);
        }
    }

    /**
     * @notice Withdraw assets from Moola Market
     */
    function _withdrawFromMoola(uint256 amount) internal {
        LENDING_POOL.withdraw(address(asset()), amount, address(this));
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Get current APY from Moola Market
     * @return APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        (,,,uint128 currentLiquidityRate,,,,,,,,) = 
            LENDING_POOL.getReserveData(address(asset()));
        
        // Convert from RAY to basis points (RAY is 10^27, we want 10^4)
        return uint256(currentLiquidityRate) / 1e23;
    }

    /**
     * @notice Get vault statistics
     */
    function getVaultStats() external view returns (
        uint256 totalAsset,
        uint256 totalShares,
        uint256 apy,
        uint256 reserve
    ) {
        totalAsset = totalAssets();
        totalShares = totalSupply();
        
        (,,,uint128 liquidityRate,,,,,,,,) = 
            LENDING_POOL.getReserveData(address(asset()));
        apy = uint256(liquidityRate) / 1e23;
        
        reserve = IERC20(asset()).balanceOf(address(this));
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Harvest yield and collect performance fees
     */
    function harvest() external onlyOwner {
        if (aToken == address(0)) revert MoolaOperationFailed();
        
        uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));
        uint256 expectedBalance = totalSupply(); // Simplified
        
        if (aTokenBalance > expectedBalance) {
            uint256 yield = aTokenBalance - expectedBalance;
            uint256 fee = (yield * performanceFee) / BASIS_POINTS;
            
            if (fee > 0) {
                _withdrawFromMoola(fee);
                IERC20(asset()).safeTransfer(treasury, fee);
            }
            
            emit YieldHarvested(yield, fee);
        }
    }

    /**
     * @notice Update reserve ratio
     */
    function setReserveRatio(uint256 _reserveRatio) external onlyOwner {
        if (_reserveRatio > BASIS_POINTS) revert InvalidAmount();
        reserveRatio = _reserveRatio;
        emit ReserveRatioUpdated(_reserveRatio);
    }

    /**
     * @notice Update performance fee
     */
    function setPerformanceFee(uint256 _performanceFee) external onlyOwner {
        if (_performanceFee > BASIS_POINTS) revert InvalidAmount();
        performanceFee = _performanceFee;
        emit PerformanceFeeUpdated(_performanceFee);
    }

    /**
     * @notice Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw all from Moola
     */
    function emergencyWithdrawFromMoola() external onlyOwner {
        if (aToken == address(0)) return;
        
        uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));
        if (aTokenBalance > 0) {
            _withdrawFromMoola(aTokenBalance);
        }
    }
}
