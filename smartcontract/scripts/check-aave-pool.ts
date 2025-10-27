import hre from "hardhat";

async function main() {
  console.log("🔍 Checking Aave Pool Contract on Celo Mainnet...");
  
  // Aave Pool address you provided
  const POOL_ADDRESS = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";
  
  // cUSD token address on Celo mainnet
  const CUSD_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a";
  
  try {
    // Get provider from hardhat
    const provider = hre.network.provider;
    console.log("✅ Provider connected");
    
    // Check if pool contract exists
    const poolCode = await provider.request({
      method: "eth_getCode",
      params: [POOL_ADDRESS, "latest"]
    });
    
    console.log(`📋 Pool Contract Code Length: ${poolCode.length}`);
    
    if (poolCode === "0x") {
      console.log("❌ Pool contract not found at this address");
      return;
    }
    
    console.log("✅ Pool contract found!");
    
    // Try to call getReservesList
    const reservesListCall = {
      to: POOL_ADDRESS,
      data: "0x35ea6a75" // getReservesList() function selector
    };
    
    try {
      const reservesResult = await provider.request({
        method: "eth_call",
        params: [reservesListCall, "latest"]
      });
      
      console.log("✅ getReservesList() call successful");
      console.log(`📋 Reserves result: ${reservesResult}`);
      
    } catch (error) {
      console.log("❌ getReservesList() call failed:", error.message);
    }
    
    // Try to call getReserveData for cUSD
    const getReserveDataCall = {
      to: POOL_ADDRESS,
      data: "0x35ea6a75" + CUSD_ADDRESS.slice(2).padStart(64, '0') // getReserveData(cUSD)
    };
    
    try {
      const reserveDataResult = await provider.request({
        method: "eth_call",
        params: [getReserveDataCall, "latest"]
      });
      
      console.log("✅ getReserveData(cUSD) call successful");
      console.log(`📋 Reserve data result: ${reserveDataResult}`);
      
    } catch (error) {
      console.log("❌ getReserveData(cUSD) call failed:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error checking pool:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});