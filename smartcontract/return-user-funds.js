import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function returnUserFunds() {
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
    console.log('💰 Returning user funds...');
    
    // Check our wallet balance (this is the recovered user funds)
    const ourBalance = await cUSD.balanceOf(wallet.address);
    console.log('Recovered funds in our wallet:', ethers.formatEther(ourBalance), 'cUSD');
    
    // Check user wallet balance
    const userBalance = await cUSD.balanceOf(userWallet);
    console.log('User wallet balance before:', ethers.formatEther(userBalance), 'cUSD');
    
    // Send all recovered funds back to user
    console.log(`📤 Returning ${ethers.formatEther(ourBalance)} cUSD to user wallet...`);
    
    const transferTx = await cUSD.transfer(userWallet, ourBalance);
    console.log('Transfer transaction:', transferTx.hash);
    
    const receipt = await transferTx.wait();
    console.log('✅ Transfer successful! Block:', receipt.blockNumber);
    
    // Check balances after transfer
    const newOurBalance = await cUSD.balanceOf(wallet.address);
    const newUserBalance = await cUSD.balanceOf(userWallet);
    
    console.log('\n📊 Updated balances:');
    console.log('Our wallet balance:', ethers.formatEther(newOurBalance), 'cUSD');
    console.log('User wallet balance:', ethers.formatEther(newUserBalance), 'cUSD');
    
    console.log('\n🎉 User funds successfully returned!');
    console.log('💡 User can now test deposits with their recovered cUSD');
    
  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
  }
}

returnUserFunds();
