# 🔗 WalletConnect Integration Guide

## ✅ WalletConnect App ID Configured

Your WalletConnect App ID has been successfully integrated into your Attestify frontend:

**App ID**: `a69043ecf4dca5c34a5e70fdfeac4558`

## 📋 Integration Status

### ✅ Completed
- **Provider Configuration**: Updated `src/app/provider.tsx` with your App ID
- **Contract Configuration**: Created `src/config/contracts.ts` with all contract addresses
- **Vault Hooks**: Created `src/hooks/useVault.ts` for contract interactions
- **Deployment Status**: Created component to track deployment progress

### 🔧 Files Updated/Created
1. **`src/app/provider.tsx`** - WalletConnect configuration
2. **`src/config/contracts.ts`** - Contract addresses and configuration
3. **`src/hooks/useVault.ts`** - Contract interaction hooks
4. **`src/components/DeploymentStatus/index.tsx`** - Deployment tracking

## 🚀 How to Use

### 1. Wallet Connection
Your app now supports:
- **MetaMask** - Direct connection
- **WalletConnect** - QR code connection
- **RainbowKit** - Multiple wallet support
- **Celo Sepolia** - Testnet support
- **Celo Mainnet** - Production support

### 2. Contract Interaction
```typescript
import { useVault } from '@/hooks/useVault';

function MyComponent() {
  const { 
    isConnected, 
    isVerified, 
    userBalance, 
    deposit, 
    withdraw 
  } = useVault();

  // Use vault functions
}
```

### 3. Contract Addresses
```typescript
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// Celo Sepolia addresses are pre-configured
const vaultAddress = CONTRACT_ADDRESSES.celoSepolia.vault;
```

## 🧪 Testing Your Integration

### Step 1: Start Development Server
```bash
cd frontend
npm run dev
```

### Step 2: Connect Wallet
1. Open your app in browser
2. Click "Connect Wallet"
3. Choose your wallet (MetaMask, WalletConnect, etc.)
4. Approve connection

### Step 3: Test Contract Functions
Once contract is deployed:
1. **Verify Identity**: Test Self Protocol verification
2. **Deposit**: Test cUSD deposits
3. **Withdraw**: Test withdrawals
4. **Check Balance**: Verify share calculations

## 📱 Mobile Support

Your WalletConnect integration supports:
- **Mobile Wallets**: Trust Wallet, Coinbase Wallet, etc.
- **QR Code Scanning**: Easy mobile connection
- **Deep Linking**: Direct wallet app integration

## 🔧 Configuration Options

### Environment Variables
Create `.env.local` in your frontend directory:
```bash
# WalletConnect (already configured)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a69043ecf4dca5c34a5e70fdfeac4558

# Contract Addresses (set after deployment)
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=
NEXT_PUBLIC_CUSD_CONTRACT_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a
NEXT_PUBLIC_ACUSD_CONTRACT_ADDRESS=0xBba98352628B0B0c4b40583F593fFCb630935a45
NEXT_PUBLIC_AAVE_POOL_ADDRESS=0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402
NEXT_PUBLIC_SELF_PROTOCOL_ADDRESS=0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
```

### Customization
You can customize the wallet connection experience by modifying:
- **App Name**: Change in `provider.tsx`
- **Supported Chains**: Add/remove chains
- **Wallet Options**: Configure RainbowKit settings

## 🎯 Next Steps

### 1. Deploy Contract
- Deploy AttestifyVault to Celo Sepolia
- Update contract address in configuration

### 2. Test Integration
- Connect wallet
- Test all contract functions
- Verify transaction flows

### 3. Production Deployment
- Deploy to Celo mainnet
- Update production contract addresses
- Launch to users

## 🔍 Troubleshooting

### Common Issues
1. **Wallet Not Connecting**: Check WalletConnect App ID
2. **Wrong Network**: Ensure Celo Sepolia is selected
3. **Contract Not Found**: Verify contract address is correct
4. **Transaction Fails**: Check gas limits and approvals

### Support Resources
- **WalletConnect Docs**: https://docs.walletconnect.com/
- **RainbowKit Docs**: https://www.rainbowkit.com/docs/introduction
- **Celo Docs**: https://docs.celo.org/
- **Wagmi Docs**: https://wagmi.sh/

## 🎉 Ready to Go!

Your WalletConnect integration is complete and ready for testing. The app will automatically connect to Celo Sepolia testnet and support all major wallets through WalletConnect and RainbowKit.

**Next**: Deploy your smart contract and start testing the full integration!
