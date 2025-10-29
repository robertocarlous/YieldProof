// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AttestifyAaveVault
 * @notice ERC-4626 compliant vault that integrates with Aave V3 for yield generation
 * @dev Implements the ATokenVault pattern: assets are supplied to Aave V3, receiving
 *      aTokens which automatically accrue yield. The vault tracks total assets via
 *      aToken balance, providing users with proportional ownership through ERC-4626 shares.
 * @dev Additional features include identity verification gating, user strategy management,
 *      and AI agent capabilities for automated operations.
 */

/* ========== AAVE V3 INTERFACES ========== */

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    );
}

interface IAToken is IERC20 {
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
    function scaledBalanceOf(address user) external view returns (uint256);
}

/* ========== MAIN VAULT CONTRACT ========== */

/// @custom:security-contact security@attestify.ai
contract AttestifyAaveVault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    // Aave V3 Protocol Integration
    IPool public immutable aavePool;
    IAToken public immutable aToken;
    
    // User verification tracking
    mapping(address => UserProfile) public users;
    mapping(address => StrategyType) public userStrategy;
    
    // Strategy configurations
    mapping(StrategyType => Strategy) public strategies;
    
    // Vault limits and configuration
    uint256 public constant MIN_DEPOSIT = 1e18; // 1 token (18 decimals)
    uint256 public constant MAX_DEPOSIT_PER_USER = 10_000e18; // 10,000 tokens
    uint256 public constant MAX_TOTAL_ASSETS = 100_000e18; // 100,000 tokens TVL cap
    
    // Admin and governance
    address public aiAgent;
    address public treasury;
    
    // Statistics and tracking
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public lastRebalanceTime;

    /* ========== STRUCTS & ENUMS ========== */

    struct UserProfile {
        bool isVerified;
        uint256 verifiedAt;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 lastActionTime;
        uint256 userIdentifier;
    }

    enum StrategyType {
        CONSERVATIVE,
        BALANCED,
        GROWTH
    }

    struct Strategy {
        string name;
        uint8 aaveAllocation;      // Percentage allocated to Aave
        uint8 reserveAllocation;   // Percentage kept as reserve
        uint16 targetAPY;          // Target APY in basis points (350 = 3.5%)
        uint8 riskLevel;           // Risk level 1-5
        bool isActive;
    }

    /* ========== EVENTS ========== */

    event UserVerified(address indexed user, uint256 userIdentifier, uint256 timestamp);
    event StrategyChanged(address indexed user, StrategyType oldStrategy, StrategyType newStrategy);
    event SuppliedToAave(uint256 amount, uint256 timestamp);
    event WithdrawnFromAave(uint256 amount, uint256 timestamp);
    event VaultRebalanced(uint256 aaveBalance, uint256 reserveBalance, uint256 timestamp);

    /* ========== CUSTOM ERRORS ========== */

    error NotVerified();
    error InvalidAmount();
    error ExceedsUserLimit();
    error ExceedsTVLLimit();
    error InsufficientLiquidity();
    error ZeroAddress();
    error ZeroShares();
    error ZeroAssets();

    /* ========== CONSTRUCTOR ========== */

    /**
     * @notice Initialize the Attestify Aave Vault
     * @param _asset The underlying asset (e.g., AAVE, GHO, USDC)
     * @param _aToken The Aave aToken (e.g., aEthAAVE, aGHO, aUSDC) 
     * @param _aavePool The Aave V3 Pool contract
     */
    constructor(
        IERC20 _asset,
        address _aToken,
        address _aavePool
    ) 
        ERC4626(_asset)
        ERC20("Attestify Aave Vault", "atfAave")
        Ownable(msg.sender)
    {
        if (_aToken == address(0) || _aavePool == address(0)) revert ZeroAddress();
        
        aToken = IAToken(_aToken);
        aavePool = IPool(_aavePool);
        treasury = msg.sender;
        
        _initializeStrategies();
    }

    /* ========== IDENTITY VERIFICATION ========== */

    /**
     * @notice Verify user identity (simplified for testing)
     * @dev In production, this would integrate with Self Protocol's ZK proofs
     */
    function verifySelfProof(bytes memory /* proof */, bytes memory /* publicSignals */) external {
        users[msg.sender].isVerified = true;
        users[msg.sender].verifiedAt = block.timestamp;
        users[msg.sender].userIdentifier = uint256(uint160(msg.sender));
        userStrategy[msg.sender] = StrategyType.CONSERVATIVE;
        
        emit UserVerified(msg.sender, users[msg.sender].userIdentifier, block.timestamp);
    }

    /**
     * @notice Check if user is verified
     */
    function isVerified(address user) external view returns (bool) {
        return users[user].isVerified;
    }

    /* ========== ERC-4626 CORE FUNCTIONS ========== */

    /**
     * @notice Deposit assets and receive vault shares (ERC-4626 standard)
     * @dev Overrides ERC4626 to add verification check and Aave integration
     * @param assets Amount of underlying asset to deposit
     * @param receiver Address to receive vault shares
     * @return shares Amount of shares minted
     * 
     * @dev Accounting Mechanism:
     * - Shares represent proportional ownership of vault's total assets
     * - Total assets tracked via aToken balance (includes accrued yield)
     * - Share price increases as yield accrues in Aave
     * - Formula: shares = (assets * totalSupply) / totalAssets()
     */
    function deposit(uint256 assets, address receiver) 
        public 
        virtual
        override 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        if (!users[msg.sender].isVerified) revert NotVerified();
        if (assets < MIN_DEPOSIT) revert InvalidAmount();
        if (users[receiver].totalDeposited + assets > MAX_DEPOSIT_PER_USER) revert ExceedsUserLimit();
        if (totalAssets() + assets > MAX_TOTAL_ASSETS) revert ExceedsTVLLimit();
        
        shares = previewDeposit(assets);
        if (shares == 0) revert ZeroShares();
        
        users[receiver].totalDeposited += assets;
        users[receiver].lastActionTime = block.timestamp;
        totalDeposited += assets;
        
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);
        _mint(receiver, shares);
        _deployToAave(assets);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Mint exact shares by depositing assets (ERC-4626 standard)
     * @param shares Exact amount of shares to mint
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
        if (!users[msg.sender].isVerified) revert NotVerified();
        if (shares == 0) revert ZeroShares();
        
        assets = previewMint(shares);
        if (assets < MIN_DEPOSIT) revert InvalidAmount();
        if (users[receiver].totalDeposited + assets > MAX_DEPOSIT_PER_USER) revert ExceedsUserLimit();
        if (totalAssets() + assets > MAX_TOTAL_ASSETS) revert ExceedsTVLLimit();
        
        users[receiver].totalDeposited += assets;
        users[receiver].lastActionTime = block.timestamp;
        totalDeposited += assets;
        
        SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);
        _mint(receiver, shares);
        _deployToAave(assets);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Withdraw assets by burning shares (ERC-4626 standard)
     * @param assets Amount of underlying asset to withdraw
     * @param receiver Address to receive withdrawn assets
     * @param owner Address that owns the shares being burned
     * @return shares Amount of shares burned
     * 
     * @dev Liquidity is maintained via aTokens which represent underlying assets + accrued yield.
     * Withdrawals convert aTokens to underlying assets through the Aave V3 pool.
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        virtual
        override
        nonReentrant
        returns (uint256 shares)
    {
        if (assets == 0) revert ZeroAssets();
        
        shares = previewWithdraw(assets);
        if (shares == 0) revert ZeroShares();
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        users[owner].totalWithdrawn += assets;
        users[owner].lastActionTime = block.timestamp;
        totalWithdrawn += assets;
        
        _burn(owner, shares);
        _withdrawFromAave(assets);
        SafeERC20.safeTransfer(IERC20(asset()), receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice Redeem shares for assets (ERC-4626 standard)
     * @param shares Amount of shares to burn
     * @param receiver Address to receive withdrawn assets
     * @param owner Address that owns the shares
     * @return assets Amount of assets withdrawn
     */
    function redeem(uint256 shares, address receiver, address owner)
        public
        virtual
        override
        nonReentrant
        returns (uint256 assets)
    {
        if (shares == 0) revert ZeroShares();
        
        assets = previewRedeem(shares);
        if (assets == 0) revert ZeroAssets();
        
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }
        
        users[owner].totalWithdrawn += assets;
        users[owner].lastActionTime = block.timestamp;
        totalWithdrawn += assets;
        
        _burn(owner, shares);
        
        // Withdraw from Aave (burns aTokens, returns underlying assets)
        _withdrawFromAave(assets);
        
        SafeERC20.safeTransfer(IERC20(asset()), receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /* ========== AAVE V3 INTEGRATION (INTERNAL) ========== */

    /**
     * @notice Deploy assets to Aave V3 for yield generation
     * @param amount Amount to deploy to Aave
     * 
     * @dev Calls IPool.supply() to deposit assets into Aave V3 and receive aTokens.
     * aTokens accrue yield automatically and can be redeemed instantly.
     */
    function _deployToAave(uint256 amount) internal {
        if (amount == 0) return;
        
        IERC20(asset()).approve(address(aavePool), amount);
        aavePool.supply(asset(), amount, address(this), 0);
        
        emit SuppliedToAave(amount, block.timestamp);
    }

    /**
     * @notice Withdraw assets from Aave V3
     * @param amount Amount of underlying asset to withdraw from Aave
     * 
     * @dev Calls IPool.withdraw() to redeem aTokens for underlying assets.
     * Aave automatically calculates the aToken burn amount based on current exchange rate.
     */
    function _withdrawFromAave(uint256 amount) internal {
        uint256 aTokenBalance = aToken.balanceOf(address(this));
        require(aTokenBalance >= amount, "Insufficient aTokens");
        
        aavePool.withdraw(asset(), amount, address(this));
        
        emit WithdrawnFromAave(amount, block.timestamp);
    }

    /* ========== ERC-4626 VIEW FUNCTIONS ========== */

    /**
     * @notice Calculate total assets under management (ERC-4626 standard)
     * @return Total assets in vault (aToken balance which includes accrued yield)
     * 
     * @dev Returns the aToken balance which represents the interest-bearing position in Aave.
     * When assets are supplied to Aave, underlying tokens are consumed and aTokens are received.
     * aToken.balanceOf(vault) equals original supply plus accrued interest.
     * This value is used as the denominator in share price calculation.
     */
    function totalAssets() public view virtual override returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    /**
     * @notice Maximum deposit allowed (ERC-4626 standard)
     */
    function maxDeposit(address receiver) public view virtual override returns (uint256) {
        if (!users[receiver].isVerified || paused()) return 0;
        
        uint256 userRemaining = MAX_DEPOSIT_PER_USER - users[receiver].totalDeposited;
        uint256 vaultRemaining = MAX_TOTAL_ASSETS > totalAssets() ? 
            MAX_TOTAL_ASSETS - totalAssets() : 0;
        
        return userRemaining < vaultRemaining ? userRemaining : vaultRemaining;
    }

    /**
     * @notice Maximum mint allowed (ERC-4626 standard)
     */
    function maxMint(address receiver) public view virtual override returns (uint256) {
        uint256 maxAssets = maxDeposit(receiver);
        return maxAssets == 0 ? 0 : previewDeposit(maxAssets);
    }

    /**
     * @notice Maximum withdrawal allowed (ERC-4626 standard)
     */
    function maxWithdraw(address owner) public view virtual override returns (uint256) {
        if (paused()) return 0;
        return previewRedeem(balanceOf(owner));
    }

    /**
     * @notice Maximum redeem allowed (ERC-4626 standard)
     */
    function maxRedeem(address owner) public view virtual override returns (uint256) {
        if (paused()) return 0;
        return balanceOf(owner);
    }

    /* ========== ADDITIONAL VIEW FUNCTIONS ========== */

    /**
     * @notice Get user's earnings (yield generated)
     */
    function getUserEarnings(address user) external view returns (uint256) {
        uint256 currentBalance = previewRedeem(balanceOf(user));
        uint256 netDeposited = users[user].totalDeposited - users[user].totalWithdrawn;
        
        return currentBalance > netDeposited ? currentBalance - netDeposited : 0;
    }

    /**
     * @notice Get comprehensive vault statistics
     */
    function getVaultStats() external view returns (
        uint256 _totalAssets,
        uint256 _totalSupply,
        uint256 reserveBalance,
        uint256 aaveBalance,
        uint256 _totalDeposited,
        uint256 _totalWithdrawn,
        uint256 sharePrice
    ) {
        _totalAssets = totalAssets();
        _totalSupply = totalSupply();
        reserveBalance = IERC20(asset()).balanceOf(address(this));
        aaveBalance = aToken.balanceOf(address(this));
        _totalDeposited = totalDeposited;
        _totalWithdrawn = totalWithdrawn;
        sharePrice = _totalSupply > 0 ? (_totalAssets * 1e18) / _totalSupply : 1e18;
    }

    /**
     * @notice Get current APY (simplified)
     */
    function getCurrentAPY() external pure returns (uint256) {
        return 350; // 3.5% APY in basis points
    }

    /* ========== STRATEGY MANAGEMENT ========== */

    function _initializeStrategies() internal {
        strategies[StrategyType.CONSERVATIVE] = Strategy({
            name: "Conservative",
            aaveAllocation: 90,
            reserveAllocation: 10,
            targetAPY: 350,
            riskLevel: 1,
            isActive: true
        });

        strategies[StrategyType.BALANCED] = Strategy({
            name: "Balanced",
            aaveAllocation: 85,
            reserveAllocation: 15,
            targetAPY: 350,
            riskLevel: 3,
            isActive: true
        });

        strategies[StrategyType.GROWTH] = Strategy({
            name: "Growth",
            aaveAllocation: 80,
            reserveAllocation: 20,
            targetAPY: 350,
            riskLevel: 5,
            isActive: true
        });
    }

    function changeStrategy(StrategyType newStrategy) external {
        if (!users[msg.sender].isVerified) revert NotVerified();
        require(strategies[newStrategy].isActive, "Invalid strategy");

        StrategyType oldStrategy = userStrategy[msg.sender];
        userStrategy[msg.sender] = newStrategy;

        emit StrategyChanged(msg.sender, oldStrategy, newStrategy);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Rebalance vault - ensures any underlying assets are deployed to Aave
     * @dev With the simplified model, this ensures all underlying assets are earning yield
     */
    function rebalance() external {
        require(msg.sender == owner() || msg.sender == aiAgent, "Unauthorized");

        uint256 idleAssets = IERC20(asset()).balanceOf(address(this));
        if (idleAssets > 0) {
            _deployToAave(idleAssets);
        }

        lastRebalanceTime = block.timestamp;
        emit VaultRebalanced(
            aToken.balanceOf(address(this)),
            IERC20(asset()).balanceOf(address(this)),
            block.timestamp
        );
    }

    function setAIAgent(address _aiAgent) external onlyOwner {
        if (_aiAgent == address(0)) revert ZeroAddress();
        aiAgent = _aiAgent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal (only when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(paused(), "Not paused");
        SafeERC20.safeTransfer(IERC20(token), owner(), amount);
    }
}