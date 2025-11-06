import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function investigateMissingFunds() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  const poolAddress = '0x04435f96c3F4E76840e08f94e0A417A4E071CEFD';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  const vaultABI = [
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function totalAssets() external view returns (uint256)'
  ];
  
  const poolABI = [
    'function totalAssets() external view returns (uint256)',
    'function getUserAccountData(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)'
  ];
  
  const cUSDABI = [
    'function balanceOf(address account) external view returns (uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  const pool = new ethers.Contract(poolAddress, poolABI, provider);
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, provider);
  
  try {
    console.log('🔍 Investigating Missing Funds...');
    
    // Check vault stats
    const stats = await vault.getVaultStats();
    console.log('Vault Stats:', {
      totalAssets: ethers.formatEther(stats[0]),
      totalShares: ethers.formatEther(stats[1]),
      reserveBalance: ethers.formatEther(stats[2]),
      aaveBalance: ethers.formatEther(stats[3]),
      totalDeposited: ethers.formatEther(stats[4]),
      totalWithdrawn: ethers.formatEther(stats[5])
    });
    
    // Check vault's cUSD balance
    const vaultBalance = await cUSD.balanceOf(vaultAddress);
    console.log('Vault cUSD balance:', ethers.formatEther(vaultBalance));
    
    // Check pool's cUSD balance
    const poolBalance = await cUSD.balanceOf(poolAddress);
    console.log('Pool cUSD balance:', ethers.formatEther(poolBalance));
    
    // Check pool total assets
    const poolAssets = await pool.totalAssets();
    console.log('Pool total assets:', ethers.formatEther(poolAssets));
    
    // Check pool user data for vault
    const poolUserData = await pool.getUserAccountData(vaultAddress);
    console.log('Pool user data for vault:', poolUserData.map(d => ethers.formatEther(d)));
    
    // Calculate where the funds should be
    const totalDeposited = Number(ethers.formatEther(stats[4]));
    const reserveBalance = Number(ethers.formatEther(stats[2]));
    const aaveBalance = Number(ethers.formatEther(stats[3]));
    const vaultBalanceNum = Number(ethers.formatEther(vaultBalance));
    const poolBalanceNum = Number(ethers.formatEther(poolBalance));
    
    console.log('\n📊 Fund Analysis:');
    console.log('Total deposited:', totalDeposited, 'cUSD');
    console.log('Reserve balance:', reserveBalance, 'cUSD');
    console.log('Aave balance:', aaveBalance, 'cUSD');
    console.log('Vault balance:', vaultBalanceNum, 'cUSD');
    console.log('Pool balance:', poolBalanceNum, 'cUSD');
    
    const totalFound = reserveBalance + aaveBalance + vaultBalanceNum + poolBalanceNum;
    const missing = totalDeposited - totalFound;
    
    console.log('Total found:', totalFound, 'cUSD');
    console.log('Missing:', missing, 'cUSD');
    
    if (missing > 0) {
      console.log('❌ ISSUE: Funds are missing!');
      console.log('💡 This explains why shares are diluted');
    } else {
      console.log('✅ All funds accounted for');
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

investigateMissingFunds();
