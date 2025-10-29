# Verify AttestifyAaveVault on Etherscan Sepolia

## ✅ Verification Status

- **✅ Verified on Blockscout**: https://eth-sepolia.blockscout.com/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0#code
- **⚠️ Etherscan**: Hardhat's built-in chain descriptors still use V1 endpoints. Manual verification recommended (see below) or wait for Hardhat update.

### Why Etherscan Auto-Verification Fails

According to [Etherscan's V2 Migration Guide](https://docs.etherscan.io/v2-migration), the API now uses:
- Unified endpoint: `https://api.etherscan.io/v2/api` for all chains
- Chainid passed as query parameter: `chainid=11155111` for Sepolia

However, Hardhat's built-in chain descriptors (in `node_modules/hardhat/src/internal/builtin-plugins/network-manager/chain-descriptors.ts`) still reference the old V1 endpoint (`https://api-sepolia.etherscan.io/api`) for Sepolia, which overrides the verify plugin's V2 default.

The `@nomicfoundation/hardhat-verify` plugin already defaults to V2 (see line 36 in `etherscan.ts`: `export const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api"`), but Hardhat's chain descriptor takes precedence. This is a known issue that Hardhat needs to fix.

## 📋 Contract Information

- **Contract Address**: `0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0`
- **Network**: Ethereum Sepolia Testnet
- **Contract Name**: `AttestifyAaveVault`
- **Compiler Version**: `0.8.28`
- **Optimization**: Enabled with 200 runs
- **Etherscan**: https://sepolia.etherscan.io/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0

## 🔧 Constructor Arguments

When verifying, you'll need these constructor arguments:

1. **Asset Address** (AAVE token): `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`
2. **aToken Address** (aEthAAVE): `0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259`
3. **Aave Pool Address**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

## 📝 Manual Verification Steps

### Option 1: Via Etherscan Web Interface (Recommended)

1. **Go to the contract page**:
   - Visit: https://sepolia.etherscan.io/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0

2. **Click "Contract" tab**, then click **"Verify and Publish"**

3. **Fill in the verification form**:
   - **Compiler Type**: Solidity (Single file) or Standard JSON Input (recommended for multi-file)
   - **Compiler Version**: `0.8.28`
   - **License**: MIT (or your license)
   - **Optimization**: Yes
   - **Runs**: `200`

4. **Upload contract code**:
   - **For Standard JSON Input**:
     - Go to `artifacts/build-info/` in your project
     - Find the JSON file for AttestifyAaveVault compilation
     - Upload that JSON file
   - **For Single File**:
     - Copy the flattened contract code from `AttestifyVault_flat.sol` (if available)
     - Or combine all contract sources

5. **Enter Constructor Arguments**:
   ```
   0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a,
   0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259,
   0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
   ```
   
   Or use the ABI-encoded format:
   ```
   00000000000000000000000088541670e55cc00beefd87eb59edd1b7c511ac9a0000000000000000000000006b8558764d3b7572136f17174cb9ab1ddc7e12590000000000000000000000006ae43d3271ff6888e7fc43fd7321a503ff738951
   ```

6. **Submit** and wait for verification (usually takes 1-2 minutes)

### Option 2: Using Hardhat Verify (If API Key is configured)

If you have an Etherscan API key set in your `.env` file:

```bash
# Add to .env file:
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

Then run:
```bash
npx hardhat verify --network sepolia \
  0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0 \
  "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a" \
  "0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259" \
  "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"
```

### Option 3: Using Sourcify (Alternative)

The contract is also configured for Sourcify verification:

1. Visit: https://sourcify.dev/
2. Select "Sepolia" network
3. Enter contract address: `0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0`
4. Upload metadata and sources

## 🔗 Required Contract Files

For verification, you'll need:
- `contracts/AttestifyVault.sol` (main contract)
- All imported contracts (OpenZeppelin, Aave interfaces)
- Compiler metadata JSON (from `artifacts/build-info/`)

## ✅ After Verification

Once verified, you'll be able to:
- ✅ View contract source code on Etherscan
- ✅ Interact with contract functions via the UI
- ✅ See contract bytecode
- ✅ Verify contract security
- ✅ Share verified contract with others

## 🆘 Troubleshooting

### Error: "Contract not found"
- Wait a few minutes for the contract to be indexed on Etherscan

### Error: "Constructor arguments mismatch"
- Double-check the constructor arguments are in the correct order
- Use ABI-encoded format if entering manually

### Error: "Compilation error"
- Ensure you're using compiler version 0.8.28
- Check optimization settings match deployment (200 runs)
- For multi-file contracts, use Standard JSON Input method

## 📚 Additional Resources

- [Etherscan Verification Guide](https://docs.etherscan.io/getting-started/verifying-contracts-programmatically)
- [Hardhat Verify Plugin](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)
- [Contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0)

