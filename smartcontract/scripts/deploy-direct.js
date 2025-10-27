const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Deploying AttestifyVault to Celo Sepolia Testnet...\n");

  // Celo Sepolia RPC URL
  const RPC_URL = "https://forno.celo-sepolia.celo-testnet.org/";
  
  // Create provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // You'll need to set your private key
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("❌ Please set PRIVATE_KEY environment variable");
    console.log("   Example: export PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient CELO balance for deployment");
    console.log("   Please get testnet CELO from: https://faucet.celo.org/");
    process.exit(1);
  }

  // Contract addresses on Celo Sepolia
  const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
  const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";

  console.log("\n📝 Using Celo Sepolia Contracts:");
  console.log("  Self Protocol:", SELF_PROTOCOL);
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD (Aave):", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);

  console.log("\n⚠️  Note: This script requires the compiled contract bytecode.");
  console.log("   Since Hardhat compilation has dependency issues, please:");
  console.log("\n   1. Use Remix IDE to compile the contract");
  console.log("   2. Copy the bytecode from Remix");
  console.log("   3. Update this script with the bytecode");
  console.log("\n   OR");
  console.log("\n   4. Use Remix IDE to deploy directly to Celo Sepolia");
  
  console.log("\n📋 Deployment Parameters:");
  console.log("  Constructor Args:");
  console.log("    _cUSD:", CUSD_ADDRESS);
  console.log("    _acUSD:", ACUSD_ADDRESS);
  console.log("    _selfProtocol:", SELF_PROTOCOL);
  console.log("    _aavePool:", AAVE_POOL);
  
  console.log("\n🎯 Recommended Next Steps:");
  console.log("1. Go to https://remix.ethereum.org/");
  console.log("2. Create new file: AttestifyVault.sol");
  console.log("3. Copy contract code from contracts/AttestifyVault.sol");
  console.log("4. Add required imports:");
  console.log("   - @openzeppelin/contracts/token/ERC20/IERC20.sol");
  console.log("   - @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol");
  console.log("   - @openzeppelin/contracts/access/Ownable.sol");
  console.log("   - @openzeppelin/contracts/utils/ReentrancyGuard.sol");
  console.log("   - @openzeppelin/contracts/utils/Pausable.sol");
  console.log("5. Compile with Solidity 0.8.28");
  console.log("6. Deploy to Celo Sepolia with constructor args above");
  
  console.log("\n💡 Alternative: Use Foundry (if available)");
  console.log("   forge create AttestifyVault --constructor-args ...");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
