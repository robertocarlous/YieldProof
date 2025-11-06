import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

/**
 * Query aUSDC (Aave USDC token) address from Aave Pool on Sepolia
 */
async function main() {
  console.log("🔍 Querying aUSDC address from Aave Pool on Sepolia...\n");

  // USDC address on Sepolia - confirmed from Etherscan
  const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // USDC on Sepolia
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

  console.log("USDC Token:", USDC_ADDRESS);
  console.log("Aave Pool:", AAVE_POOL);
  console.log("\n📡 Querying reserve data from Aave Pool...\n");

  try {
    // Get RPC URL and private key
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";
    const provider = new ethers.JsonRpcProvider(rpcUrl, {
      name: "sepolia",
      chainId: 11155111,
    }, { staticNetwork: true });
    
    // Aave Pool ABI - getReserveData function
    const poolABI = [
      "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"
    ];

    const pool = new ethers.Contract(AAVE_POOL, poolABI, provider);
    const reserveData = await pool.getReserveData(USDC_ADDRESS);
    
    console.log("✅ Successfully retrieved reserve data!\n");
    console.log("📋 Reserve Data for USDC:");
    console.log("  aToken Address (aUSDC):", reserveData[8]);
    console.log("  Stable Debt Token:", reserveData[9]);
    console.log("  Variable Debt Token:", reserveData[10]);
    console.log("  Reserve ID:", reserveData[7].toString());
    console.log("  Current Liquidity Rate:", reserveData[2].toString(), "(basis points)");
    
    const apy = Number(reserveData[2]) / 100; // Convert to percentage
    console.log("  Estimated APY:", apy.toFixed(2) + "%\n");
    
    console.log("✨ Use these addresses for USDC deployment:");
    console.log(`   USDC: ${USDC_ADDRESS}`);
    console.log(`   aUSDC: ${reserveData[8]}`);
    console.log(`   Aave Pool: ${AAVE_POOL}`);
    
    console.log("\n🔗 Verify on Etherscan:");
    console.log(`   USDC: https://sepolia.etherscan.io/address/${USDC_ADDRESS}`);
    console.log(`   aUSDC: https://sepolia.etherscan.io/address/${reserveData[8]}`);

  } catch (error) {
    console.error("❌ Error querying Aave Pool:", error.message);
    
    if (error.message.includes("execution reverted") || error.message.includes("revert")) {
      console.log("\n💡 Possible reasons:");
      console.log("   1. USDC might not be listed on Sepolia Aave v3");
      console.log("   2. The Pool address might be incorrect");
      console.log("   3. Network connection issue");
      console.log("\n🔍 Try verifying:");
      console.log("   1. Check https://app.aave.com (testnet mode, Sepolia)");
      console.log("   2. Verify USDC is available as a lending asset");
      console.log("   3. Manually get the aToken address from the UI");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

