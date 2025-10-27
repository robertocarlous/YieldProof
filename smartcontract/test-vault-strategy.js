import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function testVaultStrategy() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const vaultAddress = '0xaD763D1E1AAe6a467c7072390DC76b56D032b827';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  const mockPoolAddress = '0xBd0FA39201fFfD7744056690324fdf67bfc55D1C';
  
  console.log('🧪 Testing Vault Deposit Strategy...');
  console.log('Vault:', vaultAddress);
  console.log('Mock Pool:', mockPoolAddress);
  
  const vaultABI = [
    'function deposit(uint256 assets) external returns (uint256)',
    'function balanceOf(address user) external view returns (uint256)',
    'function totalAssets() external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function paused() external view returns (bool)',
    'function MIN_DEPOSIT() external view returns (uint256)',
    'function MAX_DEPOSIT() external view returns (uint256)',
    'function MAX_TVL() external view returns (uint256)'
  ];
  
  const cUSDABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, wallet);
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, wallet);
  
  try {
    console.log('\n📊 Pre-deposit Vault State:');
    
    // Check vault state
    const isPaused = await vault.paused();
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    const maxTVL = await vault.MAX_TVL();
    const totalAssets = await vault.totalAssets();
    const stats = await vault.getVaultStats();
    
    console.log('Paused:', isPaused);
    console.log('Min Deposit:', ethers.formatEther(minDeposit), 'cUSD');
    console.log('Max Deposit:', ethers.formatEther(maxDeposit), 'cUSD');
    console.log('Max TVL:', ethers.formatEther(maxTVL), 'cUSD');
    console.log('Total Assets:', ethers.formatEther(totalAssets), 'cUSD');
    console.log('Vault Stats:', {
      totalAssets: ethers.formatEther(stats[0]),
      totalShares: ethers.formatEther(stats[1]),
      reserveBalance: ethers.formatEther(stats[2]),
      aaveBalance: ethers.formatEther(stats[3]),
      totalDeposited: ethers.formatEther(stats[4]),
      totalWithdrawn: ethers.formatEther(stats[5])
    });
    
    // Check wallet cUSD balance
    const walletBalance = await cUSD.balanceOf(wallet.address);
    console.log('Wallet cUSD Balance:', ethers.formatEther(walletBalance), 'cUSD');
    
    if (walletBalance < minDeposit) {
      console.log('❌ Insufficient cUSD balance for testing');
      return;
    }
    
    console.log('\n🎯 Testing Deposit Strategy...');
    
    // Test with minimum deposit
    const testAmount = minDeposit;
    console.log('Test deposit amount:', ethers.formatEther(testAmount), 'cUSD');
    
    // Check current allowance
    const currentAllowance = await cUSD.allowance(wallet.address, vaultAddress);
    console.log('Current allowance:', ethers.formatEther(currentAllowance), 'cUSD');
    
    if (currentAllowance < testAmount) {
      console.log('📝 Approving cUSD...');
      const approveTx = await cUSD.approve(vaultAddress, testAmount);
      await approveTx.wait();
      console.log('✅ Approval successful');
    }
    
    console.log('💰 Attempting deposit...');
    const depositTx = await vault.deposit(testAmount);
    console.log('Deposit transaction:', depositTx.hash);
    
    const receipt = await depositTx.wait();
    console.log('✅ Deposit successful! Block:', receipt.blockNumber);
    
    // Check post-deposit state
    console.log('\n📊 Post-deposit Vault State:');
    const newTotalAssets = await vault.totalAssets();
    const newStats = await vault.getVaultStats();
    const userBalance = await vault.balanceOf(wallet.address);
    
    console.log('New Total Assets:', ethers.formatEther(newTotalAssets), 'cUSD');
    console.log('User Balance:', ethers.formatEther(userBalance), 'cUSD');
    console.log('New Vault Stats:', {
      totalAssets: ethers.formatEther(newStats[0]),
      totalShares: ethers.formatEther(newStats[1]),
      reserveBalance: ethers.formatEther(newStats[2]),
      aaveBalance: ethers.formatEther(newStats[3]),
      totalDeposited: ethers.formatEther(newStats[4]),
      totalWithdrawn: ethers.formatEther(newStats[5])
    });
    
    // Analyze the strategy
    const reserveRatio = (Number(newStats[2]) / Number(newStats[0])) * 100;
    const aaveRatio = (Number(newStats[3]) / Number(newStats[0])) * 100;
    
    console.log('\n📈 Strategy Analysis:');
    console.log('Reserve Ratio:', reserveRatio.toFixed(2), '%');
    console.log('Aave Ratio:', aaveRatio.toFixed(2), '%');
    
    if (aaveRatio > 0) {
      console.log('✅ Strategy working: Funds deployed to Aave');
    } else {
      console.log('⚠️  Strategy issue: No funds in Aave');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Analyze the error
    if (error.message.includes('execution reverted')) {
      console.log('🔍 This suggests the MockAavePool is still broken');
    }
  }
}

testVaultStrategy();
