# Attestify Architecture

## Overview

Attestify uses a **two-layer architecture** that separates core DeFi functionality from identity and user management features.

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                  (Frontend / dApp)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AttestifyVaultWrapper                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • User Verification (Self Protocol)            │   │
│  │  • User Profiles & History                      │   │
│  │  • Strategy Management (Conservative/Balanced)  │   │
│  │  • Access Control (onlyVerified)                │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 AttestifyVault                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • ERC-4626 Standard Compliance                 │   │
│  │  • Aave V3 Integration                          │   │
│  │  • Yield Generation & Harvesting                │   │
│  │  • Reserve Management                           │   │
│  │  • Slippage Protection                          │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Aave V3 Pool                           │
│            (Yield Generation Layer)                      │
└─────────────────────────────────────────────────────────┘
```

## Layer 1: Base Vault (`AttestifyVault.sol`)

**Purpose:** Core DeFi operations and Aave integration

### Responsibilities
- ✅ **ERC-4626 Compliance:** Standard vault interface for deposits/withdrawals
- ✅ **Aave V3 Integration:** Supplies assets to Aave, receives aTokens
- ✅ **Yield Management:** Harvests yield and collects performance fees
- ✅ **Reserve Buffer:** Maintains configurable reserve for instant withdrawals
- ✅ **Slippage Protection:** Protects users from unfavorable exchange rates
- ✅ **Emergency Controls:** Pause mechanism and emergency withdrawals

### Key Features
```solidity
// Standard ERC-4626 functions
function deposit(uint256 assets, address receiver) returns (uint256 shares)
function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)
function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets)

// Aave integration
function _deployToAave(uint256 amount) internal
function _withdrawFromAave(uint256 amount) internal

// Yield management
function harvest() external returns (uint256 yieldAmount, uint256 feeAmount)
function getCurrentAPY() external view returns (uint256)
```

### Configuration
- **Reserve Ratio:** 10% (configurable)
- **Performance Fee:** 10% of yield (configurable)
- **Min Deposit:** 1 token
- **Max Deposit:** 10,000 tokens
- **Max TVL:** 1,000,000 tokens

## Layer 2: Wrapper (`AttestifyVaultWrapper.sol`)

**Purpose:** Attestify-specific features (verification, profiles, strategies)

### Responsibilities
- ✅ **Identity Verification:** Integrates with Self Protocol for KYC
- ✅ **User Profiles:** Tracks verification status, deposit history
- ✅ **Strategy Management:** Offers 3 investment strategies
- ✅ **Access Control:** Enforces `onlyVerified` on deposits
- ✅ **User Experience:** Simplified interface for verified users

### Key Features

#### 1. User Verification
```solidity
function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData)
function isVerified(address user) external view returns (bool)
```

**User Profile:**
```solidity
struct UserProfile {
    bool isVerified;
    uint256 verifiedAt;
    uint256 totalDeposited;
    uint256 totalWithdrawn;
    uint256 lastActionTime;
    uint256 userIdentifier;
    uint256 vaultShares;
}
```

#### 2. Investment Strategies
```solidity
enum StrategyType {
    CONSERVATIVE,  // 100% Aave, 0% reserve
    BALANCED,      // 90% Aave, 10% reserve
    GROWTH         // 80% Aave, 20% reserve
}

function changeStrategy(StrategyType newStrategy) external onlyVerified
```

#### 3. User Operations
```solidity
// Deposit (only verified users)
function deposit(uint256 assets) external onlyVerified returns (uint256 shares)

// Withdraw (any user with shares)
function withdraw(uint256 assets) external returns (uint256 shares)
function redeem(uint256 shares) external returns (uint256 assets)

// View functions
function balanceOf(address user) external view returns (uint256)
function getEarnings(address user) external view returns (uint256)
function getUserProfile(address user) external view returns (UserProfile memory)
```

## User Flow

### 1. Verification
```
User → verifySelfProof() → Self Protocol → Verified ✓
```

### 2. Deposit
```
User (Verified) → deposit(assets) → Wrapper
                                    ↓
                            Transfer cUSD from user
                                    ↓
                            Deposit to Base Vault
                                    ↓
                            Base Vault → Aave V3
                                    ↓
                            Receive aTokens
                                    ↓
                            Update user profile
