import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function sendRemainingUserFunds() {
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
    console.log('💰 Sending remaining user funds...');
    
    // Check current balances
    const ourBalance = await cUSD.balanceOf(wallet.address);
    const userBalance = await cUSD.balanceOf(userWallet);
    
    console.log('Our wallet balance:', ethers.formatEther(ourBalance), 'cUSD');
    console.log('User wallet balance:', ethers.formatEther(userBalance), 'cUSD');
    
    // Send all remaining funds to user
    if (ourBalance > 0) {
      console.log(`📤 Sending ${ethers.formatEther(ourBalance)} cUSD to user...`);
      
      const transferTx = await cUSD.transfer(userWallet, ourBalance);
      console.log('Transfer transaction:', transferTx.hash);
      await transferTx.wait();
      console.log('✅ Transfer successful');
      
      // Check final balances
      const finalOurBalance = await cUSD.balanceOf(wallet.address);
      const finalUserBalance = await cUSD.balanceOf(userWallet);
      
      console.log('\n📊 Final balances:');
      console.log('Our wallet balance:', ethers.formatEther(finalOurBalance), 'cUSD');
      console.log('User wallet balance:', ethers.formatEther(finalUserBalance), 'cUSD');
      
      console.log('\n🎉 All user funds successfully returned!');
      console.log('💡 User now has complete funds for testing');
    } else {
      console.log('✅ No remaining funds to send');
    }
    
  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
  }
}

sendRemainingUserFunds();
