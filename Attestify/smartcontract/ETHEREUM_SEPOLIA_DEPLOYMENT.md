# Ethereum Sepolia Deployment Guide

## Overview

This guide covers deploying Attestify with **full Aave V3 integration** on Ethereum Sepolia testnet.

## Prerequisites

### 1. Environment Setup

Create or update your `.env` file:

```bash
# Ethereum Sepolia RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# Or use public RPC: https://rpc.sepolia.org

# Your deployer private key
PRIVATE_KEY=your_private_key_here

# Treasury address (optional, defaults to deployer)
TREASURY_ADDRESS=0x...

# Asset choice: USDC, DAI, or WETH (optional, defaults to USDC)
ASSET=USDC

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Get Sepolia ETH

Get test ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 3. Get Test Tokens

Get Aave test tokens from the official faucet:
- Visit: https://staging.aave.com/faucet/
- Connect wallet to Sepolia
- Request USDC, DAI, or WETH

## Deployment

### Option 1: Deploy with USDC (Recommended)

```bash
cd smartcontract

# Deploy with USDC
forge script script/DeployEthereumSepolia.s.sol:DeployEthereumSepolia \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Option 2: Deploy with DAI

```bash
ASSET=DAI forge script script/DeployEthereumSepolia.s.sol:DeployEthereumSepolia \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Option 3: Deploy with WETH

```bash
ASSET=WETH forge script script/DeployEthereumSepolia.s.sol:DeployEthereumSepolia \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## Deployed Addresses

### Aave V3 Sepolia Addresses (Pre-deployed)

| Contract | Address |
|----------|---------|
| Aave V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| Pool Data Provider | `0x3e9708d80f7B3e43118013075F7e95CE3AB31F31` |
| Oracle | `0x2da88497588bf89281816106C7259e31AF45a663` |

### Test Assets (from Aave Faucet)

| Asset | Address |
|-------|---------|
| USDC | `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` |
| DAI | `0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357` |
| WETH | `0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c` |

### Your Deployed Contracts

After deployment, your addresses will be saved to `deployment-ethereum-sepolia.txt`:

- **AttestifyVault**: [Will be generated]
- **AttestifyVaultWrapper**: [Will be generated]

## Testing the Deployment

### 1. Get Test Tokens

```bash
# Visit Aave Faucet
open https://staging.aave.com/faucet/

# Request tokens for your deployer address
```

### 2. Interact with Contracts

```bash
# Check vault total assets
cast call <VAULT_ADDRESS> "totalAssets()" --rpc-url $SEPOLIA_RPC_URL

# Check current APY
cast call <VAULT_ADDRESS> "getCurrentAPY()" --rpc-url $SEPOLIA_RPC_URL

# Check wrapper stats
cast call <WRAPPER_ADDRESS> "getWrapperStats()" --rpc-url $SEPOLIA_RPC_URL
```

### 3. Test Deposit Flow

```solidity
// 1. Approve wrapper to spend your tokens
cast send <ASSET_ADDRESS> "approve(address,uint256)" <WRAPPER_ADDRESS> 1000000000 \
  --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL

// 2. Verify identity (if Self Protocol is set)
// Skip for now if SELF_PROTOCOL = address(0)

// 3. Deposit tokens
cast send <WRAPPER_ADDRESS> "deposit(uint256)" 1000000000 \
  --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL

// 4. Check balance
cast call <WRAPPER_ADDRESS> "balanceOf(address)" <YOUR_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL
```

## Contract Verification

If auto-verification fails, manually verify:

```bash
# Verify Vault
forge verify-contract <VAULT_ADDRESS> \
  src/contracts/AttestifyVault.sol:AttestifyVault \
  --chain sepolia \
  --constructor-args $(cast abi-encode "constructor(address,string,string,address,address)" \
    <ASSET_ADDRESS> "Attestify USDC Vault" "attUSDC" <AAVE_POOL> <TREASURY>)

# Verify Wrapper
forge verify-contract <WRAPPER_ADDRESS> \
  src/contracts/AttestifyVaultWrapper.sol:AttestifyVaultWrapper \
  --chain sepolia \
  --constructor-args $(cast abi-encode "constructor(address,address)" \
    <VAULT_ADDRESS> <SELF_PROTOCOL>)
```

