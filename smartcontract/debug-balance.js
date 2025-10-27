import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function debugBalanceIssue() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  
  const vaultABI = [
    'function balanceOf(address user) external view returns (uint256)',
    'function totalAssets() external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function users(address user) external view returns (bool, uint256, uint256, uint256, uint256, uint256)',
    'function convertToAssets(uint256 shares) external view returns (uint256)',
    'function convertToShares(uint256 assets) external view returns (uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  
  try {
    console.log('🔍 Debugging Balance Display Issue...');
    console.log('User wallet:', userWallet);
    console.log('Vault address:', vaultAddress);
    
    // Check user's share balance
    const userShares = await vault.balanceOf(userWallet);
    console.log('User shares:', ethers.formatEther(userShares));
    
    // Check total assets in vault
    const totalAssets = await vault.totalAssets();
    console.log('Total assets:', ethers.formatEther(totalAssets));
    
    // Check vault stats
    const stats = await vault.getVaultStats();
    console.log('Vault stats:', {
      totalAssets: ethers.formatEther(stats[0]),
      totalShares: ethers.formatEther(stats[1]),
      reserveBalance: ethers.formatEther(stats[2]),
      aaveBalance: ethers.formatEther(stats[3]),
      totalDeposited: ethers.formatEther(stats[4]),
      totalWithdrawn: ethers.formatEther(stats[5])
    });
    
    // Check user data
    const userData = await vault.users(userWallet);
    console.log('User data:', {
      isVerified: userData[0],
      verifiedAt: userData[1].toString(),
      totalDeposited: ethers.formatEther(userData[2]),
      totalWithdrawn: ethers.formatEther(userData[3]),
      lastActionTime: userData[4].toString(),
      userIdentifier: userData[5].toString()
    });
    
    // Convert shares to assets to see what user should see
    if (userShares > 0) {
      const assetsFromShares = await vault.convertToAssets(userShares);
      console.log('Assets from shares:', ethers.formatEther(assetsFromShares));
    }
    
    // Check if there's a conversion issue
    const testShares = ethers.parseEther('1');
    const testAssets = await vault.convertToAssets(testShares);
    console.log('Test: 1 share =', ethers.formatEther(testAssets), 'assets');
    
    const testAssets2 = ethers.parseEther('1');
    const testShares2 = await vault.convertToShares(testAssets2);
    console.log('Test: 1 asset =', ethers.formatEther(testShares2), 'shares');
    
    // Check if the issue is in the frontend calculation
    console.log('\n📊 Analysis:');
    console.log('User deposited:', ethers.formatEther(userData[2]), 'cUSD');
    console.log('User shares:', ethers.formatEther(userShares));
    console.log('User should see:', ethers.formatEther(userShares), 'cUSD (if 1:1 ratio)');
    
    if (totalAssets > 0 && userShares > 0) {
      const ratio = Number(totalAssets) / Number(userShares);
      console.log('Current ratio (assets/shares):', ratio);
      
      if (ratio < 1) {
        console.log('❌ ISSUE: Ratio is less than 1, meaning shares are worth less than assets');
        console.log('💡 This could be due to fees, losses, or calculation errors');
      } else if (ratio > 1) {
        console.log('✅ Ratio is greater than 1, meaning shares are worth more (yield earned)');
      } else {
        console.log('✅ Ratio is 1:1, which is expected');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugBalanceIssue();
