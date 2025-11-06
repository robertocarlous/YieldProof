# Frontend Integration Utilities

This folder contains ready-to-use TypeScript utilities and React hooks for integrating AttestifyVault into your frontend application.

## 📁 Files

- **`attestify-vault.ts`** - Core utilities, types, ABIs, and helper functions
- **`useAttestifyVault.tsx`** - React hooks for all vault operations
- **`ExampleComponent.tsx`** - Complete example component showing usage

## 🚀 Setup

### 1. Copy Files to Your Frontend Project

```bash
# From your frontend project root
mkdir -p src/lib/attestify
cp smartcontract/frontend-utils/* src/lib/attestify/
```

### 2. Install Dependencies

```bash
npm install viem wagmi @tanstack/react-query
# or
yarn add viem wagmi @tanstack/react-query
```

### 3. Import and Use

```typescript
import { useAttestifyVault, useDeposit, useWithdraw } from '@/lib/attestify/useAttestifyVault';
import { SEPOLIA_ADDRESSES } from '@/lib/attestify/attestify-vault';
```

## 📝 Quick Example

```typescript
import { useAttestifyVault, useDeposit } from '@/lib/attestify/useAttestifyVault';
import { SEPOLIA_ADDRESSES } from '@/lib/attestify/attestify-vault';

function MyVaultComponent() {
  const config = {
    vaultAddress: SEPOLIA_ADDRESSES.ATTESTIFY_VAULT,
    assetAddress: SEPOLIA_ADDRESSES.CUSD,
  };

  const { stats, apy, position, balance } = useAttestifyVault(config);
  const { deposit, status } = useDeposit(config);

  return (
    <div>
      <h2>Vault APY: {apy.toFixed(2)}%</h2>
      <p>Your Balance: {formatUnits(balance, 18)} cUSD</p>
      <button onClick={() => deposit('100')}>
        Deposit 100 cUSD
      </button>
    </div>
  );
}
```

## 🔧 Available Hooks

### `useVaultData(config)`
Get vault statistics and APY

### `useUserPosition(config)`
Get user's position (shares, assets, pool share)

### `useTokenBalance(config)`
Get user's token balance and allowance

### `useDepositPreview(config, amount)`
Preview how many shares user will receive

### `useWithdrawalPreview(config, amount, type)`
Preview withdrawal amounts

### `useApprove(config)`
Approve vault to spend tokens

### `useDeposit(config)`
Deposit assets into vault

### `useWithdraw(config)`
Withdraw assets from vault

### `useRedeem(config)`
Redeem shares for assets

### `useAttestifyVault(config)`
All-in-one hook with all vault data

### `useYieldCalculator(config, amount)`
Calculate expected yield over time

## 📚 Documentation

See the main integration guide for complete documentation:
- **`../FRONTEND_INTEGRATION_GUIDE.md`** - Complete integration guide
- **`../QUICK_REFERENCE.md`** - Quick reference card

## ⚠️ Note

The TypeScript files in this folder may show lint errors because they depend on packages that are installed in the frontend project, not in the smart contract project. This is expected and will resolve once you copy these files to your frontend project and install the dependencies.

## 🆘 Support

For questions or issues, refer to the main integration guide or contact the development team.
