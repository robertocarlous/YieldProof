/**
 * AttestifyVault Frontend Utilities
 * Ready-to-use TypeScript utilities for integrating with AttestifyVault
 */

import { Address } from 'viem';

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

export const SEPOLIA_ADDRESSES = {
  CUSD: '0x8a016376332fa74639ddf9cc19fa9d09ce323624' as Address,
  ATTESTIFY_VAULT: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d' as Address,
  ATTESTIFY_WRAPPER: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d' as Address,
  CHAIN_ID: 11155111,
  RPC_URL: 'https://sepolia.infura.io/v3/YOUR_KEY',
  EXPLORER: 'https://sepolia.etherscan.io',
} as const;

export const CELO_MAINNET_ADDRESSES = {
  CUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as Address,
  AAVE_POOL: '0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402' as Address,
  CHAIN_ID: 42220,
  RPC_URL: 'https://forno.celo.org',
  EXPLORER: 'https://celoscan.io',
} as const;

export const ALFAJORES_ADDRESSES = {
  CUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as Address,
  AAVE_POOL: '0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402' as Address,
  CHAIN_ID: 44787,
  RPC_URL: 'https://alfajores-forno.celo-testnet.org',
  EXPLORER: 'https://alfajores.celoscan.io',
} as const;

// ============================================================================
// CONTRACT ABIs
// ============================================================================

export const ATTESTIFY_VAULT_ABI = [
  // Read Functions
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function previewDeposit(uint256 assets) view returns (uint256)',
  'function previewMint(uint256 shares) view returns (uint256)',
  'function previewWithdraw(uint256 assets) view returns (uint256)',
  'function previewRedeem(uint256 shares) view returns (uint256)',
  'function getCurrentAPY() view returns (uint256)',
  'function getVaultStats() view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)',
  'function getUserPosition(address) view returns (uint256,uint256,uint256)',
  'function asset() view returns (address)',
  'function minDeposit() view returns (uint256)',
  'function maxDeposit() view returns (uint256)',
  'function maxTvl() view returns (uint256)',
  'function reserveRatio() view returns (uint256)',
  'function performanceFee() view returns (uint256)',
  'function maxSlippage() view returns (uint256)',
  'function paused() view returns (bool)',
  
  // Write Functions
  'function deposit(uint256 assets, address receiver) returns (uint256)',
  'function mint(uint256 shares, address receiver) returns (uint256)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
  
  // Events
  'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
  'event DepositedToAave(uint256 amount, uint256 timestamp)',
  'event WithdrawnFromAave(uint256 amount, uint256 timestamp)',
  'event YieldHarvested(uint256 amount, uint256 fee, uint256 timestamp)',
] as const;

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

// ============================================================================
// TYPES
// ============================================================================

export type VaultStats = {
  totalAssets: bigint;
  totalShares: bigint;
  reserveBalance: bigint;
  aaveBalance: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  totalYield: bigint;
  totalFees: bigint;
};

export type UserPosition = {
  shares: bigint;
  assets: bigint;
  shareOfPool: number; // percentage (0-100)
};

export type VaultConfig = {
  minDeposit: bigint;
  maxDeposit: bigint;
  maxTvl: bigint;
  reserveRatio: number; // percentage (0-100)
  performanceFee: number; // percentage (0-100)
  maxSlippage: number; // percentage (0-100)
  isPaused: boolean;
};

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

export const BASIS_POINTS = 10000;
export const DECIMALS = 18;
export const MAX_UINT256 = 2n ** 256n - 1n;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert basis points to percentage
 * @param basisPoints - Value in basis points (10000 = 100%)
 * @returns Percentage value (0-100)
 */
export function basisPointsToPercent(basisPoints: bigint | number): number {
  return Number(basisPoints) / 100;
}

/**
 * Convert percentage to basis points
 * @param percent - Percentage value (0-100)
 * @returns Basis points (10000 = 100%)
 */
export function percentToBasisPoints(percent: number): bigint {
  return BigInt(Math.round(percent * 100));
}

/**
 * Calculate share price (assets per share)
 * @param totalAssets - Total assets in vault
 * @param totalShares - Total shares outstanding
 * @returns Share price (1e18 = 1:1 ratio)
 */
