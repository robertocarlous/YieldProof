// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockAToken
 * @dev Mock aToken that represents interest-bearing deposits
 */
contract MockAToken is ERC20, Ownable {
    // The underlying asset (cUSD)
    address public immutable UNDERLYING_ASSET;
    
    // The Aave pool contract
    address public immutable POOL;
    
    // Events
    event Mint(address indexed user, uint256 amount, uint256 index);
    event Burn(address indexed user, uint256 amount, uint256 index);
    
    constructor(
        address underlyingAsset,
        address pool,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        UNDERLYING_ASSET = underlyingAsset;
        POOL = pool;
    }
    
    /**
     * @dev Mint aTokens to a user (called by pool)
     * @param user The user to mint tokens to
     * @param amount The amount to mint
     */
    function mint(address user, uint256 amount) external {
        require(msg.sender == POOL, "Only pool can mint");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(user, amount);
        emit Mint(user, amount, 0);
    }
    
    /**
     * @dev Burn aTokens from a user (called by pool)
     * @param user The user to burn tokens from
     * @param amount The amount to burn
     */
    function burn(address user, uint256 amount) external {
        require(msg.sender == POOL, "Only pool can burn");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        _burn(user, amount);
        emit Burn(user, amount, 0);
    }
    
    /**
     * @dev Get the underlying asset address
     * @return The underlying asset address
     */
    function UNDERLYING_ASSET_ADDRESS() external view returns (address) {
        return UNDERLYING_ASSET;
    }
    
    /**
     * @dev Get the pool address
     * @return The pool address
     */
    function POOL_ADDRESS() external view returns (address) {
        return POOL;
    }
}