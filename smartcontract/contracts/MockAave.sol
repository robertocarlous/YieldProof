// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockAToken
 * @notice Mock implementation of Aave aToken for testing
 */
contract MockAToken is ERC20, Ownable {
    address public immutable UNDERLYING_ASSET_ADDRESS;
    address public pool;

    constructor(
        address _underlyingAsset,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        UNDERLYING_ASSET_ADDRESS = _underlyingAsset;
    }

    function setPool(address _pool) external onlyOwner {
        pool = _pool;
    }

    function mint(address account, uint256 amount) external {
        require(msg.sender == pool, "Only pool can mint");
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        require(msg.sender == pool, "Only pool can burn");
        _burn(account, amount);
    }

    function scaledBalanceOf(address user) external view returns (uint256) {
        return balanceOf(user);
    }
}

/**
 * @title MockAavePool
 * @notice Mock implementation of Aave V3 Pool for testing
 */
contract MockAavePool is Ownable {
    mapping(address => address) public aTokens; // asset => aToken

    event Supply(address indexed asset, address indexed user, uint256 amount);
    event Withdraw(address indexed asset, address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register an aToken for an asset
     */
    function setAToken(address asset, address aToken) external onlyOwner {
        aTokens[asset] = aToken;
    }

    /**
     * @notice Supply assets (mock Aave supply)
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 /* referralCode */
    ) external {
        require(aTokens[asset] != address(0), "Asset not supported");

        // Transfer underlying from user
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // Mint aTokens 1:1
        MockAToken(aTokens[asset]).mint(onBehalfOf, amount);

        emit Supply(asset, onBehalfOf, amount);
    }

    /**
     * @notice Withdraw assets (mock Aave withdraw)
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(aTokens[asset] != address(0), "Asset not supported");

        // Burn aTokens
        MockAToken(aTokens[asset]).burn(msg.sender, amount);

        // Transfer underlying back
        IERC20(asset).transfer(to, amount);

        emit Withdraw(asset, msg.sender, amount);

        return amount;
    }

    /**
     * @notice Get user account data (simplified)
     */
    function getUserAccountData(
        address /* user */
    )
        external
        pure
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return (0, 0, 0, 8000, 7500, type(uint256).max);
    }
}
