// Contract addresses for YieldProof Vault (AttestifyAaveVault)
export const CONTRACT_ADDRESSES = {
  // Ethereum Sepolia Testnet (with real Aave V3)
  sepolia: {
    vault: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || '0x4ce1c053082208874195cF322FD142842024edeF', // USDC Vault (18 decimals shares)
    usdc: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // USDC token
    aEthUSDC: '0x16dA4541aD1807f4443d92D26044C1147406EB80', // aEthUSDC (Aave USDC token)
    aavePool: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Aave V3 Pool
    selfProtocol: process.env.NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS || '0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74',
  },
};

// App configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'YieldProof',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'AI-powered investment vault with privacy-preserving identity verification',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a69043ecf4dca5c34a5e70fdfeac4558',
  networks: {
    sepolia: {
      chainId: 11155111,
      name: 'Ethereum Sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io',
      explorerUrl: 'https://sepolia.etherscan.io',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  },
};

// Vault configuration
export const VAULT_CONFIG = {
  minDeposit: '1', // 1 USDC
  maxDeposit: '10000', // 10,000 USDC per transaction
  maxTVL: '100000', // 100,000 USDC total (MVP)
  reserveRatio: 10, // 10% kept liquid for withdrawals
  targetAPY: 350, // 3.5% APY (350 basis points) - Real Aave yield
};

// Strategy types
export const STRATEGY_TYPES = {
  CONSERVATIVE: {
    id: 0,
    name: 'Conservative',
    description: '100% Aave allocation - Safest option with real yield',
    aaveAllocation: 100,
    reserveAllocation: 0,
    targetAPY: 350, // 3.5% APY (Real Aave)
    riskLevel: 1,
  },
  BALANCED: {
    id: 1,
    name: 'Balanced',
    description: '90% Aave, 10% reserve - Balanced approach',
    aaveAllocation: 90,
    reserveAllocation: 10,
    targetAPY: 315, // ~3.15% APY
    riskLevel: 3,
  },
  GROWTH: {
    id: 2,
    name: 'Growth',
    description: '80% Aave, 20% reserve - Growth focused',
    aaveAllocation: 80,
    reserveAllocation: 20,
    targetAPY: 280, // ~2.8% APY
    riskLevel: 5,
  },
} as const;

export type StrategyType = keyof typeof STRATEGY_TYPES;
