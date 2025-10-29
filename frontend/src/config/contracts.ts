// Contract addresses for AttestifyVault
export const CONTRACT_ADDRESSES = {
  // Celo Sepolia Testnet (with Fixed Mock Aave for yield testing)
  celoSepolia: {
    vault: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || '0x9c75cC4A2D319363158dA01d97d5EFec55CED742', // Fixed AttestifyVault
    cUSD: process.env.NEXT_PUBLIC_CUSD_CONTRACT_ADDRESS || '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b', // Real Celo Sepolia cUSD
    acUSD: process.env.NEXT_PUBLIC_ACUSD_CONTRACT_ADDRESS || '0xEfE339C84ECf9653fB3df3e2789a19D89466bAB3', // Fixed Mock aCUSD token
    aavePool: process.env.NEXT_PUBLIC_AAVE_POOL_ADDRESS || '0x267Cf7E391fb77329028Cba1C216ffcFb288F983', // Fixed Mock Aave Pool
    selfProtocol: process.env.NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS || '0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74',
  },
  // Ethereum Sepolia Testnet (with real Aave V3 - Recommended for production)
  ethereumSepolia: {
    vault: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS_SEPOLIA || '0x4A4EBc7bfb813069e5495fB36B53cc937A31b441', // USDC Vault (Recommended)
    vaultAAVE: '0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0', // AAVE Vault (for testing)
    usdc: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // USDC token
    aEthUSDC: '0x16dA4541aD1807f4443d92D26044C1147406EB80', // aEthUSDC (Aave USDC token)
    aave: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // AAVE token (for testing)
    aEthAAVE: '0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259', // aEthAAVE (for testing)
    aavePool: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Aave V3 Pool
    selfProtocol: process.env.NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS || '0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74', // Same Self Protocol address
  },
  // Celo Mainnet (for future use)
  celoMainnet: {
    vault: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS_MAINNET || '', // Will be set after mainnet deployment
    cUSD: process.env.NEXT_PUBLIC_CUSD_CONTRACT_ADDRESS_MAINNET || '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    acUSD: process.env.NEXT_PUBLIC_ACUSD_CONTRACT_ADDRESS_MAINNET || '0xBba98352628B0B0c4b40583F593fFCb630935a45',
    aavePool: process.env.NEXT_PUBLIC_AAVE_POOL_ADDRESS_MAINNET || '0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402',
    selfProtocol: process.env.NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS_MAINNET || '0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74',
  },
};

// App configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Attestify',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'AI-powered investment vault with privacy-preserving identity verification',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a69043ecf4dca5c34a5e70fdfeac4558',
  networks: {
    celoSepolia: {
      chainId: 11142220,
      name: 'Celo Sepolia',
      rpcUrl: 'https://forno.celo-sepolia.celo-testnet.org',
      explorerUrl: 'https://celo-sepolia.blockscout.com',
      nativeCurrency: {
        name: 'Sepolia Celo',
        symbol: 'S-CELO',
        decimals: 18,
      },
    },
    ethereumSepolia: {
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
    celoMainnet: {
      chainId: 42220,
      name: 'Celo',
      rpcUrl: 'https://forno.celo.org',
      explorerUrl: 'https://celoscan.io',
      nativeCurrency: {
        name: 'Celo',
        symbol: 'CELO',
        decimals: 18,
      },
    },
  },
};

// Vault configuration
export const VAULT_CONFIG = {
  minDeposit: '1', // 1 token (USDC or cUSD depending on network)
  maxDeposit: '10000', // 10,000 tokens per transaction
  maxTVL: '100000', // 100,000 tokens total (MVP)
  reserveRatio: 10, // 10% kept liquid for withdrawals
  targetAPY: 350, // 3.5% APY (350 basis points) - Real Aave yield
};

// Strategy types
export const STRATEGY_TYPES = {
  CONSERVATIVE: {
    id: 0,
    name: 'Conservative',
    description: '100% Mock Aave allocation - Safest option with 5% APY',
    aaveAllocation: 100,
    reserveAllocation: 0,
    targetAPY: 500, // 5% APY
    riskLevel: 1,
  },
  BALANCED: {
    id: 1,
    name: 'Balanced',
    description: '90% Mock Aave, 10% reserve - Balanced approach with 4.5% APY',
    aaveAllocation: 90,
    reserveAllocation: 10,
    targetAPY: 450, // 4.5% APY
    riskLevel: 3,
  },
  GROWTH: {
    id: 2,
    name: 'Growth',
    description: '80% Mock Aave, 20% reserve - Growth focused with 4% APY',
    aaveAllocation: 80,
    reserveAllocation: 20,
    targetAPY: 400, // 4% APY
    riskLevel: 5,
  },
} as const;

export type StrategyType = keyof typeof STRATEGY_TYPES;
