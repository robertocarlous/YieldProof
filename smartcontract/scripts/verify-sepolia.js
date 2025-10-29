import hre from "hardhat";

/**
 * Verify AttestifyAaveVault contract on Etherscan Sepolia
 */
async function main() {
  console.log("🔍 Verifying AttestifyAaveVault on Etherscan Sepolia...\n");

  const VAULT_ADDRESS = "0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0";
  
  // Constructor arguments
  const ASSET_ADDRESS = "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a"; // AAVE token
  const ATOKEN_ADDRESS = "0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259"; // aEthAAVE
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool

  console.log("📝 Contract Details:");
  console.log("  Address:", VAULT_ADDRESS);
  console.log("  Network: Sepolia");
  console.log("  Constructor Args:");
  console.log("    Asset (AAVE):", ASSET_ADDRESS);
  console.log("    aToken (aEthAAVE):", ATOKEN_ADDRESS);
  console.log("    Aave Pool:", AAVE_POOL);
  console.log("\n⏳ Verifying...\n");

  try {
    // Wait a bit to ensure contract is indexed
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await hre.run("verify:verify", {
      address: VAULT_ADDRESS,
      constructorArguments: [
        ASSET_ADDRESS,
        ATOKEN_ADDRESS,
        AAVE_POOL,
      ],
    });

    console.log("\n✅ Contract verified successfully!");
    console.log("🔗 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${VAULT_ADDRESS}#code`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified on Etherscan!");
      console.log("🔗 View on Etherscan:");
      console.log(`   https://sepolia.etherscan.io/address/${VAULT_ADDRESS}#code`);
    } else {
      console.error("\n❌ Verification failed:", error.message);
      console.log("\n💡 Alternative: Manual verification");
      console.log("   1. Go to: https://sepolia.etherscan.io/address/" + VAULT_ADDRESS);
      console.log("   2. Click 'Contract' tab, then 'Verify and Publish'");
      console.log("   3. Use compiler version: 0.8.28");
      console.log("   4. Use optimization: 200 runs");
      console.log("   5. Constructor arguments (ABI encoded):");
      console.log(`      Asset: ${ASSET_ADDRESS}`);
      console.log(`      aToken: ${ATOKEN_ADDRESS}`);
      console.log(`      Aave Pool: ${AAVE_POOL}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

