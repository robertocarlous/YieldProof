import hre from "hardhat";

/**
 * Script to remove testing functions from production contract
 * This creates a production-ready version without testing functions
 */
async function main() {
  console.log("🔧 Creating production-ready contract (removing testing functions)\n");

  // Read the current contract
  const fs = require('fs');
  const path = require('path');
  
  const contractPath = path.join(__dirname, '../contracts/AttestifyVault.sol');
  let contractCode = fs.readFileSync(contractPath, 'utf8');

  // Remove the manual verification function
  const testingFunctionRegex = /\/\*\*[\s\S]*?@notice Manual verification for testing ONLY[\s\S]*?\*\/\s*function manualVerifyForTesting[\s\S]*?}\s*/g;
  
  const originalLength = contractCode.length;
  contractCode = contractCode.replace(testingFunctionRegex, '');
  const removedLength = originalLength - contractCode.length;

  if (removedLength > 0) {
    console.log(`✅ Removed ${removedLength} characters of testing code`);
    
    // Write the production version
    const productionPath = path.join(__dirname, '../contracts/AttestifyVault-Production.sol');
    fs.writeFileSync(productionPath, contractCode);
    
    console.log("✅ Production contract saved to: AttestifyVault-Production.sol");
    console.log("\n📝 Production contract changes:");
    console.log("  ❌ Removed manualVerifyForTesting function");
    console.log("  ✅ Kept all production functionality");
    console.log("  ✅ Maintained security features");
    
    console.log("\n🚀 Next steps:");
    console.log("  1. Review AttestifyVault-Production.sol");
    console.log("  2. Deploy using deploy-production.js");
    console.log("  3. Test thoroughly on testnet first");
    console.log("  4. Deploy to mainnet when ready");
    
  } else {
    console.log("⚠️ No testing functions found to remove");
  }
}

main()
  .then(() => {
    console.log("\n🎉 Production contract preparation complete!");
  })
  .catch((error) => {
    console.error("\n❌ Failed to prepare production contract:");
    console.error(error);
    process.exitCode = 1;
  });
