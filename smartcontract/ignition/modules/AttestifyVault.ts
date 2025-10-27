import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UpdatedAttestifyVaultModule = buildModule("UpdatedAttestifyVaultModule", (m) => {
  // Contract addresses on Celo Sepolia (for testing with mock Aave)
  const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b"; // cUSD on Celo Sepolia
  
  // Deploy MockAavePool first
  const mockPool = m.contract("MockAavePool", []);
  
  // Deploy MockAToken (aCUSD)
  const mockAToken = m.contract("MockAToken", [
    CUSD_ADDRESS, // underlying asset
    mockPool, // pool address
    "Aave Celo USD", // name
    "aCUSD" // symbol
  ]);

  // Deploy AttestifyVault with mock contracts
  const vault = m.contract("AttestifyVault", [
    CUSD_ADDRESS,
    mockAToken, // mock aCUSD
    mockPool, // mock Aave Pool
  ]);

  return { vault, mockPool, mockAToken };
});

export default UpdatedAttestifyVaultModule;
