/**
 * AttestifyVault Frontend Integration
 * Main export file for easy imports
 */

// Export all utilities and types
export * from './attestify-vault';

// Export all hooks (will only work in frontend project with React)
export * from './useAttestifyVault';

// Re-export commonly used items for convenience
export {
  SEPOLIA_ADDRESSES,
  CELO_MAINNET_ADDRESSES,
  ALFAJORES_ADDRESSES,
  ATTESTIFY_VAULT_ABI,
  ERC20_ABI,
} from './attestify-vault';

export {
  useVaultData,
  useUserPosition,
  useTokenBalance,
  useDepositPreview,
  useWithdrawalPreview,
  useApprove,
  useDeposit,
  useWithdraw,
  useRedeem,
  useAttestifyVault,
  useYieldCalculator,
} from './useAttestifyVault';
