# 🎨 Frontend Integration Guide for AttestifyVault

## 📋 Table of Contents
1. [Overview](#overview)
2. [Contract Addresses](#contract-addresses)
3. [Quick Start](#quick-start)
4. [Core Functions](#core-functions)
5. [Integration Examples](#integration-examples)
6. [React Hooks](#react-hooks)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## 🎯 Overview

AttestifyVault is an ERC-4626 compliant vault that automatically generates yield through Aave V3 integration. Users deposit assets (like cUSD) and receive vault shares that appreciate in value as yield accrues.

### Key Features
- ✅ **ERC-4626 Standard**: Compatible with all ERC-4626 tools and protocols
- 💰 **Automatic Yield**: Assets automatically earn Aave V3 interest
- 🔒 **Security**: Pausable, reentrancy protection, slippage protection
- 📊 **Real-time Stats**: APY, TVL, user positions, and more
- ⚡ **Instant Withdrawals**: Reserve buffer for immediate liquidity

---

## 📍 Contract Addresses

### Ethereum Sepolia Testnet
```typescript
export const SEPOLIA_ADDRESSES = {
  // Test Token (cUSD Mock)
  CUSD: "0x8a016376332fa74639ddf9cc19fa9d09ce323624",
  
  // Main Vault Contract (Simplified Version)
  ATTESTIFY_VAULT: "0x9d8d40038ee6783ce524244c11ef7833cc2bee0d",
  
  // Wrapper Contract (for additional features)
  ATTESTIFY_WRAPPER: "0xabc700e3ee92ee98d984527ecfd82884dcc9de8d",
  
  // Network Info
  CHAIN_ID: 11155111,
  RPC_URL: "https://sepolia.infura.io/v3/YOUR_KEY",
  EXPLORER: "https://sepolia.etherscan.io"
};
```

### Celo Mainnet (Production)
```typescript
export const CELO_ADDRESSES = {
  CUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  AAVE_POOL: "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402",
  CHAIN_ID: 42220,
  RPC_URL: "https://forno.celo.org",
  EXPLORER: "https://celoscan.io"
};
```

### Celo Alfajores Testnet
```typescript
export const ALFAJORES_ADDRESSES = {
  CUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
  AAVE_POOL: "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402",
  CHAIN_ID: 44787,
  RPC_URL: "https://alfajores-forno.celo-testnet.org",
  EXPLORER: "https://alfajores.celoscan.io"
};
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install viem wagmi @tanstack/react-query
# or
yarn add viem wagmi @tanstack/react-query
```

### 2. Contract ABI

Create `src/contracts/AttestifyVault.ts`:

```typescript
export const ATTESTIFY_VAULT_ABI = [
  // Read Functions
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
  "function getCurrentAPY() view returns (uint256)",
  "function getVaultStats() view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
  "function getUserPosition(address) view returns (uint256,uint256,uint256)",
  "function asset() view returns (address)",
  "function minDeposit() view returns (uint256)",
  "function maxDeposit() view returns (uint256)",
  "function maxTvl() view returns (uint256)",
  
  // Write Functions
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function mint(uint256 shares, address receiver) returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  
  // Events
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event DepositedToAave(uint256 amount, uint256 timestamp)",
  "event WithdrawnFromAave(uint256 amount, uint256 timestamp)",
] as const;

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;
```

---

## 🔧 Core Functions

### Read Functions (No Gas Required)

#### 1. Get Vault Statistics
```typescript
import { useReadContract } from 'wagmi';
import { ATTESTIFY_VAULT_ABI } from './contracts/AttestifyVault';

function VaultStats() {
  const { data: stats } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getVaultStats',
  });

  if (!stats) return <div>Loading...</div>;

  const [
    totalAssets,
    totalShares,
    reserveBalance,
    aaveBalance,
    totalDeposited,
    totalWithdrawn,
    totalYield,
    totalFees
  ] = stats;

  return (
    <div>
      <h3>Vault Statistics</h3>
      <p>Total Assets: {formatUnits(totalAssets, 18)} cUSD</p>
      <p>Total Shares: {formatUnits(totalShares, 18)}</p>
      <p>Reserve: {formatUnits(reserveBalance, 18)} cUSD</p>
      <p>In Aave: {formatUnits(aaveBalance, 18)} cUSD</p>
      <p>Total Yield: {formatUnits(totalYield, 18)} cUSD</p>
    </div>
  );
}
```

#### 2. Get Current APY
```typescript
function VaultAPY() {
  const { data: apy } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getCurrentAPY',
  });

  // APY is returned in basis points (10000 = 100%)
  const apyPercent = apy ? Number(apy) / 100 : 0;

  return <div>Current APY: {apyPercent.toFixed(2)}%</div>;
}
```

#### 3. Get User Position
```typescript
function UserPosition({ userAddress }: { userAddress: string }) {
  const { data: position } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getUserPosition',
    args: [userAddress],
  });

  if (!position) return <div>No position</div>;

  const [shares, assets, shareOfPool] = position;

  return (
    <div>
      <h3>Your Position</h3>
      <p>Shares: {formatUnits(shares, 18)}</p>
      <p>Value: {formatUnits(assets, 18)} cUSD</p>
      <p>Pool Share: {(Number(shareOfPool) / 100).toFixed(2)}%</p>
    </div>
  );
}
```

#### 4. Preview Deposit/Withdrawal
```typescript
function DepositPreview({ amount }: { amount: bigint }) {
  const { data: shares } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'previewDeposit',
    args: [amount],
  });

  return (
    <div>
      You will receive: {shares ? formatUnits(shares, 18) : '0'} shares
    </div>
  );
}
```

### Write Functions (Requires Gas)

#### 1. Deposit Assets
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

function DepositButton({ amount }: { amount: string }) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = async () => {
    const amountWei = parseUnits(amount, 18);
    
    writeContract({
      address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'deposit',
      args: [amountWei, userAddress], // receiver address
    });
  };

  return (
    <button 
      onClick={handleDeposit} 
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Confirming...' : 
       isConfirming ? 'Processing...' : 
       'Deposit'}
    </button>
  );
}
```

#### 2. Approve Token (Required Before Deposit)
```typescript
function ApproveButton({ amount }: { amount: string }) {
  const { writeContract } = useWriteContract();

  const handleApprove = () => {
    const amountWei = parseUnits(amount, 18);
    
    writeContract({
      address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624', // cUSD
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [
        '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d', // vault address
        amountWei
      ],
    });
  };

  return <button onClick={handleApprove}>Approve cUSD</button>;
}
```

#### 3. Withdraw Assets
```typescript
function WithdrawButton({ amount, userAddress }: { amount: string, userAddress: string }) {
  const { writeContract } = useWriteContract();

  const handleWithdraw = () => {
    const amountWei = parseUnits(amount, 18);
    
    writeContract({
      address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'withdraw',
      args: [
        amountWei,
        userAddress, // receiver
        userAddress  // owner
      ],
    });
  };

  return <button onClick={handleWithdraw}>Withdraw</button>;
}
```

#### 4. Redeem Shares
```typescript
function RedeemButton({ shares, userAddress }: { shares: string, userAddress: string }) {
  const { writeContract } = useWriteContract();

  const handleRedeem = () => {
    const sharesWei = parseUnits(shares, 18);
    
    writeContract({
      address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'redeem',
      args: [
        sharesWei,
        userAddress, // receiver
        userAddress  // owner
      ],
    });
  };

  return <button onClick={handleRedeem}>Redeem All</button>;
}
```

---

## 💡 Integration Examples

### Complete Deposit Flow

```typescript
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

function DepositFlow() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'deposit'>('input');

  // Check allowance
  const { data: allowance } = useReadContract({
    address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d'],
  });

  // Check balance
  const { data: balance } = useReadContract({
    address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
  });

  // Preview deposit
  const { data: expectedShares } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'previewDeposit',
    args: [amount ? parseUnits(amount, 18) : 0n],
    query: { enabled: !!amount },
  });

  // Approve transaction
  const { 
    data: approveHash, 
    writeContract: approve,
    isPending: isApprovePending 
  } = useWriteContract();

  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Deposit transaction
  const { 
    data: depositHash, 
    writeContract: deposit,
    isPending: isDepositPending 
  } = useWriteContract();

  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const handleApprove = () => {
    approve({
      address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
      abi: ERC20_ABI,
      functionName: 'approve',
      args: ['0x9d8d40038ee6783ce524244c11ef7833cc2bee0d', parseUnits(amount, 18)],
    });
  };

  const handleDeposit = () => {
    deposit({
      address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
      abi: ATTESTIFY_VAULT_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 18), address!],
    });
  };

  const needsApproval = allowance && parseUnits(amount || '0', 18) > allowance;

  return (
    <div className="deposit-flow">
      <h2>Deposit to Vault</h2>
      
      {/* Balance Display */}
      <div className="balance">
        Balance: {balance ? formatUnits(balance, 18) : '0'} cUSD
      </div>

      {/* Amount Input */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        disabled={isApprovePending || isDepositPending}
      />

      {/* Preview */}
      {expectedShares && (
        <div className="preview">
          You will receive: {formatUnits(expectedShares, 18)} shares
        </div>
      )}

      {/* Action Buttons */}
      {needsApproval ? (
        <button 
          onClick={handleApprove}
          disabled={isApprovePending || !amount}
        >
          {isApprovePending ? 'Approving...' : 'Approve cUSD'}
        </button>
      ) : (
        <button 
          onClick={handleDeposit}
          disabled={isDepositPending || !amount}
        >
          {isDepositPending ? 'Depositing...' : 'Deposit'}
        </button>
      )}

      {/* Success Messages */}
      {isApproveSuccess && <div className="success">Approval successful!</div>}
      {isDepositSuccess && <div className="success">Deposit successful!</div>}
    </div>
  );
}
```

### Complete Withdrawal Flow

```typescript
function WithdrawalFlow() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'assets' | 'shares'>('assets');

  // Get user position
  const { data: position } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getUserPosition',
    args: [address!],
  });

  // Preview withdrawal
  const { data: preview } = useReadContract({
    address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
    abi: ATTESTIFY_VAULT_ABI,
    functionName: withdrawType === 'assets' ? 'previewWithdraw' : 'previewRedeem',
    args: [amount ? parseUnits(amount, 18) : 0n],
    query: { enabled: !!amount },
  });

  const { writeContract, isPending } = useWriteContract();

  const handleWithdraw = () => {
    const amountWei = parseUnits(amount, 18);
    
    if (withdrawType === 'assets') {
      writeContract({
        address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
        abi: ATTESTIFY_VAULT_ABI,
        functionName: 'withdraw',
        args: [amountWei, address!, address!],
      });
    } else {
      writeContract({
        address: '0x9d8d40038ee6783ce524244c11ef7833cc2bee0d',
        abi: ATTESTIFY_VAULT_ABI,
        functionName: 'redeem',
        args: [amountWei, address!, address!],
      });
    }
  };

  const [shares, assets] = position || [0n, 0n];

  return (
    <div className="withdrawal-flow">
      <h2>Withdraw from Vault</h2>

      {/* Position Display */}
      <div className="position">
        <p>Your Shares: {formatUnits(shares, 18)}</p>
        <p>Current Value: {formatUnits(assets, 18)} cUSD</p>
      </div>

      {/* Withdrawal Type Toggle */}
      <div className="toggle">
        <button 
          onClick={() => setWithdrawType('assets')}
          className={withdrawType === 'assets' ? 'active' : ''}
        >
          Withdraw Assets
        </button>
        <button 
          onClick={() => setWithdrawType('shares')}
          className={withdrawType === 'shares' ? 'active' : ''}
        >
          Redeem Shares
        </button>
      </div>

      {/* Amount Input */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`Enter ${withdrawType === 'assets' ? 'cUSD' : 'shares'} amount`}
        max={withdrawType === 'assets' ? formatUnits(assets, 18) : formatUnits(shares, 18)}
      />

      {/* Preview */}
      {preview && (
        <div className="preview">
          {withdrawType === 'assets' 
            ? `Will burn ${formatUnits(preview, 18)} shares`
            : `Will receive ${formatUnits(preview, 18)} cUSD`
          }
        </div>
      )}

      {/* Withdraw Button */}
      <button 
        onClick={handleWithdraw}
        disabled={isPending || !amount}
      >
        {isPending ? 'Processing...' : 'Withdraw'}
      </button>

      {/* Quick Actions */}
      <button 
        onClick={() => setAmount(formatUnits(withdrawType === 'assets' ? assets : shares, 18))}
        className="max-button"
      >
        Max
      </button>
    </div>
  );
}
```

---

## 🪝 React Hooks

### Custom Hook for Vault Data

```typescript
import { useReadContract } from 'wagmi';

