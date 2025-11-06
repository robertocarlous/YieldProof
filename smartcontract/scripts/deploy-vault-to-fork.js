import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying AttestifyVault to Celo Fork...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO\n");

  // Use the addresses from mock deployment
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const ACUSD_ADDRESS = "0x2a810409872AfC346F9B5b26571Fd6eC42EA4849";
  const AAVE_POOL = "0xB82008565FdC7e44609fA118A4a681E92581e680";
  const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";

  console.log("📝 Using addresses:");
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD:", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);
  console.log("  Self Protocol:", SELF_PROTOCOL);

  // Deploy AttestifyVault
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

  // Test basic functionality
  console.log("\n🧪 Testing vault...");
  
  const totalAssets = await vault.totalAssets();
  console.log("  Total Assets:", hre.ethers.formatEther(totalAssets), "cUSD");
  
  const currentAPY = await vault.getCurrentAPY();
  console.log("  Current APY:", currentAPY.toString(), "bps (", (Number(currentAPY) / 100).toFixed(2), "%)");
  
  const stats = await vault.getVaultStats();
  console.log("  ✅ Vault initialized successfully!");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  AttestifyVault:", vaultAddress);
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  acUSD:", ACUSD_ADDRESS);
  console.log("  Aave Pool:", AAVE_POOL);
  
  console.log("\n📝 Next: Test deposits and withdrawals");
  console.log("Run: npx hardhat run scripts/test-vault.js --network localhost");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});