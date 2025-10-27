import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  console.log("🚀 Deploying Mock Aave contracts to Celo Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance === 0n) {
    console.log("❌ No CELO balance. Please fund the account first.");
    return;
  }
  
  // cUSD address on Celo Sepolia
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
  
  // Deploy MockAavePool
  console.log("📦 Deploying MockAavePool...");
  const MockAavePool = await ethers.getContractFactory("MockAavePool");
  const mockPool = await MockAavePool.deploy();
  await mockPool.waitForDeployment();
  const poolAddress = await mockPool.getAddress();
  console.log("✅ MockAavePool deployed to:", poolAddress);
  
  // Deploy MockAToken
  console.log("📦 Deploying MockAToken...");
  const MockAToken = await ethers.getContractFactory("MockAToken");
  const mockAToken = await MockAToken.deploy(
    CUSD_ADDRESS,
    poolAddress,
    "Aave Celo USD",
    "aCUSD"
  );
  await mockAToken.waitForDeployment();
  const aTokenAddress = await mockAToken.getAddress();
  console.log("✅ MockAToken deployed to:", aTokenAddress);
  
  // Deploy AttestifyVault
  console.log("📦 Deploying AttestifyVault...");
  const AttestifyVault = await ethers.getContractFactory("AttestifyVault");
  const vault = await AttestifyVault.deploy(
    CUSD_ADDRESS,
    aTokenAddress,
    poolAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ AttestifyVault deployed to:", vaultAddress);
  
  console.log("\n🎉 Deployment Summary:");
  console.log("📋 MockAavePool:", poolAddress);
  console.log("📋 MockAToken (aCUSD):", aTokenAddress);
  console.log("📋 AttestifyVault:", vaultAddress);
  console.log("📋 cUSD Token:", CUSD_ADDRESS);
  
  console.log("\n🔗 Contract URLs:");
  console.log(`https://celo-sepolia.blockscout.com/address/${poolAddress}`);
  console.log(`https://celo-sepolia.blockscout.com/address/${aTokenAddress}`);
  console.log(`https://celo-sepolia.blockscout.com/address/${vaultAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
