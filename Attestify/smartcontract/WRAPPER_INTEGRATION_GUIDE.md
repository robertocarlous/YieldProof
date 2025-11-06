# 🎯 AttestifyVaultWrapper Integration Guide

## 📋 Overview

The **AttestifyVaultWrapper** is an advanced wrapper around the base AttestifyVault that adds:
- ✅ **User Verification** via Self Protocol
- 👤 **User Profiles** with complete history tracking
- 📊 **Investment Strategies** (Conservative, Balanced, Growth)
- 🤖 **AI Agent Integration** for automated operations
- 📈 **Enhanced Analytics** and earnings tracking

### Architecture

```
User → AttestifyVaultWrapper → AttestifyVault → Aave V3
         (Verification,           (ERC-4626,      (Yield
          Strategies,              Yield Mgmt)     Generation)
          Profiles)
```

---

## 🚀 Quick Start

### Contract Addresses

#### Ethereum Sepolia Testnet
```typescript
export const WRAPPER_ADDRESSES = {
  WRAPPER: "0xabc700e3ee92ee98d984527ecfd82884dcc9de8d",
  BASE_VAULT: "0x9d8d40038ee6783ce524244c11ef7833cc2bee0d",
  CUSD: "0x8a016376332fa74639ddf9cc19fa9d09ce323624",
  CHAIN_ID: 11155111,
};
```

---

## 🔑 Key Features

### 1. User Verification

Users must verify their identity through Self Protocol before depositing.

**Benefits:**
- KYC/AML compliance
- Sybil resistance
- Enhanced security
- Regulatory compliance

### 2. Investment Strategies

Three pre-configured strategies:

| Strategy | Aave Allocation | Reserve | Target APY | Risk Level |
|----------|----------------|---------|------------|------------|
| **Conservative** | 100% | 0% | 3.5% | 1/10 |
| **Balanced** | 90% | 10% | 3.5% | 3/10 |
| **Growth** | 80% | 20% | 3.5% | 5/10 |

### 3. User Profiles

Each user has a complete profile tracking:
- Verification status and timestamp
- Total deposited and withdrawn
- Current vault shares
- Last action timestamp
- Earnings history

---

## 📚 Contract ABI

```typescript
export const WRAPPER_ABI = [
  // Verification
  "function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData)",
  "function isVerified(address user) view returns (bool)",
  
  // Deposits
  "function deposit(uint256 assets) returns (uint256 shares)",
  "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
  
  // Withdrawals
  "function withdraw(uint256 assets) returns (uint256 shares)",
  "function redeem(uint256 shares) returns (uint256 assets)",
  
  // Strategy Management
  "function changeStrategy(uint8 newStrategy)",
  "function getStrategy(uint8 strategyType) view returns (tuple(string,string,uint8,uint8,uint16,uint8,bool))",
  "function getUserStrategy(address user) view returns (uint8)",
  
  // View Functions
  "function balanceOf(address user) view returns (uint256)",
  "function getEarnings(address user) view returns (uint256)",
  "function getUserProfile(address user) view returns (tuple(bool,uint256,uint256,uint256,uint256,uint256,uint256))",
  "function getWrapperStats() view returns (uint256,uint256,uint256,uint256,uint256)",
  "function getCurrentAPY() view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  
  // Events
  "event UserVerified(address indexed user, uint256 userIdentifier, uint256 timestamp)",
  "event Deposited(address indexed user, uint256 assets, uint256 shares, uint8 strategy)",
  "event Withdrawn(address indexed user, uint256 assets, uint256 shares)",
  "event StrategyChanged(address indexed user, uint8 oldStrategy, uint8 newStrategy)",
] as const;
```

---

## 💡 Integration Examples

### 1. User Verification Flow

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function VerificationFlow() {
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleVerify = async () => {
    // Get proof from Self Protocol
    const proofPayload = await getSelfProtocolProof();
    const userContext = encodeUserContext();

    writeContract({
      address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
      abi: WRAPPER_ABI,
      functionName: 'verifySelfProof',
      args: [proofPayload, userContext],
    });
  };

  return (
    <div>
      <h2>Verify Your Identity</h2>
      <p>Complete verification to start earning yield</p>
      <button onClick={handleVerify}>
        Verify with Self Protocol
      </button>
      {isSuccess && <p>✅ Verification successful!</p>}
    </div>
  );
}
```

### 2. Check Verification Status

```typescript
import { useReadContract } from 'wagmi';

