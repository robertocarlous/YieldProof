/**
 * React Hooks for AttestifyVault Integration
 * Ready-to-use hooks for wagmi v2
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useMemo, useState, useCallback } from 'react';
import {
  ATTESTIFY_VAULT_ABI,
  ERC20_ABI,
  parseVaultStats,
  parseUserPosition,
  basisPointsToPercent,
  calculateExpectedYield,
  parseContractError,
  type VaultStats,
  type UserPosition,
  type TransactionStatus,
} from './attestify-vault';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface VaultConfig {
  vaultAddress: `0x${string}`;
  assetAddress: `0x${string}`;
  chainId?: number;
}

// ============================================================================
// VAULT DATA HOOK
// ============================================================================

/**
 * Get complete vault data including stats and APY
 */
export function useVaultData(config: VaultConfig) {
  const { vaultAddress } = config;

  // Get vault stats
  const { data: statsRaw, isLoading: statsLoading, refetch: refetchStats } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getVaultStats',
  });

  // Get current APY
  const { data: apyRaw, isLoading: apyLoading, refetch: refetchAPY } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getCurrentAPY',
  });

  // Get vault config
  const { data: minDeposit } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'minDeposit',
  });

  const { data: maxDeposit } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'maxDeposit',
  });

  const { data: maxTvl } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'maxTvl',
  });

  const { data: isPaused } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'paused',
  });

  const stats: VaultStats | null = useMemo(() => {
    if (!statsRaw) return null;
    return parseVaultStats(statsRaw);
  }, [statsRaw]);

  const apy = useMemo(() => {
    if (!apyRaw) return 0;
    return basisPointsToPercent(apyRaw);
  }, [apyRaw]);

  const refetch = useCallback(() => {
    refetchStats();
    refetchAPY();
  }, [refetchStats, refetchAPY]);

  return {
    stats,
    apy,
    minDeposit: minDeposit || 0n,
    maxDeposit: maxDeposit || 0n,
    maxTvl: maxTvl || 0n,
    isPaused: isPaused || false,
    isLoading: statsLoading || apyLoading,
    refetch,
  };
}

// ============================================================================
// USER POSITION HOOK
// ============================================================================

/**
 * Get user's position in the vault
 */
export function useUserPosition(config: VaultConfig) {
  const { vaultAddress } = config;
  const { address } = useAccount();

  const { data: positionRaw, isLoading, refetch } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const position: UserPosition | null = useMemo(() => {
    if (!positionRaw) return null;
    return parseUserPosition(positionRaw);
  }, [positionRaw]);

  return {
    position,
    hasPosition: position ? position.shares > 0n : false,
    isLoading,
    refetch,
  };
}

// ============================================================================
// TOKEN BALANCE HOOK
// ============================================================================

/**
 * Get user's token balance and allowance
 */
export function useTokenBalance(config: VaultConfig) {
  const { assetAddress, vaultAddress } = config;
  const { address } = useAccount();

  // Get balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get allowance
  const { data: allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, vaultAddress] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get token info
  const { data: symbol } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const refetch = useCallback(() => {
    refetchBalance();
    refetchAllowance();
  }, [refetchBalance, refetchAllowance]);

  return {
    balance: balance || 0n,
    allowance: allowance || 0n,
    symbol: symbol || 'TOKEN',
    decimals: decimals || 18,
    isLoading: balanceLoading || allowanceLoading,
    refetch,
  };
}

// ============================================================================
// DEPOSIT PREVIEW HOOK
// ============================================================================

/**
 * Preview deposit - shows expected shares
 */
export function useDepositPreview(config: VaultConfig, amount: string) {
  const { vaultAddress } = config;
  
  const amountWei = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n;
    } catch {
      return 0n;
    }
  }, [amount]);

  const { data: expectedShares, isLoading } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'previewDeposit',
    args: [amountWei],
    query: {
      enabled: amountWei > 0n,
    },
  });

  return {
    expectedShares: expectedShares || 0n,
    expectedSharesFormatted: expectedShares ? formatUnits(expectedShares, 18) : '0',
    isLoading,
  };
}

