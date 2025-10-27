// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockAavePool
 * @dev Mock Aave Pool that simulates realistic yield for testing
 */
contract MockAavePool is Ownable {
    // Annual Percentage Yield (5% = 500 basis points)
    uint256 public constant APY_BASIS_POINTS = 500; // 5% APY
    uint256 public constant BASIS_POINTS = 10000;
    
    // Track user deposits and timestamps
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public depositTimestamps;
    
    // Events
    event Supplied(address indexed user, address indexed asset, uint256 amount, uint16 referralCode);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, address indexed to);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Supply assets to the pool (simulates Aave supply function)
     * @param asset The asset to supply (cUSD)
     * @param amount The amount to supply
     * @param onBehalfOf The user to credit the supply to
     * @param referralCode Referral code (unused in mock)
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        
        // Update user's deposit info
        if (userDeposits[onBehalfOf] > 0) {
            // Add accrued interest to existing deposit
            userDeposits[onBehalfOf] += _calculateAccruedInterest(onBehalfOf);
        }
        
        userDeposits[onBehalfOf] += amount;
        depositTimestamps[onBehalfOf] = block.timestamp;
        
        emit Supplied(onBehalfOf, asset, amount, referralCode);
    }
    
    /**
     * @dev Withdraw assets from the pool
     * @param asset The asset to withdraw
     * @param amount The amount to withdraw
     * @param to The address to send the assets to
     * @return The actual amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate total balance including accrued interest
        uint256 totalBalance = _getUserBalance(msg.sender);
        require(totalBalance >= amount, "Insufficient balance");
        
        // Update user's deposit
        userDeposits[msg.sender] = totalBalance - amount;
        depositTimestamps[msg.sender] = block.timestamp;
        
        // Transfer tokens to user
        IERC20(asset).transfer(to, amount);
        
        emit Withdrawn(msg.sender, asset, amount, to);
        return amount;
    }
    
    /**
     * @dev Get user's current balance including accrued interest
     * @param user The user address
     * @return The total balance including interest
     */
    function getUserBalance(address user) external view returns (uint256) {
        return _getUserBalance(user);
    }
    
    /**
     * @dev Internal function to calculate accrued interest
     * @param user The user address
     * @return The accrued interest amount
     */
    function _calculateAccruedInterest(address user) internal view returns (uint256) {
        if (userDeposits[user] == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamps[user];
        uint256 secondsPerYear = 365 days;
        
        // Calculate interest: principal * APY * timeElapsed / secondsPerYear
        uint256 interest = (userDeposits[user] * APY_BASIS_POINTS * timeElapsed) / 
                         (BASIS_POINTS * secondsPerYear);
        
        return interest;
    }
    
    /**
     * @dev Internal function to get user's total balance
     * @param user The user address
     * @return The total balance including interest
     */
    function _getUserBalance(address user) internal view returns (uint256) {
        return userDeposits[user] + _calculateAccruedInterest(user);
    }
    
    /**
     * @dev Get the current APY in basis points
     * @return The APY in basis points
     */
    function getAPY() external pure returns (uint256) {
        return APY_BASIS_POINTS;
    }
    
    /**
     * @dev Emergency function to withdraw all tokens (owner only)
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner(), balance);
    }
    
    /**
     * @dev Emergency function to withdraw specific amount (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev Get user account data for Aave compatibility
     */
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralETH,
        uint256 totalDebtETH,
        uint256 availableBorrowsETH,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    ) {
        uint256 balanceWithInterest = _getUserBalance(user);
        return (balanceWithInterest, 0, type(uint256).max, 0, 0, type(uint256).max);
    }
    
    /**
     * @dev Get reserve data for Aave compatibility
     */
    function getReserveData(address asset) external view returns (
        uint256 configuration,
        uint128 liquidityIndex,
        uint128 variableBorrowIndex,
        uint128 currentLiquidityRate,
        uint128 currentVariableBorrowRate,
        uint128 currentStableBorrowRate,
        uint40 lastUpdateTimestamp,
        address aTokenAddress,
        address stableDebtTokenAddress,
        address variableDebtTokenAddress,
        address interestRateStrategyAddress,
        uint8 id
    ) {
        return (
            uint256(0), // configuration
            uint128(1e27), // liquidityIndex (scaled to 1e27 for Aave)
            uint128(0), // variableBorrowIndex
            uint128(APY_BASIS_POINTS * 1e9), // currentLiquidityRate (scaled to 1e27 for Aave, 5% APY)
            uint128(0), // currentVariableBorrowRate
            uint128(0), // currentStableBorrowRate
            uint40(block.timestamp), // lastUpdateTimestamp
            address(0), // aTokenAddress (not used in this mock)
            address(0), // stableDebtTokenAddress
            address(0), // variableDebtTokenAddress
            address(0), // interestRateStrategyAddress
            uint8(0) // id
        );
    }
    
    /**
     * @dev Get total assets in the pool
     */
    function totalAssets() external view returns (uint256) {
        // Return the contract's balance of any ERC20 token
        // This is a simplified mock implementation
        return address(this).balance;
    }
}