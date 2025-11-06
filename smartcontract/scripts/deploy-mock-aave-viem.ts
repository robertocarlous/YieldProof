import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { celoAlfajores } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { readContract, writeContract, waitForTransactionReceipt } from "viem";

async function main() {
  console.log("🚀 Deploying Mock Aave contracts to Celo Sepolia...");
  
  // Load private key from environment
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  
  const account = privateKeyToAccount(privateKey);
  console.log("📋 Deploying contracts with account:", account.address);
  
  // Create clients
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http("https://forno.celo-sepolia.celo-testnet.org"),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: celoAlfajores,
    transport: http("https://forno.celo-sepolia.celo-testnet.org"),
  });
  
  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 Account balance:", formatEther(balance), "CELO");
  
  if (balance === 0n) {
    console.log("❌ No CELO balance. Please fund the account first.");
    return;
  }
  
  // cUSD address on Celo Sepolia
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";
  
  // Deploy MockAavePool
  console.log("📦 Deploying MockAavePool...");
  const poolHash = await walletClient.deployContract({
    abi: [], // We'll need to get the ABI
    bytecode: "0x", // We'll need to get the bytecode
    args: [],
  });
  
  const poolReceipt = await waitForTransactionReceipt(publicClient, { hash: poolHash });
  const poolAddress = poolReceipt.contractAddress;
  console.log("✅ MockAavePool deployed to:", poolAddress);
  
  console.log("\n🎉 Deployment completed!");
  console.log("📋 MockAavePool:", poolAddress);
  console.log("📋 cUSD Token:", CUSD_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
