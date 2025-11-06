import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

/**
 * Deploy AttestifyAaveVault to Ethereum Sepolia Testnet with USDC
 * Uses real Aave v3 contracts deployed on Sepolia
 * 
 * NOTE: Update USDC and aUSDC addresses after verifying them on Aave app
 */
async function main() {
  console.log("🚀 Deploying AttestifyAaveVault to Ethereum Sepolia with USDC\n");

  // Get RPC URL from hardhat config
  const networkName = hre.network.name;
  const networkConfig = hre.config.networks[networkName];
  const rpcUrl = networkConfig?.url || process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";
  
  console.log(`Using RPC URL: ${rpcUrl}`);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables. Please set it in .env file");
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "sepolia",
    chainId: 11155111,
  }, { staticNetwork: true });
  const deployer = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying with account:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Aave v3 addresses on Ethereum Sepolia
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool on Sepolia
  
  // Using USDC on Sepolia - all addresses confirmed
  const ASSET_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // USDC on Sepolia
  const ATOKEN_ADDRESS = "0x16dA4541aD1807f4443d92D26044C1147406EB80"; // aEthUSDC on Sepolia

  console.log("📝 Using Aave v3 on Ethereum Sepolia:");
  console.log("  Aave Pool:", AAVE_POOL);
  console.log("  USDC Token:", ASSET_ADDRESS);
  console.log("  aUSDC Token:", ATOKEN_ADDRESS);
  console.log("  View on Etherscan:");
  console.log("    Pool: https://sepolia.etherscan.io/address/" + AAVE_POOL);
  console.log("    USDC: https://sepolia.etherscan.io/address/" + ASSET_ADDRESS);
  console.log("    aUSDC: https://sepolia.etherscan.io/address/" + ATOKEN_ADDRESS);

  // Deploy vault
  console.log("\n🚀 Deploying AttestifyAaveVault...");
  
  // Read contract artifact
  const artifact = await hre.artifacts.readArtifact("AttestifyAaveVault");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  
  const vault = await factory.deploy(
    ASSET_ADDRESS,   // asset (USDC on Sepolia)
    ATOKEN_ADDRESS,  // aToken (aUSDC)
    AAVE_POOL        // aavePool
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.target;
  console.log("\n✅ AttestifyAaveVault deployed successfully!");
  console.log("📄 Contract Address:", vaultAddress);
  console.log("🔗 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${vaultAddress}`);

  // Deployment Summary
  const deploymentSummary = {
    network: "sepolia",
    asset: "USDC",
    vault: vaultAddress,
    assetAddress: ASSET_ADDRESS,
    aTokenAddress: ATOKEN_ADDRESS,
    aavePool: AAVE_POOL,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("💾 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentSummary, null, 2));
  console.log("=".repeat(60) + "\n");
  
  console.log("✨ Benefits of using USDC:");
  console.log("  - Users deposit stablecoins (no price volatility)");
  console.log("  - Earn yield in stablecoins (predictable returns)");
  console.log("  - Better user experience");
  console.log("  - Industry standard for yield vaults");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

