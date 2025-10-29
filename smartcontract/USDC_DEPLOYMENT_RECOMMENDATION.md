# USDC Deployment Recommendation for Ethereum Sepolia

## ✅ Why USDC is Better for a Yield Vault

### User Experience Benefits
1. **Predictable Returns**: Users deposit $100 USDC, see it grow to $105 USDC. Simple.
2. **No Price Volatility Risk**: Unlike AAVE, users only care about yield, not token price movements
3. **Industry Standard**: Most DeFi yield vaults use stablecoins (USDC, DAI, USDT)
4. **Better UX**: Users understand "I deposited 100 USDC, now I have 103 USDC" better than dealing with volatile tokens

### Technical Benefits
1. **Works Identically with Aave**: 
   - Deposit USDC → Aave supplies it → Receive aUSDC (interest-bearing)
   - Yield accrues automatically in aUSDC
   - Withdrawal converts aUSDC → USDC
   - **Exact same mechanism as AAVE, but with stable value**

2. **Better Liquidity**: USDC typically has higher liquidity on Aave
3. **More Predictable Yield**: Stablecoin rates are more stable than volatile asset rates

### How It Works for Users
```
1. User deposits 100 USDC to vault
2. Vault supplies 100 USDC to Aave
3. Aave gives vault aUSDC (worth 100 USDC initially)
4. Over time, aUSDC balance grows (e.g., 103 USDC worth after 1 year at 3% APY)
5. User's shares represent their portion of growing aUSDC pool
6. When user withdraws, they get USDC back (more than they deposited due to yield)
```

## 📋 Required Addresses for USDC Deployment

To deploy with USDC, we need:

1. ✅ **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` (already have)
2. ❓ **USDC Token**: Need to verify the correct USDC address on Sepolia
3. ❓ **aUSDC Token**: Need to query from Aave Pool using USDC address

### How to Get USDC Addresses

**Option 1: Via Aave App (Recommended)**
1. Go to https://app.aave.com
2. Enable "Testnet mode" (top right)
3. Select "Sepolia" network
4. Find USDC in the market
5. Click on USDC to see:
   - Underlying token address
   - aToken address (this is what we need)

**Option 2: Query On-Chain**
```bash
# Use our script (after fixing USDC address)
npx hardhat run scripts/get-usdc-atoken.js --network sepolia
```

### USDC Addresses on Sepolia ✅ Confirmed
- **USDC**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` ✅
- **aEthUSDC**: `0x16dA4541aD1807f4443d92D26044C1147406EB80` ✅

All addresses confirmed and ready for deployment!

## 🔄 Deployment Considerations

### Current Status
- ✅ Contract deployed with AAVE: `0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0`
- ⚠️ Need to redeploy with USDC addresses

### Next Steps if Switching to USDC
1. Verify USDC and aUSDC addresses on Sepolia
2. Update `scripts/deploy-eth-sepolia.js` with USDC addresses
3. Redeploy contract (creates new address)
4. Update documentation with new contract address
5. Verify new contract on Blockscout/Etherscan

### Important Note
**The contract code doesn't need changes** - it's already asset-agnostic! The constructor accepts any ERC20 token. We just need to:
- Change the addresses in deployment script
- Redeploy with USDC instead of AAVE

## 💡 Recommendation

**Use USDC for production/UI** because:
- Users prefer stablecoins for yield
- Better UX (predictable returns)
- Industry standard
- Works exactly the same with Aave

The current AAVE deployment can serve as a test, but for actual users, USDC will be much better received.

