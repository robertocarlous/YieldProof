# AttestifyAaveVault Deployment Summary - Ethereum Sepolia

## ✅ Successfully Deployed Contracts

### 🟢 USDC Vault (Recommended for Production)
**Contract Address**: `0x4A4EBc7bfb813069e5495fB36B53cc937A31b441`  
**Network**: Ethereum Sepolia Testnet  
**Asset**: USDC  
**Status**: ✅ Deployed & Ready  

**Configuration:**
- **USDC Token**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- **aEthUSDC**: `0x16dA4541aD1807f4443d92D26044C1147406EB80`
- **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

**Why USDC?**
- ✅ Stablecoin - users prefer predictable yields
- ✅ No price volatility risk
- ✅ Industry standard for yield vaults
- ✅ Better user experience

**Links:**
- [Etherscan](https://sepolia.etherscan.io/address/0x4A4EBc7bfb813069e5495fB36B53cc937A31b441)
- [Blockscout](https://eth-sepolia.blockscout.com/address/0x4A4EBc7bfb813069e5495fB36B53cc937A31b441)

---

### 🟡 AAVE Vault (For Testing)
**Contract Address**: `0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0`  
**Network**: Ethereum Sepolia Testnet  
**Asset**: AAVE  
**Status**: ✅ Deployed & Verified on Blockscout  

**Configuration:**
- **AAVE Token**: `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`
- **aEthAAVE**: `0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259`
- **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

**Links:**
- [Etherscan](https://sepolia.etherscan.io/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0)
- [Blockscout (Verified)](https://eth-sepolia.blockscout.com/address/0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0#code)

---

## 📋 All Verified Token Addresses on Sepolia

### USDC (Recommended)
- **USDC**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- **aEthUSDC**: `0x16dA4541aD1807f4443d92D26044C1147406EB80`

### AAVE
- **AAVE**: `0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`
- **aEthAAVE**: `0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259`

### GHO
- **GHO**: `0xc4bF5CbDaBE595361438F8c6a187bDc330539c60`
- **aGHO**: ❓ Need to query from Aave Pool

### Common Infrastructure
- **Aave Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`
- **WETH**: `0xfFf9976782d46CC05690D9e90473641edce96502`

---

## 🚀 Deployment Commands

### Deploy USDC Vault
```bash
npx hardhat run scripts/deploy-eth-sepolia-usdc.js --network sepolia
```

### Deploy AAVE Vault
```bash
npx hardhat run scripts/deploy-eth-sepolia.js --network sepolia
```

### Verify Contract
```bash
# Blockscout (usually works)
npx hardhat verify blockscout --network sepolia <CONTRACT_ADDRESS> <ASSET> <ATOKEN> <POOL>

# Etherscan (may require manual verification due to V2 API)
npx hardhat verify etherscan --network sepolia <CONTRACT_ADDRESS> <ASSET> <ATOKEN> <POOL>
```

---

## 💡 Recommendations

1. **For Production/UI**: Use the USDC vault (`0x4A4EBc7bfb813069e5495fB36B53cc937A31b441`)
2. **For Testing**: Keep the AAVE vault (`0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0`)
3. **Contract Code**: Already updated to be asset-agnostic (no cUSD references)

---

## 📝 Next Steps

1. ✅ Verify USDC vault on Blockscout
2. ⚠️ Verify USDC vault on Etherscan (may require manual verification)
3. Update frontend configuration with USDC vault address
4. Test deposits/withdrawals with USDC
5. Monitor yield accrual