## Key Differences from Celo

| Feature | Celo | Ethereum Sepolia |
|---------|------|------------------|
| **Aave Version** | V2 (Moola Market) | V3 (Official) |
| **Gas Costs** | Low (~0.001 CELO) | Higher (~0.01 ETH) |
| **Block Time** | ~5 seconds | ~12 seconds |
| **Native Asset** | CELO | ETH |
| **Stablecoins** | cUSD, cEUR | USDC, DAI |
| **APY** | ~3-5% | ~2-4% (varies) |

## Architecture

```
User
  ↓
AttestifyVaultWrapper (Identity + Strategies)
  ↓
AttestifyVault (ERC-4626 + Aave Integration)
  ↓
Aave V3 Pool (Yield Generation)
  ↓
aTokens (Interest-bearing tokens)
```

## Features Enabled

✅ **Full Aave V3 Integration**
- Automatic yield generation
- Real-time APY tracking
- Liquidity from Aave protocol

✅ **ERC-4626 Compliance**
- Standard vault interface
- Compatible with all DeFi tools

✅ **Identity Verification**
- Ready for Self Protocol integration
- User profiles and tracking

✅ **Investment Strategies**
- Conservative (100% Aave)
- Balanced (90% Aave, 10% reserve)
- Growth (80% Aave, 20% reserve)

✅ **Safety Features**
- Reentrancy protection
- Pausable in emergencies
- Slippage protection
- Min/max deposit limits

## Monitoring

### Check Vault Health

```bash
# Total assets under management
cast call <VAULT_ADDRESS> "totalAssets()" --rpc-url $SEPOLIA_RPC_URL

# Assets in Aave
cast call <VAULT_ADDRESS> "A_TOKEN()" --rpc-url $SEPOLIA_RPC_URL
# Then check aToken balance
cast call <ATOKEN_ADDRESS> "balanceOf(address)" <VAULT_ADDRESS> --rpc-url $SEPOLIA_RPC_URL

# Reserve balance
cast call <ASSET_ADDRESS> "balanceOf(address)" <VAULT_ADDRESS> --rpc-url $SEPOLIA_RPC_URL

# Current APY
cast call <VAULT_ADDRESS> "getCurrentAPY()" --rpc-url $SEPOLIA_RPC_URL
```

### Check User Position

```bash
# User's shares
cast call <WRAPPER_ADDRESS> "getUserProfile(address)" <USER_ADDRESS> --rpc-url $SEPOLIA_RPC_URL

# User's asset value
cast call <WRAPPER_ADDRESS> "balanceOf(address)" <USER_ADDRESS> --rpc-url $SEPOLIA_RPC_URL

# User's earnings
cast call <WRAPPER_ADDRESS> "getEarnings(address)" <USER_ADDRESS> --rpc-url $SEPOLIA_RPC_URL
```

## Troubleshooting

### Issue: "Insufficient balance"
**Solution:** Get test tokens from Aave faucet first

### Issue: "Not verified"
**Solution:** Either:
1. Set SELF_PROTOCOL to a valid address
2. Or modify wrapper to allow unverified deposits for testing

### Issue: "Aave operation failed"
**Solution:** Check:
1. Asset is supported by Aave V3 on Sepolia
2. Aave pool address is correct
3. You have enough gas

### Issue: "Slippage exceeded"
**Solution:** Increase maxSlippage in vault settings

## Frontend Integration

Update your frontend config:

```typescript
// config/contracts.ts
export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  rpcUrl: "https://rpc.sepolia.org",
  contracts: {
    wrapper: "<WRAPPER_ADDRESS>",
    vault: "<VAULT_ADDRESS>",
    asset: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC
  },
  aave: {
    pool: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  },
};
```

## Resources

- **Aave V3 Docs**: https://docs.aave.com/developers/
- **Aave Faucet**: https://staging.aave.com/faucet/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Sepolia Faucets**: https://sepoliafaucet.com/

## Support

For issues or questions:
1. Check the deployment logs in `deployment-ethereum-sepolia.txt`
2. Verify contracts on Etherscan
3. Test with small amounts first
4. Review Aave V3 documentation

---

**Note:** This is a testnet deployment. Do not use real funds. Always test thoroughly before mainnet deployment.
