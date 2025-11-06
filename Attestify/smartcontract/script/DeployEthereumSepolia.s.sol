// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {AttestifyVault} from "../contracts/AttestifyVault.sol";
import {AttestifyVaultWrapper} from "../contracts/AttestifyVaultWrapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployEthereumSepolia
 * @notice Deployment script for Attestify on Ethereum Sepolia with Aave V3
 * @dev Uses real Aave V3 protocol on Sepolia testnet
 */
contract DeployEthereumSepolia is Script {
    // ============================================
    // ETHEREUM SEPOLIA - AAVE V3 ADDRESSES
    // ============================================
    
    // Aave V3 Core Contracts
    address constant AAVE_V3_POOL = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    address constant AAVE_V3_POOL_DATA_PROVIDER = 0x3e9708d80f7B3e43118013075F7e95CE3AB31F31;
    address constant AAVE_V3_ORACLE = 0x2da88497588bf89281816106C7259e31AF45a663;
    
    // Test Assets on Sepolia (from Aave Faucet)
    address constant USDC = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // Aave Sepolia USDC
    address constant DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;  // Aave Sepolia DAI
    address constant WETH = 0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c; // Aave Sepolia WETH
    
    // Self Protocol (placeholder - update when available)
    address constant SELF_PROTOCOL = address(0);
    
    // ============================================
    // DEPLOYMENT CONFIGURATION
    // ============================================
    
    struct DeploymentConfig {
        address asset;
        string assetName;
        string vaultName;
        string vaultSymbol;
    }
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        
        // Choose which asset to use (default: USDC)
        string memory assetChoice = vm.envOr("ASSET", string("USDC"));
        DeploymentConfig memory config = getAssetConfig(assetChoice);
        
        console.log("==============================================");
        console.log("Deploying Attestify on Ethereum Sepolia");
        console.log("==============================================");
        console.log("Network: Ethereum Sepolia Testnet");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Asset:", config.assetName);
        console.log("Asset Address:", config.asset);
        console.log("Aave V3 Pool:", AAVE_V3_POOL);
        console.log("==============================================\n");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy AttestifyVault with Aave V3 integration
        console.log("Step 1: Deploying AttestifyVault with Aave V3...");
        AttestifyVault vault = new AttestifyVault(
            IERC20(config.asset),
            config.vaultName,
            config.vaultSymbol,
            AAVE_V3_POOL,
            treasury
        );
        console.log("Vault deployed at:", address(vault));
        console.log("- Integrated with Aave V3 Pool");
        console.log("- Reserve Ratio: 10% (default)");
        console.log("- Performance Fee: 10% (default)");
        
        // Step 2: Deploy AttestifyVaultWrapper
        console.log("\nStep 2: Deploying AttestifyVaultWrapper...");
        AttestifyVaultWrapper wrapper = new AttestifyVaultWrapper(
            address(vault),
            SELF_PROTOCOL
        );
        console.log("Wrapper deployed at:", address(wrapper));
        console.log("- Verification: Self Protocol integration ready");
        console.log("- Strategies: Conservative, Balanced, Growth");
        
        // Step 3: Get aToken address
        console.log("\nStep 3: Verifying Aave Integration...");
        (bool success, bytes memory data) = address(vault).staticcall(
            abi.encodeWithSignature("A_TOKEN()")
        );
        if (success && data.length > 0) {
            address aToken = abi.decode(data, (address));
            console.log("aToken Address:", aToken);
            console.log("Aave integration verified!");
        }
        
        // Step 4: Get current APY
        console.log("\nStep 4: Checking Current APY...");
        uint256 currentAPY = vault.getCurrentAPY();
        console.log("Current Aave APY:", currentAPY, "basis points");
        
        vm.stopBroadcast();
        
        // ============================================
        // DEPLOYMENT SUMMARY
        // ============================================
        
        console.log("\n==============================================");
        console.log("DEPLOYMENT SUCCESSFUL!");
        console.log("==============================================");
        console.log("Network: Ethereum Sepolia");
        console.log("Chain ID:", block.chainid);
        console.log("\nCore Contracts:");
        console.log("- Vault:", address(vault));
        console.log("- Wrapper:", address(wrapper));
        console.log("\nConfiguration:");
        console.log("- Asset:", config.assetName);
        console.log("- Asset Address:", config.asset);
        console.log("- Treasury:", treasury);
        console.log("- Aave V3 Pool:", AAVE_V3_POOL);
        console.log("==============================================\n");
        
        console.log("NEXT STEPS:");
        console.log("==============================================");
        console.log("1. Get test tokens from Aave Faucet:");
        console.log("   https://staging.aave.com/faucet/");
        console.log("\n2. Update frontend configuration:");
        console.log("   - Wrapper Address:", address(wrapper));
        console.log("   - Vault Address:", address(vault));
        console.log("   - Asset Address:", config.asset);
        console.log("\n3. Test the flow:");
        console.log("   a) Verify identity (if Self Protocol set)");
        console.log("   b) Approve asset to wrapper");
        console.log("   c) Deposit assets");
        console.log("   d) Check balance and yield");
        console.log("   e) Withdraw assets");
        console.log("\n4. Verify contracts on Etherscan:");
        console.log("   forge verify-contract <address> <contract> --chain sepolia");
        console.log("==============================================\n");
        
        // Save deployment addresses
        string memory deploymentInfo = string(abi.encodePacked(
            "ETHEREUM SEPOLIA DEPLOYMENT\n",
            "===========================\n\n",
            "Network: Ethereum Sepolia Testnet\n",
            "Chain ID: ", vm.toString(block.chainid), "\n",
            "Deployed: ", vm.toString(block.timestamp), "\n\n",
            "CONTRACTS\n",
            "---------\n",
            "Vault: ", vm.toString(address(vault)), "\n",
            "Wrapper: ", vm.toString(address(wrapper)), "\n\n",
            "CONFIGURATION\n",
            "-------------\n",
            "Asset: ", config.assetName, "\n",
            "Asset Address: ", vm.toString(config.asset), "\n",
            "Treasury: ", vm.toString(treasury), "\n",
            "Aave V3 Pool: ", vm.toString(AAVE_V3_POOL), "\n\n",
            "FEATURES\n",
            "--------\n",
            "- Full Aave V3 integration\n",
            "- Automatic yield generation\n",
            "- ERC-4626 compliant\n",
            "- Identity verification ready\n",
            "- Multiple investment strategies\n\n",
            "GET TEST TOKENS\n",
            "---------------\n",
            "Aave Faucet: https://staging.aave.com/faucet/\n\n",
            "VERIFY CONTRACTS\n",
            "----------------\n",
            "forge verify-contract ", vm.toString(address(vault)), " AttestifyVault --chain sepolia\n",
            "forge verify-contract ", vm.toString(address(wrapper)), " AttestifyVaultWrapper --chain sepolia\n"
        ));
        
        vm.writeFile("deployment-ethereum-sepolia.txt", deploymentInfo);
        console.log("Deployment info saved to: deployment-ethereum-sepolia.txt");
    }
    
    /**
     * @notice Get asset configuration based on choice
     * @param assetChoice Asset name (USDC, DAI, WETH)
     * @return config Deployment configuration
     */
    function getAssetConfig(string memory assetChoice) internal pure returns (DeploymentConfig memory) {
        if (keccak256(bytes(assetChoice)) == keccak256(bytes("DAI"))) {
            return DeploymentConfig({
                asset: DAI,
                assetName: "DAI",
                vaultName: "Attestify DAI Vault",
                vaultSymbol: "attDAI"
            });
        } else if (keccak256(bytes(assetChoice)) == keccak256(bytes("WETH"))) {
            return DeploymentConfig({
                asset: WETH,
                assetName: "WETH",
                vaultName: "Attestify WETH Vault",
                vaultSymbol: "attWETH"
            });
        } else {
            // Default to USDC
            return DeploymentConfig({
                asset: USDC,
                assetName: "USDC",
                vaultName: "Attestify USDC Vault",
                vaultSymbol: "attUSDC"
            });
        }
    }
}
