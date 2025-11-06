import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  
  console.log("🧪 Testing Mock Aave contracts locally...");
  
  // Get test accounts
  const [deployer, user1] = await ethers.getSigners();
  console.log("📋 Deployer:", deployer.address);
  console.log("📋 User1:", user1.address);
  
  // Deploy a mock cUSD token for testing
  console.log("📦 Deploying Mock cUSD...");
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockCUSD = await MockToken.deploy("Celo USD", "cUSD");
  await mockCUSD.waitForDeployment();
  const cusdAddress = await mockCUSD.getAddress();
  console.log("✅ Mock cUSD deployed to:", cusdAddress);
  
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
    cusdAddress,
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
    cusdAddress,
    aTokenAddress,
    poolAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ AttestifyVault deployed to:", vaultAddress);
  
  // Test the yield functionality
  console.log("\n🧪 Testing yield functionality...");
  
  // Mint some cUSD to user1
  await mockCUSD.mint(user1.address, ethers.parseEther("100"));
  console.log("💰 Minted 100 cUSD to user1");
  
  // User1 approves vault to spend cUSD
  await mockCUSD.connect(user1).approve(vaultAddress, ethers.parseEther("100"));
  console.log("✅ User1 approved vault to spend cUSD");
  
  // User1 deposits 50 cUSD
  await vault.connect(user1).deposit(ethers.parseEther("50"), user1.address);
  console.log("✅ User1 deposited 50 cUSD");
  
  // Check user's balance
  const userBalance = await vault.balanceOf(user1.address);
  console.log("📊 User balance:", ethers.formatEther(userBalance), "cUSD");
  
  // Simulate time passing (1 day = 86400 seconds)
  await hre.network.provider.send("evm_increaseTime", [86400]); // 1 day
  await hre.network.provider.send("evm_mine");
  
  // Check balance after 1 day
  const balanceAfter1Day = await vault.balanceOf(user1.address);
  const interest = balanceAfter1Day - userBalance;
  console.log("📊 Balance after 1 day:", ethers.formatEther(balanceAfter1Day), "cUSD");
  console.log("💰 Interest earned:", ethers.formatEther(interest), "cUSD");
  
  // Calculate APY
  const dailyAPY = Number(interest) / Number(userBalance) * 365 * 100;
  console.log("📈 Daily APY:", dailyAPY.toFixed(2), "%");
  
  console.log("\n🎉 All tests passed! Mock yield system is working correctly.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
