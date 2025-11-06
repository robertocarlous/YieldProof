// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVaultSimplified} from "../contracts/AttestifyVaultSimplified.sol";
import {AttestifyVaultWrapper} from "../contracts/AttestifyVaultWrapper.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestCUSD is ERC20 {
    constructor() ERC20("Test Celo Dollar", "cUSD") {
        _mint(msg.sender, 1000000 * 10**18); // 1M test cUSD
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeploySepoliaComplete is Script {
    address constant SELF_PROTOCOL = address(0);

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        
        console.log("==============================================");
        console.log("Deploying Attestify on Celo Sepolia");
        console.log("==============================================");
        console.log("Network: Celo Sepolia Testnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("==============================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy test cUSD token
        console.log("Step 1: Deploying Test cUSD Token...");
        TestCUSD cusd = new TestCUSD();
        console.log("Test cUSD deployed at:", address(cusd));
        console.log("Initial supply: 1,000,000 cUSD");

        // Step 2: Deploy simplified vault
        console.log("\nStep 2: Deploying Attestify Vault...");
        AttestifyVaultSimplified vault = new AttestifyVaultSimplified(
            cusd,
            "Attestify Vault",
            "attVAULT",
            treasury
        );
        console.log("Vault deployed at:", address(vault));

        // Step 3: Deploy wrapper
        console.log("\nStep 3: Deploying Attestify Wrapper...");
        AttestifyVaultWrapper wrapper = new AttestifyVaultWrapper(
            address(vault),
            SELF_PROTOCOL
        );
        console.log("Wrapper deployed at:", address(wrapper));

        // Step 4: Mint some test tokens to deployer
        cusd.mint(deployer, 10000 * 10**18); // 10k for testing
        console.log("\nMinted 10,000 test cUSD to deployer for testing");

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n==============================================");
        console.log("Deployment Successful!");
        console.log("==============================================");
        console.log("Test cUSD:", address(cusd));
        console.log("Vault:", address(vault));
        console.log("Wrapper:", address(wrapper));
        console.log("Treasury:", treasury);
        console.log("==============================================\n");

        console.log("Next Steps:");
        console.log("1. Update frontend with wrapper address:", address(wrapper));
        console.log("2. Use test cUSD for deposits:", address(cusd));
        console.log("3. Test deposit/withdraw flow");
        console.log("4. Note: No yield generation (Sepolia has no DeFi protocols yet)");
        console.log("5. Can upgrade to yield-bearing vault when protocols deploy");
        console.log("==============================================\n");

        // Save addresses
        string memory deploymentInfo = string(abi.encodePacked(
            "Network: Celo Sepolia Testnet\n",
            "Test cUSD: ", vm.toString(address(cusd)), "\n",
            "Vault: ", vm.toString(address(vault)), "\n",
            "Wrapper: ", vm.toString(address(wrapper)), "\n",
            "Treasury: ", vm.toString(treasury), "\n",
            "\nNote: This is a simplified deployment for Celo Sepolia.\n",
            "Yield generation will be added when DeFi protocols deploy on Sepolia.\n"
        ));
        
        vm.writeFile("deployment-sepolia-addresses.txt", deploymentInfo);
        console.log("Deployment addresses saved to deployment-sepolia-addresses.txt");
    }
}
