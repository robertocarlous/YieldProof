# 🚀 Foundry Deployment Guide for AaveERC4626Vault

## Prerequisites

1. **Foundry installed** ✅ (you already have this)
2. **Private key** in `.env` file
3. **RPC URL** for Celo network
4. **Gas tokens** (CELO) for deployment

## Quick Deployment

### Step 1: Check Your Environment

Make sure your `.env` file has:
```bash
PRIVATE_KEY=your_private_key_here
```

### Step 2: Deploy to Testnet (Recommended First)

Deploy to Celo Alfajores Testnet:
```bash
forge script script/DeployAaveVault.s.sol:DeployAaveVault \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify \
  -vvvv
```

### Step 3: Deploy to Mainnet

Once tested, deploy to Celo Mainnet:
```bash
forge script script/DeployAaveVault.s.sol:DeployAaveVault \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify \
  -vvvv
```

## Network Details

### Celo Alfajores (Testnet)
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org

### Celo Mainnet
- **Chain ID**: 42220
- **RPC URL**: https://forno.celo.org
- **Explorer**: https://celoscan.io

## Contract Addresses

The script automatically uses the correct addresses based on the network:

### Testnet (Alfajores)
- **cUSD**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- **Aave Pool**: `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402`

### Mainnet
- **cUSD**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **Aave Pool**: `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402`

## Customization

### Set Custom Treasury Address
```bash
export TREASURY_ADDRESS=0xYourTreasuryAddress
```

Then run the deployment command.

## Dry Run (Simulation)

Test deployment without broadcasting:
```bash
forge script script/DeployAaveVault.s.sol:DeployAaveVault \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  -vvvv
```

## Verify Contract Manually

If auto-verification fails:
```bash
forge verify-contract \
  <DEPLOYED_ADDRESS> \
  AaveERC4626Vault \
  --chain celo-alfajores \
  --constructor-args $(cast abi-encode "constructor(address,string,string,address,address)" <CUSD> "Attestify Aave Vault" "aavATT" <AAVE_POOL> <TREASURY>)
```

## Post-Deployment

### 1. Test the Vault
```bash
# Check total assets
cast call <VAULT_ADDRESS> "totalAssets()" --rpc-url <RPC_URL>

# Check current APY
cast call <VAULT_ADDRESS> "getCurrentAPY()" --rpc-url <RPC_URL>

# Get vault stats
cast call <VAULT_ADDRESS> "getVaultStats()" --rpc-url <RPC_URL>
```

### 2. Configure Vault (Optional)
```bash
# Set reserve ratio (10% = 1000 basis points)
cast send <VAULT_ADDRESS> "setReserveRatio(uint256)" 1000 --private-key <KEY> --rpc-url <RPC_URL>

# Set performance fee (10% = 1000 basis points)
cast send <VAULT_ADDRESS> "setPerformanceFee(uint256)" 1000 --private-key <KEY> --rpc-url <RPC_URL>

# Set max slippage (1% = 100 basis points)
cast send <VAULT_ADDRESS> "setMaxSlippage(uint256)" 100 --private-key <KEY> --rpc-url <RPC_URL>
```

### 3. Test Deposit
```bash
# Approve cUSD
cast send <CUSD_ADDRESS> "approve(address,uint256)" <VAULT_ADDRESS> 1000000000000000000 --private-key <KEY> --rpc-url <RPC_URL>

# Deposit 1 cUSD
cast send <VAULT_ADDRESS> "deposit(uint256,address)" 1000000000000000000 <YOUR_ADDRESS> --private-key <KEY> --rpc-url <RPC_URL>
```

## Troubleshooting

### Error: "Insufficient funds"
- Get testnet CELO from faucet: https://faucet.celo.org
- Make sure you have enough CELO for gas

### Error: "Invalid private key"
- Check your `.env` file
- Make sure PRIVATE_KEY is set correctly (without 0x prefix)

### Error: "Contract verification failed"
- Try manual verification (see above)
- Check that contract is deployed successfully first

### Error: "RPC URL not responding"
- Try alternative RPC:
  - Testnet: https://celo-alfajores.infura.io/v3/YOUR_KEY
  - Mainnet: https://celo-mainnet.infura.io/v3/YOUR_KEY

## Gas Optimization

The contract is compiled with:
- Optimizer: Enabled
- Runs: 200
- Via IR: true (for stack depth issues)

Estimated deployment cost: ~0.05 CELO

## Security Checklist

Before mainnet deployment:
- ✅ Contract compiled successfully
- ✅ All tests passing
- ✅ Deployed and tested on testnet
- ✅ Treasury address verified
- ✅ Aave integration tested
- ✅ Emergency functions tested
- ✅ Contract verified on explorer

## Support

- **Foundry Docs**: https://book.getfoundry.sh/
- **Celo Docs**: https://docs.celo.org/
- **Aave Docs**: https://docs.aave.com/
