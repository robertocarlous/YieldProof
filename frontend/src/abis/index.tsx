import VaultABI from './Vault.json';
import VaultSimplifiedABI from './VaultSimplified.json';
import WrapperABI from './Wrapper.json';

// Contract addresses (YieldProof - Celo Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  // Celo Sepolia Testnet
  VAULT: "0x9D8d40038EE6783cE524244C11EF7833CC2BEE0d" as `0x${string}`, // AttestifyVaultSimplified on Celo Sepolia
  WRAPPER: "0xABc700e3EE92Ee98D984527ecfD82884Dcc9De8d" as `0x${string}`, // AttestifyVaultWrapper on Celo Sepolia
  CUSD: "0x8a016376332fA74639ddF9CC19fa9D09cE323624" as `0x${string}`, // Test cUSD on Celo Sepolia
  TREASURY: "0x95e1CF9174AbD55E47b9EDa1b3f0F2ba0f4369a0" as `0x${string}`, // Treasury address
  
  // Legacy Ethereum Sepolia (for backward compatibility)
  VAULT_ETH_SEPOLIA: "0x4ce1c053082208874195cF322FD142842024edeF" as `0x${string}`, // USDC Vault on Ethereum Sepolia
  USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8" as `0x${string}`, // USDC on Ethereum Sepolia
} as const;

// Self Protocol Config ID
export const SELF_PROTOCOL_CONFIG_ID = "0x986751c577aa5cfaef6f49fa2a46fa273b04e1bf78250966b8037dccf8afd399";

// Import ABIs from JSON files
export const ATTESTIFY_VAULT_ABI = VaultABI.abi; // Legacy ABI
export const ATTESTIFY_VAULT_SIMPLIFIED_ABI = VaultSimplifiedABI.abi; // Celo Sepolia Vault ABI
export const ATTESTIFY_WRAPPER_ABI = WrapperABI.abi; // Wrapper ABI

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

// Contract configurations
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESSES.VAULT,
  abi: ATTESTIFY_VAULT_SIMPLIFIED_ABI,
} as const;

// Wrapper configuration
export const WRAPPER_CONFIG = {
  address: CONTRACT_ADDRESSES.WRAPPER,
  abi: ATTESTIFY_WRAPPER_ABI,
} as const;

// cUSD Token configuration (Celo Sepolia)
export const CUSD_CONFIG = {
  address: CONTRACT_ADDRESSES.CUSD,
  abi: ERC20_ABI,
} as const;

// USDC Token configuration (Ethereum Sepolia - legacy)
export const USDC_CONFIG = {
  address: CONTRACT_ADDRESSES.USDC,
  abi: ERC20_ABI,
} as const;

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
