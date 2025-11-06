import hre from "hardhat";

async function main() {
    console.log("🚀 Deploying AttestifyVault with Mock Contracts to Celo Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log(
        "Account balance:",
        (await deployer.provider.getBalance(deployer.address)).toString()
    );

    // 🧩 Only Self Protocol exists on Celo Sepolia
    const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";

    console.log("\n📝 Deploying Mock Contracts first...");

    // 🎭 Deploy Mock cUSD Token
    console.log("\n1️⃣ Deploying MockToken (cUSD)...");
    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const mockCUSD = await MockToken.deploy();
    await mockCUSD.waitForDeployment();
    const mockCUSDAddress = await mockCUSD.getAddress();
    console.log("✅ Mock cUSD deployed to:", mockCUSDAddress);

    // 🎭 Deploy Mock Aave Pool
    console.log("\n2️⃣ Deploying MockAavePool...");
    const MockAavePool = await hre.ethers.getContractFactory("MockAavePool");
    const mockAavePool = await MockAavePool.deploy();
    await mockAavePool.waitForDeployment();
    const mockAavePoolAddress = await mockAavePool.getAddress();
    console.log("✅ Mock Aave Pool deployed to:", mockAavePoolAddress);

    // 🎭 Deploy Mock aToken (acUSD)
    console.log("\n3️⃣ Deploying MockAToken...");
    const MockAToken = await hre.ethers.getContractFactory("MockAToken");
    const mockAToken = await MockAToken.deploy(
        mockCUSDAddress, // underlying asset
        "Aave Celo Dollar", // name
        "acUSD" // symbol
    );
    await mockAToken.waitForDeployment();
    const mockATokenAddress = await mockAToken.getAddress();
    console.log("✅ Mock aToken deployed to:", mockATokenAddress);

    // 🔗 Set up mock relationships
    console.log("\n4️⃣ Setting up mock contract relationships...");
    await mockAavePool.setAToken(mockCUSDAddress, mockATokenAddress);
    await mockAToken.setPool(mockAavePoolAddress);
    console.log("✅ Mock relationships configured");

    console.log("\n📝 Using Mock Contracts:");
    console.log("  Self Protocol:", SELF_PROTOCOL);
    console.log("  cUSD (Mock):", mockCUSDAddress);
    console.log("  acUSD (Mock):", mockATokenAddress);
    console.log("  Aave Pool (Mock):", mockAavePoolAddress);

    // 🚀 Deploy AttestifyVault with Mock Contracts
    console.log("\n📝 Deploying AttestifyVault...");
    const AttestifyVault = await hre.ethers.getContractFactory("AttestifyVault");
    const vault = await AttestifyVault.deploy(
        mockCUSDAddress,
        mockATokenAddress,
        SELF_PROTOCOL,
        mockAavePoolAddress
    );

    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    console.log("\n✅ AttestifyVault deployed to:", vaultAddress);

    // 🎭 Check initial cUSD balance (MockToken mints 1M in constructor)
    console.log("\n5️⃣ Checking initial cUSD balance...");
    const initialBalance = await mockCUSD.balanceOf(deployer.address);
    console.log("✅ Initial deployer cUSD balance:", hre.ethers.formatEther(initialBalance), "cUSD");

    // 💾 Deployment Summary
    const deploymentSummary = {
        vault: vaultAddress,
        mockCUSD: mockCUSDAddress,
        mockAToken: mockATokenAddress,
        mockAavePool: mockAavePoolAddress,
        selfProtocol: SELF_PROTOCOL,
        deployer: deployer.address,
    };

    console.log("\n============================================================");
    console.log("💾 Deployment summary:");
    console.log(JSON.stringify(deploymentSummary, null, 2));
    console.log("============================================================\n");

    // 🧪 Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    try {
        // Test cUSD balance
        const balance = await mockCUSD.balanceOf(deployer.address);
        console.log("✅ Deployer cUSD balance:", hre.ethers.formatEther(balance), "cUSD");

        // Test vault initialization
        const totalAssets = await vault.totalAssets();
        console.log("✅ Vault total assets:", hre.ethers.formatEther(totalAssets), "cUSD");

        // Test manual verification
        await vault.manualVerifyForTesting(deployer.address);
        console.log("✅ Manual verification successful");

        console.log("\n🎉 All tests passed! Vault is ready for testing.");
    } catch (error) {
        console.log("❌ Test failed:", error.message);
    }

    console.log("\n🎉 Deployment with mocks complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Transfer some cUSD to test users");
    console.log("2. Test deposit/withdraw functionality");
    console.log("3. Test identity verification");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