export function useVaultData(vaultAddress: string) {
  const { data: stats, isLoading: statsLoading } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getVaultStats',
  });

  const { data: apy, isLoading: apyLoading } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getCurrentAPY',
  });

  const [
    totalAssets,
    totalShares,
    reserveBalance,
    aaveBalance,
    totalDeposited,
    totalWithdrawn,
    totalYield,
    totalFees
  ] = stats || Array(8).fill(0n);

  return {
    totalAssets,
    totalShares,
    reserveBalance,
    aaveBalance,
    totalDeposited,
    totalWithdrawn,
    totalYield,
    totalFees,
    apy: apy ? Number(apy) / 100 : 0,
    isLoading: statsLoading || apyLoading,
  };
}
```

### Custom Hook for User Position

```typescript
export function useUserPosition(vaultAddress: string, userAddress?: string) {
  const { data: position } = useReadContract({
    address: vaultAddress,
    abi: ATTESTIFY_VAULT_ABI,
    functionName: 'getUserPosition',
    args: [userAddress!],
    query: { enabled: !!userAddress },
  });

  const [shares, assets, shareOfPool] = position || [0n, 0n, 0n];

  return {
    shares,
    assets,
    shareOfPool: Number(shareOfPool) / 100,
    hasPosition: shares > 0n,
  };
}
```

---

## ⚠️ Error Handling

### Common Errors and Solutions

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'ZeroAmount': 'Amount cannot be zero',
  'BelowMinDeposit': 'Amount is below minimum deposit',
  'ExceedsMaxDeposit': 'Amount exceeds maximum deposit',
  'ExceedsMaxTVL': 'Vault has reached maximum capacity',
  'SlippageExceeded': 'Price slippage too high, try again',
  'InsufficientLiquidity': 'Not enough liquidity available',
  'User rejected': 'Transaction was rejected',
};

function handleError(error: any) {
  const errorMessage = error?.message || '';
  
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }
  
  return 'Transaction failed. Please try again.';
}

// Usage in component
function DepositWithErrorHandling() {
  const [error, setError] = useState<string | null>(null);
  const { writeContract } = useWriteContract({
    mutation: {
      onError: (err) => {
        setError(handleError(err));
      },
      onSuccess: () => {
        setError(null);
      },
    },
  });

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* ... rest of component */}
    </div>
  );
}
```

