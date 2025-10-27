import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AttestifyVault with REAL Aave V3 on Celo Fork\n");

  const [deployer] = await hre.ethers.getSigners();

  // Give deployer funds
  await hre.network.provider.send("hardhat_setBalance", [
    deployer.address,
    "0x56BC75E2D63100000", // 100 CELO
  ]);

  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CELO\n");

  // REAL AAVE V3 ADDRESSES ON CELO MAINNET
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
  const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";
  const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";

  console.log("📝 Using REAL Aave V3 addresses:");
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD (Aave Celo cUSD):", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);
  console.log("  Self Protocol:", SELF_PROTOCOL);

  // Verify all contracts exist
  console.log("\n🔍 Verifying contracts...");
  for (const [name, addr] of Object.entries({
    "cUSD": CUSD_ADDRESS,
    "acUSD": ACUSD_ADDRESS,
    "Aave Pool": AAVE_POOL,
    "Self Protocol": SELF_PROTOCOL,
  })) {
    const code = await hre.ethers.provider.getCode(addr);
    if (code === "0x") {
      console.error(`❌ ${name} has no code at ${addr}`);
      return;
    }
    console.log(`  ✅ ${name} verified`);
  }

  // Deploy AttestifyVault
  console.log("\n📝 Deploying AttestifyVault with REAL Aave...");

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

  // Test basic functionality
  console.log("\n🧪 Testing vault initialization...");

  const totalAssets = await vault.totalAssets();
  console.log("  Total Assets:", hre.ethers.formatEther(totalAssets), "cUSD");

  const currentAPY = await vault.getCurrentAPY();
  console.log("  Current APY:", currentAPY.toString(), "bps (", (Number(currentAPY) / 100).toFixed(2), "%)");

  const stats = await vault.getVaultStats();
  console.log("  ✅ Vault initialized successfully!");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE WITH REAL AAVE V3!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  AttestifyVault:", vaultAddress);
  console.log("  cUSD (Real):", CUSD_ADDRESS);
  console.log("  acUSD (Real Aave):", ACUSD_ADDRESS);
  console.log("  Aave Pool (Real):", AAVE_POOL);

  console.log("\n📝 Next: Test with real cUSD from whales");

  return {
    vault: vaultAddress,
    cUSD: CUSD_ADDRESS,
    acUSD: ACUSD_ADDRESS,
    aavePool: AAVE_POOL,
  };
}

main()
  .then((addresses) => {
    console.log("\n💾 Save these addresses:");
    console.log(JSON.stringify(addresses, null, 2));
  })
  .catch(console.error);