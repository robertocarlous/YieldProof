import hre from "hardhat";

async function main() {
    console.log("🔍 Extracting Aave V3 Addresses from aToken\n");

    // The aToken you found
    const ATOKEN_ADDRESS = "0xff8309b9e99bfd2d4021bc71a362abd93dbd4785";

    const aTokenAbi = [
        "function POOL() external view returns (address)",
        "function UNDERLYING_ASSET_ADDRESS() external view returns (address)",
        "function name() external view returns (string)",
        "function symbol() external view returns (string)",
    ];

    const aToken = new hre.ethers.Contract(
        ATOKEN_ADDRESS,
        aTokenAbi,
        hre.ethers.provider
    );

    try {
        const pool = await aToken.POOL();
        const underlying = await aToken.UNDERLYING_ASSET_ADDRESS();
        const name = await aToken.name();
        const symbol = await aToken.symbol();

        console.log("✅ Found aToken Info:");
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Underlying: ${underlying}`);
        console.log(`   Pool: ${pool}`);

        // Now get cUSD aToken from the Pool
        const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

        console.log("\n🔍 Getting cUSD aToken from Pool...");

        const poolAbi = [
            "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
        ];

        const poolContract = new hre.ethers.Contract(pool, poolAbi, hre.ethers.provider);
        const reserveData = await poolContract.getReserveData(CUSD_ADDRESS);

        const acUSDAddress = reserveData.aTokenAddress;

        console.log("✅ cUSD Reserve Data:");
        console.log(`   acUSD (aToken): ${acUSDAddress}`);

        // Verify it
        const acUSD = new hre.ethers.Contract(acUSDAddress, aTokenAbi, hre.ethers.provider);
        const acUSDName = await acUSD.name();
        const acUSDSymbol = await acUSD.symbol();

        console.log(`   Name: ${acUSDName}`);
        console.log(`   Symbol: ${acUSDSymbol}`);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 REAL AAVE V3 ADDRESSES ON CELO MAINNET");
        console.log("=".repeat(60));
        console.log("\n📋 Copy these for your deployment:\n");
        console.log(`const CUSD_ADDRESS = "${CUSD_ADDRESS}";`);
        console.log(`const ACUSD_ADDRESS = "${acUSDAddress}";`);
        console.log(`const AAVE_POOL = "${pool}";`);
        console.log(`const SELF_PROTOCOL = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";`);

        console.log("\n✅ Now you can deploy with REAL Aave contracts!");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("\nTrying alternative method...");

        // Alternative: Check the other address from Aave app
        const USDC_UNDERLYING = "0xceba9300f2b948710d2653dd7b07f33a8b32118c";
        console.log("\nThis seems to be USDC, not cUSD");
        console.log("Let's search for cUSD aToken on CeloScan");
    }
}

main().catch(console.error);