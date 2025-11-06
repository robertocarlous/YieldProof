// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVaultSimplified} from "../contracts/AttestifyVaultSimplified.sol";
import {AttestifyVaultWrapper} from "../contracts/AttestifyVaultWrapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeploySepoliaVault
 * @notice Deployment script for Attestify on Celo Sepolia
 */
contract DeploySepoliaVault is Script {
    // Celo Sepolia - Using native CELO as asset for now
    // Can be updated to cUSD when it's available on Sepolia
    address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address constant SELF_PROTOCOL = address(0); // To be set

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        console.log("==============================================");
        console.log("Deploying Attestify on Celo Sepolia");
        console.log("==============================================");
        console.log("Network: Celo Sepolia Testnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasury);
        console.log("==============================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // For Sepolia, we'll use WETH or deploy a test token
        // For now, let's note this needs a token address
        console.log("Note: Update with actual cUSD address when available on Sepolia");
        
        // Deploy simplified vault (without lending)
        console.log("Step 1: Deploying Simplified Vault...");
        console.log("(No yield generation - can be upgraded later)");
        
        // Using address(0) as placeholder - need actual token
        // AttestifyVaultSimplified vault = new AttestifyVaultSimplified(
        //     IERC20(TOKEN_ADDRESS),
        //     "Attestify Vault",
        //     "attVAULT",
        //     treasury
        // );
        
        console.log("\n==============================================");
        console.log("DEPLOYMENT PAUSED");
        console.log("==============================================");
        console.log("Reason: cUSD not yet deployed on Celo Sepolia");
        console.log("\nOptions:");
        console.log("1. Wait for cUSD deployment on Sepolia");
        console.log("2. Deploy test ERC20 token for demo");
        console.log("3. Use existing Alfajores deployment");
        console.log("==============================================\n");

        vm.stopBroadcast();
    }
}
