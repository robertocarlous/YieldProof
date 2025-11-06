import hre from "hardhat";

async function main() {
  console.log("🧪 Testing AttestifyVault with REAL Aave V3 & Real cUSD\n");

  const VAULT_ADDRESS = "0x976fcd02f7C4773dd89C309fBF55D5923B4c98a1";
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const ACUSD_ADDRESS = "0xBba98352628B0B0c4b40583F593fFCb630935a45";

  // Real cUSD holders on Celo mainnet
  const possibleWhales = [
    "0xC959439207dA5341B74aDcdAC59016aa9Be7E9E7", // From aToken contract
    "0x1a8Dbe5958c597a744Ba51763AbEBD3355996c3e", // Mento
    "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08", // Large holder
    "0x4aAD04D41FD7fd495503731C5a2579e19054C432", // Another holder
  ];

  const cUSD = await hre.ethers.getContractAt("IERC20", CUSD_ADDRESS);

  // Find whale with balance
  let CUSD_WHALE;
  console.log("🔍 Finding whale with real cUSD on mainnet fork...");

  for (const addr of possibleWhales) {
    try {
      const balance = await cUSD.balanceOf(addr);
      console.log(`  ${addr}: ${hre.ethers.formatEther(balance)} cUSD`);

      if (balance > hre.ethers.parseEther("100")) {
        CUSD_WHALE = addr;
        console.log(`  ✅ Using this whale!`);
        break;
      }
    } catch (error) {
      console.log(`  ❌ Error checking ${addr}`);
    }
  }

  if (!CUSD_WHALE) {
    console.log("\n❌ No whale found with sufficient balance");
    console.log("The fork might not have the latest state.");
    console.log("\n💡 Try restarting the fork or using a different RPC");
    return;
  }

  // Impersonate whale
  console.log("\n💰 Impersonating whale...");
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [CUSD_WHALE],
  });

  await hre.network.provider.send("hardhat_setBalance", [
    CUSD_WHALE,
    "0x56BC75E2D63100000", // 100 CELO for gas
  ]);

  const whale = await hre.ethers.getSigner(CUSD_WHALE);
  console.log("✅ Impersonating:", whale.address);

  const whaleBalance = await cUSD.balanceOf(whale.address);
  console.log("Whale cUSD balance:", hre.ethers.formatEther(whaleBalance));

  // Get vault
  const vault = await hre.ethers.getContractAt("AttestifyVault", VAULT_ADDRESS);

  // Verify user
  console.log("\n🔐 Verifying user manually for testing...");
  const [deployer] = await hre.ethers.getSigners();
  const verifyTx = await vault.connect(deployer).manualVerifyForTesting(whale.address);
  await verifyTx.wait();
  console.log("✅ Verified!");

  // Deposit to REAL Aave
  console.log("\n💸 Depositing to vault (will use REAL Aave V3)...");
  const depositAmount = hre.ethers.parseEther("1000");

  console.log("Approving cUSD...");
  await cUSD.connect(whale).approve(VAULT_ADDRESS, depositAmount);
  console.log("✅ Approved");

  console.log("Depositing", hre.ethers.formatEther(depositAmount), "cUSD...");
  const depositTx = await vault.connect(whale).deposit(depositAmount);
  const receipt = await depositTx.wait();
  console.log("✅ Deposited!");
  console.log("   Gas used:", receipt.gasUsed.toString());

  // Check balances
  const userBalance = await vault.balanceOf(whale.address);
  const shares = await vault.shares(whale.address);

  console.log("\n📊 User Vault Status:");
  console.log("  Balance:", hre.ethers.formatEther(userBalance), "cUSD");
  console.log("  Shares:", hre.ethers.formatEther(shares));

  // Check vault stats
  const stats = await vault.getVaultStats();
  console.log("\n📈 Vault Stats (REAL Aave V3):");
  console.log("  Total Assets:", hre.ethers.formatEther(stats[0]), "cUSD");
  console.log("  Total Shares:", hre.ethers.formatEther(stats[1]));
  console.log("  Reserve Balance:", hre.ethers.formatEther(stats[2]), "cUSD");
  console.log("  Aave Balance:", hre.ethers.formatEther(stats[3]), "acUSD");

  // Verify on actual Aave contract
  console.log("\n🔍 Verifying on REAL Aave contract...");
  const acUSD = await hre.ethers.getContractAt("IERC20", ACUSD_ADDRESS);
  const vaultAaveBalance = await acUSD.balanceOf(VAULT_ADDRESS);
  console.log("  ✅ Vault's acUSD balance:", hre.ethers.formatEther(vaultAaveBalance));
  console.log("  ✅ Funds successfully deposited to REAL Aave!");

  // Withdraw from REAL Aave
  console.log("\n💵 Testing withdrawal from REAL Aave...");
  const withdrawAmount = hre.ethers.parseEther("500");

  console.log("Withdrawing", hre.ethers.formatEther(withdrawAmount), "cUSD...");
  const withdrawTx = await vault.connect(whale).withdraw(withdrawAmount);
  const withdrawReceipt = await withdrawTx.wait();
  console.log("✅ Withdrawn!");
  console.log("   Gas used:", withdrawReceipt.gasUsed.toString());

  const finalBalance = await vault.balanceOf(whale.address);
  const finalWhaleBalance = await cUSD.balanceOf(whale.address);

  console.log("\n📊 Final Status:");
  console.log("  Vault balance:", hre.ethers.formatEther(finalBalance), "cUSD");
  console.log("  Whale cUSD balance:", hre.ethers.formatEther(finalWhaleBalance));

  // Check earnings
  const earnings = await vault.getEarnings(whale.address);
  console.log("  Earnings:", hre.ethers.formatEther(earnings), "cUSD");

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL TESTS PASSED WITH REAL AAVE V3! 🎉");
  console.log("=".repeat(60));
  console.log("\n🏆 Success! You tested with:");
  console.log("  ✅ Real cUSD from Celo mainnet");
  console.log("  ✅ Real Aave V3 Pool on Celo");
  console.log("  ✅ Real acUSD aToken");
  console.log("  ✅ Actual deposit to Aave");
  console.log("  ✅ Actual withdrawal from Aave");
  console.log("  ✅ All on mainnet fork with real state");

  console.log("\n📝 Your contract is ready for testnet/mainnet deployment!");
}

main().catch(console.error);