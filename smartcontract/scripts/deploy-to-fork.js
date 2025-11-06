import hre from "hardhat";

/**
 * Deployment script for local fork testing
 * Runs on local hardhat fork with real Aave contracts
 */
async function main() {
  console.log("🚀 Deploying AttestifyAaveVault to LOCAL FORK\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO\n");

  // Real Aave v3 addresses on Celo Mainnet
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
  const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";

  console.log("📝 Using REAL Aave v3 contracts (from fork):");
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD:", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);

  // Verify contracts exist
  console.log("\n🔍 Verifying contract addresses...");
  try {
    const code = await hre.ethers.provider.getCode(CUSD_ADDRESS);
    if (code === "0x") throw new Error("cUSD not found");
    console.log("  ✅ cUSD verified");
    
    const aTokenCode = await hre.ethers.provider.getCode(ACUSD_ADDRESS);
    if (aTokenCode === "0x") throw new Error("acUSD not found");
    console.log("  ✅ acUSD verified");
    
    const poolCode = await hre.ethers.provider.getCode(AAVE_POOL);
    if (poolCode === "0x") throw new Error("Aave Pool not found");
    console.log("  ✅ Aave Pool verified");
  } catch (error) {
    console.error("  ❌ Verification failed:", error.message);
    throw error;
  }

  // Deploy vault
  console.log("\n🚀 Deploying AttestifyAaveVault...");
  const AttestifyVault = await hre.ethers.getContractFactory("AttestifyAaveVault");
  
  const vault = await AttestifyVault.deploy(
    CUSD_ADDRESS,      // asset (cUSD)
    ACUSD_ADDRESS,     // aToken (acUSD)
    AAVE_POOL          // aavePool
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("\n✅ AttestifyAaveVault deployed successfully!");
  console.log("📄 Contract Address:", vaultAddress);
  
  // Test basic functionality
  console.log("\n🧪 Testing vault...");
  try {
    const totalAssets = await vault.totalAssets();
    console.log("  ✓ totalAssets():", hre.ethers.formatEther(totalAssets), "cUSD");
    console.log("  ✓ Vault initialized successfully!");
  } catch (error) {
    console.error("  ❌ Test failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 LOCAL FORK DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Next steps:");
  console.log("  1. Import this address into your testing scripts");
  console.log("  2. Test deposit, withdrawal, and yield accrual");
  console.log("  3. When ready, deploy to mainnet");
  console.log("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

