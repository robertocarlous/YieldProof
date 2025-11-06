import hre from "hardhat";

async function main() {
    console.log("💰 Getting cUSD for testing on fork\n");

    const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    const [deployer] = await hre.ethers.getSigners();

    const cUSD = await hre.ethers.getContractAt("IERC20", CUSD_ADDRESS);

    // Try to find minter role or owner
    console.log("🔍 Checking cUSD contract roles...");

    // Try common owner/admin functions
    const ownerAbi = [
        "function owner() external view returns (address)",
        "function getMinterManager() external view returns (address)",
    ];

    try {
        const cUSDWithOwner = new hre.ethers.Contract(CUSD_ADDRESS, ownerAbi, hre.ethers.provider);

        try {
            const owner = await cUSDWithOwner.owner();
            console.log("Owner:", owner);

            // Impersonate owner
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [owner],
            });

            await hre.network.provider.send("hardhat_setBalance", [
                owner,
                "0x56BC75E2D63100000",
            ]);

            const ownerSigner = await hre.ethers.getSigner(owner);

            // Try to mint
            const mintAbi = ["function mint(address to, uint256 amount) external"];
            const cUSDMinter = new hre.ethers.Contract(CUSD_ADDRESS, mintAbi, ownerSigner);

            await cUSDMinter.mint(deployer.address, hre.ethers.parseEther("10000"));
            console.log("✅ Minted 10,000 cUSD!");

        } catch (e) {
            console.log("Cannot mint directly, trying transfer from rich address...");
        }

    } catch (error) {
        console.log("❌ Cannot access owner functions");
    }

    // Alternative: Transfer from the actual Aave pool which should have cUSD
    console.log("\n💡 Alternative: Get cUSD from Aave pool...");
    const AAVE_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";

    const poolBalance = await cUSD.balanceOf(AAVE_POOL);
    console.log("Aave pool cUSD balance:", hre.ethers.formatEther(poolBalance));

    if (poolBalance > 0n) {
        // Impersonate Aave pool
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [AAVE_POOL],
        });

        await hre.network.provider.send("hardhat_setBalance", [
            AAVE_POOL,
            "0x56BC75E2D63100000",
        ]);

        const poolSigner = await hre.ethers.getSigner(AAVE_POOL);
        const transferAmount = hre.ethers.parseEther("10000");

        await cUSD.connect(poolSigner).transfer(deployer.address, transferAmount);
        console.log("✅ Transferred 10,000 cUSD from Aave pool!");

        const balance = await cUSD.balanceOf(deployer.address);
        console.log("Your balance:", hre.ethers.formatEther(balance), "cUSD");

        return deployer.address;
    }

    console.log("\n❌ Could not get cUSD");
    console.log("💡 Recommendation: Use a better RPC endpoint with archive data");
}

main().catch(console.error);