function VerificationStatus({ userAddress }: { userAddress: string }) {
  const { data: isVerified } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'isVerified',
    args: [userAddress],
  });

  if (!isVerified) {
    return (
      <div className="alert alert-warning">
        ⚠️ You need to verify your identity before depositing
      </div>
    );
  }

  return (
    <div className="alert alert-success">
      ✅ Verified User
    </div>
  );
}
```

### 3. Get User Profile

```typescript
function UserProfileCard({ userAddress }: { userAddress: string }) {
  const { data: profile } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getUserProfile',
    args: [userAddress],
  });

  if (!profile) return <div>Loading...</div>;

  const [
    isVerified,
    verifiedAt,
    totalDeposited,
    totalWithdrawn,
    lastActionTime,
    userIdentifier,
    vaultShares
  ] = profile;

  return (
    <div className="profile-card">
      <h3>Your Profile</h3>
      <div className="stat">
        <label>Status:</label>
        <value>{isVerified ? '✅ Verified' : '❌ Not Verified'}</value>
      </div>
      <div className="stat">
        <label>Total Deposited:</label>
        <value>{formatUnits(totalDeposited, 18)} cUSD</value>
      </div>
      <div className="stat">
        <label>Total Withdrawn:</label>
        <value>{formatUnits(totalWithdrawn, 18)} cUSD</value>
      </div>
      <div className="stat">
        <label>Vault Shares:</label>
        <value>{formatUnits(vaultShares, 18)}</value>
      </div>
      <div className="stat">
        <label>Verified Since:</label>
        <value>{new Date(Number(verifiedAt) * 1000).toLocaleDateString()}</value>
      </div>
    </div>
  );
}
```

### 4. Get User Earnings

```typescript
function EarningsDisplay({ userAddress }: { userAddress: string }) {
  const { data: earnings } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getEarnings',
    args: [userAddress],
  });

  const { data: balance } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return (
    <div className="earnings-card">
      <h3>Your Earnings</h3>
      <div className="stat-large">
        <label>Current Balance:</label>
        <value className="success">
          {formatUnits(balance || 0n, 18)} cUSD
        </value>
      </div>
      <div className="stat-large">
        <label>Total Earnings:</label>
        <value className="success">
          +{formatUnits(earnings || 0n, 18)} cUSD
        </value>
      </div>
    </div>
  );
}
```

### 5. Strategy Selection

```typescript
enum StrategyType {
  CONSERVATIVE = 0,
  BALANCED = 1,
  GROWTH = 2,
}

