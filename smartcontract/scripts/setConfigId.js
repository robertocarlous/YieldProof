const hre = require("hardhat");

async function main() {
  const VAULT_ADDRESS = "0xeAf73aee69441cA68166bc0E1BE63E70F2ce2c06"; 
  const CONFIG_ID = "0x986751c577aa5cfaef6f49fa2a46fa273b04e1bf78250966b8037dccf8afd399"; 
  
  console.log("Setting config ID for vault:", VAULT_ADDRESS);
  
  const vault = await hre.ethers.getContractAt("AttestifyVault", VAULT_ADDRESS);
  const tx = await vault.setConfigId(CONFIG_ID);
  
  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  
  console.log("✅ Config ID set successfully!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});