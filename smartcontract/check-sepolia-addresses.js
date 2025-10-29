import hre from "hardhat";
import { ethers } from "hardhat";

async function check() {
  console.log("Checking addresses on Sepolia...\n");
  
  const ASSET = "0xfFf9976782d46CC05690D9e90473641edce96502";
  const ATOKEN = "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8";
  const POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
  
  try {
    const [signer] = await ethers.getSigners();
    const provider = signer.provider;
    
    const assetCode = await provider.getCode(ASSET);
    console.log("WETH:", assetCode !== "0x" ? "✅ EXISTS" : "❌ NOT FOUND");
    
    const aTokenCode = await provider.getCode(ATOKEN);
    console.log("aWETH:", aTokenCode !== "0x" ? "✅ EXISTS" : "❌ NOT FOUND");
    
    const poolCode = await provider.getCode(POOL);
    console.log("Pool:", poolCode !== "0x" ? "✅ EXISTS" : "❌ NOT FOUND");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

check().catch(console.error);