// ============================================================================
// WITHDRAWAL PREVIEW HOOK
// ============================================================================

/**
 * Preview withdrawal - shows expected assets or shares
 */
export function useWithdrawalPreview(
  config: VaultConfig,
  amount: string,
  type: 'assets' | 'shares'
) {
  const { vaultAddress } = config;
  
  const amountWei = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n;
    } catch {
      return 0n;
    }
  }, [amount]);

  const { data: preview, isLoading } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: type === 'assets' ? 'previewWithdraw' : 'previewRedeem',
    args: [amountWei],
    query: {
      enabled: amountWei > 0n,
    },
  });

  return {
    preview: preview || 0n,
    previewFormatted: preview ? formatUnits(preview, 18) : '0',
    isLoading,
  };
}

// ============================================================================
// APPROVE HOOK
// ============================================================================

/**
 * Approve vault to spend tokens
 */
export function useApprove(config: VaultConfig) {
  const { assetAddress, vaultAddress } = config;
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, reset } = useWriteContract({
    mutation: {
      onError: (err: Error) => {
        setError(parseContractError(err));
      },
      onSuccess: () => {
        setError(null);
      },
    },
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback(
    (amount: string) => {
      try {
        const amountWei = parseUnits(amount, 18);
        writeContract({
          address: assetAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vaultAddress, amountWei],
        });
      } catch (err: any) {
        setError(parseContractError(err));
      }
    },
    [assetAddress, vaultAddress, writeContract]
  );

  const approveMax = useCallback(() => {
    writeContract({
      address: assetAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress, 2n ** 256n - 1n], // Max uint256
    });
  }, [assetAddress, vaultAddress, writeContract]);

  const status: TransactionStatus = isSuccess
    ? 'success'
    : isConfirming
    ? 'confirming'
    : isPending
    ? 'pending'
    : error
    ? 'error'
    : 'idle';

  return {
    approve,
    approveMax,
    hash,
    status,
    error,
    reset,
  };
}

// ============================================================================
// DEPOSIT HOOK
// ============================================================================

/**
 * Deposit assets into vault
 */
export function useDeposit(config: VaultConfig) {
  const { vaultAddress } = config;
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, reset } = useWriteContract({
    mutation: {
      onError: (err: Error) => {
        setError(parseContractError(err));
      },
      onSuccess: () => {
        setError(null);
      },
    },
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = useCallback(
    (amount: string, receiver?: `0x${string}`) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      try {
        const amountWei = parseUnits(amount, 18);
        writeContract({
          address: vaultAddress,
          abi: ATTESTIFY_VAULT_ABI,
          functionName: 'deposit',
          args: [amountWei, receiver || address],
        });
      } catch (err: any) {
        setError(parseContractError(err));
      }
    },
    [address, vaultAddress, writeContract]
  );

  const status: TransactionStatus = isSuccess
    ? 'success'
    : isConfirming
    ? 'confirming'
    : isPending
    ? 'pending'
    : error
    ? 'error'
    : 'idle';

  return {
    deposit,
    hash,
    status,
    error,
    reset,
  };
}

// ============================================================================
// WITHDRAW HOOK
// ============================================================================

/**
 * Withdraw assets from vault
 */
export function useWithdraw(config: VaultConfig) {
  const { vaultAddress } = config;
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, reset } = useWriteContract({
    mutation: {
      onError: (err: Error) => {
        setError(parseContractError(err));
      },
      onSuccess: () => {
        setError(null);
      },
    },
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = useCallback(
    (amount: string, receiver?: `0x${string}`) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      try {
        const amountWei = parseUnits(amount, 18);
        writeContract({
          address: vaultAddress,
          abi: ATTESTIFY_VAULT_ABI,
          functionName: 'withdraw',
          args: [amountWei, receiver || address, address],
        });
      } catch (err: any) {
        setError(parseContractError(err));
      }
    },
    [address, vaultAddress, writeContract]
  );

  const status: TransactionStatus = isSuccess
    ? 'success'
    : isConfirming
    ? 'confirming'
    : isPending
    ? 'pending'
    : error
    ? 'error'
    : 'idle';

  return {
    withdraw,
    hash,
    status,
    error,
    reset,
  };
}

