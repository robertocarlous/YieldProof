import hre from "hardhat";

/**
 * Discover Aave v3 addresses on Ethereum Sepolia testnet
 */
async function main() {
  console.log("🔍 Discovering Aave v3 addresses on Ethereum Sepolia...\n");

  // These are the commonly known Aave v3 Pool Addresses Provider addresses
  // Verify against: https://docs.aave.com/developers/deployed-contracts/v3-sepolia-ethereum
  const KNOWN_POOLS = [
    "0x012bAC54348C0E635dCAc19D17EFD3D57a2C12C9", // Common Aave v3 Sepolia Pool
    "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Pool V3 address
  ];

  for (const poolAddress of KNOWN_POOLS) {
    try {
      const code = await hre.ethers.provider.getCode(poolAddress);
      if (code !== "0x") {
        console.log("✅ Found Aave Pool:", poolAddress);
        
        // Try to get USDC addresses
        const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Common Sepolia USDC
        const USDC_CODE = await hre.ethers.provider.getCode(USDC_ADDRESS);
        console.log("  USDC token:", USDC_ADDRESS, USDC_CODE !== "0x" ? "✅" : "❌");
      }
    } catch (error) {
      console.log("  ❌ Failed:", poolAddress);
    }
  }

  console.log("\n📝 Common Sepolia addresses to verify:");
  console.log("Pool V3: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951");
  console.log("USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238");
  console.log("aUSDC: (check Pool for aToken address)");
  console.log("\n💡 Tip: Check https://docs.aave.com/developers/deployed-contracts/v3-sepolia-ethereum");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

