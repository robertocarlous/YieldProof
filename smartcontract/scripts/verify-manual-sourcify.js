import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("🔍 Manual Sourcify Verification...\n");

    const VAULT_ADDRESS = "0x98474A93Fc64BBa2FebBE6943c7249D09Bc89612";

    console.log("📝 Contract Details:");
    console.log("  Address:", VAULT_ADDRESS);
    console.log("  Network: Celo Sepolia (Chain ID: 11142220)");

    // Create a sources directory for Sourcify
    const sourcesDir = "sourcify-sources";
    if (!fs.existsSync(sourcesDir)) {
        fs.mkdirSync(sourcesDir, { recursive: true });
    }

    // Create contracts subdirectory
    const contractsDir = path.join(sourcesDir, "contracts");
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    console.log("\n📦 Preparing source files for Sourcify...");

    // Copy all contract source files
    const contractFiles = [
        "contracts/AttestifyVault.sol",
        "contracts/ISelfProtocol.sol",
        "contracts/IAave.sol"
    ];

    for (const file of contractFiles) {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const destPath = path.join(sourcesDir, file);
            fs.writeFileSync(destPath, content);
            console.log(`✅ Copied ${file}`);
        } else {
            console.log(`❌ Missing ${file}`);
        }
    }

    // Create metadata.json for Sourcify
    const metadata = {
        compiler: {
            version: "0.8.28"
        },
        language: "Solidity",
        output: {
            abi: [],
            devdoc: {},
            userdoc: {}
        },
        settings: {
            compilationTarget: {
                "contracts/AttestifyVault.sol": "AttestifyVault"
            },
            evmVersion: "cancun",
            libraries: {},
            metadata: {
                useLiteralContent: true
            },
            optimizer: {
                enabled: true,
                runs: 200
            },
            remappings: []
        },
        sources: {},
        version: 1
    };

    // Add source files to metadata
    for (const file of contractFiles) {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const crypto = await import('crypto');
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            metadata.sources[file] = {
                keccak256: "0x" + hash,
                urls: ["bzz-raw://" + hash]
            };
        }
    }

    const metadataPath = path.join(sourcesDir, "metadata.json");
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log("✅ Created metadata.json");

    console.log("\n🌐 Sourcify Verification Instructions:");
    console.log("\n📋 Method 1: Web Interface (Recommended)");
    console.log("1. Go to: https://sourcify.dev/");
    console.log("2. Select 'Celo Sepolia' (Chain ID: 11142220)");
    console.log("3. Enter contract address:", VAULT_ADDRESS);
    console.log("4. Upload the following files from the 'sourcify-sources' folder:");
    console.log("   - contracts/AttestifyVault.sol");
    console.log("   - contracts/ISelfProtocol.sol");
    console.log("   - contracts/IAave.sol");
    console.log("   - metadata.json");
    console.log("5. Click 'Verify'");

    console.log("\n📋 Method 2: Command Line");
    console.log("npx @ethereum-sourcify/cli verify --chain 11142220 --address " + VAULT_ADDRESS + " --metadata-dir ./sourcify-sources");

    console.log("\n📋 Method 3: cURL API Call");
    console.log("curl -X POST https://sourcify.dev/server/verify \\");
    console.log("  -H 'Content-Type: application/json' \\");
    console.log("  -d '{");
    console.log('    "address": "' + VAULT_ADDRESS + '",');
    console.log('    "chain": "11142220",');
    console.log('    "files": {');
    console.log('      "contracts/AttestifyVault.sol": { "content": "..." },');
    console.log('      "contracts/ISelfProtocol.sol": { "content": "..." },');
    console.log('      "contracts/IAave.sol": { "content": "..." }');
    console.log('    }');
    console.log("  }'");

    console.log("\n✅ Files prepared in 'sourcify-sources' directory:");
    console.log("  - contracts/AttestifyVault.sol");
    console.log("  - contracts/ISelfProtocol.sol");
    console.log("  - contracts/IAave.sol");
    console.log("  - metadata.json");

    console.log("\n🎉 Ready for Sourcify verification!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
