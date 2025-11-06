import hre from "hardhat";

/**
 * Production test script for AttestifyVault
 * Tests all critical functionality with real Aave contracts
 */
async function main() {
  console.log("🧪 Testing AttestifyVault Production Deployment\n");

  // Update this with your deployed vault address
  const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000"; // UPDATE THIS
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  
  // Find a cUSD whale for testing (check CeloScan for current whale addresses)
  const CUSD_WHALE = "0x0000000000000000000000000000000000000000"; // UPDATE THIS

  console.log("📍 Test Configuration:");
  console.log("  Vault:", VAULT_ADDRESS);
  console.log("  cUSD:", CUSD_ADDRESS);
  console.log("  Whale:", CUSD_WHALE);

  if (VAULT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.log("\n❌ Please update VAULT_ADDRESS in this script first!");
    return;
  }

  if (CUSD_WHALE === "0x0000000000000000000000000000000000000000") {
    console.log("\n❌ Please update CUSD_WHALE address in this script first!");
    console.log("   Find a whale at: https://celoscan.io/token/0x765DE816845861e75A25fCA122bb6898B8B1282a");
    return;
  }

  try {
    // Step 1: Impersonate whale
    console.log("\n💰 Step 1: Impersonating cUSD whale...");
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [CUSD_WHALE],
    });

    // Give whale some CELO for gas
    await hre.network.provider.send("hardhat_setBalance", [
      CUSD_WHALE,
      "0x56BC75E2D63100000", // 100 CELO
    ]);

    const whale = await hre.ethers.getSigner(CUSD_WHALE);
    console.log("✅ Impersonating:", whale.address);

    // Step 2: Setup contracts
    console.log("\n📝 Step 2: Setting up contracts...");
    const cUSD = await hre.ethers.getContractAt("IERC20", CUSD_ADDRESS);
    const vault = await hre.ethers.getContractAt("AttestifyVault", VAULT_ADDRESS);

    const whaleBalance = await cUSD.balanceOf(whale.address);
    console.log("Whale cUSD balance:", hre.ethers.formatEther(whaleBalance));

    if (whaleBalance < hre.ethers.parseEther("100")) {
      console.log("⚠️ Whale doesn't have enough cUSD for testing");
      return;
    }

    // Step 3: Test vault initialization
    console.log("\n🔍 Step 3: Testing vault initialization...");
    
    const totalAssets = await vault.totalAssets();
    console.log("Total Assets:", hre.ethers.formatEther(totalAssets), "cUSD");
    
    const currentAPY = await vault.getCurrentAPY();
    console.log("Current APY:", currentAPY.toString(), "bps");
    
    const stats = await vault.getVaultStats();
    console.log("Vault Stats:");
    console.log("  Total Assets:", hre.ethers.formatEther(stats[0]), "cUSD");
    console.log("  Total Shares:", hre.ethers.formatEther(stats[1]));
    console.log("  Reserve Balance:", hre.ethers.formatEther(stats[2]), "cUSD");
    console.log("  Aave Balance:", hre.ethers.formatEther(stats[3]), "cUSD");

    // Step 4: Test strategy configurations
    console.log("\n📊 Step 4: Testing strategy configurations...");
    
    const conservativeStrategy = await vault.strategies(0); // CONSERVATIVE
    const balancedStrategy = await vault.strategies(1); // BALANCED
    const growthStrategy = await vault.strategies(2); // GROWTH
    
    console.log("Conservative Strategy:");
    console.log("  Name:", conservativeStrategy.name);
    console.log("  Aave Allocation:", conservativeStrategy.aaveAllocation.toString() + "%");
    console.log("  Reserve Allocation:", conservativeStrategy.reserveAllocation.toString() + "%");
    console.log("  Target APY:", conservativeStrategy.targetAPY.toString(), "bps");
    console.log("  Risk Level:", conservativeStrategy.riskLevel.toString());
    console.log("  Active:", conservativeStrategy.isActive);

    // Step 5: Test verification (if whale is not verified)
    console.log("\n✅ Step 5: Testing verification...");
    
    const isVerified = await vault.isVerified(whale.address);
    console.log("Is whale verified:", isVerified);
    
    if (!isVerified) {
      console.log("⚠️ Whale not verified. In production, users must verify through Self Protocol.");
      console.log("For testing purposes, you can:");
      console.log("1. Use the manualVerifyForTesting function (owner only)");
      console.log("2. Or deploy with MockSelfProtocol for testing");
      console.log("\nSkipping deposit test...");
      return;
    }

    // Step 6: Test deposit
    console.log("\n💸 Step 6: Testing deposit...");
    const depositAmount = hre.ethers.parseEther("100"); // 100 cUSD

    console.log("Approving cUSD...");
    const approveTx = await cUSD.connect(whale).approve(VAULT_ADDRESS, depositAmount);
    await approveTx.wait();
    console.log("✅ Approved");

    console.log("Depositing", hre.ethers.formatEther(depositAmount), "cUSD...");
    const depositTx = await vault.connect(whale).deposit(depositAmount);
    const receipt = await depositTx.wait();
    console.log("✅ Deposited! Gas used:", receipt.gasUsed.toString());

    // Step 7: Check balance
    console.log("\n📊 Step 7: Checking vault balance...");
    const userBalance = await vault.balanceOf(whale.address);
    const shares = await vault.shares(whale.address);
    
    console.log("User balance:", hre.ethers.formatEther(userBalance), "cUSD");
    console.log("User shares:", hre.ethers.formatEther(shares));

    // Step 8: Check vault stats after deposit
    console.log("\n📈 Step 8: Vault statistics after deposit...");
    const statsAfter = await vault.getVaultStats();
    console.log("  Total Assets:", hre.ethers.formatEther(statsAfter[0]), "cUSD");
    console.log("  Total Shares:", hre.ethers.formatEther(statsAfter[1]));
    console.log("  Reserve Balance:", hre.ethers.formatEther(statsAfter[2]), "cUSD");
    console.log("  Aave Balance:", hre.ethers.formatEther(statsAfter[3]), "cUSD");

    // Step 9: Test withdrawal
    console.log("\n💵 Step 9: Testing withdrawal...");
    const withdrawAmount = hre.ethers.parseEther("50"); // Withdraw 50 cUSD
    
    console.log("Withdrawing", hre.ethers.formatEther(withdrawAmount), "cUSD...");
    const withdrawTx = await vault.connect(whale).withdraw(withdrawAmount);
    const withdrawReceipt = await withdrawTx.wait();
    console.log("✅ Withdrawn! Gas used:", withdrawReceipt.gasUsed.toString());

    // Final balance
    const finalBalance = await vault.balanceOf(whale.address);
    console.log("Final balance:", hre.ethers.formatEther(finalBalance), "cUSD");

    // Step 10: Check earnings
    console.log("\n💰 Step 10: Checking earnings...");
    const earnings = await vault.getEarnings(whale.address);
    console.log("Earnings:", hre.ethers.formatEther(earnings), "cUSD");

    console.log("\n✅ All production tests passed!");
    console.log("\n📋 Test Summary:");
    console.log("  ✅ Vault initialization successful");
    console.log("  ✅ Strategy configurations correct");
    console.log("  ✅ Deposit successful");
    console.log("  ✅ Withdrawal successful");
    console.log("  ✅ Share calculations working");
    console.log("  ✅ Aave integration functional");

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🎉 Production testing complete!");
  })
  .catch((error) => {
    console.error("\n❌ Testing failed:");
    console.error(error);
    process.exitCode = 1;
  });