```

### 3. Yield Generation
```
Aave V3 → Generates yield on supplied assets
         ↓
Base Vault → Tracks total assets (reserve + aTokens)
         ↓
User shares appreciate in value
```

### 4. Withdrawal
```
User → withdraw(assets) → Wrapper
                         ↓
                  Calculate shares needed
                         ↓
                  Redeem from Base Vault
                         ↓
                  Base Vault withdraws from Aave if needed
                         ↓
                  Transfer cUSD to user
                         ↓
                  Update user profile
```

## Deployment

### Step 1: Deploy Base Vault
```bash
forge script script/DeployAaveVault.s.sol:DeployAaveVault \
  --rpc-url <RPC_URL> \
  --broadcast \
  --verify
```

### Step 2: Deploy Wrapper
```bash
forge script script/DeployAttestifyWrapper.s.sol:DeployAttestifyWrapper \
  --rpc-url <RPC_URL> \
  --broadcast \
  --verify
```

### Step 3: Configure
```solidity
// Set Self Protocol address (if not set during deployment)
wrapper.setSelfProtocol(<SELF_PROTOCOL_ADDRESS>);

// Set AI agent (optional)
wrapper.setAIAgent(<AI_AGENT_ADDRESS>);
```

## Frontend Integration

### Connect to Wrapper (Recommended)
```typescript
// Users interact with the wrapper
const wrapperAddress = "0x...";
const wrapper = new ethers.Contract(wrapperAddress, WrapperABI, signer);

// Verify user
await wrapper.verifySelfProof(proofPayload, userContextData);

// Deposit
await wrapper.deposit(ethers.parseUnits("100", 18));

// Check balance
const balance = await wrapper.balanceOf(userAddress);
```

### Direct Base Vault Access (Advanced)
```typescript
// Advanced users can interact directly with base vault
const baseVaultAddress = await wrapper.baseVault();
const baseVault = new ethers.Contract(baseVaultAddress, VaultABI, signer);

// Standard ERC-4626 operations
await baseVault.deposit(assets, receiver);
```

## Security Considerations

### Base Vault
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Pausable for emergency situations
- ✅ Slippage protection on deposits/withdrawals
- ✅ Owner-only admin functions
- ✅ Emergency withdrawal mechanism

### Wrapper
- ✅ Verification required for deposits
- ✅ User profile tracking
- ✅ Pausable wrapper operations
- ✅ Emergency withdrawal (owner only)

## Advantages of This Architecture

### 1. **Separation of Concerns**
- Base vault handles DeFi complexity
- Wrapper handles identity and UX

### 2. **Upgradeability**
- Can deploy new wrapper versions without touching base vault
- Base vault remains immutable and secure

### 3. **Flexibility**
- Advanced users can bypass wrapper
- Multiple wrappers can use same base vault

### 4. **Composability**
- Base vault is standard ERC-4626
- Can integrate with other DeFi protocols

### 5. **Testing**
- Each layer can be tested independently
- Easier to audit and verify

## Gas Optimization

### Wrapper Overhead
- **Verification:** One-time cost per user
- **Deposit:** ~50k gas extra (profile updates)
- **Withdraw:** ~30k gas extra (profile updates)

### Total Gas Costs (Estimated)
- **First Deposit:** ~300k gas (verification + deposit)
- **Subsequent Deposits:** ~250k gas
- **Withdrawals:** ~200k gas

## Future Enhancements

### Potential Wrapper Features
- [ ] Multiple strategy allocations per user
- [ ] Automated rebalancing based on strategy
- [ ] Referral system
- [ ] Governance token distribution
- [ ] Social features (leaderboards, etc.)

### Potential Base Vault Features
- [ ] Multiple Aave markets
- [ ] Compound integration
- [ ] Automated yield optimization
- [ ] Flash loan protection
- [ ] Multi-asset support

## Contract Addresses

### Celo Mainnet
- **Base Vault:** TBD
- **Wrapper:** TBD
- **cUSD:** `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **Aave Pool:** `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402`

### Celo Alfajores Testnet
- **Base Vault:** TBD
- **Wrapper:** TBD
- **cUSD:** `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- **Aave Pool:** `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402`

## Support

For questions or issues:
- GitHub: [Repository Link]
- Discord: [Community Link]
- Email: security@attestify.io
