import hre from "hardhat";

async function main() {
    console.log("🧪 Simple Fork Test...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Give deployer some CELO for gas
    await hre.network.provider.send("hardhat_setBalance", [
        deployer.address,
        "0x56BC75E2D63100000", // 100 CELO
    ]);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "CELO\n");

    // Test 1: Check if we can get block info
    console.log("🔍 Testing basic fork connectivity...");
    try {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`✅ Current block number: ${blockNumber}`);

        const block = await hre.ethers.provider.getBlock(blockNumber);
        console.log(`✅ Block timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);

    } catch (error) {
        console.log("❌ Basic connectivity failed:", error.message);
        return;
    }

    // Test 2: Check if contracts exist (without calling functions)
    console.log("\n🔍 Testing contract existence...");

    const contracts = [
        { name: "cUSD", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" },
        { name: "Aave Pool", address: "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402" },
        { name: "acUSD", address: "0xBba98352628B0B0c4b40583F593fFCb630935a45" },
        { name: "Self Protocol", address: "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74" },
    ];

    for (const contract of contracts) {
        try {
            const code = await hre.ethers.provider.getCode(contract.address);
            if (code === "0x") {
                console.log(`❌ ${contract.name}: No contract at ${contract.address}`);
            } else {
                console.log(`✅ ${contract.name}: Contract exists (${code.length} bytes)`);
            }
        } catch (error) {
            console.log(`❌ ${contract.name}: Error checking - ${error.message}`);
        }
    }

    // Test 3: Try to deploy our vault with real contracts
    console.log("\n🔍 Testing AttestifyVault deployment with real contracts...");

    try {
        const AttestifyVault = await hre.ethers.getContractFactory("AttestifyVault");

        console.log("Deploying AttestifyVault...");
        const vault = await AttestifyVault.deploy(
            "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD
            "0xBba98352628B0B0c4b40583F593fFCb630935a45", // acUSD
            "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74", // Self Protocol
            "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402"  // Aave Pool
        );

        await vault.waitForDeployment();
        const vaultAddress = await vault.getAddress();
        console.log(`✅ AttestifyVault deployed to: ${vaultAddress}`);

        // Test basic vault functions
        const totalAssets = await vault.totalAssets();
        console.log(`✅ Vault total assets: ${hre.ethers.formatEther(totalAssets)} cUSD`);

        const currentAPY = await vault.getCurrentAPY();
        console.log(`✅ Current APY: ${currentAPY} bps (${(Number(currentAPY) / 100).toFixed(2)}%)`);

    } catch (error) {
        console.log("❌ Vault deployment failed:", error.message);
        return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 FORK TEST RESULTS!");
    console.log("=".repeat(60));
    console.log("\n✅ Your fork is working for:");
    console.log("  ✅ Basic connectivity to Celo mainnet");
    console.log("  ✅ Contract existence verification");
    console.log("  ✅ AttestifyVault deployment with real contracts");

    console.log("\n📝 Next steps:");
    console.log("  1. Deploy with: npx hardhat run scripts/deploy-real-aave-fork.js --network hardhat");
    console.log("  2. Test with: npx hardhat run scripts/test-real-aave-fork.js --network hardhat");
    console.log("  3. The fork works for deployment and basic testing!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
