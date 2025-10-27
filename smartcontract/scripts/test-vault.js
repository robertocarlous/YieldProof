import hre from "hardhat";

async function main() {
    console.log("🧪 Testing AttestifyVault on Fork\n");

    const VAULT_ADDRESS = "0x9A9c9E7e882BD593F65e162978FdF173e7963175"; // UPDATE WITH YOUR NEW VAULT
    const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

    const [deployer] = await hre.ethers.getSigners();
    const testUser = deployer.address;

    console.log("📍 Test user:", testUser);

    // Get cUSD contract
    const cUSD = await hre.ethers.getContractAt("IERC20", CUSD_ADDRESS);

    // Alternative: Transfer from Mento Reserve (the actual reserve contract)
    console.log("\n💰 Getting cUSD from Mento Reserve...");

    // Mento Reserve has special mint/transfer capabilities
    const MENTO_RESERVE = "0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9";

    // Impersonate the reserve
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [MENTO_RESERVE],
    });

    // Give reserve gas
    await hre.network.provider.send("hardhat_setBalance", [
        MENTO_RESERVE,
        "0x56BC75E2D63100000",
    ]);

    const reserve = await hre.ethers.getSigner(MENTO_RESERVE);
    const reserveBalance = await cUSD.balanceOf(MENTO_RESERVE);
    console.log("Reserve cUSD balance:", hre.ethers.formatEther(reserveBalance));

    if (reserveBalance > 0n) {
        // Transfer cUSD from reserve to test user
        const transferAmount = hre.ethers.parseEther("10000");
        const amount = reserveBalance > transferAmount ? transferAmount : reserveBalance;

        console.log("Transferring", hre.ethers.formatEther(amount), "cUSD to test user...");
        const transferTx = await cUSD.connect(reserve).transfer(testUser, amount);
        await transferTx.wait();

        const testBalance = await cUSD.balanceOf(testUser);
        console.log("✅ Test user balance:", hre.ethers.formatEther(testBalance), "cUSD");
    } else {
        console.log("⚠️  Reserve has no cUSD!");

        // Last resort: Deploy a mock cUSD for testing
        console.log("\n💡 Deploying mock cUSD for testing...");

        const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const mockCUSD = await MockERC20.deploy("Test cUSD", "cUSD");
        await mockCUSD.waitForDeployment();
        const mockAddress = await mockCUSD.getAddress();

        console.log("✅ Mock cUSD deployed:", mockAddress);

        // Mint tokens
        await mockCUSD.mint(testUser, hre.ethers.parseEther("10000"));
        console.log("✅ Minted 10,000 cUSD");

        console.log("\n⚠️  NOTE: You'll need to redeploy vault with mock cUSD address");
        console.log("Mock cUSD:", mockAddress);
        return;
    }

    // Get vault
    const vault = await hre.ethers.getContractAt("AttestifyVault", VAULT_ADDRESS);

    // Verify user
    console.log("\n🔐 Verifying user...");

    try {
        const tx = await vault.manualVerifyForTesting(testUser);
        await tx.wait();
        console.log("✅ User verified!");
    } catch (error) {
        console.log("❌ Verification failed:", error.message);
        return;
    }

    // Test deposit
    console.log("\n💸 Testing deposit...");
    const depositAmount = hre.ethers.parseEther("1000");

    console.log("Approving...");
    const approveTx = await cUSD.approve(VAULT_ADDRESS, depositAmount);
    await approveTx.wait();
    console.log("✅ Approved");

    console.log("Depositing", hre.ethers.formatEther(depositAmount), "cUSD...");
    const depositTx = await vault.deposit(depositAmount);
    const receipt = await depositTx.wait();
    console.log("✅ Deposited! Gas used:", receipt.gasUsed.toString());

    // Check balance
    const userBalance = await vault.balanceOf(testUser);
    const shares = await vault.shares(testUser);
    console.log("\n📊 Vault Status:");
    console.log("  User balance:", hre.ethers.formatEther(userBalance), "cUSD");
    console.log("  User shares:", hre.ethers.formatEther(shares));

    // Check vault stats
    const stats = await vault.getVaultStats();
    console.log("\n📈 Vault Stats:");
    console.log("  Total Assets:", hre.ethers.formatEther(stats[0]));
    console.log("  Total Shares:", hre.ethers.formatEther(stats[1]));
    console.log("  Reserve Balance:", hre.ethers.formatEther(stats[2]));
    console.log("  Aave Balance:", hre.ethers.formatEther(stats[3]));

    // Test withdrawal
    console.log("\n💵 Testing withdrawal...");
    const withdrawAmount = hre.ethers.parseEther("500");

    const withdrawTx = await vault.withdraw(withdrawAmount);
    const withdrawReceipt = await withdrawTx.wait();
    console.log("✅ Withdrawn", hre.ethers.formatEther(withdrawAmount), "cUSD");
    console.log("   Gas used:", withdrawReceipt.gasUsed.toString());

    const finalBalance = await vault.balanceOf(testUser);
    console.log("\nFinal vault balance:", hre.ethers.formatEther(finalBalance), "cUSD");

    // Check earnings
    const earnings = await vault.getEarnings(testUser);
    console.log("Total earnings:", hre.ethers.formatEther(earnings), "cUSD");

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED! 🎉");
    console.log("=".repeat(60));
}

main().catch(console.error);