export function calculateSharePrice(totalAssets: bigint, totalShares: bigint): bigint {
  if (totalShares === 0n) return 10n ** 18n; // 1:1 ratio for first deposit
  return (totalAssets * 10n ** 18n) / totalShares;
}

/**
 * Calculate user's percentage of pool
 * @param userShares - User's share balance
 * @param totalShares - Total shares outstanding
 * @returns Percentage of pool (0-100)
 */
export function calculatePoolShare(userShares: bigint, totalShares: bigint): number {
  if (totalShares === 0n) return 0;
  return Number((userShares * 10000n) / totalShares) / 100;
}

/**
 * Calculate expected yield for a time period
 * @param assets - Amount of assets
 * @param apyBasisPoints - APY in basis points
 * @param days - Number of days
 * @returns Expected yield
 */
export function calculateExpectedYield(
  assets: bigint,
  apyBasisPoints: bigint,
  days: number
): bigint {
  const yearlyYield = (assets * apyBasisPoints) / BigInt(BASIS_POINTS);
  return (yearlyYield * BigInt(days)) / 365n;
}

/**
 * Format vault stats for display
 * @param stats - Raw vault stats tuple
 * @returns Formatted VaultStats object
 */
export function parseVaultStats(stats: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]): VaultStats {
  const [
    totalAssets,
    totalShares,
    reserveBalance,
    aaveBalance,
    totalDeposited,
    totalWithdrawn,
    totalYield,
    totalFees,
  ] = stats;

  return {
    totalAssets,
    totalShares,
    reserveBalance,
    aaveBalance,
    totalDeposited,
    totalWithdrawn,
    totalYield,
    totalFees,
  };
}

/**
 * Format user position for display
 * @param position - Raw user position tuple
 * @returns Formatted UserPosition object
 */
export function parseUserPosition(position: readonly [bigint, bigint, bigint]): UserPosition {
  const [shares, assets, shareOfPoolBp] = position;

  return {
    shares,
    assets,
    shareOfPool: basisPointsToPercent(shareOfPoolBp),
  };
}

/**
 * Check if amount is within deposit limits
 * @param amount - Amount to check
 * @param minDeposit - Minimum deposit
 * @param maxDeposit - Maximum deposit
 * @returns Error message if invalid, null if valid
 */
export function validateDepositAmount(
  amount: bigint,
  minDeposit: bigint,
  maxDeposit: bigint
): string | null {
  if (amount === 0n) return 'Amount cannot be zero';
  if (amount < minDeposit) return `Minimum deposit is ${minDeposit}`;
  if (amount > maxDeposit) return `Maximum deposit is ${maxDeposit}`;
  return null;
}

/**
 * Check if withdrawal amount is valid
 * @param amount - Amount to withdraw
 * @param userAssets - User's total assets
 * @returns Error message if invalid, null if valid
 */
export function validateWithdrawalAmount(
  amount: bigint,
  userAssets: bigint
): string | null {
  if (amount === 0n) return 'Amount cannot be zero';
  if (amount > userAssets) return 'Insufficient balance';
  return null;
}

/**
 * Calculate slippage percentage
 * @param expected - Expected amount
 * @param actual - Actual amount
 * @returns Slippage percentage (can be negative)
 */
export function calculateSlippage(expected: bigint, actual: bigint): number {
  if (expected === 0n) return 0;
  const diff = actual - expected;
  return Number((diff * 10000n) / expected) / 100;
}

/**
 * Format APY for display
 * @param apyBasisPoints - APY in basis points
 * @returns Formatted APY string (e.g., "5.25%")
 */
export function formatAPY(apyBasisPoints: bigint | number): string {
  const percent = basisPointsToPercent(apyBasisPoints);
  return `${percent.toFixed(2)}%`;
}

/**
 * Calculate time until next harvest
 * @param lastHarvest - Last harvest timestamp
 * @param harvestInterval - Harvest interval in seconds
 * @returns Seconds until next harvest (0 if ready)
 */
export function timeUntilNextHarvest(
  lastHarvest: bigint,
  harvestInterval: bigint
): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const nextHarvest = lastHarvest + harvestInterval;
  
  if (now >= nextHarvest) return 0;
  return Number(nextHarvest - now);
}

