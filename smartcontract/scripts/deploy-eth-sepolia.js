import hre from "hardhat";
import { ethers } from "ethers";
import "dotenv/config";

/**
 * Deploy AttestifyAaveVault to Ethereum Sepolia Testnet
 * Uses real Aave v3 contracts deployed on Sepolia
 */
async function main() {
  console.log("🚀 Deploying AttestifyAaveVault to Ethereum Sepolia\n");

  // Get RPC URL and private key from config or env
  // Use public Sepolia RPC URL as fallback
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io";
  
  console.log(`Using RPC URL: ${rpcUrl}`);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables. Please set it in .env file");
  }

  // Create provider and wallet
  // Skip automatic network detection to avoid batch calls
  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "sepolia",
    chainId: 11155111,
  }, { staticNetwork: true });
  const deployer = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying with account:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Aave v3 addresses on Ethereum Sepolia
  // Official Pool address from Aave docs
  // Source: https://docs.aave.com/developers/deployed-contracts/v3-sepolia-ethereum
  
  const AAVE_POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool on Sepolia (from Aave docs)
  
  // Using AAVE token on Sepolia - all addresses confirmed
  const ASSET_ADDRESS = "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a"; // AAVE token on Sepolia
  const ATOKEN_ADDRESS = "0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259"; // aEthAAVE on Sepolia

  console.log("📝 Using Aave v3 on Ethereum Sepolia:");
  console.log("  Aave Pool:", AAVE_POOL);
  console.log("  AAVE Token:", ASSET_ADDRESS);
  console.log("  aEthAAVE Token:", ATOKEN_ADDRESS);
  console.log("  View on Etherscan:");
  console.log("    Pool: https://sepolia.etherscan.io/address/" + AAVE_POOL);
  console.log("    AAVE: https://sepolia.etherscan.io/address/" + ASSET_ADDRESS);
  console.log("    aEthAAVE: https://sepolia.etherscan.io/address/" + ATOKEN_ADDRESS);

  // Deploy vault
  console.log("\n🚀 Deploying AttestifyAaveVault...");
  
  // Read contract artifact
  const artifact = await hre.artifacts.readArtifact("AttestifyAaveVault");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  
  const vault = await factory.deploy(
    ASSET_ADDRESS,   // asset (AAVE on Sepolia)
    ATOKEN_ADDRESS,  // aToken (aEthAAVE)
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
    vault: vaultAddress,
    asset: ASSET_ADDRESS,
    aToken: ATOKEN_ADDRESS,
    aavePool: AAVE_POOL,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("💾 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentSummary, null, 2));
  console.log("=".repeat(60) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

