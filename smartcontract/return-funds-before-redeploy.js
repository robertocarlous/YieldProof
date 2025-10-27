import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function returnFundsBeforeRedeploy() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  const poolAddress = '0x04435f96c3F4E76840e08f94e0A417A4E071CEFD';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  const vaultABI = [
    'function withdraw(uint256 shares) external returns (uint256)',
    'function balanceOf(address user) external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)'
  ];
  
  const poolABI = [
    'function emergencyWithdraw(address token) external',
    'function emergencyWithdraw(address token, uint256 amount) external'
  ];
  
  const cUSDABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, wallet);
  const pool = new ethers.Contract(poolAddress, poolABI, wallet);
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, wallet);
  
  try {
    console.log('💰 Returning all funds to user before redeploy...');
    
    // Check current balances
    const userShares = await vault.balanceOf(userWallet);
    const vaultBalance = await cUSD.balanceOf(vaultAddress);
    const poolBalance = await cUSD.balanceOf(poolAddress);
    const userBalance = await cUSD.balanceOf(userWallet);
    
    console.log('Current balances:');
    console.log('User shares:', ethers.formatEther(userShares));
    console.log('Vault cUSD:', ethers.formatEther(vaultBalance));
    console.log('Pool cUSD:', ethers.formatEther(poolBalance));
    console.log('User cUSD:', ethers.formatEther(userBalance));
    
    // First, try to withdraw user's shares from vault
    if (userShares > 0) {
      console.log(`📤 Withdrawing ${ethers.formatEther(userShares)} shares from vault...`);
      try {
        const withdrawTx = await vault.withdraw(userShares);
        console.log('Withdraw transaction:', withdrawTx.hash);
        await withdrawTx.wait();
        console.log('✅ Withdrawal successful');
      } catch (withdrawError) {
        console.log('❌ Withdrawal failed:', withdrawError.message);
        console.log('💡 Will use emergency methods instead');
      }
    }
    
    // Emergency withdraw from pool
    if (poolBalance > 0) {
      console.log(`🚨 Emergency withdrawing ${ethers.formatEther(poolBalance)} cUSD from pool...`);
      const emergencyTx = await pool.emergencyWithdraw(cUSDAddress);
      console.log('Emergency withdraw transaction:', emergencyTx.hash);
      await emergencyTx.wait();
      console.log('✅ Emergency withdrawal successful');
    }
    
    // Transfer all vault funds to user
    const finalVaultBalance = await cUSD.balanceOf(vaultAddress);
    if (finalVaultBalance > 0) {
      console.log(`📤 Transferring ${ethers.formatEther(finalVaultBalance)} cUSD from vault to user...`);
      const transferTx = await cUSD.transfer(userWallet, finalVaultBalance);
      console.log('Transfer transaction:', transferTx.hash);
      await transferTx.wait();
      console.log('✅ Transfer successful');
    }
    
    // Check final balances
    const finalUserBalance = await cUSD.balanceOf(userWallet);
    const finalVaultBalance2 = await cUSD.balanceOf(vaultAddress);
    const finalPoolBalance = await cUSD.balanceOf(poolAddress);
    
    console.log('\n📊 Final balances:');
    console.log('User cUSD:', ethers.formatEther(finalUserBalance));
    console.log('Vault cUSD:', ethers.formatEther(finalVaultBalance2));
    console.log('Pool cUSD:', ethers.formatEther(finalPoolBalance));
    
    console.log('\n🎉 All funds returned to user!');
    console.log('💡 Ready to redeploy fixed contract');
    
  } catch (error) {
    console.error('❌ Fund return failed:', error.message);
  }
}

returnFundsBeforeRedeploy();
