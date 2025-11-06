// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVault} from "../contracts/AttestifyVault.sol";
import {AttestifyVaultWrapper} from "../contracts/AttestifyVaultWrapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployAttestifyWrapper
 * @notice Deployment script for the complete Attestify system (Base Vault + Wrapper)
 * @dev Deploys both the base ERC-4626 vault and the wrapper with verification features
 */
contract DeployAttestifyWrapper is Script {
    // Celo Mainnet Addresses
    address constant CUSD_MAINNET = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant AAVE_POOL_MAINNET = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402;
    address constant SELF_PROTOCOL_MAINNET = address(0); // To be set
    
    // Celo Alfajores (Testnet) Addresses
    address constant CUSD_ALFAJORES = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address constant AAVE_POOL_ALFAJORES = 0x0886f74eEEc443fBb6907fB5528B57C28E813129; // Moola Market LendingPool
    address constant SELF_PROTOCOL_ALFAJORES = address(0); // To be set
    
    // Celo Sepolia (Testnet) Addresses  
    // Note: Celo Sepolia is a fresh testnet - using Alfajores addresses as fallback
    address constant CUSD_SEPOLIA = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1; // cUSD on Sepolia
    address constant AAVE_POOL_SEPOLIA = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402; // Using Alfajores Aave address as placeholder
    address constant SELF_PROTOCOL_SEPOLIA = address(0); // To be set

    function run() external {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        // Determine network
        bool isMainnet = block.chainid == 42220; // Celo Mainnet
        bool isSepolia = block.chainid == 11142220; // Celo Sepolia
        
        address cusdAddress;
        address aavePoolAddress;
        address selfProtocolAddress;
        string memory networkName;
        
        if (isMainnet) {
            cusdAddress = CUSD_MAINNET;
            aavePoolAddress = AAVE_POOL_MAINNET;
            selfProtocolAddress = SELF_PROTOCOL_MAINNET;
            networkName = "Celo Mainnet";
        } else if (isSepolia) {
            cusdAddress = CUSD_SEPOLIA;
            aavePoolAddress = AAVE_POOL_SEPOLIA;
            selfProtocolAddress = SELF_PROTOCOL_SEPOLIA;
            networkName = "Celo Sepolia Testnet";
        } else {
            cusdAddress = CUSD_ALFAJORES;
            aavePoolAddress = AAVE_POOL_ALFAJORES;
            selfProtocolAddress = SELF_PROTOCOL_ALFAJORES;
            networkName = "Celo Alfajores Testnet";
        }
        
        console.log("==============================================");
        console.log("Deploying Attestify Complete System");
        console.log("==============================================");
        console.log("Network:", networkName);
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasury);
        console.log("cUSD Address:", cusdAddress);
        console.log("Aave Pool:", aavePoolAddress);
        console.log("Self Protocol:", selfProtocolAddress);
        console.log("==============================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy Base Vault (ERC-4626 + Aave)
        console.log("Step 1: Deploying Base Vault...");
        AttestifyVault baseVault = new AttestifyVault(
            IERC20(cusdAddress),
            "Attestify Aave Vault",
            "aavATT",
            aavePoolAddress,
            treasury
        );
        console.log("Base Vault deployed at:", address(baseVault));

        // Step 2: Deploy Wrapper (Verification + Profiles + Strategies)
        console.log("\nStep 2: Deploying Attestify Wrapper...");
        AttestifyVaultWrapper wrapper = new AttestifyVaultWrapper(
            address(baseVault),
            selfProtocolAddress
        );
        console.log("Wrapper deployed at:", address(wrapper));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n==============================================");
        console.log("Deployment Successful!");
        console.log("==============================================");
        console.log("Base Vault:", address(baseVault));
        console.log("Wrapper:", address(wrapper));
        console.log("==============================================\n");

        // Verify deployment
        console.log("Verifying deployment...");
        try baseVault.totalAssets() returns (uint256 assets) {
            console.log("Base Vault - Total Assets:", assets);
        } catch {
            console.log("Warning: Could not verify base vault total assets");
        }

        try baseVault.getCurrentAPY() returns (uint256 apy) {
            console.log("Base Vault - Current APY:", apy / 100, "basis points");
        } catch {
            console.log("Warning: Could not get current APY");
        }

        console.log("\n==============================================");
        console.log("Next Steps:");
        console.log("==============================================");
        console.log("1. Verify contracts on block explorer:");
        if (isMainnet) {
            console.log("   Base Vault:");
            console.log("   forge verify-contract", address(baseVault), "AttestifyVault --chain celo");
            console.log("\n   Wrapper:");
            console.log("   forge verify-contract", address(wrapper), "AttestifyVaultWrapper --chain celo");
        } else {
            console.log("   Base Vault:");
            console.log("   forge verify-contract", address(baseVault), "AttestifyVault --chain celo-alfajores");
            console.log("\n   Wrapper:");
            console.log("   forge verify-contract", address(wrapper), "AttestifyVaultWrapper --chain celo-alfajores");
        }
        console.log("\n2. Update frontend with wrapper address:", address(wrapper));
        console.log("\n3. Set Self Protocol address if not set:");
        console.log("   wrapper.setSelfProtocol(<SELF_PROTOCOL_ADDRESS>)");
        console.log("\n4. Test verification and deposit flow");
        console.log("==============================================\n");

        // Save deployment addresses to file
        string memory deploymentInfo = string(abi.encodePacked(
            "Network: ", networkName, "\n",
            "Base Vault: ", vm.toString(address(baseVault)), "\n",
            "Wrapper: ", vm.toString(address(wrapper)), "\n",
            "Treasury: ", vm.toString(treasury), "\n"
        ));
        
        vm.writeFile("deployment-addresses.txt", deploymentInfo);
        console.log("Deployment addresses saved to deployment-addresses.txt");
    }
}
