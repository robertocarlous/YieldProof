# 🚀 AttestifyVault Quick Reference Card

## 📍 Contract Addresses (Sepolia Testnet)

```typescript
CUSD_TOKEN: "0x8a016376332fa74639ddf9cc19fa9d09ce323624"
ATTESTIFY_VAULT: "0x9d8d40038ee6783ce524244c11ef7833cc2bee0d"
ATTESTIFY_WRAPPER: "0xabc700e3ee92ee98d984527ecfd82884dcc9de8d"
```

---

## 🔍 Read Functions (No Gas)

| Function | Returns | Description |
|----------|---------|-------------|
| `totalAssets()` | `uint256` | Total assets in vault (cUSD) |
| `totalSupply()` | `uint256` | Total shares outstanding |
| `balanceOf(address)` | `uint256` | User's share balance |
| `convertToAssets(uint256 shares)` | `uint256` | Convert shares to assets |
| `convertToShares(uint256 assets)` | `uint256` | Convert assets to shares |
| `previewDeposit(uint256 assets)` | `uint256` | Preview shares for deposit |
| `previewWithdraw(uint256 assets)` | `uint256` | Preview shares needed |
| `getCurrentAPY()` | `uint256` | Current APY (basis points) |
| `getVaultStats()` | `tuple` | Complete vault statistics |
| `getUserPosition(address)` | `tuple` | User's position details |

---

## ✍️ Write Functions (Requires Gas)

### Deposit Flow
```typescript
// 1. Approve cUSD
approve(vaultAddress, amount) // on cUSD token

// 2. Deposit
deposit(assets, receiver) // returns shares
```

### Withdrawal Flow
```typescript
// Option A: Withdraw specific amount
withdraw(assets, receiver, owner) // returns shares burned

// Option B: Redeem all shares
redeem(shares, receiver, owner) // returns assets received
```

---

## 💻 Code Snippets

### Get Vault APY
```typescript
const { data: apy } = useReadContract({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  functionName: 'getCurrentAPY',
});
// APY in percentage: Number(apy) / 100
```

### Check User Balance
```typescript
const { data: position } = useReadContract({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  functionName: 'getUserPosition',
  args: [userAddress],
});
const [shares, assets, poolShare] = position || [0n, 0n, 0n];
```

### Deposit Assets
```typescript
// 1. Approve
writeContract({
  address: CUSD_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'approve',
  args: [VAULT_ADDRESS, parseUnits(amount, 18)],
});

// 2. Deposit
writeContract({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  functionName: 'deposit',
  args: [parseUnits(amount, 18), userAddress],
});
```

### Withdraw Assets
```typescript
writeContract({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  functionName: 'withdraw',
  args: [
    parseUnits(amount, 18),
    userAddress, // receiver
    userAddress  // owner
  ],
});
```

---

## ⚙️ Configuration Values

| Parameter | Default | Description |
|-----------|---------|-------------|
| `minDeposit` | 1 cUSD | Minimum deposit amount |
| `maxDeposit` | 10,000 cUSD | Maximum single deposit |
| `maxTvl` | 1,000,000 cUSD | Maximum total value locked |
| `reserveRatio` | 10% (1000 bp) | Reserve kept for withdrawals |
| `performanceFee` | 10% (1000 bp) | Fee on yield |
| `maxSlippage` | 1% (100 bp) | Maximum allowed slippage |

---

## 🎯 Common Patterns

### Complete Deposit Component
```typescript
function Deposit() {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  
  // Check allowance
  const { data: allowance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, VAULT_ADDRESS],
  });
  
  const needsApproval = parseUnits(amount || '0', 18) > (allowance || 0n);
  
  return (
    <div>
      <input 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
      />
      {needsApproval ? (
        <ApproveButton amount={amount} />
      ) : (
        <DepositButton amount={amount} />
      )}
    </div>
  );
}
```

### Display Vault Stats
```typescript
function Stats() {
  const { data: stats } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'getVaultStats',
  });
  
  const [totalAssets, totalShares, reserve, aave, 
         deposited, withdrawn, yield, fees] = stats || [];
  
  return (
    <div>
      <p>TVL: {formatUnits(totalAssets, 18)} cUSD</p>
      <p>Yield: {formatUnits(yield, 18)} cUSD</p>
    </div>
  );
}
```

---

## 🐛 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `ZeroAmount` | Amount is 0 | Enter valid amount |
| `BelowMinDeposit` | Below minimum | Deposit at least 1 cUSD |
| `ExceedsMaxDeposit` | Above maximum | Deposit max 10,000 cUSD |
| `ExceedsMaxTVL` | Vault full | Wait or deposit less |
| `SlippageExceeded` | Price changed | Try again |
| `InsufficientLiquidity` | Not enough funds | Vault rebalancing needed |

---

## 🧮 Calculations

### Share Price
```typescript
sharePrice = totalAssets / totalSupply
```

### User Value
```typescript
userValue = (userShares * totalAssets) / totalSupply
```

### APY Display
```typescript
apyPercent = getCurrentAPY() / 100  // basis points to percent
```

### Pool Share
```typescript
poolSharePercent = (userShares * 10000) / totalSupply / 100
```

---

## 🔗 Useful Links

- **Sepolia Explorer**: https://sepolia.etherscan.io
- **Vault Contract**: https://sepolia.etherscan.io/address/0x9d8d40038ee6783ce524244c11ef7833cc2bee0d
- **cUSD Token**: https://sepolia.etherscan.io/address/0x8a016376332fa74639ddf9cc19fa9d09ce323624

---

## 📦 NPM Packages

```bash
npm install viem wagmi @tanstack/react-query
```

---

## 🎨 TypeScript Types

```typescript
type VaultStats = {
  totalAssets: bigint;
  totalShares: bigint;
  reserveBalance: bigint;
  aaveBalance: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  totalYield: bigint;
  totalFees: bigint;
};

type UserPosition = {
  shares: bigint;
  assets: bigint;
  shareOfPool: bigint; // in basis points
};
```

---

## ⚡ Performance Tips

1. **Batch read calls** using `multicall`
2. **Cache static data** (contract addresses, decimals)
3. **Debounce preview calls** when user types
4. **Use optimistic updates** for better UX
5. **Implement pagination** for transaction history

---

## 🔐 Security Checklist

- [ ] Validate all user inputs
- [ ] Check allowances before deposits
- [ ] Use preview functions
- [ ] Handle errors gracefully
- [ ] Implement loading states
- [ ] Test on testnet first
- [ ] Verify contract addresses
- [ ] Use latest SDK versions

---

**Need more details? See `FRONTEND_INTEGRATION_GUIDE.md`**
