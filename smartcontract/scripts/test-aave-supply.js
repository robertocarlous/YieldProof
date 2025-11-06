import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
  const ATOKEN_ADDRESS = "0x16dA4541aD1807f4443d92D26044C1147406EB80";
  
  console.log("\n🧪 Testing Aave Supply Directly");
  console.log("================================");
  
  const networkName = hre.network.name;
  const networkConfig = hre.config.networks[networkName];
  const rpcUrl = networkConfig?.url || process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found");
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "sepolia",
    chainId: 11155111,
  }, { staticNetwork: true });
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`Using account: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (Number(balance) === 0) {
    console.log("\n❌ No ETH for gas!");
    return;
  }
  
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, wallet);
  
  const usdcBalance = await usdc.balanceOf(wallet.address);
  console.log(`USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
  
  const poolAbi = [
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  ];
  const pool = new ethers.Contract(AAVE_POOL, poolAbi, wallet);
  
  const testAmount = ethers.parseUnits("10", 6); // 10 USDC
  
  console.log(`\n💰 Testing with ${ethers.formatUnits(testAmount, 6)} USDC`);
  
  try {
    console.log("\n⏳ Approving Aave Pool...");
    const approveTx = await usdc.approve(AAVE_POOL, testAmount);
    await approveTx.wait();
    console.log("✅ Approved!");
    
    console.log("\n⏳ Supplying to Aave...");
    const supplyTx = await pool.supply(USDC_ADDRESS, testAmount, wallet.address, 0, {
      gasLimit: 500000,
    });
    console.log(`  Tx Hash: ${supplyTx.hash}`);
    
    const receipt = await supplyTx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Supply successful!");
      
      const aTokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const aToken = new ethers.Contract(ATOKEN_ADDRESS, aTokenAbi, wallet);
      const aTokenBalance = await aToken.balanceOf(wallet.address);
      console.log(`  aUSDC Balance: ${ethers.formatUnits(aTokenBalance, 6)} aUSDC`);
    } else {
      console.log("❌ Supply failed!");
    }
  } catch (error) {
    console.log("\n❌ Error:", error.message);
    if (error.reason) {
      console.log(`  Reason: ${error.reason}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