// ============================================================================
// REDEEM HOOK
// ============================================================================

/**
 * Redeem shares for assets
 */
export function useRedeem(config: VaultConfig) {
  const { vaultAddress } = config;
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, reset } = useWriteContract({
    mutation: {
      onError: (err: Error) => {
        setError(parseContractError(err));
      },
      onSuccess: () => {
        setError(null);
      },
    },
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const redeem = useCallback(
    (shares: string, receiver?: `0x${string}`) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      try {
        const sharesWei = parseUnits(shares, 18);
        writeContract({
          address: vaultAddress,
          abi: ATTESTIFY_VAULT_ABI,
          functionName: 'redeem',
          args: [sharesWei, receiver || address, address],
        });
      } catch (err: any) {
        setError(parseContractError(err));
      }
    },
    [address, vaultAddress, writeContract]
  );

  const redeemAll = useCallback(
    (userShares: bigint, receiver?: `0x${string}`) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      writeContract({
        address: vaultAddress,
        abi: ATTESTIFY_VAULT_ABI,
        functionName: 'redeem',
        args: [userShares, receiver || address, address],
      });
    },
    [address, vaultAddress, writeContract]
  );

  const status: TransactionStatus = isSuccess
    ? 'success'
    : isConfirming
    ? 'confirming'
    : isPending
    ? 'pending'
    : error
    ? 'error'
    : 'idle';

  return {
    redeem,
    redeemAll,
    hash,
    status,
    error,
    reset,
  };
}

// ============================================================================
// COMBINED VAULT HOOK
// ============================================================================

/**
 * All-in-one hook for vault operations
 */
export function useAttestifyVault(config: VaultConfig) {
  const vaultData = useVaultData(config);
  const userPosition = useUserPosition(config);
  const tokenBalance = useTokenBalance(config);

  const refetchAll = useCallback(() => {
    vaultData.refetch();
    userPosition.refetch();
    tokenBalance.refetch();
  }, [vaultData, userPosition, tokenBalance]);

  return {
    // Vault data
    stats: vaultData.stats,
    apy: vaultData.apy,
    minDeposit: vaultData.minDeposit,
    maxDeposit: vaultData.maxDeposit,
    maxTvl: vaultData.maxTvl,
    isPaused: vaultData.isPaused,

    // User position
    position: userPosition.position,
    hasPosition: userPosition.hasPosition,

    // Token balance
    balance: tokenBalance.balance,
    allowance: tokenBalance.allowance,
    symbol: tokenBalance.symbol,
    decimals: tokenBalance.decimals,

    // Loading states
    isLoading: vaultData.isLoading || userPosition.isLoading || tokenBalance.isLoading,

    // Refetch
    refetch: refetchAll,
  };
}

// ============================================================================
// YIELD CALCULATOR HOOK
// ============================================================================

/**
 * Calculate expected yield for different time periods
 */
export function useYieldCalculator(config: VaultConfig, amount: string) {
  const { apy } = useVaultData(config);

  const calculations = useMemo(() => {
    if (!amount || !apy) {
      return {
        daily: 0n,
        weekly: 0n,
        monthly: 0n,
        yearly: 0n,
      };
    }

    try {
      const amountWei = parseUnits(amount, 18);
      const apyBp = BigInt(Math.round(apy * 100));

      return {
        daily: calculateExpectedYield(amountWei, apyBp, 1),
        weekly: calculateExpectedYield(amountWei, apyBp, 7),
        monthly: calculateExpectedYield(amountWei, apyBp, 30),
        yearly: calculateExpectedYield(amountWei, apyBp, 365),
      };
    } catch {
      return {
        daily: 0n,
        weekly: 0n,
        monthly: 0n,
        yearly: 0n,
      };
    }
  }, [amount, apy]);

  return {
    daily: formatUnits(calculations.daily, 18),
    weekly: formatUnits(calculations.weekly, 18),
    monthly: formatUnits(calculations.monthly, 18),
    yearly: formatUnits(calculations.yearly, 18),
    apy,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
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
};
