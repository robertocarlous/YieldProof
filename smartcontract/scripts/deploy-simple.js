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

  // Contract ABI (simplified for deployment)
  const contractABI = [
    "constructor(address _cUSD, address _acUSD, address _selfProtocol, address _aavePool)",
    "function totalAssets() view returns (uint256)",
    "function getCurrentAPY() view returns (uint256)",
    "function manualVerifyForTesting(address user) external"
  ];

  // Contract bytecode (you'll need to compile and get this)
  console.log("\n⚠️  Note: This script requires the compiled contract bytecode.");
  console.log("   Please compile the contract first using:");
  console.log("   npx hardhat compile");
  console.log("\n   Then update this script with the bytecode from artifacts/");
  
  // For now, let's just show the deployment parameters
  console.log("\n📋 Deployment Parameters:");
  console.log("  Constructor Args:");
  console.log("    _cUSD:", CUSD_ADDRESS);
  console.log("    _acUSD:", ACUSD_ADDRESS);
  console.log("    _selfProtocol:", SELF_PROTOCOL);
  console.log("    _aavePool:", AAVE_POOL);
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Fix Hardhat compilation issues");
  console.log("2. Get contract bytecode from compilation");
  console.log("3. Update this script with bytecode");
  console.log("4. Deploy to testnet");
  
  console.log("\n💡 Alternative: Use Remix IDE to deploy directly");
  console.log("   1. Go to https://remix.ethereum.org/");
  console.log("   2. Create new file: AttestifyVault.sol");
  console.log("   3. Copy contract code");
  console.log("   4. Compile and deploy to Celo Sepolia");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