---

## 🧪 Testing

### Test on Sepolia Testnet

1. **Get Test Tokens**:
   ```typescript
   // The TestCUSD contract has a faucet function
   const { writeContract } = useWriteContract();
   
   writeContract({
     address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
     abi: ['function mint(address to, uint256 amount)'],
     functionName: 'mint',
     args: [userAddress, parseUnits('1000', 18)], // Mint 1000 test cUSD
   });
   ```

2. **Test Deposit Flow**:
   - Approve vault to spend cUSD
   - Deposit cUSD to vault
   - Check shares received
   - Verify vault stats updated

3. **Test Withdrawal Flow**:
   - Withdraw assets or redeem shares
   - Verify cUSD received
   - Check remaining position

### Integration Tests

```typescript
import { expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('deposit flow works correctly', async () => {
  render(<DepositFlow />);
  
  const input = screen.getByPlaceholderText('Enter amount');
  await userEvent.type(input, '100');
  
  const approveButton = screen.getByText('Approve cUSD');
  await userEvent.click(approveButton);
  
  await waitFor(() => {
    expect(screen.getByText('Approval successful!')).toBeInTheDocument();
  });
  
  const depositButton = screen.getByText('Deposit');
  await userEvent.click(depositButton);
  
  await waitFor(() => {
    expect(screen.getByText('Deposit successful!')).toBeInTheDocument();
  });
});
```

