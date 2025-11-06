import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VAULT_CONFIG, CONTRACT_ADDRESSES, STRATEGY_TYPES } from '@/config/contracts';
import { ATTESTIFY_VAULT_ABI } from '@/abis';

// Hook for interacting with the AttestifyVault contract
export function useVault() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read user's verification status
  const { data: isVerified } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Read user's balance
  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Read user's shares
  const { data: userShares } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'shares',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Read user's earnings
  const { data: userEarnings } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getEarnings',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Read vault statistics
  const { data: vaultStats } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getVaultStats',
    query: { enabled: !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Read current APY
  const { data: currentAPY } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getCurrentAPY',
    query: { enabled: !!CONTRACT_ADDRESSES.celoSepolia.vault },
  });

  // Functions for interacting with the contract
  const verifyIdentity = async (proof: string) => {
    if (!CONTRACT_ADDRESSES.celoSepolia.vault) {
      throw new Error('Vault contract address not set');
    }

    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'verifyIdentity',
      args: [proof as `0x${string}`],
    });
  };

  const deposit = async (amount: bigint) => {
    if (!CONTRACT_ADDRESSES.celoSepolia.vault) {
      throw new Error('Vault contract address not set');
    }

    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'deposit',
      args: [amount],
    });
  };

  const withdraw = async (amount: bigint) => {
    if (!CONTRACT_ADDRESSES.celoSepolia.vault) {
      throw new Error('Vault contract address not set');
    }

    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  const changeStrategy = async (strategyType: number) => {
    if (!CONTRACT_ADDRESSES.celoSepolia.vault) {
      throw new Error('Vault contract address not set');
    }

    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'changeStrategy',
      args: [strategyType],
    });
  };

  // Manual verification for testing (owner only)
  const manualVerifyForTesting = async (userAddress: string) => {
    if (!CONTRACT_ADDRESSES.celoSepolia.vault) {
      throw new Error('Vault contract address not set');
    }

    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.vault as `0x${string}`,
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'manualVerifyForTesting',
      args: [userAddress as `0x${string}`],
    });
  };

  return {
    // Connection state
    isConnected,
    address,
    
    // User data
    isVerified: !!isVerified,
    userBalance: userBalance || BigInt(0),
    userShares: userShares || BigInt(0),
    userEarnings: userEarnings || BigInt(0),
    
    // Vault data
    vaultStats: vaultStats || {
      totalAssets: BigInt(0),
      totalShares: BigInt(0),
      reserveBalance: BigInt(0),
      aaveBalance: BigInt(0),
      totalDeposited: BigInt(0),
      totalWithdrawn: BigInt(0),
    },
    currentAPY: currentAPY || BigInt(350),
    
    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    
    // Contract functions
    verifyIdentity,
    deposit,
    withdraw,
    changeStrategy,
    manualVerifyForTesting,
    
    // Configuration
    config: VAULT_CONFIG,
    strategies: STRATEGY_TYPES,
  };
}

// Hook for interacting with cUSD token
export function useCUSD() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Read cUSD balance
  const { data: cUSDBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.celoSepolia.cUSD as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      },
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Approve cUSD for vault
  const approveCUSD = async (spender: string, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.celoSepolia.cUSD as `0x${string}`,
      abi: [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });
  };

  return {
    balance: cUSDBalance || BigInt(0),
    approveCUSD,
  };
}
