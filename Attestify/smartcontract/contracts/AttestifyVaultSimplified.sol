// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AttestifyVaultSimplified
 * @notice Simplified ERC-4626 vault for Celo Sepolia (no lending integration)
 * @dev Basic vault for hackathon demo - can be upgraded to add yield later
 */
contract AttestifyVaultSimplified is ERC4626, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public treasury;
    uint256 public performanceFee; // Basis points
    uint256 public constant BASIS_POINTS = 10000;

    error InvalidAmount();
    error InvalidAddress();

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);
    event PerformanceFeeUpdated(uint256 newFee);

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _treasury
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
        performanceFee = 1000; // 10%
    }

    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

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
        emit Deposited(receiver, assets, shares);
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();
        shares = previewWithdraw(assets);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        emit Withdrawn(receiver, assets, shares);
    }

    function getCurrentAPY() external pure returns (uint256) {
        // Returns 0 for now - can be upgraded later with yield integration
        return 0;
    }

    function setPerformanceFee(uint256 _performanceFee) external onlyOwner {
        if (_performanceFee > BASIS_POINTS) revert InvalidAmount();
        performanceFee = _performanceFee;
        emit PerformanceFeeUpdated(_performanceFee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
