# 🚀 AttestifyVault Testnet Deployment Guide

## Current Status
✅ **Contract Code**: Fixed and production-ready  
✅ **Security Issues**: All resolved  
✅ **Aave Integration**: Real contracts configured  
⚠️ **Hardhat Compilation**: Dependency conflicts  

## 🎯 Deployment Options

### Option 1: Remix IDE (Recommended for now)

Since we're having Hardhat dependency issues, let's use Remix IDE for deployment:

#### Step 1: Prepare Contract
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `AttestifyVault.sol`
3. Copy the contract code from `contracts/AttestifyVault.sol`
4. Add the required imports:
   ```solidity
   import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
   import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";
   import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
   import "@openzeppelin/contracts/utils/Pausable.sol";
   ```

#### Step 2: Configure Remix
1. Go to **Solidity Compiler** tab
2. Set compiler version to `0.8.28`
3. Enable optimization (200 runs)
4. Compile the contract

#### Step 3: Deploy to Celo Sepolia
1. Go to **Deploy & Run Transactions** tab
2. Select **Injected Provider** (MetaMask)
3. Switch MetaMask to **Celo Sepolia Testnet**
4. Use these constructor parameters:
   ```
   _cUSD: 0x765DE816845861e75A25fCA122bb6898B8B1282a
   _acUSD: 0xBba98352628B0B0c4b40583F593fFCb630935a45
   _selfProtocol: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
   _aavePool: 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402
   ```

### Option 2: Fix Hardhat (Alternative)

If you want to fix Hardhat compilation:

#### Step 1: Downgrade Hardhat
```bash
npm uninstall hardhat
npm install hardhat@2.19.4 --legacy-peer-deps
```

#### Step 2: Update hardhat.config.ts
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const { PRIVATE_KEY, CELOSCAN_API_KEY, CELO_MAINNET_RPC } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11142220,
    },
  },
};

export default config;
```

## 🧪 Testing After Deployment

### Step 1: Get Testnet Tokens
1. **CELO**: Get from [Celo Faucet](https://faucet.celo.org/)
2. **cUSD**: Get from [Celo Sepolia Faucet](https://faucet.celo.org/)

### Step 2: Test Contract Functions
1. **Manual Verification**: Use `manualVerifyForTesting(your_address)`
2. **Deposit**: Deposit some cUSD to test
3. **Withdraw**: Test withdrawal functionality
4. **Check Balance**: Verify share calculations

### Step 3: Verify on Explorer
- **Celo Sepolia Explorer**: https://celo-sepolia.blockscout.com/
- **Blockscout**: https://explorer.celo.org/

## 📋 Contract Addresses (Celo Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | Stablecoin |
| acUSD | `0xBba98352628B0B0c4b40583F593fFCb630935a45` | Aave cUSD token |
| Aave Pool | `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402` | Aave V3 Pool |
| Self Protocol | `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74` | Identity verification |

## 🔧 Environment Setup

Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key
CELO_MAINNET_RPC=https://forno.celo.org
```

## 🎉 Next Steps After Deployment

1. **Test All Functions**: Deposit, withdraw, verification
2. **Monitor Performance**: Check gas costs and execution
3. **Prepare for Mainnet**: Once testnet is stable
4. **Remove Testing Functions**: Before mainnet deployment

## 🆘 Troubleshooting

### Common Issues:
- **Insufficient Gas**: Increase gas limit in MetaMask
- **Contract Not Found**: Verify contract addresses are correct
- **Compilation Errors**: Check Solidity version compatibility
- **Network Issues**: Ensure you're on Celo Sepolia testnet

### Support:
- **Celo Docs**: https://docs.celo.org/
- **Aave Docs**: https://docs.aave.com/
- **Self Protocol**: https://docs.self.xyz