/**
 * Format time duration
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Ready';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const ERROR_MESSAGES: Record<string, string> = {
  ZeroAmount: 'Amount cannot be zero',
  BelowMinDeposit: 'Amount is below minimum deposit',
  ExceedsMaxDeposit: 'Amount exceeds maximum deposit',
  ExceedsMaxTVL: 'Vault has reached maximum capacity',
  SlippageExceeded: 'Price slippage too high, please try again',
  InsufficientLiquidity: 'Not enough liquidity available',
  'User rejected': 'Transaction was rejected',
  'insufficient funds': 'Insufficient funds for transaction',
  'execution reverted': 'Transaction failed',
};

/**
 * Parse error message from contract
 * @param error - Error object
 * @returns User-friendly error message
 */
export function parseContractError(error: any): string {
  const errorMessage = error?.message || error?.toString() || '';
  
  // Check for known error messages
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }
  
  // Extract revert reason if available
  const revertMatch = errorMessage.match(/reverted with reason string '(.+?)'/);
  if (revertMatch) {
    return revertMatch[1];
  }
  
  return 'Transaction failed. Please try again.';
}

// ============================================================================
// NETWORK UTILITIES
// ============================================================================

/**
 * Get addresses for current network
 * @param chainId - Chain ID
 * @returns Network addresses
 */
export function getNetworkAddresses(chainId: number) {
  switch (chainId) {
    case 11155111:
      return SEPOLIA_ADDRESSES;
    case 42220:
      return CELO_MAINNET_ADDRESSES;
    case 44787:
      return ALFAJORES_ADDRESSES;
    default:
      throw new Error(`Unsupported network: ${chainId}`);
  }
}

/**
 * Get explorer URL for address
 * @param chainId - Chain ID
 * @param address - Contract address
 * @returns Explorer URL
 */
export function getExplorerUrl(chainId: number, address: string): string {
  const network = getNetworkAddresses(chainId);
  return `${network.EXPLORER}/address/${address}`;
}

/**
 * Get explorer URL for transaction
 * @param chainId - Chain ID
 * @param txHash - Transaction hash
 * @returns Explorer URL
 */
export function getTransactionUrl(chainId: number, txHash: string): string {
  const network = getNetworkAddresses(chainId);
  return `${network.EXPLORER}/tx/${txHash}`;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format large numbers with K, M, B suffixes
 * @param value - Value to format
 * @returns Formatted string
 */
export function formatCompact(value: bigint | number): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  
  return num.toFixed(2);
}

/**
 * Format percentage change
 * @param oldValue - Old value
 * @param newValue - New value
 * @returns Formatted percentage change with sign
 */
export function formatPercentageChange(oldValue: bigint, newValue: bigint): string {
  if (oldValue === 0n) return '+0.00%';
  
  const change = newValue - oldValue;
  const percentChange = Number((change * 10000n) / oldValue) / 100;
  const sign = percentChange >= 0 ? '+' : '';
  
  return `${sign}${percentChange.toFixed(2)}%`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if address is valid
 * @param address - Address to check
 * @returns True if valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if amount string is valid
 * @param amount - Amount string
 * @returns True if valid
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || amount === '') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Truncate address for display
 * @param address - Full address
 * @param chars - Number of chars to show on each side
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Addresses
  SEPOLIA_ADDRESSES,
  CELO_MAINNET_ADDRESSES,
  ALFAJORES_ADDRESSES,
  
  // ABIs
  ATTESTIFY_VAULT_ABI,
  ERC20_ABI,
  
  // Constants
  BASIS_POINTS,
  DECIMALS,
  MAX_UINT256,
  
  // Utilities
  basisPointsToPercent,
  percentToBasisPoints,
  calculateSharePrice,
  calculatePoolShare,
  calculateExpectedYield,
  parseVaultStats,
  parseUserPosition,
  validateDepositAmount,
  validateWithdrawalAmount,
  calculateSlippage,
  formatAPY,
  timeUntilNextHarvest,
  formatDuration,
  parseContractError,
  getNetworkAddresses,
  getExplorerUrl,
  getTransactionUrl,
  formatCompact,
  formatPercentageChange,
  isValidAddress,
  isValidAmount,
  truncateAddress,
};
