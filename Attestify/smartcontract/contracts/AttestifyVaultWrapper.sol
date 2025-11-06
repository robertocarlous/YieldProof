// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AttestifyVaultWrapper
 * @notice Wrapper contract that adds Attestify-specific features on top of the base ERC-4626 vault
 * @dev Adds user verification, profiles, and strategy management while delegating core vault operations
 * 
 * Architecture:
 * - Base Vault (AttestifyVault): Handles ERC-4626 operations and Aave integration
 * - Wrapper (this contract): Handles verification, user profiles, and strategies
 * 
 * User Flow:
 * 1. User verifies identity through Self Protocol
 * 2. User selects investment strategy
 * 3. User deposits through wrapper → wrapper deposits to base vault
 * 4. Base vault manages Aave integration and yield
 * 5. User withdraws through wrapper → wrapper withdraws from base vault
 */
contract AttestifyVaultWrapper is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    /// @notice The underlying ERC-4626 vault
    IERC4626 public immutable baseVault;

    /// @notice The underlying asset (e.g., cUSD)
    IERC20 public immutable asset;

    /// @notice Self Protocol verification contract
    address public selfProtocol;

    /// @notice AI agent address for automated operations
    address public aiAgent;

    /// @notice Treasury address
    address public treasury;

    /// @notice User profiles
    mapping(address => UserProfile) public users;

    /// @notice User strategies
    mapping(address => StrategyType) public userStrategy;

    /// @notice Strategy configurations
    mapping(StrategyType => Strategy) public strategies;

    /// @notice Total statistics
    uint256 public totalUsers;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    /* ========== CONSTANTS ========== */

    uint256 public constant MIN_DEPOSIT = 1e18; // 1 token
    uint256 public constant MAX_DEPOSIT = 10_000e18; // 10,000 tokens
    uint256 public constant MAX_TVL = 1_000_000e18; // 1M tokens

    /* ========== STRUCTS & ENUMS ========== */

    struct UserProfile {
        bool isVerified;
        uint256 verifiedAt;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 lastActionTime;
        uint256 userIdentifier; // From Self Protocol
        uint256 vaultShares; // Shares in the base vault
    }

    enum StrategyType {
        CONSERVATIVE,
        BALANCED,
        GROWTH
    }

    struct Strategy {
        string name;
        string description;
        uint8 aaveAllocation; // Percentage allocated to Aave
        uint8 reserveAllocation; // Percentage kept as reserve
        uint16 targetAPY; // Target APY in basis points
        uint8 riskLevel; // 1-10 risk scale
        bool isActive;
    }

    /* ========== EVENTS ========== */

    event UserVerified(address indexed user, uint256 userIdentifier, uint256 timestamp);
    event Deposited(address indexed user, uint256 assets, uint256 shares, StrategyType strategy);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);
    event StrategyChanged(address indexed user, StrategyType oldStrategy, StrategyType newStrategy);
    event SelfProtocolUpdated(address indexed oldProtocol, address indexed newProtocol);
    event AIAgentUpdated(address indexed oldAgent, address indexed newAgent);

    /* ========== ERRORS ========== */

    error NotVerified();
    error AlreadyVerified();
    error InvalidAmount();
    error ExceedsMaxDeposit();
    error ExceedsMaxTVL();
    error InsufficientShares();
    error ZeroAddress();
    error InvalidStrategy();
    error VerificationFailed();

    /* ========== CONSTRUCTOR ========== */

    /**
     * @notice Initialize the wrapper with base vault and Self Protocol
     * @param _baseVault Address of the underlying ERC-4626 vault
     * @param _selfProtocol Address of Self Protocol verification contract
     */
    constructor(
        address _baseVault,
        address _selfProtocol
    ) Ownable(msg.sender) {
        if (_baseVault == address(0)) revert ZeroAddress();
        
        baseVault = IERC4626(_baseVault);
        asset = IERC20(baseVault.asset());
        selfProtocol = _selfProtocol;
        treasury = msg.sender;

        _initializeStrategies();

        // Approve base vault to spend assets
        asset.forceApprove(_baseVault, type(uint256).max);
    }

    /* ========== VERIFICATION ========== */

    /**
     * @notice Verify user identity through Self Protocol
     * @param proofPayload The proof data from Self Protocol
     * @param userContextData Additional user context
     */
    function verifySelfProof(
        bytes calldata proofPayload,
        bytes calldata userContextData
    ) external {
        if (users[msg.sender].isVerified) revert AlreadyVerified();

        // If Self Protocol is set, verify through it
        if (selfProtocol != address(0)) {
            (bool success, ) = selfProtocol.call(
                abi.encodeWithSignature(
                    "verify(bytes)",
                    proofPayload
                )
            );
            if (!success) revert VerificationFailed();
        }

        // Mark user as verified
        users[msg.sender].isVerified = true;
        users[msg.sender].verifiedAt = block.timestamp;
        users[msg.sender].userIdentifier = uint256(uint160(msg.sender));
        
        // Set default strategy
        userStrategy[msg.sender] = StrategyType.CONSERVATIVE;
        
        totalUsers++;

        emit UserVerified(msg.sender, users[msg.sender].userIdentifier, block.timestamp);
    }

    /**
     * @notice Check if user is verified
     * @param user User address to check
     * @return bool True if verified
     */
    function isVerified(address user) external view returns (bool) {
        return users[user].isVerified;
    }

    /* ========== STRATEGY MANAGEMENT ========== */

    /**
     * @notice Initialize default strategies
     */
    function _initializeStrategies() internal {
        strategies[StrategyType.CONSERVATIVE] = Strategy({
            name: "Conservative",
            description: "100% Aave allocation - Safest option with stable yield",
            aaveAllocation: 100,
            reserveAllocation: 0,
            targetAPY: 350, // 3.5% APY
            riskLevel: 1,
            isActive: true
        });

        strategies[StrategyType.BALANCED] = Strategy({
            name: "Balanced",
            description: "90% Aave, 10% reserve - Balanced approach",
            aaveAllocation: 90,
            reserveAllocation: 10,
            targetAPY: 350,
            riskLevel: 3,
            isActive: true
        });

        strategies[StrategyType.GROWTH] = Strategy({
            name: "Growth",
            description: "80% Aave, 20% reserve - Growth focused",
            aaveAllocation: 80,
            reserveAllocation: 20,
            targetAPY: 350,
            riskLevel: 5,
            isActive: true
        });
    }

    /**
     * @notice Change user's investment strategy
     * @param newStrategy The new strategy to adopt
     */
    function changeStrategy(StrategyType newStrategy) external onlyVerified {
        if (!strategies[newStrategy].isActive) revert InvalidStrategy();

        StrategyType oldStrategy = userStrategy[msg.sender];
        userStrategy[msg.sender] = newStrategy;

        emit StrategyChanged(msg.sender, oldStrategy, newStrategy);
    }

    /**
     * @notice Get strategy details
     * @param strategyType The strategy to query
     * @return Strategy details
     */
    function getStrategy(StrategyType strategyType) external view returns (Strategy memory) {
        return strategies[strategyType];
    }

    /* ========== CORE FUNCTIONS: DEPOSIT ========== */

    /**
     * @notice Deposit assets into the vault
     * @dev Only verified users can deposit
     * @param assets Amount of assets to deposit
     * @return shares Amount of vault shares received
     */
    function deposit(uint256 assets)
        external
        nonReentrant
        whenNotPaused
        onlyVerified
        returns (uint256 shares)
    {
        if (assets < MIN_DEPOSIT) revert InvalidAmount();
        if (assets > MAX_DEPOSIT) revert ExceedsMaxDeposit();
        if (baseVault.totalAssets() + assets > MAX_TVL) revert ExceedsMaxTVL();

        // Transfer assets from user to wrapper
        asset.safeTransferFrom(msg.sender, address(this), assets);

        // Deposit to base vault
        shares = baseVault.deposit(assets, address(this));

        // Update user profile
        users[msg.sender].vaultShares += shares;
        users[msg.sender].totalDeposited += assets;
        users[msg.sender].lastActionTime = block.timestamp;
        totalDeposited += assets;

        emit Deposited(msg.sender, assets, shares, userStrategy[msg.sender]);
    }

    /**
     * @notice Deposit exact amount of assets
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares (must be msg.sender for verified users)
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver)
        external
        nonReentrant
        whenNotPaused
        onlyVerified
        returns (uint256 shares)
    {
        if (receiver != msg.sender) revert("Receiver must be sender");
        return this.deposit(assets);
    }

    /* ========== CORE FUNCTIONS: WITHDRAW ========== */

    /**
     * @notice Withdraw assets from the vault
     * @param assets Amount of assets to withdraw
     * @return shares Amount of shares burned
     */
    function withdraw(uint256 assets)
        external
        nonReentrant
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();

        // Calculate shares needed
        shares = baseVault.previewWithdraw(assets);
        
        if (users[msg.sender].vaultShares < shares) revert InsufficientShares();

        // Withdraw from base vault
        uint256 assetsReceived = baseVault.redeem(shares, address(this), address(this));

        // Update user profile
        users[msg.sender].vaultShares -= shares;
        users[msg.sender].totalWithdrawn += assetsReceived;
        users[msg.sender].lastActionTime = block.timestamp;
        totalWithdrawn += assetsReceived;

        // Transfer assets to user
        asset.safeTransfer(msg.sender, assetsReceived);

        emit Withdrawn(msg.sender, assetsReceived, shares);
    }

    /**
     * @notice Redeem shares for assets
     * @param shares Amount of shares to redeem
     * @return assets Amount of assets received
     */
    function redeem(uint256 shares)
        external
        nonReentrant
        returns (uint256 assets)
    {
        if (shares == 0) revert InvalidAmount();
        if (users[msg.sender].vaultShares < shares) revert InsufficientShares();

        // Redeem from base vault
        assets = baseVault.redeem(shares, address(this), address(this));

        // Update user profile
        users[msg.sender].vaultShares -= shares;
        users[msg.sender].totalWithdrawn += assets;
        users[msg.sender].lastActionTime = block.timestamp;
        totalWithdrawn += assets;

        // Transfer assets to user
        asset.safeTransfer(msg.sender, assets);

        emit Withdrawn(msg.sender, assets, shares);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice Get user's balance in assets
     * @param user User address
     * @return assets User's asset balance
     */
    function balanceOf(address user) external view returns (uint256) {
        uint256 shares = users[user].vaultShares;
        return baseVault.convertToAssets(shares);
    }

    /**
     * @notice Get user's earnings
     * @param user User address
     * @return earnings Total earnings (current balance + withdrawn - deposited)
     */
    function getEarnings(address user) external view returns (uint256) {
        uint256 currentBalance = baseVault.convertToAssets(users[user].vaultShares);
        uint256 deposited = users[user].totalDeposited;
        uint256 withdrawn = users[user].totalWithdrawn;

        if (currentBalance + withdrawn > deposited) {
            return (currentBalance + withdrawn) - deposited;
        }
        return 0;
    }

    /**
     * @notice Get user profile
     * @param user User address
     * @return profile User's complete profile
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return users[user];
    }

    /**
     * @notice Get user's current strategy
     * @param user User address
     * @return strategy Current strategy type
     */
    function getUserStrategy(address user) external view returns (StrategyType) {
        return userStrategy[user];
    }

    /**
     * @notice Get wrapper statistics
     * @return _totalUsers Total verified users
     * @return _totalDeposited Total assets deposited
     * @return _totalWithdrawn Total assets withdrawn
     * @return vaultTotalAssets Total assets in base vault
     * @return wrapperShares Total shares held by wrapper
     */
    function getWrapperStats()
        external
        view
        returns (
            uint256 _totalUsers,
            uint256 _totalDeposited,
            uint256 _totalWithdrawn,
            uint256 vaultTotalAssets,
            uint256 wrapperShares
        )
    {
        return (
            totalUsers,
            totalDeposited,
            totalWithdrawn,
            baseVault.totalAssets(),
            baseVault.balanceOf(address(this))
        );
    }

    /**
     * @notice Get current APY from base vault
     * @return apy Current APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        // Call base vault's getCurrentAPY if it exists
        (bool success, bytes memory data) = address(baseVault).staticcall(
            abi.encodeWithSignature("getCurrentAPY()")
        );
        
        if (success && data.length > 0) {
            return abi.decode(data, (uint256));
        }
        
        return 350; // Default 3.5% APY
    }

    /**
     * @notice Preview deposit
     * @param assets Amount of assets
     * @return shares Expected shares
     */
    function previewDeposit(uint256 assets) external view returns (uint256) {
        return baseVault.previewDeposit(assets);
    }

    /**
     * @notice Preview withdraw
     * @param assets Amount of assets
     * @return shares Required shares
     */
    function previewWithdraw(uint256 assets) external view returns (uint256) {
        return baseVault.previewWithdraw(assets);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Update Self Protocol address
     * @param _selfProtocol New Self Protocol address
     */
    function setSelfProtocol(address _selfProtocol) external onlyOwner {
        address oldProtocol = selfProtocol;
        selfProtocol = _selfProtocol;
        emit SelfProtocolUpdated(oldProtocol, _selfProtocol);
    }

    /**
     * @notice Update AI agent address
     * @param _aiAgent New AI agent address
     */
    function setAIAgent(address _aiAgent) external onlyOwner {
        if (_aiAgent == address(0)) revert ZeroAddress();
        address oldAgent = aiAgent;
        aiAgent = _aiAgent;
        emit AIAgentUpdated(oldAgent, _aiAgent);
    }

    /**
     * @notice Update treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    /**
     * @notice Update strategy configuration
     * @param strategyType Strategy to update
     * @param strategy New strategy configuration
     */
    function updateStrategy(StrategyType strategyType, Strategy memory strategy) external onlyOwner {
        strategies[strategyType] = strategy;
    }

    /**
     * @notice Pause the wrapper
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the wrapper
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal (only when paused)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (!paused()) revert("Not paused");
        IERC20(token).safeTransfer(owner(), amount);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyVerified() {
        if (!users[msg.sender].isVerified) revert NotVerified();
        _;
    }
}
