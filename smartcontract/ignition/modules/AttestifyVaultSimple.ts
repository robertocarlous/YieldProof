import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AttestifyVaultSimpleModule = buildModule("AttestifyVaultSimpleModule", (m) => {
  // Contract addresses on Celo Sepolia
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b";

  // Deploy AttestifyVaultSimple with simplified constructor (no Aave)
  const vault = m.contract("AttestifyVaultSimple", [
    CUSD_ADDRESS,
  ]);

  return { vault };
});

export default AttestifyVaultSimpleModule;
