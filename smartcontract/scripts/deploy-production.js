import hre from "hardhat";

/**
 * Production deployment script for AttestifyVault
 * Uses real Aave V3 contracts on Celo mainnet
 */
async function main() {
  console.log("🚀 Deploying AttestifyVault to PRODUCTION (Celo Mainnet)\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    "CELO"
  );

  // 🧩 REAL CONTRACT ADDRESSES ON CELO MAINNET
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
  const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";
  const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";

  console.log("\n📝 Using REAL Celo Mainnet Contracts:");
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD (Aave):", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);
  console.log("  Self Protocol:", SELF_PROTOCOL);

  // 🔍 Verify all contracts exist and are accessible
  console.log("\n🔍 Verifying contract addresses...");
  const contracts = [
    { name: "cUSD", address: CUSD_ADDRESS },
    { name: "acUSD (Aave)", address: ACUSD_ADDRESS },
    { name: "Aave Pool", address: AAVE_POOL },
    { name: "Self Protocol", address: SELF_PROTOCOL },
  ];

  for (const contract of contracts) {
    try {
      const code = await hre.ethers.provider.getCode(contract.address);
      if (code === "0x") {
        throw new Error(`No contract found at ${contract.address}`);
      }
      console.log(`  ✅ ${contract.name} verified`);
    } catch (error) {
      console.error(`  ❌ ${contract.name} verification failed:`, error.message);
      throw error;
    }
  }

  // 🚀 Deploy AttestifyVault
  console.log("\n📝 Deploying AttestifyVault...");
  const AttestifyVault = await hre.ethers.getContractFactory("AttestifyVault");
  
  const vault = await AttestifyVault.deploy(
    CUSD_ADDRESS,
    ACUSD_ADDRESS,
    SELF_PROTOCOL,
    AAVE_POOL
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("\n✅ AttestifyVault deployed to:", vaultAddress);

  // 🧪 Test basic functionality
  console.log("\n🧪 Testing vault initialization...");
  
  try {
    const totalAssets = await vault.totalAssets();
    console.log("  Total Assets:", hre.ethers.formatEther(totalAssets), "cUSD");
    
    const currentAPY = await vault.getCurrentAPY();
    console.log("  Current APY:", currentAPY.toString(), "bps (", (Number(currentAPY) / 100).toFixed(2), "%)");
    
    const stats = await vault.getVaultStats();
    console.log("  ✅ Vault initialized successfully!");
    
    // Test strategy configurations
    const conservativeStrategy = await vault.strategies(0); // CONSERVATIVE
    console.log("  Conservative Strategy:", conservativeStrategy.name);
    console.log("  Aave Allocation:", conservativeStrategy.aaveAllocation.toString() + "%");
    
  } catch (error) {
    console.error("  ❌ Vault initialization test failed:", error.message);
    throw error;
  }

  // 💾 Deployment Summary
  const deploymentSummary = {
    network: "celo-mainnet",
    vault: vaultAddress,
    cUSD: CUSD_ADDRESS,
    acUSD: ACUSD_ADDRESS,
    aavePool: AAVE_POOL,
    selfProtocol: SELF_PROTOCOL,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    gasUsed: (await vault.deploymentTransaction().wait()).gasUsed.toString(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("🎉 PRODUCTION DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentSummary, null, 2));

  // 🔍 Verify on Celoscan if API key is available
  if (process.env.CELOSCAN_API_KEY && process.env.CELOSCAN_API_KEY !== "abc") {
    console.log("\n⏳ Waiting for block confirmations...");
    await vault.deploymentTransaction().wait(5);

    console.log("🔍 Verifying contract on Celoscan...");
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [
          CUSD_ADDRESS,
          ACUSD_ADDRESS,
          SELF_PROTOCOL,
          AAVE_POOL,
        ],
      });
      console.log("✅ Contract verified on Celoscan!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  } else {
    console.log("\n⚠️ Skipping Celoscan verification (no API key provided)");
  }

  console.log("\n🎯 Next Steps:");
  console.log("  1. Test deposit/withdrawal with small amounts");
  console.log("  2. Monitor vault performance");
  console.log("  3. Set up AI agent address");
  console.log("  4. Configure treasury address");
  console.log("  5. Remove manualVerifyForTesting function for final production");

  console.log("\n🔗 Contract Links:");
  console.log(`  Celoscan: https://celoscan.io/address/${vaultAddress}`);
  console.log(`  Blockscout: https://explorer.celo.org/address/${vaultAddress}`);

  return deploymentSummary;
}

main()
  .then((summary) => {
    console.log("\n💾 Save this deployment summary:");
    console.log(JSON.stringify(summary, null, 2));
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });
