import hre from "hardhat";

/**
 * Query aGHO (Aave GHO token) address from Aave Pool on Sepolia
 */
async function main() {
  console.log("🔍 Querying aGHO address from Aave Pool on Sepolia...\n");

  const GHO_ADDRESS = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

  console.log("GHO Token:", GHO_ADDRESS);
  console.log("Aave Pool:", AAVE_POOL);
  console.log("\n📡 Querying reserve data from Aave Pool...\n");

  try {
    // Check if ethers is available (should be after installing @nomicfoundation/hardhat-ethers)
    if (!hre.ethers) {
      throw new Error("hre.ethers is not available. Please ensure @nomicfoundation/hardhat-ethers is imported in hardhat.config.ts");
    }
    
    // Aave Pool ABI - getReserveData function  
    const poolABI = [
      "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"
    ];

    const pool = await hre.ethers.getContractAt(poolABI, AAVE_POOL);
    const reserveData = await pool.getReserveData(GHO_ADDRESS);
    
    console.log("✅ Successfully retrieved reserve data!\n");
    console.log("📋 Reserve Data for GHO:");
    console.log("  aToken Address:", reserveData[8]); // aTokenAddress is at index 8
    console.log("  Stable Debt Token:", reserveData[9]);
    console.log("  Variable Debt Token:", reserveData[10]);
    console.log("  Reserve ID:", reserveData[7].toString());
    
    console.log("\n✨ Use this address in deployment:");
    console.log(`   aGHO: ${reserveData[8]}`);
    
    console.log("\n🔗 Verify on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${reserveData[8]}`);

  } catch (error) {
    console.error("❌ Error querying Aave Pool:", error.message);
    
    if (error.message.includes("execution reverted") || error.message.includes("revert")) {
      console.log("\n💡 Possible reasons:");
      console.log("   1. GHO might not be listed on Sepolia Aave v3");
      console.log("   2. The Pool address might be incorrect");
      console.log("   3. Network connection issue");
      console.log("\n🔍 Try verifying:");
      console.log("   1. Check https://app.aave.com (testnet mode, Sepolia)");
      console.log("   2. Verify GHO is available as a lending asset");
      console.log("   3. Manually get the aToken address from the UI");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

