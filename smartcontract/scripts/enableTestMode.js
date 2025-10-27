/**
 * Enable Test Mode for MockSelfProtocol
 * 
 * This script sets acceptAllProofs to true on the MockSelfProtocol contract
 * so that any proof will be accepted during testing.
 */

import hre from "hardhat";
const { ethers } = hre;

async function main() {
  // MockSelfProtocol address on Celo Alfajores
  const MOCK_SELF_PROTOCOL_ADDRESS = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";
  
  console.log("🔧 Enabling test mode for MockSelfProtocol...");
  console.log("Contract address:", MOCK_SELF_PROTOCOL_ADDRESS);
  
  // Get the contract instance
  const MockSelfProtocol = await ethers.getContractAt(
    "MockSelfProtocol",
    MOCK_SELF_PROTOCOL_ADDRESS
  );
  
  // Check current status
  const currentStatus = await MockSelfProtocol.acceptAllProofs();
  console.log("Current acceptAllProofs status:", currentStatus);
  
  if (currentStatus) {
    console.log("✅ Test mode is already enabled!");
    return;
  }
  
  // Enable acceptAllProofs
  console.log("📤 Sending transaction to enable acceptAllProofs...");
  const tx = await MockSelfProtocol.setAcceptAllProofs(true);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  // Verify the change
  const newStatus = await MockSelfProtocol.acceptAllProofs();
  console.log("New acceptAllProofs status:", newStatus);
  
  console.log("\n✅ Test mode enabled! Now the contract will accept any proof during testing.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

