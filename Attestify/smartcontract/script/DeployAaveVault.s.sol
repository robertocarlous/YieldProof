// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVault} from "../contracts/AttestifyVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployAaveVault
 * @notice Foundry deployment script for AttestifyVault
 * @dev Run with: forge script script/DeployAaveVault.s.sol:DeployAaveVault --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployAaveVault is Script {
    // Celo Mainnet Addresses
    address constant CUSD_MAINNET = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address constant AAVE_POOL_MAINNET = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402;
    
    // Celo Alfajores (Testnet) Addresses
    address constant CUSD_TESTNET = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address constant AAVE_POOL_TESTNET = 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402;

    function run() external {
        // Get deployment parameters from environment or use defaults
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        // Determine network and use appropriate addresses
        bool isMainnet = block.chainid == 42220; // Celo Mainnet
        address cusdAddress = isMainnet ? CUSD_MAINNET : CUSD_TESTNET;
        address aavePoolAddress = isMainnet ? AAVE_POOL_MAINNET : AAVE_POOL_TESTNET;
        
        string memory networkName = isMainnet ? "Celo Mainnet" : "Celo Alfajores Testnet";
        
        console.log("==============================================");
        console.log("Deploying AttestifyVault");
        console.log("==============================================");
        console.log("Network:", networkName);
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasury);
        console.log("cUSD Address:", cusdAddress);
        console.log("Aave Pool:", aavePoolAddress);
        console.log("==============================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the vault
        AttestifyVault vault = new AttestifyVault(
            IERC20(cusdAddress),
            "Attestify Aave Vault",
            "aavATT",
            aavePoolAddress,
            treasury
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n==============================================");
        console.log("Deployment Successful!");
        console.log("==============================================");
        console.log("Vault Address:", address(vault));
        console.log("==============================================\n");

        // Verify deployment
        console.log("Verifying deployment...");
        try vault.totalAssets() returns (uint256 assets) {
            console.log("Total Assets:", assets);
        } catch {
            console.log("Warning: Could not verify total assets");
        }

        try vault.getCurrentAPY() returns (uint256 apy) {
            console.log("Current APY:", apy / 100, "basis points");
        } catch {
            console.log("Warning: Could not get current APY");
        }

        console.log("\n==============================================");
        console.log("Next Steps:");
        console.log("==============================================");
        console.log("1. Verify contract on block explorer:");
        if (isMainnet) {
            console.log("   forge verify-contract", address(vault), "AttestifyVault --chain celo");
        } else {
            console.log("   forge verify-contract", address(vault), "AttestifyVault --chain celo-alfajores");
        }
        console.log("\n2. Update frontend with vault address:", address(vault));
        console.log("\n3. Test with small deposit/withdrawal");
        console.log("==============================================\n");
    }
}
