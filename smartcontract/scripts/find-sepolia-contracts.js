import hre from "hardhat";

async function main() {
    console.log("🔍 Searching for contracts on Celo Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Searching with account:", deployer.address);

    // Common Celo Sepolia addresses to check
    const addressesToCheck = [
        // cUSD on Sepolia
        "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet cUSD
        "0x874069Fa1Eb16D44d62F6e4a9C4e6e8e7f6E5C5", // Possible Sepolia cUSD
        "0x0000000000000000000000000000000000000000", // Placeholder

        // Self Protocol
        "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74", // Current address

        // Aave addresses
        "0xBba98352628B0B0c4b40583F593fFCb630935a45", // Current acUSD
        "0x3E59A31363E2ad014dcbc521c4a0d5757f3402", // Current Aave Pool
    ];

    console.log("📝 Checking contract existence:");

    for (const address of addressesToCheck) {
        if (address === "0x0000000000000000000000000000000000000000") continue;

        try {
            const code = await deployer.provider.getCode(address);
            const codeSize = code.length;

            if (codeSize > 2) {
                console.log(`✅ ${address} - Code size: ${codeSize}`);

                // Try to get basic info if it's an ERC20
                try {
                    const token = await hre.ethers.getContractAt("IERC20", address);
                    const name = await token.name();
                    const symbol = await token.symbol();
                    console.log(`   📋 Name: ${name}, Symbol: ${symbol}`);
                } catch (e) {
                    // Not an ERC20 or different interface
                }
            } else {
                console.log(`❌ ${address} - No contract (code size: ${codeSize})`);
            }
        } catch (error) {
            console.log(`❌ ${address} - Error: ${error.message}`);
        }
    }

    console.log("\n🔍 Let's try to find cUSD by checking known patterns...");

    // Try some common cUSD addresses on testnets
    const possibleCUSD = [
        "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet
        "0x874069Fa1Eb16D44d62F6e4a9C4e6e8e7f6E5C5", // Example
        "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Same as mainnet
    ];

    for (const address of possibleCUSD) {
        try {
            const code = await deployer.provider.getCode(address);
            if (code.length > 2) {
                console.log(`\n🧪 Testing ${address} as potential cUSD:`);
                try {
                    const token = await hre.ethers.getContractAt("IERC20", address);
                    const name = await token.name();
                    const symbol = await token.symbol();
                    const decimals = await token.decimals();

                    if (name.toLowerCase().includes('celo') || symbol.toLowerCase().includes('cusd')) {
                        console.log(`🎯 FOUND CUSD! ${name} (${symbol}) - Decimals: ${decimals}`);
                    } else {
                        console.log(`   ${name} (${symbol}) - Decimals: ${decimals}`);
                    }
                } catch (e) {
                    console.log(`   Not a standard ERC20 token`);
                }
            }
        } catch (error) {
            console.log(`   Error checking ${address}: ${error.message}`);
        }
    }

    console.log("\n💡 Recommendation: Use mock contracts for testing or deploy to Celo mainnet");
    console.log("   Celo Sepolia might not have all the contracts you need.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
