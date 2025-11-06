# 🚀 Ethereum Sepolia - Quick Start

Deploy Attestify with **full Aave V3 integration** on Ethereum Sepolia in 3 steps.

## Step 1: Setup Environment

```bash
cd smartcontract

# Copy example env file
cp .env.sepolia.example .env

# Edit .env and add:
# - SEPOLIA_RPC_URL (get from Alchemy/Infura)
# - PRIVATE_KEY (your deployer wallet)
# - ETHERSCAN_API_KEY (for verification)
```

## Step 2: Get Test Funds

### Get Sepolia ETH (for gas)
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Get Test Tokens (USDC/DAI/WETH)
- https://staging.aave.com/faucet/
- Connect wallet to Sepolia
- Request tokens

## Step 3: Deploy

```bash
# Option A: Use deployment script (easiest)
./deploy-sepolia.sh

# Option B: Manual deployment
forge script script/DeployEthereumSepolia.s.sol:DeployEthereumSepolia \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## What Gets Deployed

✅ **AttestifyVault**
- Full ERC-4626 vault
- Integrated with Aave V3
- Automatic yield generation
- Reserve management (10% default)

✅ **AttestifyVaultWrapper**
- Identity verification (Self Protocol)
- User profiles & tracking
- Investment strategies (Conservative/Balanced/Growth)
- Access control

## Key Addresses (Pre-deployed on Sepolia)

| Contract | Address |
|----------|---------|
| Aave V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |
| USDC | `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` |
| DAI | `0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357` |
| WETH | `0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c` |

## After Deployment

Your contract addresses will be saved to:
- `deployment-ethereum-sepolia.txt`

## Test the Deployment

```bash
# 1. Check vault total assets
cast call <VAULT_ADDRESS> "totalAssets()" --rpc-url $SEPOLIA_RPC_URL

# 2. Check current APY
cast call <VAULT_ADDRESS> "getCurrentAPY()" --rpc-url $SEPOLIA_RPC_URL

# 3. Approve tokens
cast send <USDC_ADDRESS> "approve(address,uint256)" <WRAPPER_ADDRESS> 1000000000 \
  --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL

# 4. Deposit (1 USDC = 1000000)
cast send <WRAPPER_ADDRESS> "deposit(uint256)" 1000000 \
  --private-key $PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL

# 5. Check balance
cast call <WRAPPER_ADDRESS> "balanceOf(address)" <YOUR_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL
```

## Differences from Celo

| Feature | Celo | Ethereum Sepolia |
|---------|------|------------------|
| Aave Version | V2 (Moola) | **V3 (Official)** ✅ |
| Yield | Limited | **Real Aave APY** ✅ |
| Gas | Very Low | Moderate |
| Stablecoins | cUSD | USDC, DAI |

## Resources

- **Deployment Guide**: `ETHEREUM_SEPOLIA_DEPLOYMENT.md`
- **Aave Faucet**: https://staging.aave.com/faucet/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Aave V3 Docs**: https://docs.aave.com/developers/

## Troubleshooting

**"Insufficient balance"**
→ Get test tokens from Aave faucet

**"Not verified"**
→ Self Protocol not set, modify wrapper for testing

**"Aave operation failed"**
→ Check asset is supported by Aave V3

---

**Ready to deploy?** Run `./deploy-sepolia.sh` 🚀
