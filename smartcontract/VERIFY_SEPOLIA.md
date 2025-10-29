# Verify Aave v3 on Sepolia

## ✅ Confirmed: Aave v3 IS Live on Ethereum Sepolia

**Sources:**
- Aave v3 deployed on Sepolia since March 2023
- Official Aave deployment repository: https://github.com/aave/aave-v3-deploy
- Testnet market accessible at: https://app.aave.com (enable testnet mode)

## How to Verify

### Option 1: Check Aave App

1. Go to https://app.aave.com
2. Click "Testnet mode" toggle (top right)
3. Select "Sepolia" network
4. You'll see Sepolia V3 market with test tokens available

### Option 2: Check Official Docs

1. Visit: https://docs.aave.com/developers/deployed-contracts/v3-sepolia-ethereum
2. Download deployment info
3. Get PoolAddressesProvider address
4. Get asset addresses (USDC, WETH, etc.)

### Option 3: Query On-Chain

Use our discovery script:
```bash
npx hardhat run scripts/discover-aave-sepolia.js --network sepolia
```

## Known Token Addresses on Sepolia

### GHO Token
- **GHO**: `0xc4bF5CbDaBE595361438F8c6a187bDc330539c60` (Aave GHO stablecoin)
- **aGHO**: `❓ MISSING - Need to query from Aave Pool` (Aave GHO aToken)

### AAVE Token
- **AAVE** (underlying): `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a` (AAVE token on Sepolia)
- **aEthAAVE**: `0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259` (Aave Ethereum AAVE aToken)

### USDC Token (Recommended for Yield Vault) ✅ Complete!
- **USDC**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` (USDC on Sepolia)
- **aEthUSDC**: `0x16dA4541aD1807f4443d92D26044C1147406EB80` (Aave Ethereum USDC aToken)

### Other Common Tokens
- **WETH**: `0xfFf9976782d46CC05690D9e90473641edce96502`

### Aave Pool
- **Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` (Aave V3 Pool)

## Missing Addresses Required for Deployment

To deploy `AttestifyAaveVault`, we need:

### Option 1: Using GHO
1. ✅ **GHO Token**: `0xc4bF5CbDaBE595361438F8c6a187bDc330539c60`
2. ❌ **aGHO Token**: Need to query from Aave Pool using GHO address
3. ✅ **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

### Option 2: Using AAVE ✅ Complete!
1. ✅ **AAVE Token** (underlying): `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`
2. ✅ **aEthAAVE Token**: `0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259`
3. ✅ **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

### Option 3: Using USDC ✅ Complete! (Recommended)
1. ✅ **USDC Token** (underlying): `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
2. ✅ **aEthUSDC Token**: `0x16dA4541aD1807f4443d92D26044C1147406EB80`
3. ✅ **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

### How to Get aGHO Address

You can get the aToken address by:

1. **Using our script** (Recommended):
   ```bash
   npx hardhat run scripts/get-gho-atoken.js --network sepolia
   ```
   This will automatically query the Aave Pool for the aGHO address.

2. **Using Aave App**: 
   - Go to https://app.aave.com
   - Enable testnet mode
   - Select Sepolia network
   - Find GHO asset and check the aToken address

3. **Query on-chain manually**: 
   Call `pool.getReserveData(GHO_ADDRESS)` and get the `aTokenAddress` from the response

4. **Check Aave docs**: 
   Look up the aToken address in the official deployment documentation at https://docs.aave.com/developers/deployed-contracts/v3-sepolia-ethereum

### How to Get Underlying AAVE Token Address

Since we have the aEthAAVE address (`0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259`), we can query the aToken contract to get the underlying asset:

1. **Query aToken contract**: Call `ASSET()` or `UNDERLYING_ASSET_ADDRESS()` function on the aEthAAVE contract
2. **Use Etherscan**: 
   - Go to https://sepolia.etherscan.io/address/0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259
   - Read the contract's `ASSET()` function to get the underlying AAVE address

⚠️ **Note**: Always verify token addresses on-chain before using in production deployments.

## Next Step

Once you have the correct addresses from docs.aave.com, update the deployment script and deploy!

## Quick Action

Want to verify right now?

1. Visit: https://app.aave.com
2. Enable testnet mode
3. Connect wallet to Sepolia
4. If you see the market → Aave v3 is LIVE ✅

