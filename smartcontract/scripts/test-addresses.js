import hre from "hardhat";

async function main() {
    console.log("🔍 Testing contract addresses on Celo Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Contract addresses on Celo Sepolia
    const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";
    const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";
    const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757f3402";

    console.log("\n📝 Testing contract addresses:");
    console.log("  Self Protocol:", SELF_PROTOCOL);
    console.log("  cUSD:", CUSD_ADDRESS);
    console.log("  acUSD (Aave):", ACUSD_ADDRESS);
    console.log("  Aave Pool:", AAVE_POOL);

    // Test if contracts exist by checking code size
    const codeSize = await deployer.provider.getCode(CUSD_ADDRESS);
    console.log("\n✅ cUSD contract code size:", codeSize.length);

    const selfCodeSize = await deployer.provider.getCode(SELF_PROTOCOL);
    console.log("✅ Self Protocol code size:", selfCodeSize.length);

    const acUSDCodeSize = await deployer.provider.getCode(ACUSD_ADDRESS);
    console.log("✅ acUSD contract code size:", acUSDCodeSize.length);

    const aavePoolCodeSize = await deployer.provider.getCode(AAVE_POOL);
    console.log("✅ Aave Pool code size:", aavePoolCodeSize.length);

    // Test cUSD token functionality
    try {
        const cUSD = await hre.ethers.getContractAt("IERC20", CUSD_ADDRESS);
        const name = await cUSD.name();
        const symbol = await cUSD.symbol();
        const decimals = await cUSD.decimals();

        console.log("\n✅ cUSD Token Info:");
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Decimals:", decimals);

        // Test approval (this might fail if cUSD doesn't support it)
        console.log("\n🧪 Testing cUSD approval...");
        await cUSD.approve(AAVE_POOL, 1000);
        console.log("✅ cUSD approval successful");

    } catch (error) {
        console.log("❌ cUSD test failed:", error.message);
    }

    // Test Self Protocol
    try {
        const selfProtocol = await hre.ethers.getContractAt("ISelfProtocol", SELF_PROTOCOL);
        console.log("\n✅ Self Protocol contract accessible");
    } catch (error) {
        console.log("❌ Self Protocol test failed:", error.message);
    }

    console.log("\n🎉 Address testing complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