---

## 📊 Dashboard Example

```typescript
function VaultDashboard() {
  const { address } = useAccount();
  const vaultData = useVaultData('0x9d8d40038ee6783ce524244c11ef7833cc2bee0d');
  const userPosition = useUserPosition('0x9d8d40038ee6783ce524244c11ef7833cc2bee0d', address);

  return (
    <div className="dashboard">
      {/* Vault Overview */}
      <div className="vault-stats">
        <h2>Vault Overview</h2>
        <div className="stat">
          <label>Total Value Locked</label>
          <value>{formatUnits(vaultData.totalAssets, 18)} cUSD</value>
        </div>
        <div className="stat">
          <label>Current APY</label>
          <value>{vaultData.apy.toFixed(2)}%</value>
        </div>
        <div className="stat">
          <label>Total Yield Generated</label>
          <value>{formatUnits(vaultData.totalYield, 18)} cUSD</value>
        </div>
      </div>

      {/* User Position */}
      {userPosition.hasPosition && (
        <div className="user-position">
          <h2>Your Position</h2>
          <div className="stat">
            <label>Your Balance</label>
            <value>{formatUnits(userPosition.assets, 18)} cUSD</value>
          </div>
          <div className="stat">
            <label>Your Shares</label>
            <value>{formatUnits(userPosition.shares, 18)}</value>
          </div>
          <div className="stat">
            <label>Pool Share</label>
            <value>{userPosition.shareOfPool.toFixed(2)}%</value>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <DepositFlow />
        <WithdrawalFlow />
      </div>
    </div>
  );
}
```

