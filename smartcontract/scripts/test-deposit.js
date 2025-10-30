import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  const VAULT_ADDRESS = "0x4ce1c053082208874195cF322FD142842024edeF";
  const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
  const DEPOSIT_AMOUNT_USDC = "100"; // 100 USDC
  
  console.log("\n🧪 Testing Vault Deposit");
  console.log("========================");
  console.log(`Vault: ${VAULT_ADDRESS}`);
  console.log(`USDC: ${USDC_ADDRESS}`);
  console.log(`Amount: ${DEPOSIT_AMOUNT_USDC} USDC\n`);
  
  // Get RPC URL and create wallet
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
  
  // Check ETH balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (Number(balance) === 0) {
    console.log("\n❌ No ETH for gas!");
    return;
  }
  
  // Get USDC token contract using ethers
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, wallet);
  
  // Check USDC balance
  const usdcBalance = await usdc.balanceOf(wallet.address);
  console.log(`USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
  
  // Convert USDC amount to vault decimals (18) by multiplying by 1e12
  const usdcAmount = ethers.parseUnits(DEPOSIT_AMOUNT_USDC, 6); // 100 USDC in 6 decimals
  const vaultAmount = usdcAmount * BigInt(1e12); // Scale to 18 decimals
  
  console.log(`\n💰 Amount Details:`);
  console.log(`  USDC amount (6 decimals): ${usdcAmount.toString()}`);
  console.log(`  Vault amount (18 decimals): ${vaultAmount.toString()}`);
  
  if (usdcBalance < usdcAmount) {
    console.log("\n❌ Insufficient USDC balance!");
    return;
  }
  
  // Get vault contract using ethers
  const artifact = await hre.artifacts.readArtifact("AttestifyAaveVault");
  const vault = new ethers.Contract(VAULT_ADDRESS, artifact.abi, wallet);
  
  // Check vault state
  try {
    const minDeposit = await vault.MIN_DEPOSIT();
    console.log(`\n📊 Vault State:`);
    console.log(`  Min Deposit: ${ethers.formatEther(minDeposit)} USDC (18 decimals)`);
    
    const isPaused = await vault.paused();
    console.log(`  Paused: ${isPaused}`);
    
    if (isPaused) {
      console.log("\n❌ Vault is paused!");
      return;
    }
    
    const isVerified = await vault.isVerified(wallet.address);
    console.log(`  Is Verified: ${isVerified}`);
    
    // Check total assets (in 18 decimals, scaled from 6 decimals)
    const totalAssets = await vault.totalAssets();
    console.log(`  Total Assets: ${ethers.formatEther(totalAssets)} USDC (18 decimals)`);
    console.log(`  Total Assets: ${ethers.formatUnits(totalAssets / BigInt(1e12), 6)} USDC (actual)`);
    
    // Test previewDeposit
    try {
      const sharesPreview = await vault.previewDeposit(vaultAmount);
      console.log(`  Preview shares for ${DEPOSIT_AMOUNT_USDC} USDC: ${ethers.formatEther(sharesPreview)} shares`);
    } catch (error) {
      console.log(`  ⚠️  Preview deposit error: ${error.message}`);
    }
  } catch (error) {
    console.log("⚠️  Could not read vault state:", error.message);
  }
  
  // Check allowance
  const allowance = await usdc.allowance(wallet.address, VAULT_ADDRESS);
  console.log(`\n🔐 Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
  
  if (allowance < usdcAmount) {
    console.log("\n⏳ Approving...");
    const approveTx = await usdc.approve(VAULT_ADDRESS, usdcAmount);
    console.log(`  Tx Hash: ${approveTx.hash}`);
    console.log(`  Waiting for confirmation...`);
    await approveTx.wait();
    console.log("✅ Approved!");
  }
  
  // Try to deposit
  console.log("\n💰 Attempting deposit...");
  console.log(`  Amount: ${DEPOSIT_AMOUNT_USDC} USDC`);
  console.log(`  Receiver: ${wallet.address}`);
  
  try {
    const depositTx = await vault.deposit(vaultAmount, wallet.address, {
      gasLimit: 1000000,
    });
    console.log(`  Tx Hash: ${depositTx.hash}`);
    
    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await depositTx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Deposit successful!");
      
      // Check vault shares
      const shares = await vault.balanceOf(wallet.address);
      console.log(`  Shares received: ${ethers.formatEther(shares)} (in 18 decimals)`);
      
      // Check vault USDC balance
      const vaultBalance = await usdc.balanceOf(VAULT_ADDRESS);
      console.log(`  Vault USDC balance: ${ethers.formatUnits(vaultBalance, 6)} USDC`);
      
      // Check vault aToken balance
      const aTokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const aToken = new ethers.Contract("0x16dA4541aD1807f4443d92D26044C1147406EB80", aTokenAbi, wallet);
      const aTokenBalance = await aToken.balanceOf(VAULT_ADDRESS);
      console.log(`  Vault aUSDC balance: ${ethers.formatUnits(aTokenBalance, 6)} aUSDC`);
      
      console.log(`\n🔗 Transaction: https://sepolia.etherscan.io/tx/${depositTx.hash}`);
      console.log(`🔗 Vault: https://sepolia.etherscan.io/address/${VAULT_ADDRESS}`);
    } else {
      console.log("❌ Deposit failed!");
    }
  } catch (error) {
    console.log("\n❌ Deposit error:");
    console.log(`  ${error.message}`);
    
    // Try to get revert reason
    if (error.error && error.error.data) {
      console.log(`\n  Revert data: ${error.error.data}`);
    }
    
    // Check if it's a revert with reason
    if (error.reason) {
      console.log(`  Reason: ${error.reason}`);
    }
    
    // Parse revert reason from data
    if (error.data) {
      try {
        const parsedError = vault.interface.parseError(error.data);
        console.log(`  Parsed error: ${parsedError.name}`);
        console.log(`  Error args: ${JSON.stringify(parsedError.args)}`);
      } catch (e) {
        console.log(`  Could not parse error data: ${e.message}`);
      }
    }
    
    // Try to decode from receipt if available
    if (error.receipt) {
      console.log(`\n  Receipt status: ${error.receipt.status}`);
      console.log(`  Gas used: ${error.receipt.gasUsed}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
