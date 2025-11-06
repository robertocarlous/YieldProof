// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVaultMoola} from "../contracts/AttestifyVaultMoola.sol";
import {AttestifyVaultWrapper} from "../contracts/AttestifyVaultWrapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployMoolaVault
 * @notice Deployment script for Attestify with Moola Market (Alfajores testnet)
 */
contract DeployMoolaVault is Script {
    // Celo Alfajores Addresses
    address constant CUSD_ALFAJORES = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address constant MOOLA_LENDING_POOL = 0x0886f74eEEc443fBb6907fB5528B57C28E813129;
    address constant SELF_PROTOCOL = address(0); // To be set

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        console.log("==============================================");
        console.log("Deploying Attestify with Moola Market");
        console.log("==============================================");
        console.log("Network: Celo Alfajores Testnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasury);
        console.log("cUSD:", CUSD_ALFAJORES);
        console.log("Moola LendingPool:", MOOLA_LENDING_POOL);
        console.log("==============================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Moola Vault
        console.log("Step 1: Deploying Moola Vault...");
        AttestifyVaultMoola vault = new AttestifyVaultMoola(
            IERC20(CUSD_ALFAJORES),
            "Attestify Moola Vault",
            "mooATT",
            MOOLA_LENDING_POOL,
            treasury
        );
        console.log("Moola Vault deployed at:", address(vault));

        // Deploy Wrapper
        console.log("\nStep 2: Deploying Attestify Wrapper...");
        AttestifyVaultWrapper wrapper = new AttestifyVaultWrapper(
            address(vault),
            SELF_PROTOCOL
        );
        console.log("Wrapper deployed at:", address(wrapper));

        vm.stopBroadcast();

        // Verification
        console.log("\n==============================================");
        console.log("Deployment Successful!");
        console.log("==============================================");
        console.log("Moola Vault:", address(vault));
        console.log("Wrapper:", address(wrapper));
        console.log("==============================================\n");

        // Test vault
        console.log("Verifying deployment...");
        try vault.totalAssets() returns (uint256 assets) {
            console.log("Total Assets:", assets);
        } catch {
            console.log("Warning: Could not verify total assets");
        }

        try vault.getCurrentAPY() returns (uint256 apy) {
            console.log("Current APY:", apy, "basis points");
        } catch {
            console.log("Warning: Could not get APY");
        }

        console.log("\n==============================================");
        console.log("Next Steps:");
        console.log("==============================================");
        console.log("1. Update frontend with wrapper address:", address(wrapper));
        console.log("2. Get testnet cUSD from faucet");
        console.log("3. Test deposit/withdraw flow");
        console.log("4. Verify yield generation");
        console.log("==============================================\n");

        // Save addresses
        string memory deploymentInfo = string(abi.encodePacked(
            "Network: Celo Alfajores Testnet\n",
            "Moola Vault: ", vm.toString(address(vault)), "\n",
            "Wrapper: ", vm.toString(address(wrapper)), "\n",
            "Treasury: ", vm.toString(treasury), "\n"
        ));
        
        vm.writeFile("deployment-moola-addresses.txt", deploymentInfo);
        console.log("Deployment addresses saved to deployment-moola-addresses.txt");
    }
}