---

## 🔐 Security Best Practices

1. **Always validate user input**:
   ```typescript
   const isValidAmount = (amount: string) => {
     const num = parseFloat(amount);
     return !isNaN(num) && num > 0 && num <= maxAmount;
   };
   ```

2. **Check allowances before deposits**:
   ```typescript
   const needsApproval = allowance < depositAmount;
   ```

3. **Handle transaction failures gracefully**:
   ```typescript
   const { writeContract } = useWriteContract({
     mutation: {
       onError: (error) => {
         console.error('Transaction failed:', error);
         showErrorToast(handleError(error));
       },
     },
   });
   ```

4. **Use preview functions before transactions**:
   ```typescript
   const { data: expectedShares } = useReadContract({
     functionName: 'previewDeposit',
     args: [amount],
   });
   // Show user what they'll receive before confirming
   ```

5. **Implement proper loading states**:
   ```typescript
   if (isPending) return <Spinner />;
   if (isConfirming) return <ConfirmingMessage />;
   if (isSuccess) return <SuccessMessage />;
   ```

---

## 📚 Additional Resources

- **Viem Docs**: https://viem.sh
- **Wagmi Docs**: https://wagmi.sh
- **ERC-4626 Standard**: https://eips.ethereum.org/EIPS/eip-4626
- **Aave V3 Docs**: https://docs.aave.com/developers/
- **Celo Docs**: https://docs.celo.org/

---

## 🆘 Support

For questions or issues:
- Open an issue on GitHub
- Contact: dev@attestify.io
- Documentation: https://docs.attestify.io

---

**Happy Building! 🚀**
