import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function fixUserBalance() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  const cUSDABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)'
  ];
  
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, wallet);
  
  try {
    console.log('💰 Fixing user balance to exactly 1.0 cUSD...');
    
    // Check current balances
    const userBalance = await cUSD.balanceOf(userWallet);
    const ourBalance = await cUSD.balanceOf(wallet.address);
    
    console.log('Current user balance:', ethers.formatEther(userBalance), 'cUSD');
    console.log('Our wallet balance:', ethers.formatEther(ourBalance), 'cUSD');
    
    // Calculate how much to send to make user have exactly 1.0 cUSD
    const targetBalance = ethers.parseEther('1.0');
    const currentBalance = userBalance;
    
    if (currentBalance < targetBalance) {
      const amountToSend = targetBalance - currentBalance;
      console.log(`📤 Sending ${ethers.formatEther(amountToSend)} cUSD to user to make total 1.0 cUSD...`);
      
      if (ourBalance >= amountToSend) {
        const transferTx = await cUSD.transfer(userWallet, amountToSend);
        console.log('Transfer transaction:', transferTx.hash);
        await transferTx.wait();
        console.log('✅ Transfer successful');
        
        const finalUserBalance = await cUSD.balanceOf(userWallet);
        console.log('Final user balance:', ethers.formatEther(finalUserBalance), 'cUSD');
        
        if (finalUserBalance == targetBalance) {
          console.log('🎉 User now has exactly 1.0 cUSD!');
        } else {
          console.log('❌ Balance still not correct');
        }
      } else {
        console.log('❌ Insufficient balance in our wallet to send to user');
        console.log('💡 Need to get more cUSD from faucet first');
      }
    } else if (currentBalance > targetBalance) {
      console.log('❌ User has more than 1.0 cUSD, this is unexpected');
    } else {
      console.log('✅ User already has exactly 1.0 cUSD');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixUserBalance();
