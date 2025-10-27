import hre from "hardhat";

async function main() {
    console.log("🔍 Testing Celo Sepolia contract addresses...\n");

    const addresses = {
        "Self Protocol": "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74",
        "cUSD": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        "mcUSD (Moola)": "0x71DB38719f9113A36e14F409bAD4F07B58b4730b",
        "Moola LendingPool": "0x0886f74eEEc443fBb6907fB5528B57C28E813129"
    };

    for (const [name, address] of Object.entries(addresses)) {
        console.log(`\nTesting ${name}: ${address}`);

        try {
            // Check if address has code
            const code = await hre.ethers.provider.getCode(address);

            if (code === "0x") {
                console.log(`❌ ${name}: NOT A CONTRACT (EOA or empty)`);
                continue;
            }

            console.log(`✅ ${name}: Has contract code (${code.length} bytes)`);

            // Try to interact with it as ERC20
            if (name.includes("USD") || name === "mcUSD (Moola)") {
                try {
                    const token = await hre.ethers.getContractAt("IERC20", address);
                    const totalSupply = await token.totalSupply();
                    console.log(`   Total Supply: ${hre.ethers.formatEther(totalSupply)}`);

                    // Try approve (this is what's failing in your constructor)
                    const [signer] = await hre.ethers.getSigners();
                    const tx = await token.approve.staticCall(
                        "0x0000000000000000000000000000000000000001",
                        1000
                    );
                    console.log(`   ✅ Approve call works`);
                } catch (e) {
                    console.log(`   ❌ ERC20 interaction failed: ${e.message}`);
                }
            }

        } catch (error) {
            console.log(`❌ ${name}: ERROR - ${error.message}`);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("RECOMMENDATION:");
    console.log("=".repeat(60));
    console.log("If any address shows 'NOT A CONTRACT', that's your problem!");
    console.log("You need to find the correct Sepolia addresses for those contracts.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});