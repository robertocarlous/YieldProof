import hre from "hardhat";

async function testDeployment() {
  console.log("🧪 Testing Contract Deployment...");
  
  try {
    const { ethers } = hre;
    const [owner, user1] = await ethers.getSigners();
    console.log("✅ Signers loaded");
    
    // Deploy MockAavePool
    console.log("📦 Deploying MockAavePool...");
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const mockPool = await MockAavePool.deploy();
    await mockPool.waitForDeployment();
    console.log("✅ MockAavePool deployed at:", await mockPool.getAddress());
    
    // Deploy MockAToken
    console.log("📦 Deploying MockAToken...");
    const MockAToken = await ethers.getContractFactory("MockAToken");
    const mockAToken = await MockAToken.deploy(
      ethers.ZeroAddress, // dummy underlying asset
      await mockPool.getAddress(),
      "Mock Aave Celo USD",
      "maCUSD"
    );
    await mockAToken.waitForDeployment();
    console.log("✅ MockAToken deployed at:", await mockAToken.getAddress());
    
    // Deploy Mock cUSD
    console.log("📦 Deploying Mock cUSD...");
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockCUSD = await MockToken.deploy("Celo USD", "cUSD", ethers.parseEther("1000000"));
    await mockCUSD.waitForDeployment();
    console.log("✅ Mock cUSD deployed at:", await mockCUSD.getAddress());
    
    // Deploy AttestifyVault
    console.log("📦 Deploying AttestifyVault...");
    const AttestifyVault = await ethers.getContractFactory("AttestifyVault");
    const vault = await AttestifyVault.deploy(
      await mockCUSD.getAddress(),
      await mockAToken.getAddress(),
      await mockPool.getAddress()
    );
    await vault.waitForDeployment();
    console.log("✅ AttestifyVault deployed at:", await vault.getAddress());
    
    // Test basic functions
    console.log("\n🔍 Testing Basic Functions...");
    
    // Test MockAavePool functions
    const apy = await mockPool.getAPY();
    console.log("✅ MockAavePool APY:", apy.toString());
    
    const ownerAddr = await mockPool.owner();
    console.log("✅ MockAavePool owner:", ownerAddr);
    
    // Test AttestifyVault functions
    const minDeposit = await vault.MIN_DEPOSIT();
    console.log("✅ Vault MIN_DEPOSIT:", ethers.formatEther(minDeposit), "cUSD");
    
    const maxDeposit = await vault.MAX_DEPOSIT();
    console.log("✅ Vault MAX_DEPOSIT:", ethers.formatEther(maxDeposit), "cUSD");
    
    const maxTVL = await vault.MAX_TVL();
    console.log("✅ Vault MAX_TVL:", ethers.formatEther(maxTVL), "cUSD");
    
    const isPaused = await vault.paused();
    console.log("✅ Vault paused:", isPaused);
    
    console.log("\n🎉 All contracts deployed and basic functions working!");
    console.log("\n📋 Deployment Summary:");
    console.log("- MockAavePool:", await mockPool.getAddress());
    console.log("- MockAToken:", await mockAToken.getAddress());
    console.log("- Mock cUSD:", await mockCUSD.getAddress());
    console.log("- AttestifyVault:", await vault.getAddress());
    
    return {
      mockPool: await mockPool.getAddress(),
      mockAToken: await mockAToken.getAddress(),
      mockCUSD: await mockCUSD.getAddress(),
      vault: await vault.getAddress()
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test
testDeployment()
  .then((addresses) => {
    console.log("\n✅ Test completed successfully!");
    console.log("Contract addresses:", addresses);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
