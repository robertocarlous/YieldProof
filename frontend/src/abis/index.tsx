import VaultABI from './Vault.json';

// Contract addresses (YieldProof - Ethereum Sepolia)
export const CONTRACT_ADDRESSES = {
  VAULT: "0x4ce1c053082208874195cF322FD142842024edeF" as `0x${string}`, // USDC Vault on Sepolia (18 decimals)
  USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8" as `0x${string}`, // USDC on Sepolia
} as const;

// Self Protocol Config ID
export const SELF_PROTOCOL_CONFIG_ID = "0x986751c577aa5cfaef6f49fa2a46fa273b04e1bf78250966b8037dccf8afd399";

// Import ABI from JSON file
export const ATTESTIFY_VAULT_ABI = VaultABI.abi;

// ERC20 Token ABI (for USDC approval and balance checks)
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

// Contract configuration
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESSES.VAULT,
  abi: ATTESTIFY_VAULT_ABI,
} as const;

// USDC Token configuration
export const USDC_CONFIG = {
  address: CONTRACT_ADDRESSES.USDC,
  abi: ERC20_ABI,
} as const;

// Legacy alias for backward compatibility
export const CUSD_CONFIG = USDC_CONFIG;

// Strategy types enum
export const STRATEGY_TYPES = {
  CONSERVATIVE: 0,
  BALANCED: 1,
  GROWTH: 2,
} as const;

// Strategy names mapping
export const STRATEGY_NAMES = {
  [STRATEGY_TYPES.CONSERVATIVE]: 'Conservative',
  [STRATEGY_TYPES.BALANCED]: 'Balanced',
  [STRATEGY_TYPES.GROWTH]: 'Growth',
} as const;
