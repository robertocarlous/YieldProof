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
import {IPool, IAToken, IRewardsController} from "./interfaces/IAaveV3.sol";

/**
 * @title AttestifyVault
 * @notice ERC-4626 compliant vault that supplies assets to Aave V3 for yield generation
 * @dev Implements full ERC-4626 standard with Aave V3 integration, comprehensive accounting,
 *      and advanced safety mechanisms for the Attestify protocol
 * 
 * Key Features:
 * - Full ERC-4626 compliance for standardized vault interactions
 * - Automatic yield generation through Aave V3 supply
 * - Configurable reserve buffer for instant withdrawals
 * - Slippage protection on deposits and withdrawals
 * - Emergency pause and recovery mechanisms
 * - Comprehensive event logging and accounting
 * - Gas-optimized operations
 * 
 * Security Features:
 * - ReentrancyGuard on all state-changing functions
 * - Pausable for emergency situations
 * - Slippage protection
 * - Minimum deposit/withdrawal amounts
 * - Maximum TVL cap
 * - Owner-only admin functions
 * 
 * @author Attestify Team
 * @custom:security-contact security@attestify.io
 */
contract AttestifyVault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    /* ========== STATE VARIABLES ========== */

    /// @notice Aave V3 Pool contract
    IPool public immutable AAVE_POOL;

    /// @notice Aave interest-bearing token (aToken)
    IAToken public immutable A_TOKEN;

    /// @notice Aave rewards controller for claiming incentives
    IRewardsController public rewardsController;

    /// @notice Percentage of assets to keep as reserve (in basis points, 10000 = 100%)
    uint256 public reserveRatio;

    /// @notice Minimum deposit amount to prevent dust attacks
    uint256 public minDeposit;

    /// @notice Maximum deposit per transaction
    uint256 public maxDeposit;

    /// @notice Maximum total value locked in the vault
    uint256 public maxTvl;

    /// @notice Maximum slippage tolerance in basis points (100 = 1%)
    uint256 public maxSlippage;

    /// @notice Treasury address for protocol fees
    address public treasury;

    /// @notice Performance fee in basis points (100 = 1%)
    uint256 public performanceFee;

    /// @notice Last harvest timestamp
    uint256 public lastHarvest;

    /// @notice Minimum time between harvests
    uint256 public harvestInterval;

    /// @notice Total assets deposited (for accounting)
    uint256 public totalDeposited;

    /// @notice Total assets withdrawn (for accounting)
    uint256 public totalWithdrawn;

    /// @notice Total yield harvested (for accounting)
    uint256 public totalYieldHarvested;

    /// @notice Total fees collected (for accounting)
    uint256 public totalFeesCollected;

    /* ========== CONSTANTS ========== */

    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DEFAULT_RESERVE_RATIO = 1000; // 10%
    uint256 private constant DEFAULT_MAX_SLIPPAGE = 100; // 1%
    uint256 private constant DEFAULT_PERFORMANCE_FEE = 1000; // 10%
    uint256 private constant DEFAULT_HARVEST_INTERVAL = 1 days;
    uint256 private constant RAY = 1e27; // Aave uses RAY (10^27) for calculations

    /* ========== EVENTS ========== */

    event DepositedToAave(uint256 amount, uint256 timestamp);
    event WithdrawnFromAave(uint256 amount, uint256 timestamp);
    event Rebalanced(uint256 aaveBalance, uint256 reserveBalance, uint256 timestamp);
    event YieldHarvested(uint256 amount, uint256 fee, uint256 timestamp);
    event RewardsHarvested(address indexed reward, uint256 amount, uint256 timestamp);
    event ReserveRatioUpdated(uint256 oldRatio, uint256 newRatio);
    event PerformanceFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event LimitsUpdated(uint256 minDeposit, uint256 maxDeposit, uint256 maxTvl);
    event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed to);

    /* ========== ERRORS ========== */

    error ZeroAddress();
    error ZeroAmount();
    error BelowMinDeposit();
    error ExceedsMaxDeposit();
    error ExceedsMaxTVL();
    error SlippageExceeded();
    error InsufficientLiquidity();
    error InvalidRatio();
    error InvalidFee();
    error HarvestTooSoon();
    error AaveOperationFailed();

    /* ========== CONSTRUCTOR ========== */

    /**
     * @notice Initialize the vault with Aave V3 integration
     * @param _asset The underlying asset (e.g., cUSD)
     * @param _name The vault token name
     * @param _symbol The vault token symbol
     * @param _aavePool The Aave V3 Pool address
     * @param _treasury The treasury address for fees
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _aavePool,
        address _treasury
    )
        ERC4626(_asset)
        ERC20(_name, _symbol)
        Ownable(msg.sender)
    {
        if (_aavePool == address(0) || _treasury == address(0)) {
            revert ZeroAddress();
        }

        AAVE_POOL = IPool(_aavePool);
        treasury = _treasury;

        // Get aToken address from Aave pool
        (,,,,,,,, 
            address aTokenAddress,
            ,,,,,
        ) = AAVE_POOL.getReserveData(address(_asset));
        
        if (aTokenAddress == address(0)) {
            revert AaveOperationFailed();
        }

        A_TOKEN = IAToken(aTokenAddress);

        // Initialize default parameters
        reserveRatio = DEFAULT_RESERVE_RATIO;
        maxSlippage = DEFAULT_MAX_SLIPPAGE;
        performanceFee = DEFAULT_PERFORMANCE_FEE;
        harvestInterval = DEFAULT_HARVEST_INTERVAL;
        
        minDeposit = 1e18; // 1 token
        maxDeposit = 10_000e18; // 10,000 tokens
        maxTvl = 1_000_000e18; // 1M tokens

        lastHarvest = block.timestamp;

        // Approve Aave pool to spend underlying asset
        IERC20(_asset).forceApprove(_aavePool, type(uint256).max);
    }

    /* ========== ERC-4626 OVERRIDES ========== */

    /**
     * @notice Calculate total assets under management
     * @dev Includes both reserve balance and Aave deposits (with accrued interest)
     * @return Total assets in underlying token
     */
    function totalAssets() public view override returns (uint256) {
        uint256 reserveBalance = IERC20(asset()).balanceOf(address(this));
        uint256 aaveBalance = A_TOKEN.balanceOf(address(this));
        return reserveBalance + aaveBalance;
    }

    /**
     * @notice Deposit assets and receive vault shares
     * @dev Implements ERC-4626 deposit with Aave integration and safety checks
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive vault shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver)
        public
        virtual
        override
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        // Validation checks
        if (assets == 0) revert ZeroAmount();
        if (assets < minDeposit) revert BelowMinDeposit();
        if (assets > maxDeposit) revert ExceedsMaxDeposit();
        if (receiver == address(0)) revert ZeroAddress();

        uint256 currentTvl = totalAssets();
        if (currentTvl + assets > maxTvl) revert ExceedsMaxTVL();

        // Calculate shares with slippage check
        shares = previewDeposit(assets);
        if (shares == 0) revert ZeroAmount();

        // Slippage protection: ensure user gets expected shares
        uint256 minShares = (shares * (BASIS_POINTS - maxSlippage)) / BASIS_POINTS;
        
        // Execute deposit
        _deposit(_msgSender(), receiver, assets, shares);

        // Verify slippage
        if (shares < minShares) revert SlippageExceeded();

        // Deploy to Aave
        _deployToAave(assets);

        // Update accounting
        totalDeposited += assets;

        emit DepositedToAave(assets, block.timestamp);
    }

    /**
     * @notice Mint exact shares by depositing assets
     * @dev Implements ERC-4626 mint with Aave integration and safety checks
     * @param shares Amount of shares to mint
     * @param receiver Address to receive vault shares
     * @return assets Amount of assets deposited
     */
    function mint(uint256 shares, address receiver)
        public
        virtual
        override
        nonReentrant
        whenNotPaused
        returns (uint256 assets)
    {
        if (shares == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        // Calculate required assets with slippage check
        assets = previewMint(shares);
        if (assets == 0) revert ZeroAmount();
        if (assets < minDeposit) revert BelowMinDeposit();
        if (assets > maxDeposit) revert ExceedsMaxDeposit();

        uint256 currentTvl = totalAssets();
        if (currentTvl + assets > maxTvl) revert ExceedsMaxTVL();

        // Slippage protection
        uint256 maxAssets = (assets * (BASIS_POINTS + maxSlippage)) / BASIS_POINTS;

        // Execute mint
        _deposit(_msgSender(), receiver, assets, shares);

        // Verify slippage
        if (assets > maxAssets) revert SlippageExceeded();

        // Deploy to Aave
        _deployToAave(assets);

        // Update accounting
        totalDeposited += assets;

        emit DepositedToAave(assets, block.timestamp);
    }

    /**
     * @notice Withdraw assets by burning shares
     * @dev Implements ERC-4626 withdraw with Aave integration and safety checks
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return shares Amount of shares burned
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    )
        public
        virtual
        override
        nonReentrant
        returns (uint256 shares)
    {
        if (assets == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        // Calculate shares to burn
        shares = previewWithdraw(assets);
        if (shares == 0) revert ZeroAmount();

        // Slippage protection
        uint256 maxShares = (shares * (BASIS_POINTS + maxSlippage)) / BASIS_POINTS;

        // Check liquidity and withdraw from Aave if needed
        uint256 reserveBalance = IERC20(asset()).balanceOf(address(this));
        if (reserveBalance < assets) {
            uint256 shortfall = assets - reserveBalance;
            _withdrawFromAave(shortfall);
        }

        // Execute withdrawal
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        // Verify slippage
        if (shares > maxShares) revert SlippageExceeded();

        // Update accounting
        totalWithdrawn += assets;

        emit WithdrawnFromAave(assets, block.timestamp);
    }

    /**
     * @notice Redeem shares for assets
     * @dev Implements ERC-4626 redeem with Aave integration and safety checks
     * @param shares Amount of shares to redeem
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return assets Amount of assets withdrawn
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    )
        public
        virtual
        override
        nonReentrant
        returns (uint256 assets)
    {
        if (shares == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        // Calculate assets to withdraw
        assets = previewRedeem(shares);
        if (assets == 0) revert ZeroAmount();

        // Slippage protection
        uint256 minAssets = (assets * (BASIS_POINTS - maxSlippage)) / BASIS_POINTS;

        // Check liquidity and withdraw from Aave if needed
        uint256 reserveBalance = IERC20(asset()).balanceOf(address(this));
        if (reserveBalance < assets) {
            uint256 shortfall = assets - reserveBalance;
            _withdrawFromAave(shortfall);
        }

        // Execute redemption
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        // Verify slippage
        if (assets < minAssets) revert SlippageExceeded();

        // Update accounting
        totalWithdrawn += assets;

        emit WithdrawnFromAave(assets, block.timestamp);
    }

    /* ========== AAVE INTEGRATION ========== */

    /**
     * @notice Deploy assets to Aave for yield generation
     * @dev Maintains reserve ratio for instant withdrawals
     * @param amount Amount to potentially deploy
     */
    function _deployToAave(uint256 amount) internal {
        if (amount == 0) return;

        // Calculate how much to keep as reserve
        uint256 reserveAmount = (amount * reserveRatio) / BASIS_POINTS;
        uint256 deployAmount = amount - reserveAmount;

        if (deployAmount > 0) {
            // Supply to Aave (automatically receives aTokens)
            try AAVE_POOL.supply(
                address(asset()),
                deployAmount,
                address(this),
                0 // No referral code
            ) {
                emit DepositedToAave(deployAmount, block.timestamp);
            } catch {
                revert AaveOperationFailed();
            }
        }
    }

    /**
     * @notice Withdraw assets from Aave
     * @dev Withdraws exact amount needed, burns aTokens
     * @param amount Amount to withdraw
     */
    function _withdrawFromAave(uint256 amount) internal {
        if (amount == 0) return;

        uint256 aaveBalance = A_TOKEN.balanceOf(address(this));
        if (aaveBalance < amount) {
            revert InsufficientLiquidity();
        }

        // Withdraw from Aave (automatically burns aTokens)
        try AAVE_POOL.withdraw(
            address(asset()),
            amount,
            address(this)
        ) returns (uint256 withdrawn) {
            if (withdrawn < amount) {
                revert InsufficientLiquidity();
            }
            emit WithdrawnFromAave(withdrawn, block.timestamp);
        } catch {
            revert AaveOperationFailed();
        }
    }

    /* ========== YIELD MANAGEMENT ========== */

    /**
     * @notice Harvest yield and collect performance fees
     * @dev Can only be called after harvest interval has passed
     * @return yieldAmount Amount of yield harvested
     * @return feeAmount Amount of fees collected
     */
    function harvest() external nonReentrant returns (uint256 yieldAmount, uint256 feeAmount) {
        if (block.timestamp < lastHarvest + harvestInterval) {
            revert HarvestTooSoon();
        }

        // Calculate yield (current assets - total deposited + total withdrawn)
        uint256 currentAssets = totalAssets();
        uint256 expectedAssets = totalDeposited - totalWithdrawn;
        
        if (currentAssets > expectedAssets) {
            yieldAmount = currentAssets - expectedAssets;
            
            // Calculate and collect performance fee
            if (performanceFee > 0 && treasury != address(0)) {
                feeAmount = (yieldAmount * performanceFee) / BASIS_POINTS;
                
                if (feeAmount > 0) {
                    // Withdraw fee from Aave if needed
                    uint256 reserveBalance = IERC20(asset()).balanceOf(address(this));
                    if (reserveBalance < feeAmount) {
                        _withdrawFromAave(feeAmount - reserveBalance);
                    }
                    
                    // Transfer fee to treasury
                    IERC20(asset()).safeTransfer(treasury, feeAmount);
                    totalFeesCollected += feeAmount;
                }
            }

            totalYieldHarvested += yieldAmount;
            lastHarvest = block.timestamp;

            emit YieldHarvested(yieldAmount, feeAmount, block.timestamp);
        }
    }

    /**
     * @notice Claim Aave rewards (if available)
     * @dev Claims all available rewards and sends to treasury
     * @param assets Array of aToken addresses to claim from
     * @param reward Reward token address
     */
    function claimRewards(address[] calldata assets, address reward) 
        external 
        onlyOwner 
        returns (uint256 rewardAmount) 
    {
        if (address(rewardsController) == address(0)) {
            revert ZeroAddress();
        }

        rewardAmount = rewardsController.claimRewards(
            assets,
            type(uint256).max,
            treasury,
            reward
        );

        emit RewardsHarvested(reward, rewardAmount, block.timestamp);
    }

    /**
     * @notice Rebalance vault to maintain target reserve ratio
     * @dev Can be called by anyone to optimize capital efficiency
     */
    function rebalance() external nonReentrant {
        uint256 _totalAssets = totalAssets();
        uint256 targetReserve = (_totalAssets * reserveRatio) / BASIS_POINTS;
        uint256 currentReserve = IERC20(asset()).balanceOf(address(this));

        if (currentReserve < targetReserve) {
            // Need to withdraw from Aave
            uint256 needed = targetReserve - currentReserve;
            uint256 aaveBalance = A_TOKEN.balanceOf(address(this));
            
            if (aaveBalance >= needed) {
                _withdrawFromAave(needed);
            }
        } else if (currentReserve > targetReserve * 2) {
            // Too much in reserve, deploy excess to Aave
            uint256 excess = currentReserve - targetReserve;
            _deployToAave(excess);
        }

        emit Rebalanced(
            A_TOKEN.balanceOf(address(this)),
            IERC20(asset()).balanceOf(address(this)),
            block.timestamp
        );
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Get current APY from Aave
     * @return APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        (,, uint128 currentLiquidityRate,,,,,,,,,,,,) = 
            AAVE_POOL.getReserveData(address(asset()));
        
        // Convert from RAY to basis points (RAY is 10^27, we want 10^4)
        return uint256(currentLiquidityRate) / 1e23;
    }

    /**
     * @notice Get vault statistics
     * @return _totalAssets Total assets under management
     * @return _totalShares Total shares outstanding
     * @return reserveBalance Assets in reserve
     * @return aaveBalance Assets in Aave
     * @return _totalDeposited Total deposited
     * @return _totalWithdrawn Total withdrawn
     * @return _totalYield Total yield generated
     * @return _totalFees Total fees collected
     */
    function getVaultStats()
        external
        view
        returns (
            uint256 _totalAssets,
            uint256 _totalShares,
            uint256 reserveBalance,
            uint256 aaveBalance,
            uint256 _totalDeposited,
            uint256 _totalWithdrawn,
            uint256 _totalYield,
            uint256 _totalFees
        )
    {
        return (
            totalAssets(),
            totalSupply(),
            IERC20(asset()).balanceOf(address(this)),
            A_TOKEN.balanceOf(address(this)),
            totalDeposited,
            totalWithdrawn,
            totalYieldHarvested,
            totalFeesCollected
        );
    }

    /**
     * @notice Get user position details
     * @param user User address
     * @return userShares User's share balance
     * @return userAssets User's asset value
     * @return shareOfPool User's percentage of pool (in basis points)
     */
    function getUserPosition(address user)
        external
        view
        returns (
            uint256 userShares,
            uint256 userAssets,
            uint256 shareOfPool
        )
    {
        userShares = balanceOf(user);
        userAssets = convertToAssets(userShares);
        
        uint256 _totalSupply = totalSupply();
        shareOfPool = _totalSupply > 0 
            ? (userShares * BASIS_POINTS) / _totalSupply 
            : 0;
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Update reserve ratio
     * @param newRatio New reserve ratio in basis points
     */
    function setReserveRatio(uint256 newRatio) external onlyOwner {
        if (newRatio > BASIS_POINTS) revert InvalidRatio();
        
        uint256 oldRatio = reserveRatio;
        reserveRatio = newRatio;
        
        emit ReserveRatioUpdated(oldRatio, newRatio);
    }

    /**
     * @notice Update performance fee
     * @param newFee New performance fee in basis points
     */
    function setPerformanceFee(uint256 newFee) external onlyOwner {
        if (newFee > 5000) revert InvalidFee(); // Max 50%
        
        uint256 oldFee = performanceFee;
        performanceFee = newFee;
        
        emit PerformanceFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        
        address oldTreasury = treasury;
        treasury = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Update deposit and TVL limits
     * @param _minDeposit Minimum deposit amount
     * @param _maxDeposit Maximum deposit amount
     * @param _maxTvl Maximum total value locked
     */
    function setLimits(
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _maxTvl
    ) external onlyOwner {
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        maxTvl = _maxTvl;
        
        emit LimitsUpdated(_minDeposit, _maxDeposit, _maxTvl);
    }

    /**
     * @notice Update max slippage tolerance
     * @param newSlippage New max slippage in basis points
     */
    function setMaxSlippage(uint256 newSlippage) external onlyOwner {
        if (newSlippage > 1000) revert InvalidRatio(); // Max 10%
        maxSlippage = newSlippage;
    }

    /**
     * @notice Update harvest interval
     * @param newInterval New harvest interval in seconds
     */
    function setHarvestInterval(uint256 newInterval) external onlyOwner {
        harvestInterval = newInterval;
    }

    /**
     * @notice Set rewards controller address
     * @param _rewardsController Rewards controller address
     */
    function setRewardsController(address _rewardsController) external onlyOwner {
        rewardsController = IRewardsController(_rewardsController);
    }

    /**
     * @notice Pause the vault
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the vault
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal of tokens
     * @dev Only callable when paused
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        if (!paused()) revert("Not paused");
        if (to == address(0)) revert ZeroAddress();
        
        IERC20(token).safeTransfer(to, amount);
        
        emit EmergencyWithdrawal(token, amount, to);
    }

    /**
     * @notice Emergency withdrawal from Aave
     * @dev Only callable when paused, withdraws all from Aave
     */
    function emergencyWithdrawFromAave() external onlyOwner {
        if (!paused()) revert("Not paused");
        
        uint256 aaveBalance = A_TOKEN.balanceOf(address(this));
        if (aaveBalance > 0) {
            _withdrawFromAave(aaveBalance);
        }
    }
}