function StrategySelector({ userAddress }: { userAddress: string }) {
  const { data: currentStrategy } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getUserStrategy',
    args: [userAddress],
  });

  const { writeContract } = useWriteContract();

  const strategies = [
    {
      type: StrategyType.CONSERVATIVE,
      name: 'Conservative',
      description: '100% Aave - Safest option',
      risk: 1,
      apy: '3.5%',
    },
    {
      type: StrategyType.BALANCED,
      name: 'Balanced',
      description: '90% Aave, 10% reserve',
      risk: 3,
      apy: '3.5%',
    },
    {
      type: StrategyType.GROWTH,
      name: 'Growth',
      description: '80% Aave, 20% reserve',
      risk: 5,
      apy: '3.5%',
    },
  ];

  const handleStrategyChange = (strategyType: StrategyType) => {
    writeContract({
      address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
      abi: WRAPPER_ABI,
      functionName: 'changeStrategy',
      args: [strategyType],
    });
  };

  return (
    <div className="strategy-selector">
      <h3>Select Your Strategy</h3>
      <div className="strategies">
        {strategies.map((strategy) => (
          <div
            key={strategy.type}
            className={`strategy-card ${
              currentStrategy === strategy.type ? 'active' : ''
            }`}
            onClick={() => handleStrategyChange(strategy.type)}
          >
            <h4>{strategy.name}</h4>
            <p>{strategy.description}</p>
            <div className="strategy-stats">
              <span>Risk: {strategy.risk}/10</span>
              <span>APY: {strategy.apy}</span>
            </div>
            {currentStrategy === strategy.type && (
              <div className="badge">Current</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Deposit Flow (Wrapper)

```typescript
function WrapperDepositFlow() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  // Check verification
  const { data: isVerified } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'isVerified',
    args: [address!],
  });

  // Check allowance
  const { data: allowance } = useReadContract({
    address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d'],
  });

  // Preview deposit
  const { data: expectedShares } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'previewDeposit',
    args: [amount ? parseUnits(amount, 18) : 0n],
  });

  const { writeContract: approve } = useWriteContract();
  const { writeContract: deposit } = useWriteContract();

  const needsApproval = amount && parseUnits(amount, 18) > (allowance || 0n);

  const handleApprove = () => {
    approve({
      address: '0x8a016376332fa74639ddf9cc19fa9d09ce323624',
      abi: ERC20_ABI,
      functionName: 'approve',
      args: ['0xabc700e3ee92ee98d984527ecfd82884dcc9de8d', parseUnits(amount, 18)],
    });
  };

  const handleDeposit = () => {
    deposit({
      address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
      abi: WRAPPER_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 18)],
    });
  };

  if (!isVerified) {
    return (
      <div className="alert alert-warning">
        Please verify your identity first
      </div>
    );
  }

  return (
    <div className="deposit-panel">
      <h3>Deposit to Vault</h3>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />

      {expectedShares && (
        <div className="preview">
          You will receive: {formatUnits(expectedShares, 18)} shares
        </div>
      )}

      {needsApproval ? (
        <button onClick={handleApprove}>Approve cUSD</button>
      ) : (
        <button onClick={handleDeposit}>Deposit</button>
      )}
    </div>
  );
}
```

### 7. Withdrawal Flow (Wrapper)

```typescript
function WrapperWithdrawFlow() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  // Get user balance
  const { data: balance } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'balanceOf',
    args: [address!],
  });

  // Preview withdrawal
  const { data: requiredShares } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'previewWithdraw',
    args: [amount ? parseUnits(amount, 18) : 0n],
  });

  const { writeContract } = useWriteContract();

  const handleWithdraw = () => {
    writeContract({
      address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
      abi: WRAPPER_ABI,
      functionName: 'withdraw',
      args: [parseUnits(amount, 18)],
    });
  };

  return (
    <div className="withdraw-panel">
      <h3>Withdraw from Vault</h3>
      
      <div className="balance">
        Available: {formatUnits(balance || 0n, 18)} cUSD
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        max={formatUnits(balance || 0n, 18)}
      />

      {requiredShares && (
        <div className="preview">
          Will burn: {formatUnits(requiredShares, 18)} shares
        </div>
      )}

      <button onClick={handleWithdraw}>Withdraw</button>
      
      <button onClick={() => setAmount(formatUnits(balance || 0n, 18))}>
        Withdraw All
      </button>
    </div>
  );
}
```

### 8. Wrapper Statistics

```typescript
function WrapperStats() {
  const { data: stats } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getWrapperStats',
  });

  if (!stats) return <div>Loading...</div>;

  const [
    totalUsers,
    totalDeposited,
    totalWithdrawn,
    vaultTotalAssets,
    wrapperShares
  ] = stats;

  return (
    <div className="wrapper-stats">
      <h3>Platform Statistics</h3>
      
      <div className="stat-grid">
        <div className="stat">
          <label>Total Users:</label>
          <value>{totalUsers.toString()}</value>
        </div>
        
        <div className="stat">
          <label>Total Deposited:</label>
          <value>{formatUnits(totalDeposited, 18)} cUSD</value>
        </div>
        
        <div className="stat">
          <label>Total Withdrawn:</label>
          <value>{formatUnits(totalWithdrawn, 18)} cUSD</value>
        </div>
        
        <div className="stat">
          <label>Vault TVL:</label>
          <value>{formatUnits(vaultTotalAssets, 18)} cUSD</value>
        </div>
        
        <div className="stat">
          <label>Wrapper Shares:</label>
          <value>{formatUnits(wrapperShares, 18)}</value>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Complete User Journey

### 1. New User Flow

```typescript
function CompleteUserJourney() {
  const { address } = useAccount();
  const [step, setStep] = useState<'verify' | 'strategy' | 'deposit'>('verify');

  const { data: isVerified } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'isVerified',
    args: [address!],
  });

  useEffect(() => {
    if (isVerified) {
      setStep('strategy');
    }
  }, [isVerified]);

  return (
    <div className="user-journey">
      {/* Progress Indicator */}
      <div className="progress-steps">
        <div className={step === 'verify' ? 'active' : 'completed'}>
          1. Verify Identity
        </div>
        <div className={step === 'strategy' ? 'active' : step === 'deposit' ? 'completed' : ''}>
          2. Choose Strategy
        </div>
        <div className={step === 'deposit' ? 'active' : ''}>
          3. Deposit Funds
        </div>
      </div>

      {/* Step Content */}
      {step === 'verify' && <VerificationFlow />}
      {step === 'strategy' && (
        <>
          <StrategySelector userAddress={address!} />
          <button onClick={() => setStep('deposit')}>Continue</button>
        </>
      )}
      {step === 'deposit' && <WrapperDepositFlow />}
    </div>
  );
}
```

---

## 🎨 TypeScript Types

```typescript
export type UserProfile = {
  isVerified: boolean;
  verifiedAt: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  lastActionTime: bigint;
  userIdentifier: bigint;
  vaultShares: bigint;
};

export type Strategy = {
  name: string;
  description: string;
  aaveAllocation: number;
  reserveAllocation: number;
  targetAPY: number;
  riskLevel: number;
  isActive: boolean;
};

export enum StrategyType {
  CONSERVATIVE = 0,
  BALANCED = 1,
  GROWTH = 2,
}

export type WrapperStats = {
  totalUsers: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  vaultTotalAssets: bigint;
  wrapperShares: bigint;
};
```

---

## ⚠️ Important Differences from Base Vault

| Feature | Base Vault | Wrapper |
|---------|-----------|---------|
| **Verification** | Not required | Required via Self Protocol |
| **Strategies** | N/A | 3 strategies available |
| **User Profiles** | No tracking | Complete profile tracking |
| **Earnings** | Manual calculation | Built-in earnings tracking |
| **Direct Access** | Anyone can use | Only verified users |
| **Shares** | User holds shares | Wrapper holds shares |

---

## 🔐 Security Considerations

1. **Verification Required**: Users must verify before depositing
2. **Non-Transferable**: Shares are held by wrapper, not transferable
3. **Pausable**: Admin can pause in emergencies
4. **Reentrancy Protection**: All state-changing functions protected
5. **Emergency Withdrawal**: Only when paused, only by owner

---

## 📊 Analytics & Tracking

### Track User Activity

```typescript
function UserActivity({ userAddress }: { userAddress: string }) {
  const { data: profile } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getUserProfile',
    args: [userAddress],
  });

  const { data: earnings } = useReadContract({
    address: '0xabc700e3ee92ee98d984527ecfd82884dcc9de8d',
    abi: WRAPPER_ABI,
    functionName: 'getEarnings',
    args: [userAddress],
  });

  if (!profile) return null;

  const [,,totalDeposited, totalWithdrawn, lastActionTime] = profile;
  const netDeposited = totalDeposited - totalWithdrawn;
  const roi = totalDeposited > 0n 
    ? (Number(earnings || 0n) / Number(totalDeposited)) * 100 
    : 0;

  return (
    <div className="user-activity">
      <h3>Your Activity</h3>
      <div className="stat">
        <label>Net Deposited:</label>
        <value>{formatUnits(netDeposited, 18)} cUSD</value>
      </div>
      <div className="stat">
        <label>Total Earnings:</label>
        <value className="success">+{formatUnits(earnings || 0n, 18)} cUSD</value>
      </div>
      <div className="stat">
        <label>ROI:</label>
        <value className="success">+{roi.toFixed(2)}%</value>
      </div>
      <div className="stat">
        <label>Last Activity:</label>
        <value>
          {new Date(Number(lastActionTime) * 1000).toLocaleString()}
        </value>
      </div>
    </div>
  );
}
```

---

## 🆘 Error Handling

```typescript
const WRAPPER_ERRORS: Record<string, string> = {
  NotVerified: 'Please verify your identity first',
  AlreadyVerified: 'You are already verified',
  InvalidAmount: 'Invalid amount entered',
  ExceedsMaxDeposit: 'Amount exceeds maximum deposit (10,000 cUSD)',
  ExceedsMaxTVL: 'Vault has reached maximum capacity',
  InsufficientShares: 'Insufficient shares for withdrawal',
  InvalidStrategy: 'Selected strategy is not available',
  VerificationFailed: 'Identity verification failed',
};

function handleWrapperError(error: any): string {
  const errorMessage = error?.message || '';
  
  for (const [key, message] of Object.entries(WRAPPER_ERRORS)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }
  
  return 'Transaction failed. Please try again.';
}
```

---

## 🎯 Best Practices

1. **Always check verification** before showing deposit UI
2. **Display strategy information** clearly to users
3. **Show earnings prominently** to encourage engagement
4. **Track user journey** through verification → strategy → deposit
5. **Implement proper error handling** for verification failures
6. **Cache verification status** to avoid repeated checks
7. **Show profile stats** to build trust and transparency

---

## 📚 Additional Resources

- **Base Vault Guide**: See `FRONTEND_INTEGRATION_GUIDE.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`
- **Self Protocol Docs**: https://docs.selfprotocol.io
- **Contract on Explorer**: https://sepolia.etherscan.io/address/0xabc700e3ee92ee98d984527ecfd82884dcc9de8d

---

**The wrapper adds a complete user management layer on top of the base vault!** 🚀
