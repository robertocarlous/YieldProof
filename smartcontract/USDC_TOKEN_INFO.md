# USDC Token Information for Ethereum Sepolia

## Current USDC Token Address
**Contract**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`  
**Network**: Ethereum Sepolia Testnet  
**Status**: ⚠️ Need to verify if this is the official faucet USDC

## Important Notes

### Testnet vs Mainnet
⚠️ **YES** - The USDC on Sepolia is different from mainnet USDC:
- **Testnet USDC**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` (Sepolia)
- **Mainnet USDC**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (Ethereum Mainnet)
- Testnet USDC has **NO REAL VALUE** - only for testing
- You cannot convert testnet USDC to real USD

### Getting Sepolia USDC for Testing

There are **NO official USDC faucets** on Sepolia. You need to:

#### Option 1: Use Official Testnet USDC (Recommended)
Check if there's an official Circle USDC testnet deployment:
- Check Circle's documentation
- Look for official testnet announcements
- May require approval/registration

#### Option 2: Use Different Tokens on Sepolia
Common testnet tokens with faucets:
- **WETH** - Has faucets on Sepolia
- **LINK** - Has faucets on Sepolia  
- **DAI** - Has testnet versions

#### Option 3: Deploy Your Own Test ERC20
- Create a test USDC contract
- Users can mint their own for testing
- Not suitable for production

### Recommendation

**For Testing:**
1. **Verify** if `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` works with Aave on Sepolia
2. **Document** in the UI that users need test USDC (provide faucet link if available)
3. **Consider** using WETH or LINK instead if easier to obtain

**For Production (Mainnet):**
- Use official USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- This has real value and real yield
- Requires mainnet deployment

### Current Setup
- Vault is deployed with USDC `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- Aave Pool deployed on Sepolia
- Users need to get Sepolia USDC somehow

### Next Steps
1. ✅ Deploy vault with this USDC address
2. ⚠️ **Need to provide users a way to get Sepolia USDC**
3. ⚠️ Consider if we should switch to a more accessible test token
4. Document how users can obtain test tokens

## Alternative: Switch to WETH?

If USDC is hard to obtain on Sepolia, we could:
- Deploy vault with WETH as the asset
- WETH has active faucets on Sepolia
- Still use Aave V3 for yield
- Better UX for testing

Let me know if you want to explore this option!


