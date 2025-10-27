import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function testFixedContract() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const vaultAddress = '0x9c75cC4A2D319363158dA01d97d5EFec55CED742';
  const poolAddress = '0x267Cf7E391fb77329028Cba1C216ffcFb288F983';
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  
  const vaultABI = [
    'function totalAssets() external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function balanceOf(address user) external view returns (uint256)',
    'function isVerified(address user) external view returns (bool)',
    'function users(address user) external view returns (bool, uint256, uint256, uint256, uint256, uint256)'
  ];
  
  const poolABI = [
    'function getUserAccountData(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function totalAssets() external view returns (uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  const pool = new ethers.Contract(poolAddress, poolABI, provider);
  
  try {
    console.log('🧪 Testing Fixed Contract Balance Display...');
    console.log('Vault:', vaultAddress);
    console.log('Pool:', poolAddress);
    console.log('User:', userWallet);
    
    // Test empty vault first
    console.log('\n📊 Empty Vault State:');
    const totalAssets = await vault.totalAssets();
    const stats = await vault.getVaultStats();
    
    console.log('Total Assets:', ethers.formatEther(totalAssets), 'cUSD');
    console.log('Vault Stats:', {
      totalAssets: ethers.formatEther(stats[0]),
      totalShares: ethers.formatEther(stats[1]),
      reserveBalance: ethers.formatEther(stats[2]),
      aaveBalance: ethers.formatEther(stats[3]),
      totalDeposited: ethers.formatEther(stats[4]),
      totalWithdrawn: ethers.formatEther(stats[5])
    });
    
    // Test pool functions
    console.log('\n📊 Pool State:');
    const poolAssets = await pool.totalAssets();
    const poolUserData = await pool.getUserAccountData(vaultAddress);
    console.log('Pool Total Assets:', ethers.formatEther(poolAssets), 'cUSD');
    console.log('Pool User Data:', poolUserData.map(d => ethers.formatEther(d)));
    
    // Check user verification status
    const isVerified = await vault.isVerified(userWallet);
    console.log('\n👤 User Status:');
    console.log('User verified:', isVerified);
    
    if (isVerified) {
      const userData = await vault.users(userWallet);
      console.log('User data:', {
        isVerified: userData[0],
        verifiedAt: userData[1].toString(),
        totalDeposited: ethers.formatEther(userData[2]),
        totalWithdrawn: ethers.formatEther(userData[3]),
        lastActionTime: userData[4].toString(),
        userIdentifier: userData[5].toString()
      });
    }
    
    console.log('\n✅ Fixed contract is ready for testing!');
    console.log('💡 The totalAssets() function should now correctly include both reserve and Aave balances');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFixedContract();
